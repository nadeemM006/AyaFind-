import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { parseTimeOfDay, formatTimeOfDay, formatTimeRange } from '../utils/parseCareRequest';

/* ═══════════════════════════════════════════════════════
   AYA CARE REQUESTS — opportunity discovery for the
   authenticated Aya: every request here is a real booking
   row addressed to her. Discover → Understand → Evaluate
   Fit → Respond. No invented scores, no demo data.
   Visual system matches the Aya Dashboard (shared tokens
   kept inline per the project's per-page convention).
   ═══════════════════════════════════════════════════════ */

const BACKEND_URL = 'https://ayafind-production.up.railway.app';

const C = {
  navy: '#18243D', navyDark: '#111B2E', teal: '#278F87', tealSoft: '#E4F1EF',
  coral: '#F47C5C', coralSoft: '#FDF0EC', bg: '#FAF9F5', card: '#FFFFFF',
  text: '#27313D', textSec: '#657081', textMuted: '#9BA5B4', border: '#E9E6E1',
  green: '#34946A', greenBg: '#ECF8F2',
};
const FF = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

/* ═══════════════════════════════════════════════════════
   ICONS — Lucide-style 24×24 stroke SVGs
   ═══════════════════════════════════════════════════════ */
const sv = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Ic = {
  ArrowLeft: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  ChevronRight: (p) => <svg {...sv} {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CalendarCheck: (p) => <svg {...sv} {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Banknote: (p) => <svg {...sv} {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  LogOut: (p) => <svg {...sv} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  RefreshCw: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  AlertCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  CheckCircle: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  User: (p) => <svg {...sv} {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Sparkles: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  Search: (p) => <svg {...sv} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Inbox: (p) => <svg {...sv} {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Bell: (p) => <svg {...sv} {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Filter: (p) => <svg {...sv} {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
};

/* ═══════════════════════════════════════════════════════
   LOGO — parent & child (same mark as every AyaFind page)
   ═══════════════════════════════════════════════════════ */
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
    <svg width={30} height={34} viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <circle cx="10" cy="6" r="3.5" stroke={C.navy} strokeWidth="1.8" fill="none"/>
      <path d="M4.5 29v-8c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5v8" stroke={C.navy} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="20.5" cy="11.5" r="2.8" stroke={C.teal} strokeWidth="1.8" fill="none"/>
      <path d="M16 29v-6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v6" stroke={C.teal} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M15 16.5c-.5-.5-1.2-.5-1.7 0s-.5 1.2 0 1.7L15 20l1.7-1.8c.5-.5.5-1.2 0-1.7s-1.2-.5-1.7 0z" fill={C.coral}/>
    </svg>
    <span style={{ fontSize: '20px', fontWeight: '800', color: C.navy, letterSpacing: '-0.025em' }}>
      Aya<span style={{ color: C.teal }}>Find</span>
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════
   FORMATTING + REQUEST HELPERS
   ═══════════════════════════════════════════════════════ */
const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};

const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dayLabel = (dateStr) => {
  if (!dateStr) return '';
  const today = localDateStr(new Date());
  const tomorrow = localDateStr(new Date(Date.now() + 86400000));
  if (String(dateStr) === today) return 'Today';
  if (String(dateStr) === tomorrow) return 'Tomorrow';
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? String(dateStr)
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const longDate = (dateStr) => {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? String(dateStr)
    : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const relTime = (iso) => {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const mins = Math.floor((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const childAgeText = (age) => `${age} year${Number(age) === 1 ? '' : 's'} old`;

const durationText = (b) =>
  b.duration ? `${b.duration} hour${Number(b.duration) === 1 ? '' : 's'}` : null;

const formatAmount = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

const paymentWord = (status) => ({
  pending: 'awaiting payment', processing: 'processing', paid: 'paid',
  failed: 'payment failed', cancelled: 'cancelled', refunded: 'refunded',
}[status] || String(status || ''));

/* Derived request status: pending requests whose care date has
   already passed can no longer be acted on — surfaced as expired */
const isPastDate = (b, todayStr) =>
  !!(b.date && String(b.date).slice(0, 10) < todayStr);

const derivedStatus = (b, todayStr) =>
  (b.status === 'pending' && isPastDate(b, todayStr)) ? 'expired' : (b.status || 'pending');

const REQ_STATUS_STYLES = {
  pending: { label: 'PENDING', color: '#9A6B15', bg: '#FBF1D8' },
  confirmed: { label: 'ACCEPTED', color: C.green, bg: C.greenBg },
  declined: { label: 'DECLINED', color: '#C23B3B', bg: '#FBE9E9' },
  completed: { label: 'COMPLETED', color: C.teal, bg: C.tealSoft },
  expired: { label: 'EXPIRED', color: C.textSec, bg: '#F1EFEA' },
};
const statusStyle = (status) =>
  REQ_STATUS_STYLES[status] || { label: String(status || 'PENDING').toUpperCase(), color: C.textSec, bg: C.bg };

/* Sort bookings by date, then by start time (missing times last) */
const byDateTime = (a, b) => {
  const byDate = String(a.date || '').localeCompare(String(b.date || ''));
  if (byDate !== 0) return byDate;
  const ta = parseTimeOfDay(a.time);
  const tb = parseTimeOfDay(b.time);
  if (ta === null && tb === null) return 0;
  if (ta === null) return 1;
  if (tb === null) return -1;
  return ta - tb;
};

const byCreatedDesc = (a, b) =>
  String(b.created_at || '').localeCompare(String(a.created_at || ''));

/* Area match — honest city-level comparison of the two real
   location strings (aya profile vs parent profile). No distance
   data exists, so nothing stronger is claimed. */
const sameArea = (a, b) => {
  const x = (a || '').trim().toLowerCase();
  const y = (b || '').trim().toLowerCase();
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
};

/* Fit factors for one request, derived only from real profile
   and booking data. No invented compatibility scores. */
const fitFor = (b, profile, bookings, todayStr) => {
  const parent = b.parents || {};
  const factors = [];
  if (profile && profile.location && parent.location && sameArea(profile.location, parent.location)) {
    factors.push({ key: 'area', Icon: Ic.MapPin, text: `In your area — this family is in ${parent.location}` });
  }
  const sameDay = (bookings || []).filter((o) =>
    o.id !== b.id && o.date && String(o.date) === String(b.date) &&
    (o.status === 'confirmed' || o.status === 'pending'));
  const conflicts = sameDay.filter((o) => o.status === 'confirmed');
  if (!conflicts.length) {
    factors.push({ key: 'schedule', Icon: Ic.CalendarCheck, text: 'No conflicts with your confirmed bookings' });
  }
  const pendingOthers = sameDay.filter((o) => o.status === 'pending');
  const recommended =
    b.status === 'pending' && !isPastDate(b, todayStr) &&
    factors.some((f) => f.key === 'area') && conflicts.length === 0;
  return { factors, conflicts, pendingOthers: pendingOthers.length, recommended };
};

/* Time-of-day bucket for the time filter (real stored times) */
const timeBucket = (b) => {
  const t = parseTimeOfDay(b.time);
  if (t === null) return null;
  if (t < 720) return 'morning';
  if (t < 1020) return 'afternoon';
  return 'evening';
};

/* ═══════════════════════════════════════════════════════
   SHARED BLOCKS
   ═══════════════════════════════════════════════════════ */
function EmptyState({ Icon, title, text, children }) {
  return (
    <div className="acr-card acr-empty">
      <div className="acr-empty-icon"><Icon width={22} height={22} /></div>
      <h3 className="acr-empty-title">{title}</h3>
      <p className="acr-section-sub">{text}</p>
      {children}
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <section className="acr-card acr-error-card" role="alert">
      <div className="acr-empty-icon acr-empty-icon-coral"><Ic.AlertCircle width={22} height={22} /></div>
      <h2 className="acr-section-title">We hit a snag</h2>
      <p className="acr-section-sub">{message}</p>
      <button type="button" className="acr-btn" onClick={onRetry}>
        <Ic.RefreshCw width={15} height={15} /> Try Again
      </button>
    </section>
  );
}

function NoProfileCard({ kind, onSignOut }) {
  return (
    <div className="acr-card acr-noprofile">
      <div className="acr-empty-icon"><Ic.User width={22} height={22} /></div>
      <h1 className="acr-noprofile-title">
        {kind === 'parent' ? 'This account belongs to a parent' : 'No caregiver profile found'}
      </h1>
      <p className="acr-section-sub">
        {kind === 'parent'
          ? 'You’re signed in with a parent account. Care Requests is for caregiver accounts.'
          : 'We couldn’t find a caregiver profile for this account. Register as a caregiver to start receiving care requests.'}
      </p>
      <div className="acr-noprofile-actions">
        {kind === 'parent' ? (
          <button type="button" className="acr-btn" onClick={() => { window.location.href = '/parent-dashboard'; }}>
            Go to Parent Dashboard
          </button>
        ) : (
          <button type="button" className="acr-btn" onClick={() => { window.location.href = '/register'; }}>
            Register as a Caregiver
          </button>
        )}
        <button type="button" className="acr-btn-ghost" onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <>
      <div className="acr-skel-head">
        <div className="acr-skel acr-skel-btn" />
        <div className="acr-skel acr-skel-title" />
        <div className="acr-skel acr-skel-row" style={{ width: '62%' }} />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="acr-card acr-skel-card">
          <div className="acr-skel acr-skel-row" style={{ width: '30%' }} />
          <div className="acr-skel acr-skel-row" style={{ width: '52%' }} />
          <div className="acr-skel acr-skel-sm" />
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   REQUEST ROW — one real request in the discovery list
   ═══════════════════════════════════════════════════════ */
function RequestRow({ booking, amount, fit, selected, onSelect }) {
  const parent = booking.parents || {};
  const todayStr = localDateStr(new Date());
  const st = statusStyle(derivedStatus(booking, todayStr));
  const range = formatTimeRange(booking.time, booking.duration) || formatTimeOfDay(booking.time) || null;
  const meta = [parent.location, durationText(booking),
    parent.child_age != null && parent.child_age !== '' ? childAgeText(parent.child_age) : null,
  ].filter(Boolean).join(' · ');
  return (
    <button
      type="button"
      className={`acr-row${selected ? ' selected' : ''}${booking.status === 'pending' && !isPastDate(booking, todayStr) ? ' awaiting' : ''}`}
      onClick={onSelect}
      aria-pressed={selected ? 'true' : undefined}
    >
      <span className="acr-row-when">
        <span className="acr-row-date">{booking.date ? dayLabel(booking.date) : 'Date to be confirmed'}</span>
        <span className="acr-row-time"><Ic.Clock width={13} height={13} />{range || 'Time to be confirmed'}</span>
      </span>
      <span className="acr-row-main">
        <span className="acr-row-family">
          {parent.name || 'Family'}
          {fit && fit.recommended && (
            <span className="acr-rec-pill"><Ic.Sparkles width={12} height={12} />Recommended</span>
          )}
        </span>
        {meta && <span className="acr-row-meta">{meta}</span>}
      </span>
      <span className="acr-row-side">
        {amount && (
          <span className="acr-row-amount">
            <span className="acr-row-amount-value">
              {amount.source === 'payment' ? formatAmount(amount.value) : `Est. ${formatAmount(amount.value)}`}
            </span>
            <span className="acr-row-amount-label">
              {amount.source === 'payment' ? paymentWord(amount.payment.status) : 'from your rate'}
            </span>
          </span>
        )}
        <span className="acr-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
      </span>
      <Ic.ChevronRight className="acr-row-chevron" width={17} height={17} />
    </button>
  );
}

/* Honest note when a pending request has no positive factors */
const profileAreaNote = (fit) => {
  if (fit && fit.conflicts.length > 0) {
    return 'This request conflicts with a confirmed booking on the same date, so it isn’t recommended.';
  }
  return 'This request is outside your area, so it isn’t highlighted as a recommended fit.';
};

/* ═══════════════════════════════════════════════════════
   DETAIL PANEL — understand the request, evaluate the fit,
   respond. Used as the desktop side panel and as the
   mobile full-screen sheet.
   ═══════════════════════════════════════════════════════ */
function DetailPanel({
  booking, fit, amount, rate, payment, acting, outcome, isMobile, onBack, onRespond, onViewSchedule,
}) {
  const [confirmStep, setConfirmStep] = useState(null); // 'accept' | 'decline' | null
  /* A completed response ends the confirm step so the panel
     reflects the real booking state */
  useEffect(() => {
    setConfirmStep(null);
  }, [booking.id, booking.status]);
  const parent = booking.parents || {};
  const todayStr = localDateStr(new Date());
  const dStatus = derivedStatus(booking, todayStr);
  const st = statusStyle(dStatus);
  const range = formatTimeRange(booking.time, booking.duration) || formatTimeOfDay(booking.time) || null;
  const isPending = booking.status === 'pending';
  const isExpired = dStatus === 'expired';
  const est = rate != null && rate !== '' && booking.duration ? Number(rate) * booking.duration : null;
  const justAccepted = outcome && outcome.id === booking.id && outcome.action === 'accept' && booking.status === 'confirmed';

  const statusCaption = {
    pending: 'Awaiting your response',
    confirmed: 'You accepted this request',
    declined: 'You declined this request',
    expired: 'The care date has passed — this request can no longer be accepted',
  }[dStatus];

  const startConfirm = (step) => setConfirmStep(step);

  return (
    <div className={`acr-detail${isMobile ? ' acr-detail-sheet' : ''}`}>
      <div className="acr-detail-head">
        {isMobile && (
          <button type="button" className="acr-iconbtn" onClick={onBack} aria-label="Back to requests">
            <Ic.ArrowLeft width={18} height={18} />
          </button>
        )}
        <div className="acr-avatar acr-avatar-lg acr-avatar-coral">{initials(parent.name)}</div>
        <div className="acr-detail-headtext">
          <h3 className="acr-detail-title">{parent.name || 'Family'}</h3>
          <div className="acr-detail-statusrow">
            <span className="acr-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
            <span className="acr-detail-caption">{statusCaption}</span>
          </div>
        </div>
        {isMobile && (
          <button type="button" className="acr-iconbtn" onClick={onBack} aria-label="Close details">
            <Ic.X width={18} height={18} />
          </button>
        )}
      </div>
      {booking.created_at && (
        <p className="acr-detail-requested">Requested {relTime(booking.created_at)}</p>
      )}

      {justAccepted ? (
        <div className="acr-success" role="status">
          <div className="acr-success-icon"><Ic.CheckCircle width={26} height={26} /></div>
          <h4 className="acr-success-title">Request accepted</h4>
          <p className="acr-success-text">
            This booking is confirmed{booking.date ? <> for {longDate(booking.date)}</> : null}. You’ll find it in
            Upcoming Bookings on your Home.
          </p>
          <div className="acr-success-actions">
            <button type="button" className="acr-btn" onClick={onViewSchedule}>
              <Ic.Calendar width={15} height={15} /> View My Schedule
            </button>
            {isMobile && (
              <button type="button" className="acr-btn-ghost" onClick={onBack}>Back to Requests</button>
            )}
          </div>
        </div>
      ) : confirmStep ? (
        <div className="acr-confirm" role="dialog" aria-label={confirmStep === 'accept' ? 'Confirm acceptance' : 'Confirm decline'}>
          <h4 className="acr-confirm-title">
            {confirmStep === 'accept' ? 'Accept this request?' : 'Decline this request?'}
          </h4>
          <p className="acr-confirm-text">
            {confirmStep === 'accept' ? (
              <>
                Confirming means you are committing to this care session
                {booking.date ? <> on <strong>{longDate(booking.date)}</strong></> : null}
                {range ? <> at <strong>{range}</strong></> : null}
                {durationText(booking) ? <> for <strong>{durationText(booking)}</strong></> : null}.
                The family will see this booking as confirmed, and it will appear in your Upcoming Bookings.
              </>
            ) : (
              <>
                The family will see this request as declined. This can’t be undone.
                {isExpired && ' Declining simply tidies it out of your pending queue.'}
              </>
            )}
          </p>
          {confirmStep === 'accept' && fit && fit.conflicts.length > 0 && (
            <div className="acr-warn" role="alert">
              <Ic.AlertCircle width={16} height={16} />
              <p>
                <strong>Schedule conflict:</strong> you already have a confirmed booking
                on {dayLabel(booking.date) || 'this date'}
                {fit.conflicts[0].family ? <> with {fit.conflicts[0].family}</> : null}
                {fit.conflicts[0].time ? <> at {formatTimeOfDay(fit.conflicts[0].time)}</> : null}.
                Make sure you can cover both before accepting.
              </p>
            </div>
          )}
          <div className="acr-confirm-actions">
            <button type="button" className="acr-btn-ghost" onClick={() => setConfirmStep(null)} disabled={acting}>
              Cancel
            </button>
            <button
              type="button"
              className={confirmStep === 'accept' ? 'acr-btn' : 'acr-btn-ghost acr-btn-danger'}
              onClick={() => onRespond(booking, confirmStep === 'accept' ? 'accept' : 'decline')}
              disabled={acting}
            >
              {acting
                ? (confirmStep === 'accept' ? 'Accepting…' : 'Declining…')
                : (confirmStep === 'accept' ? 'Confirm Accept' : 'Confirm Decline')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="acr-dl-heading">Care Session</p>
          <dl className="acr-dl">
            <div className="acr-dl-row"><dt>Date</dt><dd>{booking.date ? longDate(booking.date) : 'To be confirmed'}</dd></div>
            <div className="acr-dl-row"><dt>Time</dt><dd>{range || booking.time || 'To be confirmed'}</dd></div>
            <div className="acr-dl-row"><dt>Duration</dt><dd>{durationText(booking) || 'To be confirmed'}</dd></div>
            {parent.location && <div className="acr-dl-row"><dt>Area</dt><dd>{parent.location}</dd></div>}
          </dl>

          <p className="acr-dl-heading">Childcare Details</p>
          <dl className="acr-dl">
            <div className="acr-dl-row">
              <dt>Child age</dt>
              <dd>{parent.child_age != null && parent.child_age !== '' ? childAgeText(parent.child_age) : 'Not specified'}</dd>
            </div>
          </dl>
          {(parent.child_age == null || parent.child_age === '') && (
            <p className="acr-detail-note">
              This family hasn’t shared further care details with their request. Anything they add will appear here.
            </p>
          )}

          {(rate != null && rate !== '') || payment || est != null ? (
            <>
              <p className="acr-dl-heading">Earnings</p>
              <dl className="acr-dl">
                {rate != null && rate !== '' && (
                  <div className="acr-dl-row"><dt>Your rate</dt><dd>PKR {rate}/hr</dd></div>
                )}
                {payment ? (
                  <div className="acr-dl-row"><dt>Payment</dt><dd>{formatAmount(payment.amount)} · {paymentWord(payment.status)}</dd></div>
                ) : est != null ? (
                  <div className="acr-dl-row"><dt>Estimated total</dt><dd>{formatAmount(est)}</dd></div>
                ) : null}
              </dl>
              {!payment && est == null && rate != null && rate !== '' && (
                <p className="acr-detail-note">A total is shown once the session length is confirmed.</p>
              )}
            </>
          ) : (
            <>
              <p className="acr-dl-heading">Earnings</p>
              <p className="acr-detail-note">No hourly rate is set on your profile, so no earning estimate is available for this request.</p>
            </>
          )}

          {isPending && !isExpired && (
            <>
              <p className="acr-dl-heading">Why this fits you</p>
              {fit && fit.factors.length ? (
                <ul className="acr-factors">
                  {fit.factors.map((f) => (
                    <li key={f.key} className="acr-factor">
                      <span className="acr-factor-icon"><f.Icon width={14} height={14} /></span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="acr-detail-note">
                  {profileAreaNote(fit)}
                </p>
              )}
              {fit && fit.conflicts.length > 0 && (
                <div className="acr-warn" role="alert">
                  <Ic.AlertCircle width={16} height={16} />
                  <p>
                    <strong>Schedule conflict:</strong> you already have a confirmed booking
                    on {dayLabel(booking.date) || 'this date'}
                    {fit.conflicts[0].family ? <> with {fit.conflicts[0].family}</> : null}
                    {fit.conflicts[0].time ? <> at {formatTimeOfDay(fit.conflicts[0].time)}</> : null}.
                  </p>
                </div>
              )}
              {fit && fit.pendingOthers > 0 && (
                <p className="acr-detail-note">
                  You have {fit.pendingOthers} other pending request{fit.pendingOthers === 1 ? '' : 's'} for this date.
                </p>
              )}
            </>
          )}

          {booking.status === 'confirmed' && (
            <>
              <p className="acr-dl-heading">Contact</p>
              {parent.phone ? (
                <dl className="acr-dl">
                  <div className="acr-dl-row"><dt>Family’s phone</dt><dd>{parent.phone}</dd></div>
                </dl>
              ) : (
                <p className="acr-detail-note">This family hasn’t shared a phone number.</p>
              )}
            </>
          )}
          {isPending && (
            <p className="acr-detail-note">
              Contact details are shared with you once you accept a request.
            </p>
          )}

          <div className="acr-detail-actions">
            {isPending && !isExpired && (
              <>
                <button type="button" className="acr-btn-ghost acr-btn-danger" onClick={() => startConfirm('decline')} disabled={acting}>
                  Decline
                </button>
                <button type="button" className="acr-btn" onClick={() => startConfirm('accept')} disabled={acting}>
                  Accept Request
                </button>
              </>
            )}
            {isExpired && (
              <>
                <p className="acr-detail-note acr-detail-note-wide">
                  The care date for this request has passed, so it can no longer be accepted.
                </p>
                <button type="button" className="acr-btn-ghost acr-btn-danger" onClick={() => startConfirm('decline')} disabled={acting}>
                  Decline
                </button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <button type="button" className="acr-btn" onClick={onViewSchedule}>
                <Ic.Calendar width={15} height={15} /> View My Schedule
              </button>
            )}
            {booking.status === 'declined' && (
              <p className="acr-detail-note acr-detail-note-wide">You declined this request. It stays in your records under Declined.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CARE REQUESTS — page shell + discovery experience
   ═══════════════════════════════════════════════════════ */
const TABS = [
  { id: 'new', label: 'New', emptyIcon: Ic.Inbox },
  { id: 'recommended', label: 'Recommended', emptyIcon: Ic.Sparkles },
  { id: 'pending', label: 'Pending', emptyIcon: Ic.Clock },
  { id: 'accepted', label: 'Accepted', emptyIcon: Ic.CalendarCheck },
  { id: 'declined', label: 'Declined', emptyIcon: Ic.X },
  { id: 'expired', label: 'Expired', emptyIcon: Ic.Calendar },
];

const naturalTab = (b, todayStr) => {
  if (b.status === 'confirmed') return 'accepted';
  if (b.status === 'declined') return 'declined';
  if (isPastDate(b, todayStr)) return 'expired';
  return 'new';
};

function AyaCareRequests() {
  const [searchParams] = useSearchParams();

  const [booting, setBooting] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [noProfile, setNoProfile] = useState(null);   // 'parent' | 'none'
  const [bookings, setBookings] = useState(null);     // null while loading
  const [payments, setPayments] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('new');
  const [filters, setFilters] = useState({ date: 'any', time: 'any', area: 'any', childAge: 'any', duration: 'any' });
  const [selectedId, setSelectedId] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [lastOutcome, setLastOutcome] = useState(null); // { id, action } for the success panel
  const [isMobile, setIsMobile] = useState(false);
  const deepLinked = useRef(false);

  /* ── Data loading (real data only: this Aya's bookings and
     the payments made for those bookings) ─────────────── */
  const loadData = async (ayaId) => {
    setLoadError(null);
    const { data: bk, error: bkErr } = await supabase
      .from('bookings')
      .select('*, parents(name, phone, location, child_age)')
      .eq('aya_id', ayaId)
      .order('created_at', { ascending: false });
    if (bkErr) {
      setLoadError('We couldn’t load your care requests right now. Please try again.');
      return;
    }
    const list = bk || [];
    setBookings(list);
    /* Payments are a secondary slice — if the payments table can't be
       read, requests stay fully usable with rate-based estimates. */
    if (list.length) {
      const { data: pays, error: payErr } = await supabase
        .from('payments')
        .select('id, booking_id, amount, currency, status, paid_at, created_at')
        .in('booking_id', list.map((b) => b.id));
      setPayments(payErr ? [] : (pays || []));
    } else {
      setPayments([]);
    }
  };

  /* Boot: restore session, load the Aya profile, then data */
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setAuthUser(user);
      const { data: aya, error: ayaErr } = await supabase
        .from('ayas')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      if (!alive) return;
      if (ayaErr) {
        setLoadError('We couldn’t load your caregiver profile. Please try again.');
        setBooting(false);
        return;
      }
      if (!aya) {
        const { data: parent } = await supabase
          .from('parents')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
        if (!alive) return;
        setNoProfile(parent ? 'parent' : 'none');
        setBooting(false);
        return;
      }
      setProfile(aya);
      await loadData(aya.id);
      if (alive) setBooting(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Responsive detection — the details panel becomes a
     full-screen sheet below the split-view breakpoint */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Deep link: ?request=<id> opens that request's details */
  useEffect(() => {
    if (booting || !bookings || deepLinked.current) return;
    const rid = searchParams.get('request');
    if (!rid) return;
    deepLinked.current = true;
    const b = bookings.find((x) => x.id === rid);
    if (b) {
      const todayStr = localDateStr(new Date());
      setTab(naturalTab(b, todayStr));
      setSelectedId(rid);
      setLastOutcome(null);
      if (window.innerWidth < 1024) setOverlayOpen(true);
    }
  }, [booting, bookings, searchParams]);

  /* Escape closes the mobile sheet; lock body scroll behind it */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOverlayOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [overlayOpen]);

  /* ── Derived state ─────────────────────────────────── */

  const todayStr = localDateStr(new Date());

  /* Latest payment row per booking */
  const paymentsByBooking = useMemo(() => {
    const m = {};
    (payments || []).forEach((p) => {
      const cur = m[p.booking_id];
      if (!cur || new Date(p.created_at || 0) > new Date(cur.created_at || 0)) m[p.booking_id] = p;
    });
    return m;
  }, [payments]);

  /* Fit factors per booking (real profile + schedule data) */
  const fits = useMemo(() => {
    const m = {};
    if (bookings && profile) {
      bookings.forEach((b) => { m[b.id] = fitFor(b, profile, bookings, todayStr); });
    }
    return m;
  }, [bookings, profile, todayStr]);

  /* Status buckets behind the tabs */
  const buckets = useMemo(() => {
    if (!bookings) return null;
    const res = { new: [], recommended: [], pending: [], accepted: [], declined: [], expired: [] };
    bookings.forEach((b) => {
      if (b.status === 'pending') {
        res.pending.push(b);
        if (isPastDate(b, todayStr)) {
          res.expired.push(b);
        } else {
          res.new.push(b);
          if (fits[b.id] && fits[b.id].recommended) res.recommended.push(b);
        }
      } else if (b.status === 'confirmed') res.accepted.push(b);
      else if (b.status === 'declined') res.declined.push(b);
    });
    res.new.sort(byDateTime);
    res.recommended.sort(byDateTime);
    res.pending.sort(byDateTime);
    res.accepted.sort(byDateTime);
    res.declined.sort(byCreatedDesc);
    res.expired.sort(byCreatedDesc);
    return res;
  }, [bookings, fits, todayStr]);

  /* Filter options derived from the real loaded requests —
     a filter is only offered when it can actually narrow data */
  const filterOpts = useMemo(() => {
    const list = bookings || [];
    const areas = [...new Set(list.map((b) => b.parents && b.parents.location).filter(Boolean))];
    const ages = [...new Set(list.map((b) => b.parents && b.parents.child_age)
      .filter((a) => a != null && a !== '').map(String))];
    const durations = [...new Set(list.map((b) => b.duration).filter(Boolean).map(String))];
    return { areas: areas.sort(), ages: ages.sort(), durations: durations.sort() };
  }, [bookings]);

  const anyFilterActive = filters.date !== 'any' || filters.time !== 'any' || filters.area !== 'any'
    || filters.childAge !== 'any' || filters.duration !== 'any';

  /* The visible list: current tab + active filters */
  const visible = useMemo(() => {
    if (!buckets) return null;
    let list = buckets[tab] || [];
    if (filters.date !== 'any') {
      const today = new Date();
      const t = localDateStr(today);
      const tm = localDateStr(new Date(Date.now() + 86400000));
      const wk = localDateStr(new Date(Date.now() + 6 * 86400000));
      list = list.filter((b) => {
        const d = b.date ? String(b.date).slice(0, 10) : null;
        if (!d) return false;
        if (filters.date === 'today') return d === t;
        if (filters.date === 'tomorrow') return d === tm;
        return d >= t && d <= wk; // 'week'
      });
    }
    if (filters.time !== 'any') list = list.filter((b) => timeBucket(b) === filters.time);
    if (filters.area !== 'any') list = list.filter((b) => (b.parents && b.parents.location) === filters.area);
    if (filters.childAge !== 'any') list = list.filter((b) => b.parents && String(b.parents.child_age) === filters.childAge);
    if (filters.duration !== 'any') list = list.filter((b) => String(b.duration) === filters.duration);
    return list;
  }, [buckets, tab, filters]);

  /* Amount for a booking: the real payment when one exists,
     otherwise an estimate from the Aya's own rate */
  const amountFor = (b) => {
    const pay = paymentsByBooking[b.id];
    if (pay && pay.amount != null && pay.amount !== '') {
      return { value: parseFloat(pay.amount), source: 'payment', payment: pay };
    }
    if (profile && profile.rate_per_hour != null && profile.rate_per_hour !== '' && b.duration) {
      return { value: Number(profile.rate_per_hour) * b.duration, source: 'estimate' };
    }
    return null;
  };

  const selectedBooking = useMemo(
    () => (bookings || []).find((b) => b.id === selectedId) || null,
    [bookings, selectedId],
  );

  /* ── Actions ───────────────────────────────────────── */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const select = (id) => {
    setSelectedId(id);
    setLastOutcome(null);
    if (isMobile) setOverlayOpen(true);
  };

  /* Accept / decline. Server-side authorized via the backend
     route (JWT-verified ownership + pending-status guard); if
     the backend can't be reached, the same guards — ownership
     and still-pending — are enforced inside the conditional
     UPDATE's WHERE clause so a response can never duplicate. */
  const respond = async (booking, action) => {
    if (!profile || actingId) return;
    setActingId(booking.id);
    setActionError(null);
    const nextStatus = action === 'accept' ? 'confirmed' : 'declined';
    try {
      let updatedBooking = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${BACKEND_URL}/api/aya/requests/${booking.id}/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session && session.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ action }),
        });
        if (res.ok) {
          const data = await res.json();
          updatedBooking = data.booking || null;
        } else if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 409) {
          /* The backend answered authoritatively — trust it, never retry elsewhere */
          const data = await res.json().catch(() => ({}));
          const err = new Error(data.error || 'We couldn’t update this request.');
          err.status = res.status;
          throw err;
        }
        /* 404 / 5xx — route not deployed yet or upstream failed: fall
           back to the direct conditional update below */
      } catch (backendErr) {
        if (backendErr && backendErr.status) throw backendErr;
        /* Network failure reaching the backend — fall through too */
      }

      if (!updatedBooking) {
        if (action === 'accept' && isPastDate(booking, todayStr)) {
          const err = new Error('This request is for a past date and can no longer be accepted.');
          err.status = 400;
          throw err;
        }
        const { data: updated, error } = await supabase
          .from('bookings')
          .update({ status: nextStatus })
          .eq('id', booking.id)
          .eq('aya_id', profile.id)
          .eq('status', 'pending')
          .select('*, parents(name, phone, location, child_age)')
          .maybeSingle();
        if (error) {
          const err = new Error('We couldn’t update this request. Please try again.');
          err.status = 500;
          throw err;
        }
        if (!updated) {
          const err = new Error('This request was just responded to in another session.');
          err.status = 409;
          throw err;
        }
        updatedBooking = updated;
      }

      /* Sync local state with the real updated row */
      setBookings((list) => (list || []).map((b) => (
        b.id === updatedBooking.id ? { ...b, status: updatedBooking.status } : b
      )));
      setLastOutcome({ id: updatedBooking.id, action });
    } catch (err) {
      if (err && err.status === 409) {
        /* Another session already responded — resync to server truth */
        await loadData(profile.id);
      }
      setActionError(err.message || 'We couldn’t update this request. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const goHome = () => { window.location.href = '/aya-dashboard'; };
  const viewSchedule = () => { window.location.href = '/aya-dashboard#ad-upcoming'; };

  /* ── Identity bits ─────────────────────────────────── */

  const avatarText = initials((profile && profile.name) || (authUser && authUser.email) || '');
  const isAvail = !!(profile && profile.is_available);

  const header = (
    <header className="acr-header">
      <Logo />
      <div className="acr-header-right">
        {profile && (
          <span className={`acr-avail-pill${isAvail ? ' on' : ' off'}`}>
            <span className="acr-avail-dot" aria-hidden="true" />
            {isAvail ? 'Available' : 'Unavailable'}
          </span>
        )}
        <div className="acr-avatar acr-avatar-sm" aria-hidden="true">{avatarText}</div>
        <button type="button" className="acr-logout" onClick={handleLogout}>
          <Ic.LogOut width={15} height={15} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );

  /* ── Loading / role mismatch / hard error shells ──── */

  if (booting) {
    return (
      <div className="acr-app">
        <style>{ACR_CSS}</style>
        {header}
        <main className="acr-main">
          <div className="acr-content"><SkeletonPage /></div>
        </main>
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="acr-app">
        <style>{ACR_CSS}</style>
        {header}
        <main className="acr-main">
          <div className="acr-content">
            <NoProfileCard kind={noProfile} onSignOut={handleLogout} />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="acr-app">
        <style>{ACR_CSS}</style>
        {header}
        <main className="acr-main">
          <div className="acr-content">
            <ErrorCard
              message={loadError || 'We couldn’t load your caregiver profile. Please try again.'}
              onRetry={() => { window.location.reload(); }}
            />
          </div>
        </main>
      </div>
    );
  }

  /* ── Page header + attention line (real counts only) ── */

  const newCount = buckets ? buckets.new.length : 0;
  const recCount = buckets ? buckets.recommended.length : 0;

  /* ── Empty states per tab ─────────────────────────── */

  const emptyForTab = (tabId) => {
    if (tabId === 'new') {
      return isAvail ? {
        title: 'No new requests right now',
        text: 'When a parent requests your care, it will appear here for you to accept or decline.',
      } : {
        title: 'You’re not visible to parents',
        text: 'You’re currently unavailable, so parents can’t request you. Turn on availability from your Home to start receiving requests.',
        action: { label: 'Go to Home', onClick: goHome },
      };
    }
    if (tabId === 'recommended') {
      return {
        title: 'No recommended requests',
        text: profile.location
          ? `Requests in your area (${profile.location}) that don’t clash with your confirmed bookings are highlighted here.`
          : 'Set your location so requests near you can be highlighted here.',
      };
    }
    if (tabId === 'pending') {
      return { title: 'No pending requests', text: 'Requests awaiting your response appear here.' };
    }
    if (tabId === 'accepted') {
      return { title: 'No accepted bookings yet', text: 'When you accept a request, the booking will appear here.' };
    }
    if (tabId === 'declined') {
      return { title: 'No declined requests', text: 'Requests you decline are kept here for your records.' };
    }
    return { title: 'No expired requests', text: 'Pending requests whose care date passes without a response are kept here.' };
  };

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  const listBody = visible === null ? (
    <div className="acr-card acr-skel-card">
      <div className="acr-skel acr-skel-row" style={{ width: '30%' }} />
      <div className="acr-skel acr-skel-row" style={{ width: '52%' }} />
      <div className="acr-skel acr-skel-sm" />
    </div>
  ) : visible.length ? (
    <div className="acr-card acr-list">
      {visible.map((b) => (
        <RequestRow
          key={b.id}
          booking={b}
          amount={amountFor(b)}
          fit={fits[b.id]}
          selected={b.id === selectedId}
          onSelect={() => select(b.id)}
        />
      ))}
    </div>
  ) : anyFilterActive ? (
    <EmptyState
      Icon={Ic.Filter}
      title="No requests match your filters"
      text="Nothing in this category matches the filters you’ve set. Try widening or clearing them."
    >
      <button type="button" className="acr-btn-ghost" onClick={() => setFilters({ date: 'any', time: 'any', area: 'any', childAge: 'any', duration: 'any' })}>
        Clear Filters
      </button>
    </EmptyState>
  ) : (
    (() => {
      const e = emptyForTab(tab);
      return (
        <EmptyState Icon={activeTab.emptyIcon} title={e.title} text={e.text}>
          {e.action && (
            <button type="button" className="acr-btn" onClick={e.action.onClick}>
              {e.action.label}
            </button>
          )}
        </EmptyState>
      );
    })()
  );

  const detailBody = selectedBooking ? (
    <DetailPanel
      key={selectedBooking.id}
      booking={selectedBooking}
      fit={fits[selectedBooking.id]}
      amount={amountFor(selectedBooking)}
      rate={profile ? profile.rate_per_hour : null}
      payment={paymentsByBooking[selectedBooking.id]}
      acting={actingId === selectedBooking.id}
      outcome={lastOutcome}
      isMobile={isMobile}
      onBack={() => setOverlayOpen(false)}
      onRespond={respond}
      onViewSchedule={viewSchedule}
    />
  ) : (
    <div className="acr-card acr-detail acr-detail-empty">
      <div className="acr-detail-empty-icon"><Ic.Search width={24} height={24} /></div>
      <h3 className="acr-detail-empty-title">Select a request</h3>
      <p className="acr-section-sub">
        Choose a request from the list to see the care session, the family’s area, what you’d earn, and how it fits
        your schedule — then accept or decline it.
      </p>
      <div className="acr-detail-steps">
        <span className="acr-step"><Ic.Inbox width={13} height={13} /> Discover</span>
        <span className="acr-step"><Ic.User width={13} height={13} /> Understand</span>
        <span className="acr-step"><Ic.Sparkles width={13} height={13} /> Evaluate fit</span>
        <span className="acr-step"><Ic.CheckCircle width={13} height={13} /> Respond</span>
      </div>
    </div>
  );

  return (
    <div className="acr-app">
      <style>{ACR_CSS}</style>
      {header}
      <main className="acr-main">
        <div className="acr-content">
          <button type="button" className="acr-back" onClick={goHome}>
            <Ic.ArrowLeft width={15} height={15} />
            <span>Back to Home</span>
          </button>

          <header className="acr-pagehead">
            <h1 className="acr-page-title">Care Requests</h1>
            <p className="acr-page-sub">
              Discover childcare opportunities that fit your experience, availability, and preferences.
            </p>
          </header>

          {actionError && (
            <div className="acr-alert" role="alert">
              <Ic.AlertCircle width={16} height={16} />
              <p>{actionError}</p>
              <button type="button" className="acr-alert-x" onClick={() => setActionError(null)} aria-label="Dismiss">
                <Ic.X width={14} height={14} />
              </button>
            </div>
          )}

          {loadError ? (
            <ErrorCard message={loadError} onRetry={() => loadData(profile.id)} />
          ) : (
            <>
              {buckets && newCount > 0 && (
                <div className="acr-attention" role="status">
                  <Ic.Bell width={15} height={15} />
                  <p>
                    {newCount} {newCount === 1 ? 'request is' : 'requests are'} awaiting your response
                    {recCount > 0 ? ` — ${recCount} ${recCount === 1 ? 'looks' : 'look'} like a strong fit for you.` : '.'}
                  </p>
                </div>
              )}

              <div className="acr-tabs" role="tablist" aria-label="Request categories">
                {TABS.map((t) => {
                  const count = buckets ? buckets[t.id].length : 0;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`acr-tab${tab === t.id ? ' active' : ''}`}
                      onClick={() => setTab(t.id)}
                    >
                      <span>{t.label}</span>
                      <span className="acr-tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="acr-filters">
                <span className="acr-filters-label"><Ic.Filter width={13} height={13} /> Filters</span>
                <label className="acr-filter">
                  <span>Date</span>
                  <select value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}>
                    <option value="any">Any date</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">Next 7 days</option>
                  </select>
                </label>
                <label className="acr-filter">
                  <span>Time</span>
                  <select value={filters.time} onChange={(e) => setFilters((f) => ({ ...f, time: e.target.value }))}>
                    <option value="any">Any time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </label>
                {filterOpts.areas.length > 1 && (
                  <label className="acr-filter">
                    <span>Area</span>
                    <select value={filters.area} onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value }))}>
                      <option value="any">Any area</option>
                      {filterOpts.areas.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </label>
                )}
                {filterOpts.ages.length > 1 && (
                  <label className="acr-filter">
                    <span>Child age</span>
                    <select value={filters.childAge} onChange={(e) => setFilters((f) => ({ ...f, childAge: e.target.value }))}>
                      <option value="any">Any age</option>
                      {filterOpts.ages.map((a) => <option key={a} value={a}>{childAgeText(a)}</option>)}
                    </select>
                  </label>
                )}
                {filterOpts.durations.length > 1 && (
                  <label className="acr-filter">
                    <span>Duration</span>
                    <select value={filters.duration} onChange={(e) => setFilters((f) => ({ ...f, duration: e.target.value }))}>
                      <option value="any">Any duration</option>
                      {filterOpts.durations.map((d) => <option key={d} value={d}>{d} {Number(d) === 1 ? 'hour' : 'hours'}</option>)}
                    </select>
                  </label>
                )}
                {anyFilterActive && (
                  <button
                    type="button"
                    className="acr-clear"
                    onClick={() => setFilters({ date: 'any', time: 'any', area: 'any', childAge: 'any', duration: 'any' })}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="acr-split">
                <section className="acr-listcol" aria-label={`${activeTab.label} requests`}>
                  {listBody}
                </section>
                {!isMobile && (
                  <aside className="acr-detailcol" aria-label="Request details">
                    {detailBody}
                  </aside>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {isMobile && overlayOpen && selectedBooking && (
        <div
          className="acr-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Request details"
          onClick={(e) => { if (e.target === e.currentTarget) setOverlayOpen(false); }}
        >
          {detailBody}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES — AyaFind visual tokens, scoped with the acr- prefix
   ═══════════════════════════════════════════════════════ */
const ACR_CSS = `
.acr-app{min-height:100vh;background:${C.bg};color:${C.text};font-family:${FF};-webkit-font-smoothing:antialiased;}
.acr-app *,.acr-app *::before,.acr-app *::after{box-sizing:border-box;}
.acr-app button{font-family:inherit;cursor:pointer;}
.acr-app select{font-family:inherit;}
.acr-app h1,.acr-app h2,.acr-app h3,.acr-app h4,.acr-app p,.acr-app dl,.acr-app dd,.acr-app ul{margin:0;padding:0;}
.acr-app :focus-visible{outline:2px solid ${C.teal};outline-offset:2px;}

/* Header */
.acr-header{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 28px;background:rgba(250,249,245,0.92);backdrop-filter:blur(10px);border-bottom:1px solid ${C.border};}
.acr-header-right{display:flex;align-items:center;gap:12px;}
.acr-avail-pill{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:0.02em;}
.acr-avail-pill.on{background:${C.greenBg};color:${C.green};}
.acr-avail-pill.off{background:#F1EFEA;color:${C.textSec};}
.acr-avail-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}
.acr-logout{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.textSec};font-size:13px;font-weight:700;transition:border-color .18s ease,color .18s ease;}
.acr-logout:hover{border-color:#C23B3B;color:#C23B3B;}

/* Layout */
.acr-main{min-height:calc(100vh - 60px);display:flex;flex-direction:column;}
.acr-content{width:100%;max-width:1120px;margin:0 auto;padding:26px 32px 64px;flex:1;}

/* Avatars */
.acr-avatar{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${C.tealSoft};color:${C.teal};font-size:14px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;}
.acr-avatar-sm{width:34px;height:34px;font-size:12.5px;}
.acr-avatar-lg{width:52px;height:52px;font-size:17px;}
.acr-avatar-coral{background:${C.coralSoft};color:${C.coral};}

/* Buttons */
.acr-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border:none;border-radius:10px;background:${C.teal};color:#fff;font-size:14px;font-weight:700;box-shadow:0 6px 16px rgba(39,143,135,0.22);transition:background .18s ease,box-shadow .18s ease,transform .18s ease;}
.acr-btn:hover{background:#1F7A73;box-shadow:0 8px 20px rgba(39,143,135,0.3);}
.acr-btn:active{transform:translateY(1px);}
.acr-btn:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}
.acr-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.text};font-size:13.5px;font-weight:700;transition:border-color .18s ease,color .18s ease,background .18s ease;}
.acr-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.acr-btn-danger{border-color:rgba(194,59,59,0.35);color:#C23B3B;}
.acr-btn-danger:hover{border-color:#C23B3B;color:#C23B3B;background:#FBE9E9;}

/* Cards + shared bits */
.acr-card{background:#fff;border:1px solid ${C.border};border-radius:14px;box-shadow:0 1px 2px rgba(23,36,61,0.04);}
.acr-status{display:inline-flex;align-items:center;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.06em;}
.acr-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:9px;background:${C.bg};color:${C.textSec};transition:background .18s ease,color .18s ease;flex-shrink:0;}
.acr-iconbtn:hover{background:${C.border};color:${C.text};}
.acr-section-title{font-size:16.5px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.acr-section-sub{font-size:14px;color:${C.textSec};line-height:1.55;}

/* Page head */
.acr-back{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.textSec};font-size:13px;font-weight:700;margin-bottom:16px;transition:border-color .18s ease,color .18s ease;}
.acr-back:hover{border-color:${C.teal};color:${C.teal};}
.acr-pagehead{margin-bottom:20px;animation:acrFadeUp .4s ease both;}
.acr-page-title{font-size:clamp(24px,3vw,30px);font-weight:800;letter-spacing:-0.02em;color:${C.navy};}
.acr-page-sub{margin-top:7px;font-size:15px;color:${C.textSec};max-width:600px;line-height:1.5;}

/* Attention + alert */
.acr-attention{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;margin-bottom:16px;border-radius:11px;background:${C.tealSoft};border:1px solid rgba(39,143,135,0.25);color:#1F7A73;font-size:13.5px;font-weight:600;line-height:1.5;}
.acr-attention svg{flex-shrink:0;margin-top:2px;}
.acr-alert{display:flex;align-items:center;gap:10px;padding:12px 16px;margin-bottom:18px;border-radius:11px;background:#FBE9E9;border:1px solid rgba(194,59,59,0.2);}
.acr-alert > svg{color:#C23B3B;flex-shrink:0;}
.acr-alert p{flex:1;font-size:13.5px;font-weight:600;color:#A03030;line-height:1.45;}
.acr-alert-x{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:8px;background:transparent;color:#C23B3B;}
.acr-alert-x:hover{background:rgba(194,59,59,0.1);}

/* Tabs */
.acr-tabs{display:flex;gap:8px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px;scrollbar-width:thin;}
.acr-tab{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border:1px solid ${C.border};border-radius:999px;background:#fff;color:${C.textSec};font-size:13px;font-weight:700;white-space:nowrap;transition:border-color .18s ease,color .18s ease,background .18s ease;}
.acr-tab:hover{border-color:${C.teal};color:${C.teal};}
.acr-tab.active{background:${C.navy};border-color:${C.navy};color:#fff;}
.acr-tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;padding:1px 6px;border-radius:999px;background:${C.bg};font-size:11px;font-weight:800;color:${C.textSec};}
.acr-tab.active .acr-tab-count{background:rgba(255,255,255,0.16);color:#fff;}

/* Filters */
.acr-filters{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:18px;}
.acr-filters-label{display:inline-flex;align-items:center;gap:6px;padding-bottom:9px;font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};}
.acr-filters-label svg{color:${C.teal};}
.acr-filter{display:flex;flex-direction:column;gap:5px;font-size:10.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.textSec};}
.acr-filter select{appearance:none;-webkit-appearance:none;padding:8px 30px 8px 12px;border:1px solid ${C.border};border-radius:10px;background-color:#fff;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23657081' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;color:${C.text};font-size:12.5px;font-weight:700;cursor:pointer;transition:border-color .18s ease;}
.acr-filter select:hover{border-color:${C.teal};}
.acr-clear{padding:9px 12px;border:none;border-radius:10px;background:transparent;color:${C.teal};font-size:12.5px;font-weight:800;text-decoration:underline;text-underline-offset:3px;}
.acr-clear:hover{color:#1F7A73;}

/* Split layout — discovery list + details side panel */
.acr-split{display:grid;grid-template-columns:minmax(0,1fr) 396px;gap:20px;align-items:start;animation:acrFadeUp .4s .05s ease both;}
.acr-listcol{min-width:0;}
.acr-detailcol{position:sticky;top:82px;max-height:calc(100vh - 102px);overflow-y:auto;scrollbar-width:thin;}

/* Request list rows */
.acr-list{overflow:hidden;}
.acr-row{display:grid;grid-template-columns:minmax(118px,auto) minmax(0,1fr) auto 17px;align-items:center;gap:16px;width:100%;padding:15px 18px;background:#fff;border:none;border-bottom:1px solid ${C.bg};text-align:left;font-family:inherit;color:inherit;transition:background .16s ease,box-shadow .16s ease;}
.acr-row:last-child{border-bottom:none;}
.acr-row:hover{background:#FCFBF8;}
.acr-row.awaiting{box-shadow:inset 3px 0 0 0 ${C.teal};}
.acr-row.selected{background:${C.tealSoft};box-shadow:inset 0 0 0 1.5px rgba(39,143,135,0.45);}
.acr-row.selected .acr-row-chevron{color:${C.teal};}
.acr-row-when{display:flex;flex-direction:column;gap:3px;}
.acr-row-date{font-size:13.5px;font-weight:800;color:${C.text};}
.acr-row-time{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:${C.textSec};}
.acr-row-time svg{color:${C.teal};flex-shrink:0;}
.acr-row-main{min-width:0;}
.acr-row-family{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14.5px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.acr-row-meta{margin-top:3px;font-size:12.5px;color:${C.textSec};}
.acr-rec-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:${C.coralSoft};color:#D85A38;font-size:10.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;}
.acr-rec-pill svg{flex-shrink:0;}
.acr-row-side{display:flex;flex-direction:column;align-items:flex-end;gap:7px;flex-shrink:0;}
.acr-row-amount{text-align:right;}
.acr-row-amount-value{font-size:14px;font-weight:800;color:${C.navy};}
.acr-row-amount-label{display:block;margin-top:1px;font-size:11px;font-weight:600;color:${C.textMuted};}
.acr-row-chevron{color:${C.textMuted};flex-shrink:0;transition:color .16s ease;}

/* Detail panel */
.acr-detail{background:#fff;border:1px solid ${C.border};border-radius:14px;box-shadow:0 1px 2px rgba(23,36,61,0.04);padding:20px 22px;animation:acrFadeUp .3s ease both;}
.acr-detail-head{display:flex;align-items:center;gap:13px;}
.acr-detail-headtext{flex:1;min-width:0;}
.acr-detail-title{font-size:17px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.acr-detail-statusrow{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:6px;}
.acr-detail-caption{font-size:12px;color:${C.textSec};font-weight:600;}
.acr-detail-requested{margin-top:8px;font-size:12px;color:${C.textMuted};font-weight:600;}

/* Success + confirm */
.acr-success{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:18px;border-radius:12px;background:${C.greenBg};border:1px solid rgba(52,148,106,0.25);animation:acrFadeUp .3s ease both;}
.acr-success-icon{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#fff;color:${C.green};margin-bottom:6px;box-shadow:0 4px 12px rgba(52,148,106,0.2);}
.acr-success-title{font-size:16px;font-weight:800;color:${C.green};}
.acr-success-text{margin-top:4px;font-size:13.5px;color:#256B4E;line-height:1.55;font-weight:600;}
.acr-success-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;}
.acr-confirm{padding:18px;border-radius:12px;background:${C.bg};border:1px dashed ${C.border};animation:acrFadeUp .25s ease both;}
.acr-confirm-title{font-size:15.5px;font-weight:800;color:${C.text};}
.acr-confirm-text{margin-top:7px;font-size:13.5px;color:${C.textSec};line-height:1.6;}
.acr-confirm-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;flex-wrap:wrap;}

/* Definition lists, notes, warnings */
.acr-dl-heading{font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};margin:18px 0 8px;}
.acr-dl{border:1px solid ${C.border};border-radius:11px;overflow:hidden;}
.acr-dl-row{display:flex;justify-content:space-between;gap:14px;padding:10px 14px;font-size:13.5px;}
.acr-dl-row + .acr-dl-row{border-top:1px solid ${C.bg};}
.acr-dl-row dt{color:${C.textSec};font-weight:600;}
.acr-dl-row dd{margin:0;color:${C.text};font-weight:700;text-align:right;}
.acr-detail-note{margin-top:10px;padding:11px 14px;border-radius:10px;background:${C.bg};font-size:12.5px;line-height:1.55;color:${C.textSec};font-weight:600;}
.acr-detail-note-wide{flex:1;min-width:200px;margin-top:0;}
.acr-warn{display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding:12px 14px;border-radius:10px;background:#FBF1D8;border:1px solid rgba(154,107,21,0.25);}
.acr-warn svg{flex-shrink:0;color:#9A6B15;margin-top:2px;}
.acr-warn p{font-size:13px;line-height:1.5;color:#9A6B15;font-weight:600;}

/* Why this fits you */
.acr-factors{list-style:none;display:flex;flex-direction:column;gap:8px;}
.acr-factor{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;color:${C.text};line-height:1.5;font-weight:600;}
.acr-factor-icon{display:inline-flex;align-items:center;justify-content:center;width:27px;height:27px;border-radius:8px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}

/* Detail actions */
.acr-detail-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:20px;padding-top:16px;border-top:1px solid ${C.border};}

/* Detail empty (desktop placeholder) */
.acr-detail-empty{padding:30px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.acr-detail-empty-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:12px;}
.acr-detail-empty-title{font-size:15.5px;font-weight:800;color:${C.text};}
.acr-detail-empty .acr-section-sub{margin-top:6px;max-width:320px;}
.acr-detail-steps{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:16px;}
.acr-step{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:${C.bg};border:1px solid ${C.border};font-size:12px;font-weight:700;color:${C.textSec};}
.acr-step svg{color:${C.teal};flex-shrink:0;}

/* Empty + error + no-profile */
.acr-empty{padding:30px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.acr-empty-icon{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:11px;}
.acr-empty-icon-coral{background:${C.coralSoft};color:${C.coral};}
.acr-empty-title{font-size:15.5px;font-weight:800;color:${C.text};}
.acr-empty .acr-section-sub{margin-top:5px;max-width:440px;}
.acr-empty .acr-btn,.acr-empty .acr-btn-ghost{margin-top:14px;}
.acr-error-card{padding:34px 26px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.acr-error-card .acr-section-sub{margin-top:6px;max-width:420px;}
.acr-error-card .acr-btn{margin-top:16px;}
.acr-noprofile{max-width:480px;margin:48px auto 0;padding:44px 30px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.acr-noprofile-title{font-size:20px;font-weight:800;color:${C.text};}
.acr-noprofile .acr-section-sub{margin-top:8px;}
.acr-noprofile-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;justify-content:center;}

/* Mobile details sheet */
.acr-overlay{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;background:rgba(17,27,46,0.5);animation:acrFade .2s ease;}
.acr-detail-sheet{width:100%;max-width:620px;max-height:92vh;overflow-y:auto;border-radius:18px 18px 0 0;border-bottom:none;box-shadow:0 -12px 44px rgba(17,27,46,0.3);animation:acrSheetUp .3s cubic-bezier(0.2,0.7,0.3,1) both;padding-bottom:calc(22px + env(safe-area-inset-bottom));}
.acr-detail-sheet::before{content:"";display:block;width:44px;height:4px;margin:0 auto 14px;border-radius:999px;background:${C.border};}

/* Skeletons */
.acr-skel{border-radius:7px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:acrShimmer 1.3s infinite linear;}
.acr-skel-head{display:flex;flex-direction:column;align-items:flex-start;gap:12px;margin-bottom:22px;}
.acr-skel-btn{width:140px;height:36px;border-radius:10px;}
.acr-skel-title{width:38%;height:26px;}
.acr-skel-row{height:15px;margin-bottom:10px;}
.acr-skel-sm{width:55%;height:12px;}
.acr-skel-card{padding:20px;margin-bottom:14px;}

/* Motion */
@keyframes acrFade{from{opacity:0;}to{opacity:1;}}
@keyframes acrFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes acrShimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@keyframes acrSheetUp{from{opacity:0;transform:translateY(48px);}to{opacity:1;transform:translateY(0);}}

/* Responsive */
@media (max-width:1024px){
  .acr-content{padding:24px 24px 56px;}
  .acr-split{grid-template-columns:1fr;}
  .acr-detailcol{position:static;max-height:none;overflow:visible;}
}
@media (max-width:860px){
  .acr-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:14px 16px;}
  .acr-row-when{flex-direction:row;align-items:center;gap:8px;flex-wrap:wrap;width:100%;}
  .acr-row-main{flex:1;min-width:150px;}
  .acr-row-side{flex-direction:row;align-items:center;gap:10px;}
  .acr-row-chevron{display:none;}
}
@media (max-width:640px){
  .acr-header{padding:11px 16px;}
  .acr-logout span{display:none;}
  .acr-logout{padding:9px 11px;}
  .acr-avail-pill{display:none;}
  .acr-content{padding:20px 16px 48px;}
  .acr-page-sub{font-size:14px;}
  .acr-filters-label{display:none;}
  .acr-filter select{padding:8px 26px 8px 10px;font-size:12px;}
  .acr-detail{padding:18px 16px;}
  .acr-detail-actions{flex-direction:column;align-items:stretch;}
  .acr-detail-actions .acr-btn,.acr-detail-actions .acr-btn-ghost{width:100%;}
  .acr-confirm-actions{flex-direction:column;align-items:stretch;}
  .acr-confirm-actions .acr-btn,.acr-confirm-actions .acr-btn-ghost{width:100%;}
  .acr-success-actions{flex-direction:column;align-items:stretch;}
  .acr-success-actions .acr-btn,.acr-success-actions .acr-btn-ghost{width:100%;}
}
@media (prefers-reduced-motion:reduce){
  .acr-app *,.acr-app *::before,.acr-app *::after{animation-duration:0.001s !important;transition-duration:0.001s !important;}
}
`;

export default AyaCareRequests;
