import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import BookingFlow from './BookingFlow';
import FindCare from './FindCare';
import MyBookings from './MyBookings';
import MyFamily from './MyFamily';
import Payments from './Payments';
import Messages from './Messages';
import { parseCareRequest, parseTimeOfDay, formatTimeOfDay } from '../utils/parseCareRequest';

/* ═══════════════════════════════════════════════════════
   PARENT DASHBOARD — a personal childcare command center
   Shell navigation + Home experience. Visual system matches
   Landing / Register / Login (shared tokens kept inline per
   the project's per-page convention).
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
  Home: (p) => <svg {...sv} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: (p) => <svg {...sv} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CalendarCheck: (p) => <svg {...sv} {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>,
  Users: (p) => <svg {...sv} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  CreditCard: (p) => <svg {...sv} {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  MessageCircle: (p) => <svg {...sv} {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Menu: (p) => <svg {...sv} {...p}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  LogOut: (p) => <svg {...sv} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Sparkles: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Banknote: (p) => <svg {...sv} {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>,
  ArrowRight: (p) => <svg {...sv} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 19 12 12 5"/></svg>,
  ArrowLeft: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  CheckCircle: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Plus: (p) => <svg {...sv} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Heart: (p) => <svg {...sv} {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>,
  User: (p) => <svg {...sv} {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

/* ═══════════════════════════════════════════════════════
   LOGO — parent & child (same mark as Landing / Register / Login)
   ═══════════════════════════════════════════════════════ */
const Logo = ({ dark, compact }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '9px' : '11px' }}>
    <svg width={compact ? 28 : 34} height={compact ? 28 : 34} viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <circle cx="10" cy="6" r="3.5" stroke={dark ? '#fff' : C.navy} strokeWidth="1.8" fill="none"/>
      <path d="M4.5 29v-8c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5v8" stroke={dark ? '#fff' : C.navy} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="20.5" cy="11.5" r="2.8" stroke={C.teal} strokeWidth="1.8" fill="none"/>
      <path d="M16 29v-6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v6" stroke={C.teal} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M15 16.5c-.5-.5-1.2-.5-1.7 0s-.5 1.2 0 1.7L15 20l1.7-1.8c.5-.5.5-1.2 0-1.7s-1.2-.5-1.7 0z" fill={C.coral}/>
    </svg>
    <span style={{ fontSize: compact ? '19px' : '22px', fontWeight: '800', color: dark ? '#fff' : C.navy, letterSpacing: '-0.025em' }}>
      Aya<span style={{ color: C.teal }}>Find</span>
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════
   NAVIGATION + PLACEHOLDER SECTION META
   ═══════════════════════════════════════════════════════ */
const VIEWS = ['home', 'find-care', 'bookings', 'family', 'payments', 'messages'];

const NAV = [
  { id: 'home', label: 'Home', Icon: Ic.Home },
  { id: 'find-care', label: 'Find Care', Icon: Ic.Search },
  { id: 'bookings', label: 'My Bookings', Icon: Ic.Calendar },
  { id: 'family', label: 'My Family', Icon: Ic.Users },
  { id: 'payments', label: 'Payments', Icon: Ic.CreditCard },
  { id: 'messages', label: 'Messages', Icon: Ic.MessageCircle },
];

/* Sections that are part of the product direction but not built yet —
   honest placeholders, never fake data. */
const PLACEHOLDERS = {
};

const STATUS_STYLES = {
  pending: { label: 'PENDING', color: '#9A6B15', bg: '#FBF1D8' },
  confirmed: { label: 'CONFIRMED', color: C.green, bg: C.greenBg },
  declined: { label: 'DECLINED', color: '#C23B3B', bg: '#FBE9E9' },
  completed: { label: 'COMPLETED', color: C.teal, bg: C.tealSoft },
};
const statusStyle = (status) =>
  STATUS_STYLES[status] || { label: String(status || 'PENDING').toUpperCase(), color: C.textSec, bg: C.bg };

/* ═══════════════════════════════════════════════════════
   FORMATTING HELPERS
   ═══════════════════════════════════════════════════════ */
const firstName = (name) => (name || '').trim().split(/\s+/)[0] || '';

const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};

const greetingFor = (d) => {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dayLabel = (dateStr) => {
  if (!dateStr) return '';
  const today = localDateStr(new Date());
  const tomorrow = localDateStr(new Date(Date.now() + 86400000));
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const longDate = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const relTime = (iso) => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* experience_years is stored both as numbers ("8") and ranges ("3-5 years") */
const expLabel = (a) => {
  const v = a && a.experience_years;
  if (v === null || v === undefined || v === '') return 'Experienced';
  return `${String(v).replace(/\s*years?$/i, '').trim()} yrs`;
};

const rateLabel = (a) =>
  a && a.rate_per_hour !== null && a.rate_per_hour !== undefined && a.rate_per_hour !== ''
    ? `PKR ${a.rate_per_hour}/hr`
    : '';

const childAgeText = (age) => `${age} year${Number(age) === 1 ? '' : 's'} old`;

/* ═══════════════════════════════════════════════════════
   UPCOMING CARE CARD — one real booking row
   ═══════════════════════════════════════════════════════ */
function UpcomingCard({ booking, onView }) {
  const aya = booking.ayas || {};
  const st = statusStyle(booking.status);
  const time = formatTimeOfDay(booking.time);
  return (
    <section className="pd-card pd-upcoming pd-section" aria-label="Upcoming care">
      <div className="pd-up-row">
        <div className="pd-avatar pd-avatar-lg">{initials(aya.name)}</div>
        <div className="pd-up-info">
          <p className="pd-up-when">{[dayLabel(booking.date), time].filter(Boolean).join(' · ')}</p>
          <h3 className="pd-up-name">{aya.name || 'Your caregiver'}</h3>
          <p className="pd-up-meta">
            {[aya.location, `${expLabel(aya)} experience`, rateLabel(aya)].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="pd-up-side">
          <span className="pd-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          <button type="button" className="pd-btn-ghost" onClick={onView}>View Booking</button>
        </div>
      </div>
      {booking.status === 'pending' && (
        <p className="pd-up-note">Waiting for {firstName(aya.name) || 'your caregiver'} to confirm this booking.</p>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FIND CARE CARD — the existing caregiver marketplace card,
   restyled to the AyaFind tokens. Functionality unchanged.
   ═══════════════════════════════════════════════════════ */
function AyaCard({ aya, summary, onBook }) {
  return (
    <article className="pd-card pd-aya">
      <div className="pd-aya-top">
        <div className="pd-avatar pd-avatar-lg">{initials(aya.name)}</div>
        <div className="pd-aya-head">
          <h3 className="pd-aya-name">{aya.name}</h3>
          <p className="pd-aya-loc"><Ic.MapPin width={13} height={13} /> {aya.location || 'Pakistan'}</p>
        </div>
      </div>
      <div className="pd-tags">
        <span className="pd-tag pd-tag-teal">
          <Ic.Shield width={13} height={13} /> Trust Score: {aya.trust_score != null ? aya.trust_score : '—'}/100
        </span>
      </div>
      <div className="pd-aya-details">
        <span><Ic.Award width={14} height={14} /> {expLabel(aya)} experience</span>
        {rateLabel(aya) && <span><Ic.Banknote width={14} height={14} /> {rateLabel(aya)}</span>}
      </div>
      <div className="pd-ai-summary">
        <p className="pd-ai-summary-label"><Ic.Sparkles width={13} height={13} /> AI Safety Summary</p>
        <p className="pd-ai-summary-text">{summary || 'Generating AI summary…'}</p>
      </div>
      <button type="button" className="pd-btn" onClick={onBook}>Book Now</button>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════
   ADD CHILD MODAL — saves the child's age to the existing
   parents.child_age column
   ═══════════════════════════════════════════════════════ */
function ChildModal({ profile, onClose, onSaved }) {
  const hasAge = profile && profile.child_age != null && profile.child_age !== '';
  const [age, setAge] = useState(hasAge ? String(profile.child_age) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!age || saving) return;
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase
      .from('parents')
      .update({ child_age: parseInt(age, 10) })
      .eq('id', profile.id);
    if (updateError) {
      setError('We couldn’t save that right now. Please try again.');
      setSaving(false);
      return;
    }
    onSaved(parseInt(age, 10));
  };

  return (
    <div className="pd-modalwrap" role="dialog" aria-modal="true" aria-label="Add child" onClick={onClose}>
      <div className="pd-modalcard" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-head">
          <div>
            <h3 className="pd-modal-title">{hasAge ? 'Your Child' : 'Add Child'}</h3>
            <p className="pd-modal-sub">A child’s age helps AyaFind match the right caregivers for your family.</p>
          </div>
          <button type="button" className="pd-iconbtn" onClick={onClose} aria-label="Close">
            <Ic.X width={18} height={18} />
          </button>
        </div>
        <label className="pd-label" htmlFor="pd-child-age">Child’s Age</label>
        <select
          id="pd-child-age"
          className="pd-select"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          disabled={saving}
        >
          <option value="" disabled>Select age</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>{i + 1} year{i > 0 ? 's' : ''} old</option>
          ))}
        </select>
        {error && <p className="pd-form-error">{error}</p>}
        <div className="pd-modal-actions">
          <button type="button" className="pd-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="pd-btn" onClick={save} disabled={!age || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOKING DETAILS MODAL — read-only view of a real booking
   ═══════════════════════════════════════════════════════ */
function BookingModal({ booking, onClose }) {
  const aya = booking.ayas || {};
  const st = statusStyle(booking.status);
  const hasExp = aya.experience_years !== null && aya.experience_years !== undefined && aya.experience_years !== '';
  return (
    <div className="pd-modalwrap" role="dialog" aria-modal="true" aria-label="Booking details" onClick={onClose}>
      <div className="pd-modalcard" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-head">
          <div className="pd-avatar pd-avatar-lg">{initials(aya.name)}</div>
          <div className="pd-modal-headtext">
            <h3 className="pd-modal-title">{aya.name || 'Your caregiver'}</h3>
            <span className="pd-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          </div>
          <button type="button" className="pd-iconbtn" onClick={onClose} aria-label="Close">
            <Ic.X width={18} height={18} />
          </button>
        </div>

        <p className="pd-dl-heading">Booking</p>
        <dl className="pd-dl">
          <div className="pd-dl-row"><dt>Date</dt><dd>{booking.date ? longDate(booking.date) : '—'}</dd></div>
          <div className="pd-dl-row"><dt>Time</dt><dd>{formatTimeOfDay(booking.time) || booking.time || '—'}</dd></div>
        </dl>

        <p className="pd-dl-heading">Caregiver</p>
        <dl className="pd-dl">
          {aya.location && <div className="pd-dl-row"><dt>Based in</dt><dd>{aya.location}</dd></div>}
          {hasExp && <div className="pd-dl-row"><dt>Experience</dt><dd>{expLabel(aya)}</dd></div>}
          {rateLabel(aya) && <div className="pd-dl-row"><dt>Rate</dt><dd>{rateLabel(aya)}</dd></div>}
          {aya.trust_score != null && <div className="pd-dl-row"><dt>Trust score</dt><dd>{aya.trust_score}/100</dd></div>}
        </dl>

        {booking.status === 'pending' && (
          <p className="pd-modal-note">Waiting for {firstName(aya.name) || 'your caregiver'} to confirm this booking.</p>
        )}
        <div className="pd-modal-actions">
          <button type="button" className="pd-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PLACEHOLDER VIEW — for dashboard sections not built yet
   ═══════════════════════════════════════════════════════ */
function PlaceholderView({ meta, onHome }) {
  const Icon = meta.Icon;
  return (
    <div className="pd-placeholder">
      <div className="pd-placeholder-icon"><Icon width={26} height={26} /></div>
      <h1 className="pd-placeholder-title">{meta.title}</h1>
      <p className="pd-placeholder-text">{meta.text}</p>
      <button type="button" className="pd-btn-ghost" onClick={onHome}>
        <Ic.ArrowLeft width={15} height={15} /> Back to Home
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RECOMMENDATION CARD — compact caregiver card for Home
   ═══════════════════════════════════════════════════════ */
function RecCard({ aya, why, score, onBook }) {
  return (
    <article className="pd-card pd-rec">
      <div className="pd-rec-top">
        <div className="pd-avatar pd-avatar-lg">{initials(aya.name)}</div>
        <div className="pd-rec-head">
          <h3 className="pd-rec-name">{aya.name}</h3>
          <p className="pd-rec-loc"><Ic.MapPin width={12} height={12} /> {aya.location || 'Pakistan'}</p>
        </div>
        {score != null && (
          <span className="pd-match"><Ic.CheckCircle width={12} height={12} /> {score}% match</span>
        )}
      </div>
      <div className="pd-aya-details">
        <span><Ic.Shield width={14} height={14} /> Trust score {aya.trust_score != null ? aya.trust_score : '—'}/100</span>
        <span><Ic.Award width={14} height={14} /> {expLabel(aya)} experience</span>
        {rateLabel(aya) && <span><Ic.Banknote width={14} height={14} /> {rateLabel(aya)}</span>}
      </div>
      <div className="pd-rec-why">
        <p className="pd-rec-why-label"><Ic.Sparkles width={12} height={12} /> Why recommended</p>
        <p className="pd-rec-why-text">{why}</p>
      </div>
      <button type="button" className="pd-btn-ghost pd-rec-book" onClick={onBook}>
        Book Now <Ic.ArrowRight width={14} height={14} />
      </button>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════
   PARENT DASHBOARD — shell navigation + Home experience
   ═══════════════════════════════════════════════════════ */
function ParentDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState(() => {
    const v = searchParams.get('view');
    return VIEWS.includes(v) ? v : 'home';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Auth + parent profile (row from the parents table) */
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [booting, setBooting] = useState(true);

  /* Caregivers + AI rankings — real data via Supabase + /api/match-ayas */
  const [ayas, setAyas] = useState([]);
  const [rankings, setRankings] = useState({});
  const [ayasLoading, setAyasLoading] = useState(true);

  /* Bookings — null while loading */
  const [bookings, setBookings] = useState(null);

  /* AI Care Assistant */
  const [aiText, setAiText] = useState('');
  const [aiStatus, setAiStatus] = useState('idle'); /* idle | thinking | done | error */
  const [aiResults, setAiResults] = useState(null);
  const [aiError, setAiError] = useState('');

  /* Modals */
  const [bookingAya, setBookingAya] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [activeMessageBookingId, setActiveMessageBookingId] = useState(null);

  const assistantRef = useRef(null);
  const aiInputRef = useRef(null);

  const chips = useMemo(() => parseCareRequest(aiText).chips, [aiText]);

  /* ── Data loading ─────────────────────────────────── */

  const loadBookings = async (parentId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, ayas(id, name, location, experience_years, rate_per_hour, trust_score)')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });
    setBookings(error ? [] : data || []);
  };

  /* Real AI matching through the existing backend */
  const runMatch = async (parentNeeds, list) => {
    const res = await fetch(`${BACKEND_URL}/api/match-ayas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentNeeds, ayas: list }),
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const result = await res.json();
    if (!result || result.success !== true || !Array.isArray(result.rankings)) {
      throw new Error('Unexpected response');
    }
    return result.rankings;
  };

  const fetchAyas = async (prof) => {
    setAyasLoading(true);
    try {
      const { data, error } = await supabase
        .from('ayas')
        .select('*')
        .eq('is_available', true);
      if (error) throw error;
      const list = data || [];
      let ranked = false;
      if (prof && list.length) {
        try {
          const fromAI = await runMatch({
            childAge: prof.child_age != null && prof.child_age !== '' ? prof.child_age : '',
            location: prof.location || '',
            specialNeeds: '',
            language: '',
          }, list);
          const map = {};
          fromAI.forEach((r) => {
            if (r && r.name) {
              map[r.name] = {
                reason: typeof r.reason === 'string' ? r.reason : '',
                score: typeof r.match_score === 'number'
                  ? Math.round(Math.max(0, Math.min(100, r.match_score)))
                  : null,
              };
            }
          });
          if (Object.keys(map).length) {
            setRankings(map);
            list.sort((a, b) => ((map[b.name] && map[b.name].score) || 0) - ((map[a.name] && map[a.name].score) || 0));
            ranked = true;
          }
        } catch {
          /* AI ranking unavailable — fall back to trust score order below */
        }
      }
      if (!ranked) list.sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0));
      setAyas(list);
    } catch {
      setAyas([]);
    } finally {
      setAyasLoading(false);
    }
  };

  /* Boot: restore session, load the parent profile, bookings, caregivers */
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      if (user) {
        setAuthUser(user);
        const { data: prof } = await supabase
          .from('parents')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        if (!alive) return;
        if (prof) {
          setProfile(prof);
          loadBookings(prof.id);
        } else {
          setBookings([]);
        }
        fetchAyas(prof || null);
      } else {
        setBookings([]);
        fetchAyas(null);
      }
      setBooting(false);
    })();
    return () => { alive = false; };
    /* Boot runs once on mount — fetchAyas/loadBookings are boot-time helpers. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keep the view in sync with the URL (browser back / forward) */
  useEffect(() => {
    const v = searchParams.get('view');
    setView(VIEWS.includes(v) ? v : 'home');
  }, [searchParams]);
  
  /* Escape closes the topmost layer; lock body scroll behind overlays */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (bookingAya) setBookingAya(null);
      else if (detailBooking) setDetailBooking(null);
      else if (childModalOpen) setChildModalOpen(false);
      else if (drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bookingAya, detailBooking, childModalOpen, drawerOpen]);

  useEffect(() => {
    const locked = bookingAya || detailBooking || childModalOpen || drawerOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [bookingAya, detailBooking, childModalOpen, drawerOpen]);

  /* ── Derived state ────────────────────────────────── */

  const todayStr = localDateStr(new Date());

  /* Earliest pending / confirmed booking from today onward */
  const upcoming = useMemo(() => {
    if (!bookings) return undefined;
    const candidates = bookings.filter((b) =>
      (b.status === 'pending' || b.status === 'confirmed') &&
      b.date && String(b.date) >= todayStr);
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      const byDate = String(a.date).localeCompare(String(b.date));
      if (byDate !== 0) return byDate;
      const ta = parseTimeOfDay(a.time);
      const tb = parseTimeOfDay(b.time);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return ta - tb;
    });
    return candidates[0];
  }, [bookings, todayStr]);

  const hasChild = !!(profile && profile.child_age !== null && profile.child_age !== undefined && profile.child_age !== '');

  /* Personalization mode — drives the Home section order */
  const mode = useMemo(() => {
    if (booting || bookings === null) return 'loading';
    if (upcoming) return 'with-upcoming';
    if (bookings.length > 0) return 'settled';
    if (hasChild) return 'family';
    return 'new';
  }, [booting, bookings, upcoming, hasChild]);

  const recommendations = ayas.slice(0, 3);

  /* AI reason when the backend provides one; otherwise a factual
     line built from the caregiver's real profile fields */
  const whyFor = (a) => {
    const r = rankings[a.name];
    if (r && r.reason) return r.reason;
    const bits = [];
    if (a.trust_score != null) bits.push(`trust score ${a.trust_score}/100`);
    if (a.location) bits.push(`based in ${a.location}`);
    if (a.experience_years) bits.push(`${expLabel(a)} of experience`);
    return bits.length
      ? `A verified caregiver with ${bits.join(', ')}.`
      : 'A verified caregiver on AyaFind.';
  };

  /* Real activity derived from the parent's actual bookings */
  const activityItems = useMemo(() => {
    if (!bookings) return null;
    const items = [];
    bookings.forEach((b) => {
      const who = (b.ayas && b.ayas.name) || 'a caregiver';
      let text;
      let Icon = Ic.Calendar;
      if (b.status === 'confirmed') {
        text = `${who} confirmed your booking`;
        Icon = Ic.CheckCircle;
      } else if (b.status === 'completed') {
        text = `Completed care session with ${who}`;
        Icon = Ic.CalendarCheck;
      } else if (b.status === 'declined') {
        text = `Booking with ${who} was declined`;
      } else {
        text = `Booking request sent to ${who}`;
      }
      items.push({ id: b.id, text, Icon, when: relTime(b.created_at) });
    });
    return items.slice(0, 4);
  }, [bookings]);

  /* ── Actions ──────────────────────────────────────── */

  const go = (next) => {
    setView(next);
    setDrawerOpen(false);
    setSearchParams(next === 'home' ? {} : { view: next }, { replace: true });
    window.scrollTo({ top: 0 });
  };

  const focusAssistant = () => {
    if (view !== 'home') go('home');
    setTimeout(() => {
      if (assistantRef.current) assistantRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (aiInputRef.current) aiInputRef.current.focus({ preventScroll: true });
    }, 80);
  };

  const openChildModal = () => {
    if (profile) setChildModalOpen(true);
    else window.location.href = '/login';
  };

  const childSaved = (age) => {
    setProfile((p) => (p ? { ...p, child_age: age } : p));
    setChildModalOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  /* AI Care Assistant — parse locally, match through the real backend */
  const runAssistant = async () => {
    const text = aiText.trim();
    if (!text || aiStatus === 'thinking') return;
    if (!ayas.length) {
      setAiStatus('error');
      setAiError('No caregivers are available to match right now. Please try again in a moment.');
      return;
    }
    setAiStatus('thinking');
    setAiError('');
    setAiResults(null);
    const parsed = parseCareRequest(text);
    const parentNeeds = {
      childAge: parsed.age !== null
        ? parsed.age
        : parsed.ageWord || (hasChild ? profile.child_age : ''),
      location: (profile && profile.location) || '',
      specialNeeds: parsed.specialNeeds || '',
      language: parsed.language ? parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1) : '',
      budget: parsed.budget || '',
    };
    try {
      const rs = await runMatch(parentNeeds, ayas);
      const rows = rs
        .map((r) => {
          if (!r || !r.name) return null;
          const aya = ayas.find((a) => a.name === r.name);
          if (!aya) return null;
          return {
            aya,
            reason: typeof r.reason === 'string' ? r.reason : '',
            score: typeof r.match_score === 'number'
              ? Math.round(Math.max(0, Math.min(100, r.match_score)))
              : null,
          };
        })
        .filter(Boolean)
        .slice(0, 3);
      if (!rows.length) throw new Error('No matches returned');
      setAiResults(rows);
      setAiStatus('done');
    } catch {
      setAiStatus('error');
      setAiError('AyaFind couldn’t complete that request right now. Please try again, or browse all caregivers below.');
    }
  };

  /* ── Navigation + identity ────────────────────────── */

  const navButtons = NAV.map(({ id, label, Icon }) => (
    <button
      key={id}
      type="button"
      className={`pd-navbtn${view === id ? ' active' : ''}`}
      onClick={() => {
        if (id === 'messages') setActiveMessageBookingId(null);
        go(id);
      }}
      aria-current={view === id ? 'page' : undefined}
    >
      <Icon width={18} height={18} />
      <span>{label}</span>
    </button>
  ));

  const displayName = firstName(profile && profile.name);
  const avatarText = initials((profile && profile.name) || (authUser && authUser.email) || '');

  const userBlock = authUser ? (
    <div className="pd-user">
      <div className="pd-avatar pd-avatar-sm pd-avatar-side">{avatarText}</div>
      <div className="pd-user-text">
        <p className="pd-user-name">{(profile && profile.name) || authUser.email}</p>
        <p className="pd-user-role">Parent</p>
      </div>
      <button
        type="button"
        className="pd-iconbtn pd-user-out"
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
      >
        <Ic.LogOut width={16} height={16} />
      </button>
    </div>
  ) : (
    <button type="button" className="pd-btn pd-side-signin" onClick={() => { window.location.href = '/login'; }}>
      Sign In
    </button>
  );

  const guestBanner = !booting && (!authUser || !profile) ? (
    <div className="pd-guest" role="note">
      <Ic.User width={18} height={18} />
      <p className="pd-guest-text">
        {!authUser
          ? 'You’re viewing AyaFind as a guest. Sign in to see your bookings, family profile, and personalized recommendations.'
          : 'We couldn’t load your parent profile, so your bookings and family details aren’t available right now.'}
      </p>
      {!authUser && (
        <button type="button" className="pd-btn-ghost pd-guest-btn" onClick={() => { window.location.href = '/login'; }}>
          Sign In
        </button>
      )}
    </div>
  ) : null;

  /* ── Home sections ────────────────────────────────── */

  const welcomeBlock = (
    <header className="pd-welcome">
      <p className="pd-welcome-date">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <h1 className="pd-welcome-title">
        {greetingFor(new Date())}{displayName ? `, ${displayName}` : ''}
      </h1>
      <p className="pd-welcome-sub">How can AyaFind help with your childcare today?</p>
    </header>
  );

  const assistantBlock = (
    <section className="pd-card pd-assistant pd-section" ref={assistantRef} aria-label="AyaFind Care Assistant">
      <div className="pd-assistant-head">
        <span className="pd-assistant-badge"><Ic.Sparkles width={19} height={19} /></span>
        <div>
          <h2 className="pd-section-title">Tell AyaFind what you need</h2>
          <p className="pd-section-sub">Describe your childcare needs naturally, and AyaFind will help you find suitable care.</p>
        </div>
      </div>
      <div className="pd-assistant-form">
        <textarea
          ref={aiInputRef}
          className="pd-assistant-input"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              runAssistant();
            }
          }}
          placeholder="e.g. I need an Urdu-speaking Aya for my 3-year-old tomorrow from 6–10 PM."
          rows={3}
          aria-label="Describe your childcare needs"
          disabled={aiStatus === 'thinking'}
        />
        {chips.length > 0 && (
          <div className="pd-chips" aria-label="AyaFind understood">
            <span className="pd-chips-label"><Ic.CheckCircle width={13} height={13} /> Understood</span>
            {chips.map((chip) => <span key={chip} className="pd-chip">{chip}</span>)}
            {profile && profile.location ? (
              <span className="pd-chip pd-chip-loc"><Ic.MapPin width={12} height={12} /> Near {profile.location}</span>
            ) : null}
          </div>
        )}
        <div className="pd-assistant-actions">
          <button
            type="button"
            className="pd-btn pd-assistant-btn"
            onClick={runAssistant}
            disabled={!aiText.trim() || aiStatus === 'thinking'}
          >
            {aiStatus === 'thinking' ? 'Finding care…' : (
              <>Find Care <Ic.ArrowRight width={15} height={15} /></>
            )}
          </button>
        </div>
      </div>
      {aiStatus === 'thinking' && (
        <p className="pd-assistant-status" aria-live="polite">
          <span className="pd-dot" /><span className="pd-dot" /><span className="pd-dot" />
          Reading your request and matching caregivers
        </p>
      )}
      {aiStatus === 'error' && (
        <div className="pd-alert" role="alert">
          <p>{aiError}</p>
          <button type="button" className="pd-alert-link" onClick={() => go('find-care')}>
            Browse all caregivers
          </button>
        </div>
      )}
      {aiStatus === 'done' && aiResults && (
        <div className="pd-ai-results">
          <p className="pd-ai-results-label"><Ic.Sparkles width={13} height={13} /> AyaFind’s top matches</p>
          {aiResults.map(({ aya, reason, score }) => (
            <div key={aya.id} className="pd-ai-row">
              <div className="pd-avatar">{initials(aya.name)}</div>
              <div className="pd-ai-row-info">
                <p className="pd-ai-row-name">
                  {aya.name}
                  {score != null && (
                    <span className="pd-match"><Ic.CheckCircle width={12} height={12} /> {score}% match</span>
                  )}
                </p>
                <p className="pd-ai-row-why">{reason || whyFor(aya)}</p>
              </div>
              <button type="button" className="pd-btn-ghost" onClick={() => setBookingAya(aya)}>Book Now</button>
            </div>
          ))}
          <button type="button" className="pd-textbtn" onClick={() => go('find-care')}>
            See all caregivers <Ic.ArrowRight width={13} height={13} />
          </button>
        </div>
      )}
    </section>
  );

  const upcomingSection = upcoming ? (
    <div className="pd-section">
      <h2 className="pd-section-title pd-blockhead">Upcoming Care</h2>
      <UpcomingCard booking={upcoming} onView={() => setDetailBooking(upcoming)} />
    </div>
  ) : null;

  const upcomingEmpty = (
    <section className="pd-card pd-empty pd-section" aria-label="Upcoming care">
      <div className="pd-empty-icon"><Ic.CalendarCheck width={22} height={22} /></div>
      <h2 className="pd-section-title">No upcoming care</h2>
      <p className="pd-section-sub">Need an Aya? Tell AyaFind what you’re looking for.</p>
      <button type="button" className="pd-btn" onClick={focusAssistant}>Find Care</button>
    </section>
  );

  const recommendationsBlock = (
    <section className="pd-section" aria-label="Recommended for your family">
      <div className="pd-section-head">
        <h2 className="pd-section-title">Recommended for Your Family</h2>
        <button type="button" className="pd-textbtn" onClick={() => go('find-care')}>
          View all <Ic.ArrowRight width={13} height={13} />
        </button>
      </div>
      {ayasLoading ? (
        <div className="pd-recgrid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pd-card pd-skel-card">
              <div className="pd-skel pd-skel-lg" />
              <div className="pd-skel pd-skel-row" />
              <div className="pd-skel pd-skel-row" />
              <div className="pd-skel pd-skel-sm" />
            </div>
          ))}
        </div>
      ) : recommendations.length ? (
        <div className="pd-recgrid">
          {recommendations.map((a) => (
            <RecCard
              key={a.id}
              aya={a}
              why={whyFor(a)}
              score={rankings[a.name] ? rankings[a.name].score : null}
              onBook={() => setBookingAya(a)}
            />
          ))}
        </div>
      ) : (
        <div className="pd-card pd-empty-inline">
          <p className="pd-section-sub">No caregivers are available right now. Please check back soon.</p>
        </div>
      )}
    </section>
  );

  const familyBlock = (
    <section className="pd-card pd-family pd-section" aria-label="Your family">
      <div className="pd-section-head">
        <h2 className="pd-section-title">Your Family</h2>
        {hasChild && (
          <button type="button" className="pd-textbtn" onClick={() => setChildModalOpen(true)}>
            Manage Family
          </button>
        )}
      </div>
      {hasChild ? (
        <>
          <div className="pd-family-row">
            <div className="pd-avatar pd-avatar-lg pd-avatar-coral"><Ic.Heart width={16} height={16} /></div>
            <div>
              <p className="pd-family-name">1 child · {childAgeText(profile.child_age)}</p>
              {profile.location ? <p className="pd-family-meta">Care near {profile.location}</p> : null}
            </div>
          </div>
          <p className="pd-family-note">Your family preferences help AyaFind personalize recommendations.</p>
        </>
      ) : (
        <>
          <p className="pd-family-name">No child profile yet</p>
          <p className="pd-family-note">Add your child’s information to get more personalized recommendations.</p>
          <button type="button" className="pd-btn-coral" onClick={openChildModal}>
            <Ic.Plus width={15} height={15} /> Add Child
          </button>
        </>
      )}
    </section>
  );

  const activityBlock = (
    <section className="pd-card pd-activity" aria-label="Recent activity">
      <h2 className="pd-section-title">Recent Activity</h2>
      {bookings === null ? (
        <div className="pd-skel-list">
          <div className="pd-skel pd-skel-row" />
          <div className="pd-skel pd-skel-row" />
          <div className="pd-skel pd-skel-row" />
        </div>
      ) : activityItems && activityItems.length ? (
        <ul className="pd-activity-list">
          {activityItems.map(({ id, text, Icon, when }) => (
            <li key={id} className="pd-activity-item">
              <span className="pd-activity-icon"><Icon width={14} height={14} /></span>
              <span className="pd-activity-text">{text}</span>
              <span className="pd-activity-when">{when}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="pd-section-sub">No recent activity</p>
      )}
    </section>
  );

  const quickActionsBlock = (
    <section className="pd-section" aria-label="Quick actions">
      <h2 className="pd-section-title pd-blockhead">Quick Actions</h2>
      <div className="pd-qa">
        <button type="button" className="pd-qa-btn" onClick={focusAssistant}>
          <Ic.Search width={16} height={16} /> Find Care
        </button>
        <button type="button" className="pd-qa-btn" onClick={() => go('bookings')}>
          <Ic.Calendar width={16} height={16} /> My Bookings
        </button>
        <button type="button" className="pd-qa-btn" onClick={openChildModal}>
          <Ic.Plus width={16} height={16} /> Add Child
        </button>
        <button type="button" className="pd-qa-btn" onClick={() => go('payments')}>
          <Ic.CreditCard width={16} height={16} /> Payments
        </button>
      </div>
    </section>
  );

  /* Personalized Home composition — the order changes with the
     parent's state (new / family saved / upcoming booking) */
  let homeBody;
  if (mode === 'loading') {
    homeBody = (
      <>
        {guestBanner}
        {welcomeBlock}
        {assistantBlock}
        <div className="pd-card pd-skel-card pd-section">
          <div className="pd-skel pd-skel-row" />
          <div className="pd-skel pd-skel-row" />
          <div className="pd-skel pd-skel-sm" />
        </div>
      </>
    );
  } else if (mode === 'with-upcoming') {
    homeBody = (
      <>
        {guestBanner}
        {welcomeBlock}
        {upcomingSection}
        {assistantBlock}
        {recommendationsBlock}
        <div className="pd-duo">{familyBlock}{activityBlock}</div>
        {quickActionsBlock}
      </>
    );
  } else if (mode === 'settled') {
    homeBody = (
      <>
        {guestBanner}
        {welcomeBlock}
        {assistantBlock}
        {upcomingEmpty}
        {recommendationsBlock}
        <div className="pd-duo">{familyBlock}{activityBlock}</div>
        {quickActionsBlock}
      </>
    );
  } else if (mode === 'family') {
    homeBody = (
      <>
        {guestBanner}
        {welcomeBlock}
        {assistantBlock}
        {recommendationsBlock}
        {upcomingEmpty}
        <div className="pd-duo">{familyBlock}{activityBlock}</div>
        {quickActionsBlock}
      </>
    );
  } else {
    homeBody = (
      <>
        {guestBanner}
        {welcomeBlock}
        {assistantBlock}
        {familyBlock}
        {upcomingEmpty}
        {quickActionsBlock}
      </>
    );
  }

  const findCareView = (
    <FindCare
      ayas={ayas}
      rankings={rankings}
      profile={profile}
      profileLoading={booting}
      onBook={(aya) => setBookingAya(aya)}
    />
  );

  return (
    <div className="pd-app">
      <style>{PD_CSS}</style>

      <aside className="pd-sidebar">
        <div className="pd-side-logo"><Logo dark /></div>
        <nav className="pd-side-nav" aria-label="Dashboard">{navButtons}</nav>
        <div className="pd-side-user">{userBlock}</div>
      </aside>

      <header className="pd-topbar">
        <button type="button" className="pd-iconbtn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Ic.Menu width={20} height={20} />
        </button>
        <Logo compact />
        <div className="pd-avatar pd-avatar-sm">{avatarText}</div>
      </header>

      <main className="pd-main">
        <div className="pd-content">
          {view === 'home' ? homeBody
            : view === 'find-care' ? findCareView
            : view === 'bookings' ? (
              <MyBookings
                bookings={bookings}
                loading={booting}
                profile={profile}
                onBookAgain={(aya) => setBookingAya(aya)}
                onFindCare={() => go('find-care')}
                onViewAya={(bookingId) => {
                  setActiveMessageBookingId(bookingId);
                  go('messages');
                }}
              />
            )
            : view === 'family' ? (
              <MyFamily profile={profile} onNavigate={go} />
            )
            : view === 'payments' ? (
              <Payments
                parentId={profile ? profile.id : null}
                bookings={bookings}
              />
            )
            : view === 'messages' ? (
              <Messages
                profile={profile}
                bookings={bookings}
                activeBookingId={activeMessageBookingId}
              />
            )
            : <PlaceholderView meta={PLACEHOLDERS[view]} onHome={() => go('home')} />}
        </div>
      </main>

      <div className={`pd-overlay${drawerOpen ? ' pd-show' : ''}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <div className={`pd-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="pd-drawer-head">
          <Logo dark compact />
          <button type="button" className="pd-iconbtn pd-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <Ic.X width={18} height={18} />
          </button>
        </div>
        <nav className="pd-side-nav" aria-label="Dashboard">{navButtons}</nav>
        <div className="pd-side-user">{userBlock}</div>
      </div>

      {bookingAya && (
        <BookingFlow
          aya={bookingAya}
          onClose={() => setBookingAya(null)}
          onSuccess={() => {
            setBookingAya(null);
            if (profile) loadBookings(profile.id);
          }}
        />
      )}
      {detailBooking && <BookingModal booking={detailBooking} onClose={() => setDetailBooking(null)} />}
      {childModalOpen && profile && (
        <ChildModal profile={profile} onClose={() => setChildModalOpen(false)} onSaved={childSaved} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES — AyaFind visual tokens, scoped with the pd- prefix
   ═══════════════════════════════════════════════════════ */
const PD_CSS = `
.pd-app{min-height:100vh;background:${C.bg};color:${C.text};font-family:${FF};-webkit-font-smoothing:antialiased;}
.pd-app *,.pd-app *::before,.pd-app *::after{box-sizing:border-box;}
.pd-app button{font-family:inherit;cursor:pointer;}
.pd-content h1,.pd-content h2,.pd-content h3,.pd-content p,.pd-sidebar p,.pd-drawer p,.pd-modalcard p{margin:0;}
.pd-app :focus-visible{outline:2px solid ${C.teal};outline-offset:2px;}

/* Shell — desktop sidebar */
.pd-sidebar{position:fixed;top:0;left:0;bottom:0;width:264px;background:${C.navy};display:flex;flex-direction:column;padding:22px 16px;z-index:40;}
.pd-side-logo{padding:4px 8px 22px;}
.pd-side-nav{display:flex;flex-direction:column;gap:4px;flex:1;}
.pd-navbtn{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,0.62);font-size:14px;font-weight:600;text-align:left;transition:background .18s ease,color .18s ease;}
.pd-navbtn svg{flex-shrink:0;}
.pd-navbtn:hover{background:rgba(255,255,255,0.07);color:#fff;}
.pd-navbtn.active{background:${C.teal};color:#fff;box-shadow:0 6px 16px rgba(39,143,135,0.35);}
.pd-side-user{border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;margin-top:8px;}
.pd-user{display:flex;align-items:center;gap:10px;}
.pd-user-text{flex:1;min-width:0;}
.pd-user-name{color:#fff;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pd-user-role{color:rgba(255,255,255,0.5);font-size:12px;margin-top:2px;}
.pd-user-out{color:rgba(255,255,255,0.6);background:transparent;border:none;flex-shrink:0;}
.pd-user-out:hover{color:#fff;background:rgba(255,255,255,0.1);}
.pd-side-signin{width:100%;}

/* Mobile topbar + drawer */
.pd-topbar{display:none;}
.pd-main{margin-left:264px;min-height:100vh;display:flex;flex-direction:column;}
.pd-content{width:100%;max-width:1180px;margin:0 auto;padding:34px 40px 64px;flex:1;}
.pd-overlay{position:fixed;inset:0;background:rgba(17,27,46,0.55);z-index:60;opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s;}
.pd-overlay.pd-show{opacity:1;visibility:visible;}
.pd-drawer{position:fixed;top:0;left:0;bottom:0;width:284px;max-width:86vw;background:${C.navy};display:flex;flex-direction:column;padding:18px 14px;z-index:70;transform:translateX(-102%);visibility:hidden;transition:transform .28s cubic-bezier(.4,0,.2,1),visibility .28s;}
.pd-drawer.open{transform:translateX(0);visibility:visible;}
.pd-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:2px 6px 18px;}
.pd-drawer-close{color:rgba(255,255,255,0.75);background:transparent;border:none;}
.pd-drawer-close:hover{color:#fff;background:rgba(255,255,255,0.1);}

/* Buttons */
.pd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border:none;border-radius:10px;background:${C.teal};color:#fff;font-size:14px;font-weight:700;box-shadow:0 6px 16px rgba(39,143,135,0.22);transition:background .18s ease,box-shadow .18s ease,transform .18s ease;}
.pd-btn:hover{background:#1F7A73;box-shadow:0 8px 20px rgba(39,143,135,0.3);}
.pd-btn:active{transform:translateY(1px);}
.pd-btn:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}
.pd-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.text};font-size:13.5px;font-weight:700;transition:border-color .18s ease,color .18s ease,background .18s ease;}
.pd-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.pd-btn-coral{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;border:none;border-radius:10px;background:${C.coral};color:#fff;font-size:14px;font-weight:700;box-shadow:0 6px 16px rgba(244,124,92,0.25);transition:background .18s ease,transform .18s ease;}
.pd-btn-coral:hover{background:#E86A48;}
.pd-btn-coral:active{transform:translateY(1px);}
.pd-textbtn{display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:${C.teal};font-size:13px;font-weight:700;padding:4px 2px;transition:color .18s ease;}
.pd-textbtn:hover{color:#1F7A73;}
.pd-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:9px;background:${C.bg};color:${C.textSec};transition:background .18s ease,color .18s ease;}
.pd-iconbtn:hover{background:${C.border};color:${C.text};}

/* Cards + shared section bits */
.pd-card{background:#fff;border:1px solid ${C.border};border-radius:14px;box-shadow:0 1px 2px rgba(23,36,61,0.04);}
.pd-section{margin-bottom:22px;}
.pd-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px;}
.pd-section-title{font-size:16.5px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.pd-section-sub{font-size:14px;color:${C.textSec};line-height:1.55;}
.pd-blockhead{margin-bottom:12px;}
.pd-avatar{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${C.tealSoft};color:${C.teal};font-size:14px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;}
.pd-avatar-sm{width:34px;height:34px;font-size:12.5px;}
.pd-avatar-lg{width:52px;height:52px;font-size:17px;}
.pd-avatar-coral{background:${C.coralSoft};color:${C.coral};}
.pd-avatar-side{background:rgba(255,255,255,0.14);color:#fff;}
.pd-status{display:inline-flex;align-items:center;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.06em;}
.pd-match{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;background:${C.tealSoft};color:#1F7A73;font-size:11.5px;font-weight:800;}

/* Welcome */
.pd-welcome{margin-bottom:24px;animation:pdFadeUp .4s ease both;}
.pd-welcome-date{font-size:12.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${C.teal};margin-bottom:8px;}
.pd-welcome-title{font-size:clamp(24px,3vw,30px);font-weight:800;letter-spacing:-0.02em;color:${C.navy};}
.pd-welcome-sub{margin-top:7px;font-size:15px;color:${C.textSec};}

/* AI Care Assistant — the centerpiece */
.pd-assistant{padding:24px;border-top:3px solid ${C.teal};box-shadow:0 10px 34px rgba(39,143,135,0.1);animation:pdFadeUp .4s .05s ease both;}
.pd-assistant-head{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;}
.pd-assistant-badge{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.pd-assistant-form{display:flex;flex-direction:column;gap:12px;}
.pd-assistant-input{width:100%;min-height:88px;padding:14px 16px;border:1.5px solid ${C.border};border-radius:12px;background:${C.bg};color:${C.text};font-family:inherit;font-size:15px;line-height:1.55;resize:vertical;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;}
.pd-assistant-input::placeholder{color:${C.textMuted};}
.pd-assistant-input:focus{outline:none;border-color:${C.teal};background:#fff;box-shadow:0 0 0 3px rgba(39,143,135,0.14);}
.pd-assistant-input:disabled{opacity:0.7;}
.pd-chips{display:flex;flex-wrap:wrap;align-items:center;gap:7px;}
.pd-chips-label{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.teal};margin-right:2px;}
.pd-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;border:1px solid ${C.border};background:#fff;font-size:12.5px;font-weight:600;color:${C.text};animation:pdFadeUp .25s ease both;}
.pd-chip-loc{border-color:rgba(39,143,135,0.35);background:${C.tealSoft};color:#1F7A73;}
.pd-assistant-actions{display:flex;}
.pd-assistant-btn{padding:12px 26px;font-size:14.5px;}
.pd-assistant-status{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:${C.teal};margin-top:14px;}
.pd-dot{width:6px;height:6px;border-radius:50%;background:${C.teal};animation:pdDot 1s infinite ease-in-out;}
.pd-dot:nth-child(2){animation-delay:0.15s;}
.pd-dot:nth-child(3){animation-delay:0.3s;}
.pd-alert{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:14px;padding:13px 16px;border-radius:11px;background:#FBE9E9;border:1px solid rgba(194,59,59,0.18);}
.pd-alert p{font-size:13.5px;line-height:1.5;color:#A03030;font-weight:600;}
.pd-alert-link{background:none;border:none;padding:0;color:#C23B3B;font-size:13px;font-weight:800;text-decoration:underline;}
.pd-ai-results{margin-top:18px;border-top:1px dashed ${C.border};padding-top:16px;}
.pd-ai-results-label{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.teal};margin-bottom:10px;}
.pd-ai-row{display:flex;align-items:center;gap:13px;padding:12px 0;border-bottom:1px solid ${C.bg};}
.pd-ai-row:last-of-type{border-bottom:none;}
.pd-ai-row-info{flex:1;min-width:0;}
.pd-ai-row-name{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14.5px;font-weight:800;color:${C.text};}
.pd-ai-row-why{margin-top:3px;font-size:13px;line-height:1.5;color:${C.textSec};}

/* Upcoming care */
.pd-upcoming{padding:20px 22px;animation:pdFadeUp .4s .05s ease both;}
.pd-section > .pd-upcoming{margin-bottom:0;}
.pd-up-row{display:flex;align-items:center;gap:16px;}
.pd-up-info{flex:1;min-width:0;}
.pd-up-when{font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};margin-bottom:4px;}
.pd-up-name{font-size:18px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.pd-up-meta{margin-top:4px;font-size:13px;color:${C.textSec};}
.pd-up-side{display:flex;flex-direction:column;align-items:flex-end;gap:9px;flex-shrink:0;}
.pd-up-note{margin-top:13px;padding-top:12px;border-top:1px dashed ${C.border};font-size:13px;color:${C.textSec};}

/* Empty states */
.pd-empty{padding:30px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.pd-empty-icon{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:10px;}
.pd-empty .pd-btn{margin-top:14px;}
.pd-empty-inline{padding:22px;text-align:center;}

/* Recommendations */
.pd-recgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.pd-rec{padding:20px;display:flex;flex-direction:column;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;}
.pd-rec:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(23,36,61,0.08);border-color:rgba(39,143,135,0.3);}
.pd-rec-top{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.pd-rec-head{flex:1;min-width:0;}
.pd-rec-name{font-size:15.5px;font-weight:800;color:${C.text};}
.pd-rec-loc{display:flex;align-items:center;gap:4px;margin-top:3px;font-size:12.5px;color:${C.textSec};}
.pd-rec-why{margin-top:13px;padding:12px 14px;border-radius:11px;background:${C.bg};flex:1;}
.pd-rec-why-label{display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${C.teal};margin-bottom:5px;}
.pd-rec-why-text{font-size:13px;line-height:1.55;color:${C.textSec};}
.pd-rec-book{margin-top:14px;width:100%;}

/* Caregiver detail rows (shared) */
.pd-aya-details{display:flex;flex-direction:column;gap:7px;margin:13px 0;}
.pd-aya-details span{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:${C.textSec};}
.pd-aya-details svg{color:${C.teal};flex-shrink:0;}

/* Find Care */
.pd-view-head{margin-bottom:22px;}
.pd-view-title{font-size:24px;font-weight:800;letter-spacing:-0.02em;color:${C.navy};}
.pd-view-sub{margin-top:6px;font-size:14.5px;color:${C.textSec};}
.pd-ayagrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.pd-aya{padding:20px;display:flex;flex-direction:column;}
.pd-aya-top{display:flex;align-items:center;gap:13px;}
.pd-aya-head{min-width:0;}
.pd-aya-name{font-size:16px;font-weight:800;color:${C.text};}
.pd-aya-loc{display:flex;align-items:center;gap:4px;margin-top:3px;font-size:12.5px;color:${C.textSec};}
.pd-tags{margin-top:13px;}
.pd-tag{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:12px;font-weight:700;}
.pd-tag-teal{background:${C.tealSoft};color:#1F7A73;}
.pd-ai-summary{margin:4px 0 14px;padding:12px 14px;border-radius:11px;background:${C.bg};flex:1;}
.pd-ai-summary-label{display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${C.teal};margin-bottom:5px;}
.pd-ai-summary-text{font-size:13px;line-height:1.55;color:${C.textSec};}
.pd-aya .pd-btn{width:100%;}

/* Family + activity */
.pd-duo{display:grid;grid-template-columns:1fr 1.15fr;gap:16px;margin-bottom:22px;}
.pd-duo .pd-section{margin-bottom:0;}
.pd-family{padding:22px;}
.pd-family-row{display:flex;align-items:center;gap:13px;}
.pd-family-name{font-size:15.5px;font-weight:800;color:${C.text};}
.pd-family-meta{margin-top:3px;font-size:13px;color:${C.textSec};}
.pd-family-note{margin-top:14px;font-size:13px;line-height:1.55;color:${C.textSec};}
.pd-family .pd-btn-coral{margin-top:14px;}
.pd-activity{padding:22px;}
.pd-activity .pd-section-title{margin-bottom:14px;}
.pd-activity-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}
.pd-activity-item{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid ${C.bg};}
.pd-activity-item:last-child{border-bottom:none;}
.pd-activity-icon{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.pd-activity-text{flex:1;font-size:13.5px;font-weight:600;color:${C.text};line-height:1.4;}
.pd-activity-when{font-size:12px;color:${C.textMuted};flex-shrink:0;}

/* Quick actions */
.pd-qa{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.pd-qa-btn{display:flex;align-items:center;gap:10px;padding:14px 16px;border:1px solid ${C.border};border-radius:12px;background:#fff;color:${C.text};font-size:13.5px;font-weight:700;transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease;}
.pd-qa-btn svg{color:${C.teal};flex-shrink:0;}
.pd-qa-btn:hover{border-color:${C.teal};box-shadow:0 8px 18px rgba(39,143,135,0.1);transform:translateY(-1px);}

/* Guest banner */
.pd-guest{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;margin-bottom:20px;border-radius:12px;border:1px solid rgba(244,124,92,0.35);background:${C.coralSoft};}
.pd-guest > svg{flex-shrink:0;color:${C.coral};}
.pd-guest-text{flex:1;min-width:220px;font-size:13.5px;font-weight:600;line-height:1.5;color:#B45333;}
.pd-guest-btn{border-color:rgba(244,124,92,0.4);color:#B45333;}
.pd-guest-btn:hover{border-color:${C.coral};color:#D95F3D;background:#fff;}

/* Modals */
.pd-modalwrap{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(17,27,46,0.55);animation:pdFade .2s ease;}
.pd-modalcard{width:100%;max-width:460px;max-height:88vh;overflow-y:auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 24px 60px rgba(17,27,46,0.3);animation:pdFadeUp .25s ease both;}
.pd-modal-head{display:flex;align-items:center;gap:13px;margin-bottom:18px;}
.pd-modal-headtext{flex:1;min-width:0;}
.pd-modal-title{font-size:17px;font-weight:800;color:${C.text};}
.pd-modal-sub{margin-top:3px;font-size:13px;line-height:1.5;color:${C.textSec};}
.pd-dl-heading{font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};margin:16px 0 8px;}
.pd-dl{margin:0;border:1px solid ${C.border};border-radius:11px;overflow:hidden;}
.pd-dl-row{display:flex;justify-content:space-between;gap:14px;padding:10px 14px;font-size:13.5px;}
.pd-dl-row + .pd-dl-row{border-top:1px solid ${C.bg};}
.pd-dl-row dt{color:${C.textSec};font-weight:600;}
.pd-dl-row dd{margin:0;color:${C.text};font-weight:700;text-align:right;}
.pd-modal-note{margin-top:14px;padding:11px 14px;border-radius:10px;background:${C.bg};font-size:13px;line-height:1.5;color:${C.textSec};}
.pd-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;}
.pd-label{display:block;font-size:12.5px;font-weight:800;color:${C.text};margin:14px 0 7px;letter-spacing:0.01em;}
.pd-select{width:100%;padding:11px 13px;border:1.5px solid ${C.border};border-radius:10px;font-family:inherit;font-size:14px;color:${C.text};background:#fff;transition:border-color .18s ease,box-shadow .18s ease;}
.pd-select:focus{outline:none;border-color:${C.teal};box-shadow:0 0 0 3px rgba(39,143,135,0.14);}
.pd-form-error{margin-top:10px;font-size:13px;font-weight:600;color:#C23B3B;}

/* Placeholder views */
.pd-placeholder{max-width:520px;margin:40px auto 0;padding:44px 30px;text-align:center;background:#fff;border:1px solid ${C.border};border-radius:16px;display:flex;flex-direction:column;align-items:center;}
.pd-placeholder-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:14px;background:${C.tealSoft};color:${C.teal};margin-bottom:14px;}
.pd-placeholder-title{font-size:20px;font-weight:800;color:${C.text};}
.pd-placeholder-text{margin-top:8px;font-size:14px;line-height:1.6;color:${C.textSec};}
.pd-placeholder .pd-btn-ghost{margin-top:18px;}

/* Skeletons */
.pd-skel{height:14px;border-radius:7px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:pdShimmer 1.3s infinite linear;}
.pd-skel-lg{height:44px;border-radius:12px;margin-bottom:14px;}
.pd-skel-sm{height:12px;width:55%;margin-top:10px;}
.pd-skel-row{height:18px;margin-bottom:10px;}
.pd-skel-card{padding:20px;}
.pd-skel-list{display:flex;flex-direction:column;}

/* Motion */
@keyframes pdFade{from{opacity:0;}to{opacity:1;}}
@keyframes pdFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes pdShimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@keyframes pdDot{0%,80%,100%{opacity:0.25;transform:scale(0.8);}40%{opacity:1;transform:scale(1);}}

/* Responsive */
@media (max-width:1180px){
  .pd-content{padding:30px 32px 56px;}
}
@media (max-width:1024px){
  .pd-recgrid{grid-template-columns:repeat(2,1fr);}
  .pd-ayagrid{grid-template-columns:repeat(2,1fr);}
}
@media (max-width:960px){
  .pd-sidebar{display:none;}
  .pd-topbar{display:flex;position:sticky;top:0;z-index:50;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;background:rgba(250,249,245,0.92);backdrop-filter:blur(10px);border-bottom:1px solid ${C.border};}
  .pd-main{margin-left:0;}
  .pd-content{padding:24px 18px 48px;}
}
@media (max-width:760px){
  .pd-ayagrid{grid-template-columns:1fr;}
  .pd-duo{grid-template-columns:1fr;}
}
@media (max-width:640px){
  .pd-recgrid{grid-template-columns:1fr;}
  .pd-qa{grid-template-columns:repeat(2,1fr);}
  .pd-up-row{flex-wrap:wrap;}
  .pd-up-side{flex-direction:row;align-items:center;width:100%;justify-content:space-between;}
  .pd-assistant{padding:18px;}
  .pd-welcome-title{font-size:23px;}
  .pd-assistant-btn{width:100%;}
  .pd-ai-row{flex-wrap:wrap;}
  .pd-ai-row .pd-btn-ghost{width:100%;}
}
@media (prefers-reduced-motion:reduce){
  .pd-app *,.pd-app *::before,.pd-app *::after{animation-duration:0.001s !important;transition-duration:0.001s !important;}
}
`;

export default ParentDashboard;
