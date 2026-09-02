import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { parseTimeOfDay, formatTimeRange } from '../utils/parseCareRequest';

/* ═══════════════════════════════════════════════════════
   AYA DASHBOARD — HOME
   A professional childcare work dashboard for the
   authenticated Aya: today's care, new care requests,
   upcoming bookings, an earnings snapshot, quick actions,
   and an assistant presence — all real data, no filler.
   Visual system matches the Parent Dashboard (shared tokens
   kept inline per the project's per-page convention).
   ═══════════════════════════════════════════════════════ */

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
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CalendarCheck: (p) => <svg {...sv} {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Banknote: (p) => <svg {...sv} {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  LogOut: (p) => <svg {...sv} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Sparkles: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  RefreshCw: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Search: (p) => <svg {...sv} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  User: (p) => <svg {...sv} {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  AlertCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Power: (p) => <svg {...sv} {...p}><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
};

/* ═══════════════════════════════════════════════════════
   LOGO — parent & child (same mark as Landing / Register /
   Login / Parent Dashboard)
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

/* experience_years is stored both as numbers ("8") and ranges ("3-5 years") */
const expLabel = (v) => {
  if (v === null || v === undefined || v === '') return null;
  return `${String(v).replace(/\s*years?$/i, '').trim()} yrs`;
};

const childAgeText = (age) => `${age} year${Number(age) === 1 ? '' : 's'} old`;

const durationText = (b) =>
  b.duration ? `${b.duration} hour${Number(b.duration) === 1 ? '' : 's'}` : null;

const childText = (parent) =>
  parent && parent.child_age != null && parent.child_age !== '' ? `Child ${childAgeText(parent.child_age)}` : null;

const formatAmount = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

const paymentWord = (status) => ({
  pending: 'awaiting payment', processing: 'processing', paid: 'paid',
  failed: 'payment failed', cancelled: 'cancelled', refunded: 'refunded',
}[status] || String(status || ''));

const STATUS_STYLES = {
  pending: { label: 'PENDING', color: '#9A6B15', bg: '#FBF1D8' },
  confirmed: { label: 'CONFIRMED', color: C.green, bg: C.greenBg },
  declined: { label: 'DECLINED', color: '#C23B3B', bg: '#FBE9E9' },
  completed: { label: 'COMPLETED', color: C.teal, bg: C.tealSoft },
};
const statusStyle = (status) =>
  STATUS_STYLES[status] || { label: String(status || 'PENDING').toUpperCase(), color: C.textSec, bg: C.bg };

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

/* ═══════════════════════════════════════════════════════
   SHARED BLOCKS
   ═══════════════════════════════════════════════════════ */
function EmptyState({ Icon, title, text, children }) {
  return (
    <div className="ad-card ad-empty">
      <div className="ad-empty-icon"><Icon width={22} height={22} /></div>
      <h3 className="ad-empty-title">{title}</h3>
      <p className="ad-section-sub">{text}</p>
      {children}
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <section className="ad-card ad-error-card" role="alert">
      <div className="ad-empty-icon ad-empty-icon-coral"><Ic.AlertCircle width={22} height={22} /></div>
      <h2 className="ad-section-title">We hit a snag</h2>
      <p className="ad-section-sub">{message}</p>
      <button type="button" className="ad-btn" onClick={onRetry}>
        <Ic.RefreshCw width={15} height={15} /> Try Again
      </button>
    </section>
  );
}

function NoProfileCard({ kind, onSignOut }) {
  return (
    <div className="ad-card ad-noprofile">
      <div className="ad-empty-icon"><Ic.User width={22} height={22} /></div>
      <h1 className="ad-noprofile-title">
        {kind === 'parent' ? 'This account belongs to a parent' : 'No caregiver profile found'}
      </h1>
      <p className="ad-section-sub">
        {kind === 'parent'
          ? 'You’re signed in with a parent account. The Aya Dashboard is for caregiver accounts.'
          : 'We couldn’t find a caregiver profile for this account. Register as a caregiver to start receiving care requests.'}
      </p>
      <div className="ad-noprofile-actions">
        {kind === 'parent' ? (
          <button type="button" className="ad-btn" onClick={() => { window.location.href = '/parent-dashboard'; }}>
            Go to Parent Dashboard
          </button>
        ) : (
          <button type="button" className="ad-btn" onClick={() => { window.location.href = '/register'; }}>
            Register as a Caregiver
          </button>
        )}
        <button type="button" className="ad-btn-ghost" onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

function SkeletonHome() {
  return (
    <>
      <div className="ad-welcome">
        <div className="ad-welcome-row">
          <div className="ad-skel ad-skel-avatar" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ad-skel ad-skel-sm" style={{ marginBottom: 10 }} />
            <div className="ad-skel ad-skel-title" />
            <div className="ad-skel ad-skel-row ad-skel-text" />
          </div>
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="ad-card ad-skel-card">
          <div className="ad-skel ad-skel-row" style={{ width: '32%' }} />
          <div className="ad-skel ad-skel-row" style={{ width: '55%' }} />
          <div className="ad-skel ad-skel-sm" />
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TODAY CARD — the strongest block on the page
   ═══════════════════════════════════════════════════════ */
function TodayCard({ booking, amount, onDetails }) {
  const parent = booking.parents || {};
  const st = statusStyle(booking.status);
  const range = formatTimeRange(booking.time, booking.duration) || booking.time || null;
  return (
    <article className="ad-card ad-today-card" aria-label="Today's care">
      <p className="ad-today-when">
        <span className="ad-today-badge">Today</span>
        {range && <span>{range}</span>}
      </p>
      <div className="ad-today-row">
        <div className="ad-avatar ad-avatar-lg ad-avatar-coral">{initials(parent.name)}</div>
        <div className="ad-today-info">
          <h3 className="ad-today-name">{parent.name || 'Family'}</h3>
          <p className="ad-today-meta">
            {[childText(parent), parent.location, durationText(booking)].filter(Boolean).join(' · ')}
          </p>
          {amount && (
            <p className="ad-today-amount">
              {amount.source === 'payment' ? formatAmount(amount.value) : `Est. ${formatAmount(amount.value)}`}
            </p>
          )}
        </div>
        <div className="ad-today-side">
          <span className="ad-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          <button type="button" className="ad-btn-ghost" onClick={onDetails}>View Details</button>
        </div>
      </div>
      {booking.status === 'pending' && (
        <p className="ad-today-note">This request is for today — respond so the family can plan ahead.</p>
      )}
    </article>
  );
}

/* ═══════════════════════════════════════════════════════
   REQUEST CARD — a real pending care request for this Aya
   ═══════════════════════════════════════════════════════ */
function RequestCard({ booking, amount, acting, onAccept, onDecline, onDetails }) {
  const parent = booking.parents || {};
  const range = formatTimeRange(booking.time, booking.duration) || booking.time || null;
  return (
    <article className="ad-card ad-request-card" aria-label="Care request">
      <div className="ad-req-main">
        <div className="ad-avatar">{initials(parent.name)}</div>
        <div className="ad-req-info">
          <p className="ad-req-when">{[dayLabel(booking.date), range].filter(Boolean).join(' · ')}</p>
          <h3 className="ad-req-name">{parent.name || 'Family'}</h3>
          <p className="ad-req-meta">
            {[childText(parent), parent.location, durationText(booking)].filter(Boolean).join(' · ')}
          </p>
        </div>
        {amount && (
          <div className="ad-req-amount">
            <p className="ad-req-amount-value">
              {amount.source === 'payment' ? formatAmount(amount.value) : `Est. ${formatAmount(amount.value)}`}
            </p>
            <p className="ad-req-amount-label">
              {amount.source === 'payment' ? paymentWord(amount.payment.status) : 'from your rate'}
            </p>
          </div>
        )}
      </div>
      <div className="ad-req-actions">
        <button type="button" className="ad-btn-ghost ad-btn-sm" onClick={onDetails}>View Details</button>
        <div className="ad-req-respond">
          <button type="button" className="ad-btn-ghost ad-btn-sm ad-btn-danger" onClick={onDecline} disabled={acting}>
            Decline
          </button>
          <button type="button" className="ad-btn ad-btn-sm" onClick={onAccept} disabled={acting}>
            {acting ? 'Responding…' : 'Accept'}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════
   UPCOMING ROW — compact confirmed booking line
   ═══════════════════════════════════════════════════════ */
function UpcomingRow({ booking, amount, onDetails }) {
  const parent = booking.parents || {};
  const st = statusStyle(booking.status);
  const range = formatTimeRange(booking.time, booking.duration) || booking.time || null;
  return (
    <div className="ad-up-row">
      <div className="ad-up-when">
        <span className="ad-up-date">{dayLabel(booking.date)}</span>
        <span className="ad-up-time"><Ic.Clock width={13} height={13} />{range || 'Time to be confirmed'}</span>
      </div>
      <div className="ad-up-info">
        <p className="ad-up-name">{parent.name || 'Family'}</p>
        <p className="ad-up-meta">{[parent.location, durationText(booking)].filter(Boolean).join(' · ')}</p>
      </div>
      <span className="ad-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
      {amount ? (
        <div className="ad-up-amount">
          <span className="ad-up-amount-value">
            {amount.source === 'payment' ? formatAmount(amount.value) : `Est. ${formatAmount(amount.value)}`}
          </span>
          <span className="ad-up-amount-label">
            {amount.source === 'payment' ? paymentWord(amount.payment.status) : 'estimated'}
          </span>
        </div>
      ) : <div className="ad-up-amount" aria-hidden="true" />}
      <button type="button" className="ad-btn-ghost ad-btn-sm" onClick={onDetails}>View</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOKING DETAILS MODAL — read-only, with respond actions
   for pending requests
   ═══════════════════════════════════════════════════════ */
function BookingModal({ booking, payment, rate, acting, onAccept, onDecline, onClose }) {
  const parent = booking.parents || {};
  const st = statusStyle(booking.status);
  const range = formatTimeRange(booking.time, booking.duration) || booking.time || null;
  const est = rate != null && rate !== '' && booking.duration ? Number(rate) * booking.duration : null;
  return (
    <div className="ad-modalwrap" role="dialog" aria-modal="true" aria-label="Booking details" onClick={onClose}>
      <div className="ad-modalcard" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-head">
          <div className="ad-avatar ad-avatar-lg ad-avatar-coral">{initials(parent.name)}</div>
          <div className="ad-modal-headtext">
            <h3 className="ad-modal-title">{parent.name || 'Family'}</h3>
            <span className="ad-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          </div>
          <button type="button" className="ad-iconbtn" onClick={onClose} aria-label="Close">
            <Ic.X width={18} height={18} />
          </button>
        </div>

        <p className="ad-dl-heading">Booking</p>
        <dl className="ad-dl">
          <div className="ad-dl-row"><dt>Date</dt><dd>{booking.date ? longDate(booking.date) : '—'}</dd></div>
          <div className="ad-dl-row"><dt>Time</dt><dd>{range || booking.time || '—'}</dd></div>
          {booking.duration != null && booking.duration !== '' && (
            <div className="ad-dl-row"><dt>Duration</dt><dd>{booking.duration} hour{Number(booking.duration) === 1 ? '' : 's'}</dd></div>
          )}
          {parent.location && <div className="ad-dl-row"><dt>Location</dt><dd>{parent.location}</dd></div>}
          {childText(parent) && <div className="ad-dl-row"><dt>Child</dt><dd>{childAgeText(parent.child_age)}</dd></div>}
        </dl>

        {(rate != null && rate !== '') || payment || est != null ? (
          <>
            <p className="ad-dl-heading">Earnings</p>
            <dl className="ad-dl">
              {rate != null && rate !== '' && (
                <div className="ad-dl-row"><dt>Your rate</dt><dd>PKR {rate}/hr</dd></div>
              )}
              {payment ? (
                <div className="ad-dl-row"><dt>Payment</dt><dd>{formatAmount(payment.amount)} · {paymentWord(payment.status)}</dd></div>
              ) : est != null ? (
                <div className="ad-dl-row"><dt>Estimated total</dt><dd>{formatAmount(est)}</dd></div>
              ) : null}
            </dl>
          </>
        ) : null}

        {parent.phone && (
          <>
            <p className="ad-dl-heading">Contact</p>
            <dl className="ad-dl">
              <div className="ad-dl-row"><dt>Parent’s phone</dt><dd>{parent.phone}</dd></div>
            </dl>
          </>
        )}

        {booking.status === 'pending' && (
          <p className="ad-modal-note">Respond to this request so the family can complete their booking.</p>
        )}
        <div className="ad-modal-actions">
          {booking.status === 'pending' ? (
            <>
              <button type="button" className="ad-btn-ghost ad-btn-danger" onClick={onDecline} disabled={acting}>
                Decline
              </button>
              <button type="button" className="ad-btn" onClick={onAccept} disabled={acting}>
                {acting ? 'Responding…' : 'Accept Request'}
              </button>
            </>
          ) : (
            <button type="button" className="ad-btn" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AYA DASHBOARD — shell + Home experience
   ═══════════════════════════════════════════════════════ */
function AyaDashboard() {
  const [booting, setBooting] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [noProfile, setNoProfile] = useState(null);   // 'parent' | 'none'
  const [bookings, setBookings] = useState(null);     // null while loading
  const [payments, setPayments] = useState([]);
  const [earningsUnavailable, setEarningsUnavailable] = useState(false); // payments unreadable (e.g. table not live yet)
  const [loadError, setLoadError] = useState(null);
  const [availSaving, setAvailSaving] = useState(false);
  const [actingId, setActingId] = useState(null);     // booking being accepted/declined
  const [actionError, setActionError] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);

  /* ── Data loading (real data only: this Aya's bookings and
     the payments made for those bookings) ─────────────── */
  const loadData = async (ayaId) => {
    setLoadError(null);
    setEarningsUnavailable(false);
    const { data: bk, error: bkErr } = await supabase
      .from('bookings')
      .select('*, parents(name, phone, location, child_age)')
      .eq('aya_id', ayaId)
      .order('created_at', { ascending: false });
    if (bkErr) {
      setLoadError('We couldn’t load your bookings right now. Please try again.');
      return;
    }
    const list = bk || [];
    setBookings(list);

    /* Earnings are a secondary slice: if payments can’t be read
       (e.g. the payments table isn’t live in this project yet),
       keep the dashboard usable and show the snapshot as
       unavailable instead of blocking the whole page. */
    if (list.length) {
      const { data: pays, error: payErr } = await supabase
        .from('payments')
        .select('id, booking_id, amount, currency, status, paid_at, created_at')
        .in('booking_id', list.map((b) => b.id));
      if (payErr) {
        setPayments([]);
        setEarningsUnavailable(true);
      } else {
        setPayments(pays || []);
      }
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

  /* Escape closes the modal; lock body scroll behind it */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailBooking(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = detailBooking ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [detailBooking]);

  /* ── Derived state ─────────────────────────────────── */

  const todayStr = localDateStr(new Date());

  const todayBookings = useMemo(() => {
    if (!bookings) return null;
    return bookings
      .filter((b) => b.date && String(b.date) === todayStr && (b.status === 'pending' || b.status === 'confirmed'))
      .sort(byDateTime);
  }, [bookings, todayStr]);

  const requests = useMemo(() => {
    if (!bookings) return null;
    return bookings
      .filter((b) => b.status === 'pending' && b.date && String(b.date) >= todayStr)
      .sort(byDateTime);
  }, [bookings, todayStr]);

  const upcoming = useMemo(() => {
    if (!bookings) return null;
    return bookings
      .filter((b) => b.status === 'confirmed' && b.date && String(b.date) > todayStr)
      .sort(byDateTime)
      .slice(0, 4);
  }, [bookings, todayStr]);

  /* Latest payment row per booking (UNIQUE(booking_id, provider)
     can still yield several rows across providers) */
  const paymentsByBooking = useMemo(() => {
    const m = {};
    (payments || []).forEach((p) => {
      const cur = m[p.booking_id];
      if (!cur || new Date(p.created_at || 0) > new Date(cur.created_at || 0)) m[p.booking_id] = p;
    });
    return m;
  }, [payments]);

  const earnings = useMemo(() => {
    if (!bookings) return null;
    if (!payments.length) return { any: false, pending: 0, paid: 0 };
    const inFlight = payments.filter((p) => p.status === 'pending' || p.status === 'processing');
    const paid = payments.filter((p) => p.status === 'paid');
    return {
      any: true,
      pending: inFlight.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
      paid: paid.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0),
    };
  }, [bookings, payments]);

  /* Amount for a booking: the real payment when one exists,
     otherwise an estimate from the Aya's own rate (the same
     rate × duration formula the payment service uses) */
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

  /* ── Actions ───────────────────────────────────────── */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const respond = async (bookingId, status) => {
    if (actingId) return;
    setActingId(bookingId);
    setActionError(null);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    if (error) {
      setActionError(status === 'confirmed'
        ? 'We couldn’t accept that request. Please try again.'
        : 'We couldn’t decline that request. Please try again.');
    } else {
      setBookings((list) => (list || []).map((b) => (b.id === bookingId ? { ...b, status } : b)));
      setDetailBooking((d) => (d && d.id === bookingId ? { ...d, status } : d));
    }
    setActingId(null);
  };

  const toggleAvailability = async () => {
    if (!profile || availSaving) return;
    setAvailSaving(true);
    setActionError(null);
    const next = !profile.is_available;
    const { error } = await supabase
      .from('ayas')
      .update({ is_available: next })
      .eq('id', profile.id);
    if (error) {
      setActionError('We couldn’t update your availability. Please try again.');
    } else {
      setProfile((p) => ({ ...p, is_available: next }));
    }
    setAvailSaving(false);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Assistant prompt: review the first booking of today (or today section) */
  const reviewToday = () => {
    if (todayBookings && todayBookings.length) setDetailBooking(todayBookings[0]);
    else scrollTo('ad-today');
  };

  /* ── Identity bits ─────────────────────────────────── */

  const avatarText = initials((profile && profile.name) || (authUser && authUser.email) || '');
  const displayName = firstName(profile && profile.name);
  const isAvail = !!(profile && profile.is_available);
  const experience = profile ? expLabel(profile.experience_years) : null;
  const hasRate = !!(profile && profile.rate_per_hour != null && profile.rate_per_hour !== '');

  const header = (
    <header className="ad-header">
      <Logo />
      <div className="ad-header-right">
        {profile && (
          <span className={`ad-avail-pill${isAvail ? ' on' : ' off'}`}>
            <span className="ad-avail-dot" aria-hidden="true" />
            {isAvail ? 'Available' : 'Unavailable'}
          </span>
        )}
        <div className="ad-avatar ad-avatar-sm" aria-hidden="true">{avatarText}</div>
        <button type="button" className="ad-logout" onClick={handleLogout}>
          <Ic.LogOut width={15} height={15} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );

  /* ── Loading / role mismatch / hard error shells ──── */

  if (booting) {
    return (
      <div className="ad-app">
        <style>{AD_CSS}</style>
        {header}
        <main className="ad-main">
          <div className="ad-content"><SkeletonHome /></div>
        </main>
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="ad-app">
        <style>{AD_CSS}</style>
        {header}
        <main className="ad-main">
          <div className="ad-content">
            <NoProfileCard kind={noProfile} onSignOut={handleLogout} />
          </div>
        </main>
      </div>
    );
  }

  /* Profile fetch failed — nothing else can render safely */
  if (!profile) {
    return (
      <div className="ad-app">
        <style>{AD_CSS}</style>
        {header}
        <main className="ad-main">
          <div className="ad-content">
            <ErrorCard
              message={loadError || 'We couldn’t load your caregiver profile. Please try again.'}
              onRetry={() => { window.location.reload(); }}
            />
          </div>
        </main>
      </div>
    );
  }

  /* ── Welcome header ────────────────────────────────── */

  const welcomeBlock = (
    <header className="ad-welcome">
      <div className="ad-welcome-row">
        <div className="ad-avatar ad-avatar-xl">{avatarText}</div>
        <div className="ad-welcome-text">
          <p className="ad-eyebrow">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="ad-welcome-title">
            {greetingFor(new Date())}{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="ad-welcome-sub">Here’s what’s happening with your care today.</p>
        </div>
      </div>
      <div className="ad-welcome-foot">
        <div className="ad-meta">
          {profile.location && (
            <span className="ad-meta-chip"><Ic.MapPin width={13} height={13} />{profile.location}</span>
          )}
          {experience && (
            <span className="ad-meta-chip"><Ic.Award width={13} height={13} />{experience} experience</span>
          )}
          {hasRate && (
            <span className="ad-meta-chip"><Ic.Banknote width={13} height={13} />PKR {profile.rate_per_hour}/hr</span>
          )}
          {profile.trust_score != null && (
            <span className="ad-meta-chip"><Ic.Shield width={13} height={13} />Trust score {profile.trust_score}/100</span>
          )}
        </div>
        <div className="ad-avail-card">
          <div className="ad-avail-text">
            <p className="ad-avail-title">{isAvail ? 'Available for new care' : 'Not accepting new care'}</p>
            <p className="ad-avail-sub">{isAvail ? 'Parents can find and request you' : 'You’re hidden from parent searches'}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAvail}
            aria-label="Toggle availability"
            className={`ad-switch${isAvail ? ' on' : ''}`}
            onClick={toggleAvailability}
            disabled={availSaving}
          >
            <span className="ad-switch-knob" />
          </button>
        </div>
      </div>
    </header>
  );

  /* ── Home sections ─────────────────────────────────── */

  const todaySection = (
    <section id="ad-today" className="ad-section" aria-label="Today's care">
      <div className="ad-section-head">
        <h2 className="ad-section-title">Today</h2>
        {todayBookings && todayBookings.length > 1 && (
          <span className="ad-count">{todayBookings.length} sessions</span>
        )}
      </div>
      {todayBookings === null ? (
        <div className="ad-card ad-skel-card">
          <div className="ad-skel ad-skel-row" style={{ width: '32%' }} />
          <div className="ad-skel ad-skel-row" style={{ width: '55%' }} />
          <div className="ad-skel ad-skel-sm" />
        </div>
      ) : todayBookings.length ? (
        todayBookings.map((b) => (
          <TodayCard key={b.id} booking={b} amount={amountFor(b)} onDetails={() => setDetailBooking(b)} />
        ))
      ) : (
        <EmptyState
          Icon={Ic.CalendarCheck}
          title="No care scheduled today"
          text="Your day is open. Review new care requests to fill your calendar — and stay available so parents can find you."
        >
          <button type="button" className="ad-btn" onClick={() => scrollTo('ad-requests')}>
            View Care Requests
          </button>
        </EmptyState>
      )}
    </section>
  );

  const requestsSection = (
    <section id="ad-requests" className="ad-section" aria-label="New care requests">
      <div className="ad-section-head">
        <h2 className="ad-section-title">New Care Requests</h2>
        {requests && requests.length > 0 && (
          <span className="ad-count">{requests.length} new</span>
        )}
      </div>
      {requests === null ? (
        <div className="ad-card ad-skel-card">
          <div className="ad-skel ad-skel-row" style={{ width: '40%' }} />
          <div className="ad-skel ad-skel-row" style={{ width: '60%' }} />
          <div className="ad-skel ad-skel-sm" />
        </div>
      ) : requests.length ? (
        requests.map((b) => (
          <RequestCard
            key={b.id}
            booking={b}
            amount={amountFor(b)}
            acting={actingId === b.id}
            onAccept={() => respond(b.id, 'confirmed')}
            onDecline={() => respond(b.id, 'declined')}
            onDetails={() => setDetailBooking(b)}
          />
        ))
      ) : (
        <EmptyState
          Icon={Ic.User}
          title="No new care requests"
          text={isAvail
            ? 'When a parent requests your care, it will appear here for you to accept or decline.'
            : 'You’re currently unavailable, so parents can’t request you. Turn on availability to start receiving requests.'}
        >
          {!isAvail && (
            <button type="button" className="ad-btn" onClick={toggleAvailability} disabled={availSaving}>
              <Ic.Power width={15} height={15} /> Become Available
            </button>
          )}
        </EmptyState>
      )}
    </section>
  );

  const upcomingSection = (
    <section id="ad-upcoming" className="ad-section" aria-label="Upcoming bookings">
      <div className="ad-section-head">
        <h2 className="ad-section-title">Upcoming Bookings</h2>
      </div>
      {upcoming === null ? (
        <div className="ad-card ad-skel-card">
          <div className="ad-skel ad-skel-row" style={{ width: '45%' }} />
          <div className="ad-skel ad-skel-row" style={{ width: '30%' }} />
          <div className="ad-skel ad-skel-sm" />
        </div>
      ) : upcoming.length ? (
        <div className="ad-card ad-up-card">
          {upcoming.map((b) => (
            <UpcomingRow key={b.id} booking={b} amount={amountFor(b)} onDetails={() => setDetailBooking(b)} />
          ))}
        </div>
      ) : (
        <EmptyState
          Icon={Ic.Calendar}
          title="No upcoming bookings"
          text="Accepted bookings will appear here as your schedule fills up."
        />
      )}
    </section>
  );

  const earningsAndActions = (
    <div className="ad-duo">
      <section id="ad-earnings" className="ad-card ad-duo-card" aria-label="Earnings snapshot">
        <h2 className="ad-section-title">Earnings Snapshot</h2>
        {earningsUnavailable ? (
          <div className="ad-earn-empty">
            <p className="ad-section-sub">
              Earnings aren’t available right now. Your bookings above are up to date — please check back later.
            </p>
          </div>
        ) : earnings && earnings.any ? (
          <>
            <div className="ad-earn-stats">
              <div className="ad-stat">
                <p className="ad-stat-value">{formatAmount(earnings.pending)}</p>
                <p className="ad-stat-label">Pending earnings</p>
              </div>
              <div className="ad-stat">
                <p className="ad-stat-value">{formatAmount(earnings.paid)}</p>
                <p className="ad-stat-label">Completed earnings</p>
              </div>
            </div>
            <p className="ad-earn-note">Amounts are payments made for your bookings. Payout tracking isn’t available yet.</p>
          </>
        ) : (
          <div className="ad-earn-empty">
            <p className="ad-section-sub">
              No earnings yet. Payments for your bookings will appear here once parents complete checkout.
            </p>
          </div>
        )}
      </section>

      <section className="ad-card ad-duo-card" aria-label="Quick actions">
        <h2 className="ad-section-title">Quick Actions</h2>
        <div className="ad-qa">
          <button type="button" className="ad-qa-btn" onClick={() => scrollTo('ad-requests')}>
            <Ic.Search width={16} height={16} /> View Care Requests
          </button>
          <button type="button" className="ad-qa-btn" onClick={() => scrollTo('ad-upcoming')}>
            <Ic.Calendar width={16} height={16} /> View Schedule
          </button>
          <button type="button" className="ad-qa-btn" onClick={toggleAvailability} disabled={availSaving}>
            <Ic.Power width={16} height={16} /> {isAvail ? 'Pause Availability' : 'Become Available'}
          </button>
          <button type="button" className="ad-qa-btn" onClick={() => scrollTo('ad-earnings')}>
            <Ic.Banknote width={16} height={16} /> View Earnings
          </button>
        </div>
      </section>
    </div>
  );

  const assistantBlock = (
    <section className="ad-card ad-ai" aria-label="AyaFind Assistant">
      <div className="ad-ai-head">
        <span className="ad-ai-badge"><Ic.Sparkles width={19} height={19} /></span>
        <div>
          <h2 className="ad-section-title">Need help managing your care?</h2>
          <p className="ad-section-sub">Tap a prompt and we’ll take you straight to the answer.</p>
        </div>
      </div>
      <div className="ad-ai-chips">
        <button type="button" className="ad-ai-chip" onClick={() => scrollTo('ad-requests')}>
          <Ic.Search width={13} height={13} /> Find suitable care requests
        </button>
        <button type="button" className="ad-ai-chip" onClick={() => scrollTo('ad-upcoming')}>
          <Ic.Calendar width={13} height={13} /> Check my schedule
        </button>
        <button type="button" className="ad-ai-chip" onClick={reviewToday}>
          <Ic.CalendarCheck width={13} height={13} /> Review today’s booking
        </button>
        <button type="button" className="ad-ai-chip" onClick={toggleAvailability} disabled={availSaving}>
          <Ic.Power width={13} height={13} /> Update my availability
        </button>
        <button type="button" className="ad-ai-chip" onClick={() => scrollTo('ad-earnings')}>
          <Ic.Banknote width={13} height={13} /> Explain my earnings
        </button>
      </div>
    </section>
  );

  return (
    <div className="ad-app">
      <style>{AD_CSS}</style>
      {header}
      <main className="ad-main">
        <div className="ad-content">
          {welcomeBlock}
          {actionError && (
            <div className="ad-alert" role="alert">
              <Ic.AlertCircle width={16} height={16} />
              <p>{actionError}</p>
              <button type="button" className="ad-alert-x" onClick={() => setActionError(null)} aria-label="Dismiss">
                <Ic.X width={14} height={14} />
              </button>
            </div>
          )}
          {loadError ? (
            <ErrorCard message={loadError} onRetry={() => profile && loadData(profile.id)} />
          ) : (
            <>
              {todaySection}
              {requestsSection}
              {upcomingSection}
              {earningsAndActions}
              {assistantBlock}
            </>
          )}
        </div>
      </main>
      {detailBooking && (
        <BookingModal
          booking={detailBooking}
          payment={paymentsByBooking[detailBooking.id]}
          rate={profile ? profile.rate_per_hour : null}
          acting={actingId === detailBooking.id}
          onAccept={() => respond(detailBooking.id, 'confirmed')}
          onDecline={() => respond(detailBooking.id, 'declined')}
          onClose={() => setDetailBooking(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES — AyaFind visual tokens, scoped with the ad- prefix
   ═══════════════════════════════════════════════════════ */
const AD_CSS = `
.ad-app{min-height:100vh;background:${C.bg};color:${C.text};font-family:${FF};-webkit-font-smoothing:antialiased;}
.ad-app *,.ad-app *::before,.ad-app *::after{box-sizing:border-box;}
.ad-app button{font-family:inherit;cursor:pointer;}
.ad-app h1,.ad-app h2,.ad-app h3,.ad-app p,.ad-app dl,.ad-app dd{margin:0;}
.ad-app :focus-visible{outline:2px solid ${C.teal};outline-offset:2px;}

/* Header */
.ad-header{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 28px;background:rgba(250,249,245,0.92);backdrop-filter:blur(10px);border-bottom:1px solid ${C.border};}
.ad-header-right{display:flex;align-items:center;gap:12px;}
.ad-avail-pill{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:0.02em;}
.ad-avail-pill.on{background:${C.greenBg};color:${C.green};}
.ad-avail-pill.off{background:#F1EFEA;color:${C.textSec};}
.ad-avail-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}
.ad-logout{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.textSec};font-size:13px;font-weight:700;transition:border-color .18s ease,color .18s ease;}
.ad-logout:hover{border-color:#C23B3B;color:#C23B3B;}

/* Layout */
.ad-main{min-height:calc(100vh - 60px);display:flex;flex-direction:column;}
.ad-content{width:100%;max-width:1080px;margin:0 auto;padding:30px 32px 64px;flex:1;}

/* Avatars */
.ad-avatar{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${C.tealSoft};color:${C.teal};font-size:14px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;}
.ad-avatar-sm{width:34px;height:34px;font-size:12.5px;}
.ad-avatar-lg{width:52px;height:52px;font-size:17px;}
.ad-avatar-xl{width:64px;height:64px;font-size:21px;}
.ad-avatar-coral{background:${C.coralSoft};color:${C.coral};}

/* Welcome */
.ad-welcome{margin-bottom:26px;animation:adFadeUp .4s ease both;}
.ad-welcome-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
.ad-welcome-text{min-width:0;}
.ad-eyebrow{font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${C.teal};margin-bottom:7px;}
.ad-welcome-title{font-size:clamp(24px,3vw,30px);font-weight:800;letter-spacing:-0.02em;color:${C.navy};}
.ad-welcome-sub{margin-top:7px;font-size:15px;color:${C.textSec};}
.ad-welcome-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:18px;padding-top:18px;border-top:1px solid ${C.border};}
.ad-meta{display:flex;flex-wrap:wrap;gap:8px;}
.ad-meta-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:#fff;border:1px solid ${C.border};font-size:12.5px;font-weight:700;color:${C.textSec};}
.ad-meta-chip svg{color:${C.teal};flex-shrink:0;}

/* Availability card + switch */
.ad-avail-card{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:12px;background:#fff;border:1px solid ${C.border};}
.ad-avail-text{min-width:0;}
.ad-avail-title{font-size:13.5px;font-weight:800;color:${C.text};}
.ad-avail-sub{margin-top:2px;font-size:12px;color:${C.textSec};}
.ad-switch{position:relative;width:46px;height:26px;border-radius:999px;border:none;background:#D8D3CB;transition:background .2s ease;flex-shrink:0;padding:0;}
.ad-switch.on{background:${C.green};}
.ad-switch:disabled{opacity:0.6;cursor:not-allowed;}
.ad-switch-knob{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(23,36,61,0.25);transition:transform .2s ease;}
.ad-switch.on .ad-switch-knob{transform:translateX(20px);}

/* Sections + cards */
.ad-section{margin-bottom:26px;scroll-margin-top:84px;}
.ad-section-head{display:flex;align-items:center;gap:10px;margin-bottom:13px;}
.ad-section-title{font-size:16.5px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.ad-section-sub{font-size:14px;color:${C.textSec};line-height:1.55;}
.ad-count{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;background:${C.tealSoft};color:#1F7A73;font-size:11.5px;font-weight:800;}
.ad-card{background:#fff;border:1px solid ${C.border};border-radius:14px;box-shadow:0 1px 2px rgba(23,36,61,0.04);}

/* Buttons */
.ad-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border:none;border-radius:10px;background:${C.teal};color:#fff;font-size:14px;font-weight:700;box-shadow:0 6px 16px rgba(39,143,135,0.22);transition:background .18s ease,box-shadow .18s ease,transform .18s ease;}
.ad-btn:hover{background:#1F7A73;box-shadow:0 8px 20px rgba(39,143,135,0.3);}
.ad-btn:active{transform:translateY(1px);}
.ad-btn:disabled{opacity:0.55;cursor:not-allowed;box-shadow:none;}
.ad-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.text};font-size:13.5px;font-weight:700;transition:border-color .18s ease,color .18s ease,background .18s ease;}
.ad-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.ad-btn-danger{border-color:rgba(194,59,59,0.35);color:#C23B3B;}
.ad-btn-danger:hover{border-color:#C23B3B;color:#C23B3B;background:#FBE9E9;}
.ad-btn-sm{padding:8px 14px;font-size:12.5px;}

/* Status badge */
.ad-status{display:inline-flex;align-items:center;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.06em;}

/* Today */
.ad-today-card{padding:22px 24px;border-top:3px solid ${C.teal};box-shadow:0 10px 34px rgba(39,143,135,0.1);animation:adFadeUp .4s .05s ease both;}
.ad-today-card + .ad-today-card{margin-top:14px;}
.ad-today-when{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};margin-bottom:14px;}
.ad-today-badge{padding:4px 11px;border-radius:999px;background:${C.tealSoft};}
.ad-today-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.ad-today-info{flex:1;min-width:220px;}
.ad-today-name{font-size:18px;font-weight:800;color:${C.text};letter-spacing:-0.01em;}
.ad-today-meta{margin-top:4px;font-size:13px;color:${C.textSec};}
.ad-today-amount{margin-top:6px;font-size:13px;font-weight:800;color:${C.navy};}
.ad-today-side{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.ad-today-note{margin-top:14px;padding-top:12px;border-top:1px dashed ${C.border};font-size:13px;font-weight:600;color:#9A6B15;}

/* Requests */
.ad-request-card{padding:20px 22px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;animation:adFadeUp .4s .05s ease both;}
.ad-request-card + .ad-request-card{margin-top:14px;}
.ad-request-card:hover{border-color:rgba(39,143,135,0.35);box-shadow:0 10px 26px rgba(23,36,61,0.07);}
.ad-req-main{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.ad-req-info{flex:1;min-width:220px;}
.ad-req-when{font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};margin-bottom:4px;}
.ad-req-name{font-size:16px;font-weight:800;color:${C.text};}
.ad-req-meta{margin-top:3px;font-size:13px;color:${C.textSec};}
.ad-req-amount{text-align:right;flex-shrink:0;}
.ad-req-amount-value{font-size:16px;font-weight:800;color:${C.navy};}
.ad-req-amount-label{margin-top:2px;font-size:11.5px;color:${C.textMuted};font-weight:600;}
.ad-req-actions{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-top:15px;padding-top:15px;border-top:1px dashed ${C.border};flex-wrap:wrap;}
.ad-req-respond{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}

/* Upcoming */
.ad-up-card{overflow:hidden;}
.ad-up-row{display:grid;grid-template-columns:minmax(175px,auto) minmax(0,1fr) auto minmax(96px,auto) auto;align-items:center;gap:16px;padding:16px 20px;}
.ad-up-row + .ad-up-row{border-top:1px solid ${C.bg};}
.ad-up-when{display:flex;flex-direction:column;gap:3px;}
.ad-up-date{font-size:13.5px;font-weight:800;color:${C.text};}
.ad-up-time{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:${C.textSec};}
.ad-up-time svg{color:${C.teal};flex-shrink:0;}
.ad-up-info{min-width:0;}
.ad-up-name{font-size:14px;font-weight:700;color:${C.text};}
.ad-up-meta{margin-top:2px;font-size:12.5px;color:${C.textSec};}
.ad-up-amount{text-align:right;}
.ad-up-amount-value{font-size:13.5px;font-weight:800;color:${C.navy};}
.ad-up-amount-label{display:block;margin-top:1px;font-size:11px;color:${C.textMuted};font-weight:600;}

/* Earnings + quick actions duo */
.ad-duo{display:grid;grid-template-columns:1.05fr 1fr;gap:16px;margin-bottom:26px;}
.ad-duo-card{padding:22px;}
.ad-earn-stats{display:flex;gap:14px;margin-top:16px;}
.ad-stat{flex:1;padding:16px;border-radius:12px;background:${C.bg};}
.ad-stat-value{font-size:20px;font-weight:800;color:${C.navy};letter-spacing:-0.01em;}
.ad-stat-label{margin-top:4px;font-size:12px;font-weight:700;color:${C.textSec};}
.ad-earn-note{margin-top:14px;font-size:12.5px;color:${C.textMuted};line-height:1.5;}
.ad-earn-empty{margin-top:12px;}
.ad-qa{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}
.ad-qa-btn{display:flex;align-items:center;gap:9px;padding:12px 14px;border:1px solid ${C.border};border-radius:11px;background:#fff;color:${C.text};font-size:13px;font-weight:700;transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease;}
.ad-qa-btn svg{color:${C.teal};flex-shrink:0;}
.ad-qa-btn:hover{border-color:${C.teal};box-shadow:0 8px 18px rgba(39,143,135,0.1);transform:translateY(-1px);}
.ad-qa-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}

/* Assistant */
.ad-ai{padding:22px 24px;border-top:3px solid ${C.teal};box-shadow:0 10px 34px rgba(39,143,135,0.08);}
.ad-ai-head{display:flex;align-items:flex-start;gap:14px;}
.ad-ai-badge{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.ad-ai-chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px;}
.ad-ai-chip{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;border:1px solid ${C.border};background:#fff;font-size:13px;font-weight:700;color:${C.text};transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease;}
.ad-ai-chip svg{color:${C.teal};flex-shrink:0;}
.ad-ai-chip:hover{border-color:${C.teal};background:${C.tealSoft};color:#1F7A73;transform:translateY(-1px);}
.ad-ai-chip:disabled{opacity:0.6;cursor:not-allowed;transform:none;}

/* Empty + error + alert */
.ad-empty{padding:30px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.ad-empty-icon{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:11px;}
.ad-empty-icon-coral{background:${C.coralSoft};color:${C.coral};}
.ad-empty-title{font-size:15.5px;font-weight:800;color:${C.text};}
.ad-empty .ad-section-sub{margin-top:5px;max-width:440px;}
.ad-empty .ad-btn,.ad-empty .ad-btn-ghost{margin-top:14px;}
.ad-alert{display:flex;align-items:center;gap:10px;padding:12px 16px;margin-bottom:20px;border-radius:11px;background:#FBE9E9;border:1px solid rgba(194,59,59,0.2);}
.ad-alert > svg{color:#C23B3B;flex-shrink:0;}
.ad-alert p{flex:1;font-size:13.5px;font-weight:600;color:#A03030;line-height:1.45;}
.ad-alert-x{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:8px;background:transparent;color:#C23B3B;}
.ad-alert-x:hover{background:rgba(194,59,59,0.1);}
.ad-error-card{padding:34px 26px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.ad-error-card .ad-section-sub{margin-top:6px;max-width:420px;}
.ad-error-card .ad-btn{margin-top:16px;}
.ad-noprofile{max-width:480px;margin:48px auto 0;padding:44px 30px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.ad-noprofile-title{font-size:20px;font-weight:800;color:${C.text};}
.ad-noprofile .ad-section-sub{margin-top:8px;}
.ad-noprofile-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;justify-content:center;}

/* Modal */
.ad-modalwrap{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(17,27,46,0.55);animation:adFade .2s ease;}
.ad-modalcard{width:100%;max-width:470px;max-height:88vh;overflow-y:auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 24px 60px rgba(17,27,46,0.3);animation:adFadeUp .25s ease both;}
.ad-modal-head{display:flex;align-items:center;gap:13px;margin-bottom:18px;}
.ad-modal-headtext{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:7px;}
.ad-modal-title{font-size:17px;font-weight:800;color:${C.text};}
.ad-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:9px;background:${C.bg};color:${C.textSec};transition:background .18s ease,color .18s ease;flex-shrink:0;}
.ad-iconbtn:hover{background:${C.border};color:${C.text};}
.ad-dl-heading{font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};margin:16px 0 8px;}
.ad-dl{margin:0;border:1px solid ${C.border};border-radius:11px;overflow:hidden;}
.ad-dl-row{display:flex;justify-content:space-between;gap:14px;padding:10px 14px;font-size:13.5px;}
.ad-dl-row + .ad-dl-row{border-top:1px solid ${C.bg};}
.ad-dl-row dt{color:${C.textSec};font-weight:600;}
.ad-dl-row dd{margin:0;color:${C.text};font-weight:700;text-align:right;}
.ad-modal-note{margin-top:14px;padding:11px 14px;border-radius:10px;background:#FBF1D8;font-size:13px;line-height:1.5;color:#9A6B15;font-weight:600;}
.ad-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;flex-wrap:wrap;}

/* Skeletons */
.ad-skel{height:14px;border-radius:7px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:adShimmer 1.3s infinite linear;}
.ad-skel-row{height:16px;margin-bottom:10px;}
.ad-skel-title{width:45%;height:24px;margin-bottom:12px;}
.ad-skel-text{width:70%;}
.ad-skel-sm{width:55%;height:12px;}
.ad-skel-avatar{width:64px;height:64px;border-radius:50%;flex-shrink:0;}
.ad-skel-card{padding:22px;margin-bottom:26px;}

/* Motion */
@keyframes adFade{from{opacity:0;}to{opacity:1;}}
@keyframes adFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes adShimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}

/* Responsive */
@media (max-width:1024px){
  .ad-content{padding:26px 24px 56px;}
}
@media (max-width:860px){
  .ad-duo{grid-template-columns:1fr;}
  .ad-up-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:15px 18px;}
  .ad-up-when{flex-direction:row;align-items:center;gap:8px;flex-wrap:wrap;}
  .ad-up-info{flex:1;min-width:150px;}
}
@media (max-width:640px){
  .ad-header{padding:11px 16px;}
  .ad-logout span{display:none;}
  .ad-logout{padding:9px 11px;}
  .ad-avail-pill{display:none;}
  .ad-content{padding:22px 16px 48px;}
  .ad-welcome-row{gap:14px;}
  .ad-welcome-foot{flex-direction:column;align-items:stretch;}
  .ad-avail-card{justify-content:space-between;}
  .ad-today-side{width:100%;justify-content:space-between;}
  .ad-req-amount{text-align:left;width:100%;}
  .ad-req-actions{flex-direction:column;align-items:stretch;}
  .ad-req-actions .ad-btn-ghost{width:100%;}
  .ad-req-respond{width:100%;}
  .ad-req-respond .ad-btn,.ad-req-respond .ad-btn-ghost{flex:1;}
  .ad-up-amount{margin-left:auto;}
  .ad-up-row .ad-btn-ghost{width:100%;}
  .ad-qa{grid-template-columns:1fr;}
  .ad-earn-stats{flex-direction:column;}
  .ad-modal-actions .ad-btn,.ad-modal-actions .ad-btn-ghost{flex:1;}
}
@media (prefers-reduced-motion:reduce){
  .ad-app *,.ad-app *::before,.ad-app *::after{animation-duration:0.001s !important;transition-duration:0.001s !important;}
}
`;

export default AyaDashboard;
