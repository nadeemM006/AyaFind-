/* ═══════════════════════════════════════════════════════
   AyaFind Care Assistant — natural-language request parser
   Deterministically extracts structured childcare needs from
   free text so they can be shown as "understood" chips and
   sent to the existing /api/match-ayas backend.
   Only ever returns what it actually detects.
   ═══════════════════════════════════════════════════════ */

const LANGUAGES = ['urdu', 'english', 'punjabi', 'sindhi'];
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ──────────────────────────────────────────────────────
   Time-of-day helpers — tolerate the mixed formats stored
   in the bookings table ("8:14:15 AM", "08:37:18", "14:00")
   ────────────────────────────────────────────────────── */
export function parseTimeOfDay(raw) {
  if (raw === null || raw === undefined) return null;
  const t = String(raw).trim().toLowerCase();
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[4];
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  if (mer === 'pm' && h < 12) h += 12;
  else if (mer === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatTimeOfDay(raw) {
  const total = parseTimeOfDay(raw);
  if (total === null) return null;
  const h24 = Math.floor(total / 60);
  const min = total % 60;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(min).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
}

/* Format a stored start time plus a duration (hours) as a display
   range, e.g. ("5:00 PM", 4) → "5:00 PM – 9:00 PM". Ranges that cross
   midnight wrap (11 PM + 4 hrs → 3:00 AM). With no usable duration it
   returns the start time alone; unparseable times return null. */
export function formatTimeRange(raw, durationHours) {
  const startLabel = formatTimeOfDay(raw);
  if (startLabel === null) return null;
  const start = parseTimeOfDay(raw);
  const hours = Number(durationHours);
  if (!Number.isFinite(hours) || hours <= 0) return startLabel;
  const end = (start + Math.round(hours * 60)) % 1440;
  const h24 = Math.floor(end / 60);
  const min = end % 60;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${startLabel} – ${h12}:${String(min).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
}

/* Format an hour/minute pair with an optional meridiem ("pm") */
const fmtClock = (h, min, mer) => {
  if (!mer) return `${h}:${String(min).padStart(2, '0')}`;
  let hh = h;
  if (mer === 'pm' && h < 12) hh = h + 12;
  else if (mer === 'am' && h === 12) hh = 0;
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(min).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;
};

/* ──────────────────────────────────────────────────────
   Main parser
   ────────────────────────────────────────────────────── */
export function parseCareRequest(text) {
  const raw = text === null || text === undefined ? '' : String(text);
  const t = raw.toLowerCase();

  /* Child age — "3-year-old", "3 year old", "3 years old" */
  let age = null;
  let ageWord = null;
  let m = t.match(/(\d{1,2})\s*[-–—]?\s*years?\s*[-–—]?\s*old/);
  if (m) age = parseInt(m[1], 10);
  else if (/\b(?:newborn|infant|baby)\b/.test(t)) ageWord = 'infant';
  else if (/\btoddlers?\b/.test(t)) ageWord = 'toddler';

  /* Language */
  const language = LANGUAGES.find((l) => new RegExp(`\\b${l}\\b`).test(t)) || null;

  /* Date words */
  let dateLabel = null;
  if (/\btoday\b/.test(t)) dateLabel = 'Today';
  else if (/\btomorrow\b/.test(t)) dateLabel = 'Tomorrow';
  else if (/\b(?:this\s+)?weekend\b/.test(t)) dateLabel = 'This weekend';
  else if (/\bnext week\b/.test(t)) dateLabel = 'Next week';
  else {
    const wd = WEEKDAYS.find((d) => t.includes(d));
    if (wd) dateLabel = cap(wd);
  }

  /* Time window — range first ("6–10 PM", "from 2 until 5 pm"),
     then a single meridiem time ("at 8pm"), then an unambiguous
     24-hour time ("18:00"), then a part of the day ("morning"). */
  let timeLabel = null;
  m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|–|—|-|until|till)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  /* Guard: require a meridiem or explicit minutes so "2-3 hours"
     is never mistaken for a time range. */
  if (m && (m[3] || m[6] || m[2] || m[5])) {
    const h1 = parseInt(m[1], 10);
    const min1 = m[2] ? parseInt(m[2], 10) : 0;
    const h2 = parseInt(m[4], 10);
    const min2 = m[5] ? parseInt(m[5], 10) : 0;
    const e1 = m[3] || m[6];
    const e2 = m[6] || m[3];
    if (h1 <= 23 && h2 <= 23) timeLabel = `${fmtClock(h1, min1, e1)} – ${fmtClock(h2, min2, e2)}`;
  }
  if (!timeLabel) {
    m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
    if (m) timeLabel = fmtClock(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0, m[3]);
  }
  if (!timeLabel) {
    m = t.match(/\b(\d{1,2}):(\d{2})\b/);
    if (m && parseInt(m[1], 10) > 12) timeLabel = fmtClock(parseInt(m[1], 10), parseInt(m[2], 10), 'pm');
  }
  if (!timeLabel) {
    if (/\btonight\b/.test(t)) timeLabel = 'Tonight';
    else if (/\bmornings?\b/.test(t)) timeLabel = 'Morning';
    else if (/\bafternoons?\b/.test(t)) timeLabel = 'Afternoon';
    else if (/\bevenings?\b/.test(t)) timeLabel = 'Evening';
    else if (/\bnights?\b/.test(t)) timeLabel = 'Night';
  }

  /* Duration — "for 4 hours", "3 hrs" */
  m = t.match(/(\d{1,2})\s*(?:hours?|hrs?)\b/);
  const durationHours = m ? parseInt(m[1], 10) : null;

  /* Budget — "pkr 500", "Rs 600", "₨500", "500/hr" */
  let budget = null;
  m = t.match(/(?:pkr|rs\.?|₨)\s*(\d{3,6})/);
  if (m) budget = parseInt(m[1], 10);
  else {
    m = t.match(/(\d{3,6})\s*(?:\/|per\s)\s*(?:hr|hour)/);
    if (m) budget = parseInt(m[1], 10);
  }

  /* Special needs — values mirror the BookingFlow options */
  let specialNeeds = null;
  if (/\bspecial[\s-]?needs?\b/.test(t)) specialNeeds = 'Special needs child';
  else if (/\btwins?\b/.test(t)) specialNeeds = 'Multiple children';
  else if (/\b(?:multiple|two|three)\s+(?:kids?|children)\b/.test(t)) specialNeeds = 'Multiple children';
  else if (/\bmedical\b/.test(t)) specialNeeds = 'Medical needs';
  else if (ageWord === 'infant') specialNeeds = 'Infant care';

  /* Chips — built only from values that were actually found */
  const chips = [];
  if (age !== null) chips.push(`${age}-year-old`);
  else if (ageWord) chips.push(cap(ageWord));
  if (language) chips.push(cap(language));
  if (dateLabel) chips.push(dateLabel);
  if (timeLabel) chips.push(timeLabel);
  if (durationHours !== null) chips.push(`${durationHours} ${durationHours === 1 ? 'hour' : 'hours'}`);
  if (budget !== null) chips.push(`PKR ${budget}/hr`);
  if (specialNeeds === 'Multiple children') chips.push('Multiple children');
  else if (specialNeeds === 'Special needs child') chips.push('Special needs');
  else if (specialNeeds === 'Medical needs') chips.push('Medical needs');

  return { age, ageWord, language, dateLabel, timeLabel, durationHours, budget, specialNeeds, chips };
}
