import React, { useState, useMemo } from 'react';
import { formatTimeOfDay, parseTimeOfDay } from '../utils/parseCareRequest';

/* ═══════════════════════════════════════════════════════
   MY BOOKINGS — premium care-management experience
   ═══════════════════════════════════════════════════════ */

const C = {
  navy: '#18243D', navyDark: '#111B2E', teal: '#278F87', tealSoft: '#E4F1EF',
  coral: '#F47C5C', coralSoft: '#FDF0EC', bg: '#FAF9F5', card: '#FFFFFF',
  text: '#27313D', textSec: '#657081', textMuted: '#9BA5B4', border: '#E9E6E1',
  green: '#34946A', greenBg: '#ECF8F2',
};
const FF = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

const sv = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Ic = {
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  CheckCircle: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  MessageCircle: (p) => <svg {...sv} {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  XCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Refresh: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  ArrowRight: (p) => <svg {...sv} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 19 12 12 5"/></svg>,
  Search: (p) => <svg {...sv} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Star: (p) => <svg {...sv} {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Banknote: (p) => <svg {...sv} {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>,
  CalendarCheck: (p) => <svg {...sv} {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>,
  ChevronRight: (p) => <svg {...sv} {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Receipt: (p) => <svg {...sv} {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 10h8"/><path d="M8 14h4"/></svg>,
  User: (p) => <svg {...sv} {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

/* ── Helpers ─────────────────────────────────────────── */
const EST_DURATION = 4;
const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};
const firstName = (name) => (name || '').trim().split(/\s+/)[0] || '';
const expLabel = (a) => {
  const v = a && a.experience_years;
  if (v === null || v === undefined || v === '') return 'Experienced';
  return `${String(v).replace(/\s*years?$/i, '').trim()} yrs`;
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
const addHoursToTime = (timeStr, hours) => {
  const total = parseTimeOfDay(timeStr);
  if (total === null) return '';
  const end = total + (hours * 60);
  const h24 = Math.floor(end / 60) % 24;
  const min = end % 60;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(min).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
};

const STATUS_MAP = {
  pending:   { label: 'PENDING',   color: '#9A6B15', bg: '#FBF1D8' },
  confirmed: { label: 'CONFIRMED', color: C.green,   bg: C.greenBg },
  declined:  { label: 'DECLINED',  color: '#C23B3B', bg: '#FBE9E9' },
  completed: { label: 'COMPLETED', color: C.teal,    bg: C.tealSoft },
  cancelled: { label: 'CANCELLED', color: '#C23B3B', bg: '#FBE9E9' },
};
const statusStyle = (s) => STATUS_MAP[s] || { label: String(s || 'PENDING').toUpperCase(), color: C.textSec, bg: C.bg };

const careTypeFor = () => 'Childcare';

/* ── Status timeline steps ──────────────────────────── */
const TIMELINE_STEPS = [
  { key: 'confirmed',  label: 'Booking Confirmed' },
  { key: 'payment',    label: 'Payment Completed' },
  { key: 'accepted',   label: 'Aya Accepted' },
  { key: 'scheduled',  label: 'Care Scheduled' },
  { key: 'completed',  label: 'Care Completed' },
];
const timelineState = (status) => {
  switch (status) {
    case 'pending':   return { active: 0, states: ['done', 'pending', 'pending', 'pending', 'pending'] };
    case 'confirmed': return { active: 2, states: ['done', 'done', 'done', 'active', 'pending'] };
    case 'completed': return { active: 4, states: ['done', 'done', 'done', 'done', 'done'] };
    case 'declined':  return { active: -1, states: ['done', 'pending', 'declined', 'pending', 'pending'] };
    case 'cancelled': return { active: -1, states: ['done', 'pending', 'pending', 'cancelled', 'pending'] };
    default:          return { active: 0, states: ['done', 'pending', 'pending', 'pending', 'pending'] };
  }
};

/* ═══════════════════════════════════════════════════════
   BOOKING CARD
   ═══════════════════════════════════════════════════════ */
function BookingCard({ booking, tab, onView, onBookAgain, onMessageAya }) {
  const aya = booking.ayas || {};
  const st = statusStyle(booking.status);
  const time = formatTimeOfDay(booking.time);
  const endTime = addHoursToTime(booking.time, EST_DURATION);
  const rate = aya.rate_per_hour || 0;
  const total = rate * EST_DURATION;
  const isPast = tab === 'past';

  return (
    <article className={`mb-card ${isPast ? 'mb-card-past' : ''}`}>
      <div className="mb-card-header">
        <span className="mb-card-day">{dayLabel(booking.date)}</span>
        <span className="mb-card-time">{time && endTime ? `${time} \u2013 ${endTime}` : time || ''}</span>
      </div>
      <div className="mb-card-body">
        <div className="mb-card-avatar">{initials(aya.name)}</div>
        <div className="mb-card-info">
          <h3 className="mb-card-name">{aya.name || 'Your Caregiver'}</h3>
          <p className="mb-card-type">{careTypeFor()}</p>
          <div className="mb-card-meta">
            {EST_DURATION} hours
            {aya.location && <><span className="mb-dot" />{aya.location}</>}
          </div>
        </div>
        <div className="mb-card-right">
          <span className="mb-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          {rate > 0 && (
            <div className="mb-card-price">
              <span className="mb-card-amount">Rs. {total.toLocaleString()}</span>
              {!isPast && <span className="mb-card-paystatus">Pending</span>}
              {isPast && booking.status === 'completed' && <span className="mb-card-paystatus mb-paid">Paid</span>}
            </div>
          )}
        </div>
      </div>
      <div className="mb-card-actions">
        <button type="button" className="mb-btn-primary" onClick={onView}>View Details</button>
        {!isPast && booking.status !== 'cancelled' && booking.status !== 'declined' && (
          <button type="button" className="mb-btn-ghost" onClick={onMessageAya}>
            <Ic.MessageCircle width={14} height={14} /> Message Aya
          </button>
        )}
        {isPast && booking.status === 'completed' && (
          <button type="button" className="mb-btn-coral" onClick={onBookAgain}>
            <Ic.Refresh width={14} height={14} /> Book Again
          </button>
        )}
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOKING DETAIL MODAL
   ═══════════════════════════════════════════════════════ */
function BookingDetail({ booking, onClose, onBookAgain, onMessageAya }) {
  const aya = booking.ayas || {};
  const st = statusStyle(booking.status);
  const time = formatTimeOfDay(booking.time);
  const endTime = addHoursToTime(booking.time, EST_DURATION);
  const rate = aya.rate_per_hour || 0;
  const serviceTotal = rate * EST_DURATION;
  const tl = timelineState(booking.status);

  return (
    <div className="mb-overlay" role="dialog" aria-modal="true" aria-label="Booking details" onClick={onClose}>
      <div className="mb-detail" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-detail-header">
          <div className="mb-detail-hleft">
            <div className="mb-detail-avatar">{initials(aya.name)}</div>
            <div>
              <h2 className="mb-detail-title">{aya.name || 'Your Caregiver'}</h2>
              <span className="mb-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
            </div>
          </div>
          <button type="button" className="mb-close-btn" onClick={onClose} aria-label="Close">
            <Ic.X width={18} height={18} />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="mb-detail-section">
          <h3 className="mb-detail-label">Booking Summary</h3>
          <div className="mb-detail-grid">
            <div className="mb-detail-field">
              <span className="mb-detail-flabel">Date</span>
              <span className="mb-detail-fvalue">{booking.date ? longDate(booking.date) : '\u2014'}</span>
            </div>
            <div className="mb-detail-field">
              <span className="mb-detail-flabel">Time</span>
              <span className="mb-detail-fvalue">{time ? `${time}${endTime ? ` \u2013 ${endTime}` : ''}` : '\u2014'}</span>
            </div>
            <div className="mb-detail-field">
              <span className="mb-detail-flabel">Duration</span>
              <span className="mb-detail-fvalue">{EST_DURATION} hours</span>
            </div>
            <div className="mb-detail-field">
              <span className="mb-detail-flabel">Care Type</span>
              <span className="mb-detail-fvalue">{careTypeFor()}</span>
            </div>
            {aya.location && (
              <div className="mb-detail-field">
                <span className="mb-detail-flabel">Location</span>
                <span className="mb-detail-fvalue">{aya.location}</span>
              </div>
            )}
            {aya.experience_years != null && aya.experience_years !== '' && (
              <div className="mb-detail-field">
                <span className="mb-detail-flabel">Caregiver Experience</span>
                <span className="mb-detail-fvalue">{expLabel(aya)}</span>
              </div>
            )}
            {aya.trust_score != null && (
              <div className="mb-detail-field">
                <span className="mb-detail-flabel">Trust Score</span>
                <span className="mb-detail-fvalue">{aya.trust_score}/100</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-detail-section">
          <h3 className="mb-detail-label">Booking Status</h3>
          <div className="mb-timeline">
            {TIMELINE_STEPS.map((step, i) => {
              const state = tl.states[i];
              return (
                <div key={step.key} className={`mb-tl-step mb-tl-${state}`}>
                  <div className="mb-tl-marker">
                    {state === 'done' && <Ic.CheckCircle width={16} height={16} />}
                    {state === 'active' && <div className="mb-tl-pulse" />}
                    {(state === 'pending') && <div className="mb-tl-dot" />}
                    {(state === 'declined' || state === 'cancelled') && <Ic.XCircle width={16} height={16} />}
                  </div>
                  <span className="mb-tl-text">{step.label}</span>
                  {i < TIMELINE_STEPS.length - 1 && <div className="mb-tl-line" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Summary */}
        {rate > 0 && (
          <div className="mb-detail-section">
            <h3 className="mb-detail-label">Payment Summary</h3>
            <div className="mb-pay-box">
              <div className="mb-pay-row"><span>Hourly Rate</span><span>PKR {rate.toLocaleString()}</span></div>
              <div className="mb-pay-row"><span>Duration</span><span>{EST_DURATION} hours</span></div>
              <div className="mb-pay-row mb-pay-total"><span>Service Total</span><span>PKR {serviceTotal.toLocaleString()}</span></div>
              <div className="mb-pay-row">
                <span>Payment Status</span>
                <span className={booking.status === 'completed' ? 'mb-paid-text' : 'mb-pending-text'}>
                  {booking.status === 'completed' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-detail-actions">
          {booking.status === 'completed' && (
            <button type="button" className="mb-btn-primary mb-btn-full" onClick={onBookAgain}>
              <Ic.Refresh width={15} height={15} /> Book Again
            </button>
          )}
          {booking.status !== 'cancelled' && booking.status !== 'declined' && (
            <button type="button" className="mb-btn-ghost mb-btn-full" onClick={onMessageAya}>
              <Ic.MessageCircle width={15} height={15} /> Message {firstName(aya.name) || 'Aya'}
            </button>
          )}
          <button type="button" className="mb-btn-ghost mb-btn-full" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMPTY STATES
   ═══════════════════════════════════════════════════════ */
function EmptyUpcoming({ onFindCare }) {
  return (
    <div className="mb-empty">
      <div className="mb-empty-icon"><Ic.CalendarCheck width={26} height={26} /></div>
      <h3 className="mb-empty-title">No upcoming care</h3>
      <p className="mb-empty-text">You don't have any upcoming bookings yet.</p>
      <button type="button" className="mb-btn-primary" onClick={onFindCare}>
        <Ic.Search width={15} height={15} /> Find Care
      </button>
    </div>
  );
}
function EmptyPast() {
  return (
    <div className="mb-empty">
      <div className="mb-empty-icon"><Ic.Calendar width={26} height={26} /></div>
      <h3 className="mb-empty-title">No past bookings</h3>
      <p className="mb-empty-text">Your completed care arrangements will appear here.</p>
    </div>
  );
}
function EmptyCancelled() {
  return (
    <div className="mb-empty">
      <div className="mb-empty-icon"><Ic.XCircle width={26} height={26} /></div>
      <h3 className="mb-empty-title">No cancelled bookings</h3>
      <p className="mb-empty-text">You don't have any cancelled bookings.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
function MyBookings({ bookings, loading, profile, onBookAgain, onFindCare, onViewAya }) {
  const [tab, setTab] = useState('upcoming');
  const [detailBooking, setDetailBooking] = useState(null);

  const todayStr = localDateStr(new Date());

  const upcoming = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter((b) => (b.status === 'pending' || b.status === 'confirmed') && b.date && String(b.date) >= todayStr)
      .sort((a, b) => {
        const byDate = String(a.date).localeCompare(String(b.date));
        if (byDate !== 0) return byDate;
        const ta = parseTimeOfDay(a.time);
        const tb = parseTimeOfDay(b.time);
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;
        return ta - tb;
      });
  }, [bookings, todayStr]);

  const past = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (b.status === 'completed') return true;
      if (b.status === 'declined') return true;
      if ((b.status === 'pending' || b.status === 'confirmed') && b.date && String(b.date) < todayStr) return true;
      return false;
    });
  }, [bookings, todayStr]);

  const cancelled = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => b.status === 'cancelled');
  }, [bookings]);

  const openDetail = (b) => setDetailBooking(b);
  const closeDetail = () => setDetailBooking(null);

  const handleBookAgain = (b) => {
    closeDetail();
    if (b.ayas && onBookAgain) onBookAgain(b.ayas);
  };
  const handleMessageAya = (b) => {
    closeDetail();
    if (onViewAya) onViewAya(b.ayas);
  };

  const currentList = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  return (
    <div className="mb-root">
      <style>{MB_CSS}</style>

      {/* Header */}
      <header className="mb-header">
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-subtitle">Manage your upcoming and past childcare arrangements.</p>
      </header>

      {/* Tabs */}
      <div className="mb-tabs">
        <button type="button" className={`mb-tab${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming
          {upcoming.length > 0 && <span className="mb-tab-count">{upcoming.length}</span>}
        </button>
        <button type="button" className={`mb-tab${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>
          Past
          {past.length > 0 && <span className="mb-tab-count">{past.length}</span>}
        </button>
        {cancelled.length > 0 && (
          <button type="button" className={`mb-tab${tab === 'cancelled' ? ' active' : ''}`} onClick={() => setTab('cancelled')}>
            Cancelled
            <span className="mb-tab-count mb-tab-cancelled">{cancelled.length}</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-content">
        {loading ? (
          <div className="mb-skeleton-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-skel-card">
                <div className="mb-skel mb-skel-sm" />
                <div className="mb-skel mb-skel-row" />
                <div className="mb-skel mb-skel-row" />
                <div className="mb-skel mb-skel-lg" />
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          tab === 'upcoming' ? <EmptyUpcoming onFindCare={onFindCare} />
          : tab === 'past' ? <EmptyPast />
          : <EmptyCancelled />
        ) : (
          <div className="mb-list">
            {currentList.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                tab={tab}
                onView={() => openDetail(b)}
                onBookAgain={() => handleBookAgain(b)}
                onMessageAya={() => handleMessageAya(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailBooking && (
        <BookingDetail
          booking={detailBooking}
          onClose={closeDetail}
          onBookAgain={() => handleBookAgain(detailBooking)}
          onMessageAya={() => handleMessageAya(detailBooking)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const MB_CSS = `
.mb-root{font-family:${FF};color:${C.text};-webkit-font-smoothing:antialiased;animation:mbFade .35s ease both;}
.mb-root *,.mb-root *::before,.mb-root *::after{box-sizing:border-box;}
.mb-root button{font-family:inherit;cursor:pointer;}
.mb-root h1,.mb-root h2,.mb-root h3,.mb-root p{margin:0;}

/* Header */
.mb-header{margin-bottom:28px;}
.mb-title{font-size:clamp(24px,3vw,30px);font-weight:800;color:${C.navy};letter-spacing:-0.025em;line-height:1.2;}
.mb-subtitle{margin-top:8px;font-size:15px;color:${C.textSec};line-height:1.55;}

/* Tabs */
.mb-tabs{display:flex;align-items:center;gap:4px;padding:4px;background:${C.card};border:1px solid ${C.border};border-radius:13px;margin-bottom:24px;width:fit-content;}
.mb-tab{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border:none;border-radius:10px;background:transparent;color:${C.textSec};font-size:13.5px;font-weight:700;transition:background .2s,color .2s,box-shadow .2s;}
.mb-tab:hover{color:${C.text};background:${C.bg};}
.mb-tab.active{background:${C.teal};color:#fff;box-shadow:0 4px 14px rgba(39,143,135,0.25);}
.mb-tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:rgba(255,255,255,0.25);font-size:11.5px;font-weight:800;}
.mb-tab:not(.active) .mb-tab-count{background:${C.bg};color:${C.textSec};}
.mb-tab-cancelled{background:rgba(194,59,59,0.12)!important;color:#C23B3B!important;}

/* Card list */
.mb-list{display:flex;flex-direction:column;gap:16px;}

/* Booking Card */
.mb-card{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:22px 24px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;animation:mbFadeUp .35s ease both;}
.mb-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(23,36,61,0.08);border-color:rgba(39,143,135,0.25);}
.mb-card-past{opacity:0.92;}
.mb-card-header{display:flex;align-items:center;gap:8px;margin-bottom:16px;}
.mb-card-day{font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};}
.mb-card-time{font-size:12px;font-weight:600;color:${C.textSec};}
.mb-card-body{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
.mb-card-avatar{width:52px;height:52px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;}
.mb-card-info{flex:1;min-width:0;}
.mb-card-name{font-size:17px;font-weight:800;color:${C.navy};letter-spacing:-0.01em;margin-bottom:3px;}
.mb-card-type{font-size:13px;color:${C.textSec};margin-bottom:4px;}
.mb-card-meta{display:flex;align-items:center;gap:6px;font-size:12.5px;color:${C.textMuted};flex-wrap:wrap;}
.mb-dot{width:3px;height:3px;border-radius:50%;background:${C.textMuted};flex-shrink:0;}
.mb-card-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;}
.mb-status{display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.06em;}
.mb-card-price{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
.mb-card-amount{font-size:15px;font-weight:800;color:${C.navy};}
.mb-card-paystatus{font-size:11px;font-weight:700;color:${C.textMuted};letter-spacing:0.04em;}
.mb-paid{color:${C.green}!important;}

/* Card actions */
.mb-card-actions{display:flex;align-items:center;gap:10px;padding-top:16px;border-top:1px solid ${C.bg};}
.mb-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;border:none;border-radius:10px;background:${C.teal};color:#fff;font-size:13.5px;font-weight:700;box-shadow:0 4px 14px rgba(39,143,135,0.2);transition:background .2s,box-shadow .2s,transform .15s;}
.mb-btn-primary:hover{background:#1F7A73;box-shadow:0 6px 18px rgba(39,143,135,0.3);transform:translateY(-1px);}
.mb-btn-primary:active{transform:translateY(0);}
.mb-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 16px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.text};font-size:13px;font-weight:700;transition:border-color .2s,color .2s,background .2s;}
.mb-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.mb-btn-coral{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 16px;border:none;border-radius:10px;background:${C.coral};color:#fff;font-size:13px;font-weight:700;box-shadow:0 4px 14px rgba(244,124,92,0.2);transition:background .2s,transform .15s;}
.mb-btn-coral:hover{background:#E86A48;transform:translateY(-1px);}
.mb-btn-full{width:100%;}

/* Empty states */
.mb-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px;animation:mbFade .4s ease both;}
.mb-empty-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:16px;}
.mb-empty-title{font-size:18px;font-weight:800;color:${C.navy};margin-bottom:6px;}
.mb-empty-text{font-size:14px;color:${C.textSec};line-height:1.55;margin-bottom:20px;max-width:360px;}
.mb-empty .mb-btn-primary{padding:12px 28px;font-size:14px;}

/* Skeleton */
.mb-skeleton-list{display:flex;flex-direction:column;gap:16px;}
.mb-skel-card{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:22px 24px;}
.mb-skel{height:14px;border-radius:7px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:mbShimmer 1.3s infinite linear;}
.mb-skel-sm{height:12px;width:40%;margin-bottom:14px;}
.mb-skel-row{height:16px;margin-bottom:10px;}
.mb-skel-lg{height:38px;width:45%;margin-top:8px;border-radius:10px;}

/* Detail overlay */
.mb-overlay{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(17,27,46,0.55);animation:mbFade .2s ease;}
.mb-detail{width:100%;max-width:600px;max-height:90vh;overflow-y:auto;background:#fff;border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(17,27,46,0.3);animation:mbFadeUp .25s ease both;}
.mb-detail::-webkit-scrollbar{width:6px;}
.mb-detail::-webkit-scrollbar-track{background:transparent;}
.mb-detail::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
.mb-detail-header{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:24px;}
.mb-detail-hleft{display:flex;align-items:center;gap:14px;}
.mb-detail-avatar{width:56px;height:56px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex-shrink:0;}
.mb-detail-title{font-size:19px;font-weight:800;color:${C.navy};margin-bottom:6px;}
.mb-close-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;border-radius:10px;background:${C.bg};color:${C.textSec};transition:background .2s,color .2s;flex-shrink:0;}
.mb-close-btn:hover{background:${C.border};color:${C.text};}

/* Detail sections */
.mb-detail-section{margin-bottom:24px;}
.mb-detail-label{font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};margin-bottom:12px;}
.mb-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:${C.border};border:1px solid ${C.border};border-radius:12px;overflow:hidden;}
.mb-detail-field{display:flex;flex-direction:column;gap:3px;padding:12px 16px;background:${C.card};}
.mb-detail-flabel{font-size:12px;font-weight:700;color:${C.textMuted};letter-spacing:0.02em;}
.mb-detail-fvalue{font-size:14px;font-weight:700;color:${C.text};}

/* Timeline */
.mb-timeline{display:flex;flex-direction:column;gap:0;}
.mb-tl-step{display:flex;align-items:flex-start;gap:12px;position:relative;padding-bottom:18px;}
.mb-tl-step:last-child{padding-bottom:0;}
.mb-tl-marker{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;flex-shrink:0;z-index:1;}
.mb-tl-done .mb-tl-marker{background:${C.greenBg};color:${C.green};}
.mb-tl-active .mb-tl-marker{background:${C.tealSoft};color:${C.teal};}
.mb-tl-pending .mb-tl-marker{background:${C.bg};color:${C.textMuted};}
.mb-tl-declined .mb-tl-marker,.mb-tl-cancelled .mb-tl-marker{background:#FBE9E9;color:#C23B3B;}
.mb-tl-pulse{width:10px;height:10px;border-radius:50%;background:${C.teal};animation:mbPulse 2s infinite;}
.mb-tl-dot{width:8px;height:8px;border-radius:50%;background:${C.border};}
.mb-tl-text{font-size:13.5px;font-weight:600;padding-top:4px;}
.mb-tl-done .mb-tl-text{color:${C.green};}
.mb-tl-active .mb-tl-text{color:${C.teal};font-weight:700;}
.mb-tl-pending .mb-tl-text{color:${C.textMuted};}
.mb-tl-declined .mb-tl-text,.mb-tl-cancelled .mb-tl-text{color:#C23B3B;}
.mb-tl-line{position:absolute;left:13px;top:28px;bottom:0;width:2px;background:${C.border};}
.mb-tl-done .mb-tl-line{background:${C.green};}

/* Payment */
.mb-pay-box{border:1px solid ${C.border};border-radius:12px;overflow:hidden;}
.mb-pay-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;font-size:13.5px;}
.mb-pay-row + .mb-pay-row{border-top:1px solid ${C.bg};}
.mb-pay-row span:first-child{color:${C.textSec};font-weight:600;}
.mb-pay-row span:last-child{color:${C.text};font-weight:700;}
.mb-pay-total{background:${C.tealSoft};}
.mb-pay-total span{color:${C.navy}!important;font-weight:800!important;font-size:14.5px;}
.mb-paid-text{color:${C.green}!important;font-weight:800!important;}
.mb-pending-text{color:#9A6B15!important;font-weight:700!important;}

/* Detail actions */
.mb-detail-actions{display:flex;flex-direction:column;gap:10px;padding-top:8px;}

/* Animations */
@keyframes mbFade{from{opacity:0;}to{opacity:1;}}
@keyframes mbFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes mbShimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@keyframes mbPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.4);}}

/* Responsive */
@media(max-width:768px){
  .mb-detail{padding:22px;max-width:100%;border-radius:16px;}
  .mb-card{padding:18px 20px;}
  .mb-card-body{flex-wrap:wrap;}
  .mb-card-right{flex-direction:row;align-items:center;width:100%;justify-content:flex-start;gap:12px;margin-top:4px;}
  .mb-card-actions{flex-wrap:wrap;}
  .mb-detail-grid{grid-template-columns:1fr;}
  .mb-tabs{width:100%;}
  .mb-tab{flex:1;justify-content:center;padding:10px 12px;}
}
@media(max-width:480px){
  .mb-card-body{gap:12px;}
  .mb-card-avatar{width:44px;height:44px;font-size:15px;}
  .mb-card-name{font-size:15px;}
  .mb-card-actions{flex-direction:column;}
  .mb-card-actions button{width:100%;}
  .mb-detail-header{flex-direction:column;align-items:flex-start;}
  .mb-close-btn{position:absolute;top:16px;right:16px;}
  .mb-detail{position:relative;padding-top:44px;}
}
@media(prefers-reduced-motion:reduce){
  .mb-root *,.mb-root *::before,.mb-root *::after{animation-duration:0.001s!important;transition-duration:0.001s!important;}
}
`;

export default MyBookings;
