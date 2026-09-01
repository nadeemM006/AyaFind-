import React, { useState, useEffect, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════
   PAYMENTS — premium payment management experience
   ═══════════════════════════════════════════════════════ */

const BACKEND_URL = 'https://ayafind-production.up.railway.app';

const C = {
  navy: '#18243D', navyDark: '#111B2E', teal: '#278F87', tealSoft: '#E4F1EF',
  coral: '#F47C5C', coralSoft: '#FDF0EC', bg: '#FAF9F5', card: '#FFFFFF',
  text: '#27313D', textSec: '#657081', textMuted: '#9BA5B4', border: '#E9E6E1',
  green: '#34946A', greenBg: '#ECF8F2', amber: '#9A6B15', amberBg: '#FBF1D8',
  red: '#C23B3B', redBg: '#FBE9E9',
};
const FF = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

/* ── Icons ──────────────────────────────────────────── */
const sv = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Ic = {
  CreditCard: (p) => <svg {...sv} {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Receipt: (p) => <svg {...sv} {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 10h8"/><path d="M8 14h4"/></svg>,
  CheckCircle: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  XCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  RefreshCw: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  ArrowLeft: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Eye: (p) => <svg {...sv} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  TrendingUp: (p) => <svg {...sv} {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  AlertCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Download: (p) => <svg {...sv} {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Banknote: (p) => <svg {...sv} {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>,
  ChevronRight: (p) => <svg {...sv} {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  User: (p) => <svg {...sv} {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

/* ── Helpers ────────────────────────────────────────── */
const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};

const PAY_STATUS = {
  pending:    { label: 'Pending',    color: C.amber,  bg: C.amberBg,  Icon: Ic.Clock },
  processing: { label: 'Processing', color: C.teal,   bg: C.tealSoft, Icon: Ic.RefreshCw },
  paid:       { label: 'Paid',       color: C.green,  bg: C.greenBg,  Icon: Ic.CheckCircle },
  failed:     { label: 'Failed',     color: C.red,    bg: C.redBg,    Icon: Ic.XCircle },
  refunded:   { label: 'Refunded',   color: C.amber,  bg: C.amberBg,  Icon: Ic.RefreshCw },
  cancelled:  { label: 'Cancelled',  color: C.textSec, bg: C.bg,      Icon: Ic.XCircle },
};

const payStatusStyle = (s) => PAY_STATUS[s] || PAY_STATUS.pending;

const formatAmount = (amt) => {
  const n = parseFloat(amt) || 0;
  return `PKR ${n.toLocaleString('en-PK')}`;
};

const formatDate = (d) => {
  if (!d) return '\u2014';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (d) => {
  if (!d) return '\u2014';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

const shortId = (id) => {
  if (!id) return '\u2014';
  return String(id).substring(0, 8).toUpperCase();
};

/* ═══════════════════════════════════════════════════════
   RECEIPT MODAL
   ═══════════════════════════════════════════════════════ */
function ReceiptModal({ payment, onClose }) {
  if (!payment) return null;
  const aya = (payment.bookings && payment.bookings.ayas) || {};
  const booking = payment.bookings || {};
  const rate = aya.rate_per_hour || 0;
  const duration = booking.duration || 4;
  const serviceTotal = rate * duration;
  const st = payStatusStyle(payment.status);

  return (
    <div className="py-overlay" role="dialog" aria-modal="true" aria-label="Payment Receipt" onClick={onClose}>
      <div className="py-receipt" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="py-receipt-header">
          <div className="py-receipt-brand">
            <span className="py-receipt-logo">Aya<span style={{ color: C.teal }}>Find</span></span>
            <span className="py-receipt-label">Payment Receipt</span>
          </div>
          <button type="button" className="py-close-btn" onClick={onClose} aria-label="Close">
            <Ic.X width={18} height={18} />
          </button>
        </div>

        {/* Status Banner */}
        <div className="py-receipt-status" style={{ background: st.bg }}>
          <st.Icon width={20} height={20} />
          <div>
            <span className="py-receipt-status-label" style={{ color: st.color }}>{st.label}</span>
            {payment.paid_at && (
              <span className="py-receipt-status-sub">on {formatDate(payment.paid_at)}</span>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="py-receipt-section">
          <h3 className="py-receipt-section-title">Transaction Details</h3>
          <div className="py-receipt-parties">
            <div className="py-receipt-party">
              <span className="py-receipt-party-label">From</span>
              <div className="py-receipt-party-info">
                <div className="py-receipt-avatar"><Ic.User width={14} height={14} /></div>
                <div>
                  <p className="py-receipt-party-name">{(payment.parents && payment.parents.name) || 'Parent'}</p>
                                    <p className="py-receipt-party-sub">{(payment.parents && payment.parents.email) || ''}</p>
                </div>
              </div>
            </div>
            <div className="py-receipt-party">
              <span className="py-receipt-party-label">To (via AyaFind)</span>
              <div className="py-receipt-party-info">
                <div className="py-receipt-avatar py-receipt-avatar-teal">{initials(aya.name)}</div>
                <div>
                  <p className="py-receipt-party-name">{aya.name || 'Caregiver'}</p>
                  <p className="py-receipt-party-sub">Childcare Services</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="py-receipt-section">
          <h3 className="py-receipt-section-title">Booking Details</h3>
          <div className="py-receipt-grid">
            <div className="py-receipt-field">
              <span className="py-receipt-flabel">Date</span>
              <span className="py-receipt-fvalue">{booking.date ? formatDate(booking.date) : '\u2014'}</span>
            </div>
            <div className="py-receipt-field">
              <span className="py-receipt-flabel">Time</span>
              <span className="py-receipt-fvalue">{booking.time || '\u2014'}</span>
            </div>
            <div className="py-receipt-field">
              <span className="py-receipt-flabel">Duration</span>
              <span className="py-receipt-fvalue">{duration} hours</span>
            </div>
            <div className="py-receipt-field">
              <span className="py-receipt-flabel">Caregiver</span>
              <span className="py-receipt-fvalue">{aya.name || '\u2014'}</span>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="py-receipt-section">
          <h3 className="py-receipt-section-title">Amount Breakdown</h3>
          <div className="py-receipt-amounts">
            <div className="py-receipt-row">
              <span>Hourly Rate</span>
              <span>{formatAmount(rate)}</span>
            </div>
            <div className="py-receipt-row">
              <span>Duration</span>
              <span>{duration} hours</span>
            </div>
            <div className="py-receipt-row py-receipt-row-total">
              <span>Service Total</span>
              <span>{formatAmount(serviceTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="py-receipt-section">
          <h3 className="py-receipt-section-title">Payment Information</h3>
          <div className="py-receipt-amounts">
            <div className="py-receipt-row">
              <span>Payment Date</span>
              <span>{payment.paid_at ? formatDateTime(payment.paid_at) : formatDate(payment.created_at)}</span>
            </div>
            <div className="py-receipt-row">
              <span>Payment Method</span>
              <span>{payment.payment_method || '\u2014'}</span>
            </div>
            <div className="py-receipt-row">
              <span>Transaction ID</span>
              <span className="py-receipt-mono">{payment.provider_txn_id ? shortId(payment.provider_txn_id) : '\u2014'}</span>
            </div>
            <div className="py-receipt-row">
              <span>Status</span>
              <span style={{ color: st.color, fontWeight: 800 }}>{st.label}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-receipt-footer">
          <p>This is an official AyaFind payment receipt.</p>
          <p className="py-receipt-footer-sub">For support, contact AyaFind customer care.</p>
        </div>

        <div className="py-receipt-actions">
          <button type="button" className="py-btn-primary py-btn-full" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TRANSACTION ROW
   ═══════════════════════════════════════════════════════ */
function TransactionRow({ payment, onViewReceipt }) {
  const aya = (payment.bookings && payment.bookings.ayas) || {};
  const booking = payment.bookings || {};
  const st = payStatusStyle(payment.status);
  const StIcon = st.Icon;

  return (
    <div className="py-txn">
      <div className="py-txn-left">
        <div className="py-txn-avatar">{initials(aya.name)}</div>
        <div className="py-txn-info">
          <h3 className="py-txn-name">{aya.name || 'Caregiver'}</h3>
          <p className="py-txn-meta">
            {booking.date ? formatDate(booking.date) : ''}
            {payment.provider_txn_id && <span className="py-txn-ref">Ref: {shortId(payment.provider_txn_id)}</span>}
          </p>
        </div>
      </div>
      <div className="py-txn-right">
        <span className="py-txn-amount">{formatAmount(payment.amount)}</span>
        <span className="py-txn-status" style={{ color: st.color, background: st.bg }}>
          <StIcon width={12} height={12} />
          {st.label}
        </span>
        <button type="button" className="py-txn-receipt-btn" onClick={() => onViewReceipt(payment)}>
          <Ic.Eye width={13} height={13} /> Receipt
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMPTY STATES
   ═══════════════════════════════════════════════════════ */
function EmptyPayments() {
  return (
    <div className="py-empty">
      <div className="py-empty-icon"><Ic.CreditCard width={26} height={26} /></div>
      <h3 className="py-empty-title">No payments yet</h3>
      <p className="py-empty-text">Your payment history will appear here once you book care through AyaFind.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
function Payments({ parentId, bookings }) {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiptPayment, setReceiptPayment] = useState(null);

  const loadPayments = async () => {
    if (!parentId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/list/${parentId}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      } else {
        setPayments([]);
        setError('Could not load payment history.');
      }
    } catch {
      setPayments([]);
      setError('Payment service is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  /* ── Summary calculations ─────────────────────────── */
  const summary = useMemo(() => {
    if (!payments || !payments.length) return null;
    const paidPayments = payments.filter((p) => p.status === 'paid');
    const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'processing');
    const totalSpent = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const nextPayment = pendingPayments.length ? pendingPayments[0] : null;

    return {
      totalSpent,
      pendingAmount,
      pendingCount: pendingPayments.length,
      nextPayment,
      totalCount: payments.length,
    };
  }, [payments]);

  return (
    <div className="py-root">
      <style>{PY_CSS}</style>

      {/* Header */}
      <header className="py-header">
        <h1 className="py-title">Payments</h1>
        <p className="py-subtitle">Manage your payments, view receipts, and track transaction history.</p>
      </header>

      {/* Error state */}
      {error && (
        <div className="py-alert" role="alert">
          <Ic.AlertCircle width={16} height={16} />
          <p>{error}</p>
          <button type="button" className="py-alert-btn" onClick={loadPayments}>Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="py-skeleton">
          <div className="py-skel-cards">
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-skel-card">
                <div className="py-skel py-skel-sm" />
                <div className="py-skel py-skel-lg" />
              </div>
            ))}
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="py-skel-row">
              <div className="py-skel py-skel-avatar" />
              <div className="py-skel-col">
                <div className="py-skel py-skel-md" />
                <div className="py-skel py-skel-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : payments && payments.length > 0 ? (
        <>
          {/* Overview Cards */}
          {summary && (
            <div className="py-overview">
              <div className="py-stat-card">
                <span className="py-stat-icon"><Ic.TrendingUp width={16} height={16} /></span>
                <div>
                  <p className="py-stat-label">Total Spent</p>
                  <p className="py-stat-value">{formatAmount(summary.totalSpent)}</p>
                </div>
              </div>
              {summary.pendingCount > 0 && (
                <div className="py-stat-card py-stat-card-amber">
                  <span className="py-stat-icon"><Ic.Clock width={16} height={16} /></span>
                  <div>
                    <p className="py-stat-label">Pending</p>
                    <p className="py-stat-value">{formatAmount(summary.pendingAmount)}</p>
                    <p className="py-stat-sub">{summary.pendingCount} payment{summary.pendingCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
              <div className="py-stat-card">
                <span className="py-stat-icon"><Ic.Receipt width={16} height={16} /></span>
                <div>
                  <p className="py-stat-label">Transactions</p>
                  <p className="py-stat-value">{summary.totalCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next / Pending Payment Banner */}
          {summary && summary.nextPayment && (
            <div className="py-next-banner">
              <div className="py-next-icon"><Ic.Clock width={18} height={18} /></div>
              <div className="py-next-info">
                <p className="py-next-label">Next Payment</p>
                <p className="py-next-detail">
                  {formatAmount(summary.nextPayment.amount)} for{' '}
                  {(summary.nextPayment.bookings && summary.nextPayment.bookings.ayas && summary.nextPayment.bookings.ayas.name) || 'caregiver'}
                  {' '}on {formatDate(summary.nextPayment.bookings && summary.nextPayment.bookings.date)}
                </p>
              </div>
              <button
                type="button"
                className="py-btn-ghost"
                onClick={() => setReceiptPayment(summary.nextPayment)}
              >
                View <Ic.ChevronRight width={14} height={14} />
              </button>
            </div>
          )}

          {/* Transaction History */}
          <div className="py-section">
            <div className="py-section-head">
              <h2 className="py-section-title">Transaction History</h2>
              <button type="button" className="py-refresh-btn" onClick={loadPayments} aria-label="Refresh">
                <Ic.RefreshCw width={15} height={15} />
              </button>
            </div>
            <div className="py-txn-list">
              {payments.map((p) => (
                <TransactionRow
                  key={p.id}
                  payment={p}
                  onViewReceipt={setReceiptPayment}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyPayments />
      )}

      {/* Receipt Modal */}
      {receiptPayment && (
        <ReceiptModal
          payment={receiptPayment}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const PY_CSS = `
.py-root{font-family:${FF};color:${C.text};-webkit-font-smoothing:antialiased;animation:pyFade .35s ease both;}
.py-root *,.py-root *::before,.py-root *::after{box-sizing:border-box;}
.py-root button{font-family:inherit;cursor:pointer;}
.py-root h1,.py-root h2,.py-root h3,.py-root p{margin:0;}

/* Header */
.py-header{margin-bottom:28px;}
.py-title{font-size:clamp(24px,3vw,30px);font-weight:800;color:${C.navy};letter-spacing:-0.025em;line-height:1.2;}
.py-subtitle{margin-top:8px;font-size:15px;color:${C.textSec};line-height:1.55;}

/* Alert */
.py-alert{display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:12px;background:${C.redBg};color:${C.red};font-size:13.5px;font-weight:600;margin-bottom:20px;}
.py-alert p{flex:1;}
.py-alert-btn{padding:6px 14px;border:1px solid ${C.red};border-radius:8px;background:transparent;color:${C.red};font-size:12px;font-weight:700;}
.py-alert-btn:hover{background:${C.red};color:#fff;}

/* Overview Cards */
.py-overview{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;}
.py-stat-card{display:flex;align-items:center;gap:14px;padding:20px;background:${C.card};border:1px solid ${C.border};border-radius:14px;transition:transform .2s,box-shadow .2s;}
.py-stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(23,36,61,0.06);}
.py-stat-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.py-stat-card-amber .py-stat-icon{background:${C.amberBg};color:${C.amber};}
.py-stat-label{font-size:12px;font-weight:700;color:${C.textMuted};letter-spacing:0.04em;text-transform:uppercase;}
.py-stat-value{font-size:22px;font-weight:800;color:${C.navy};letter-spacing:-0.02em;margin-top:2px;}
.py-stat-sub{font-size:12px;color:${C.textSec};margin-top:2px;}

/* Next Payment Banner */
.py-next-banner{display:flex;align-items:center;gap:14px;padding:16px 20px;background:${C.amberBg};border:1px solid rgba(154,107,21,0.15);border-radius:14px;margin-bottom:24px;}
.py-next-icon{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(154,107,21,0.12);color:${C.amber};flex-shrink:0;}
.py-next-info{flex:1;min-width:0;}
.py-next-label{font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.amber};}
.py-next-detail{font-size:13.5px;font-weight:600;color:${C.text};margin-top:2px;}

/* Section */
.py-section{margin-bottom:24px;}
.py-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.py-section-title{font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};}
.py-refresh-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid ${C.border};border-radius:10px;background:#fff;color:${C.textSec};transition:border-color .2s,color .2s;}
.py-refresh-btn:hover{border-color:${C.teal};color:${C.teal};}

/* Transaction List */
.py-txn-list{display:flex;flex-direction:column;gap:1px;background:${C.border};border:1px solid ${C.border};border-radius:14px;overflow:hidden;}
.py-txn{display:flex;align-items:center;gap:14px;padding:16px 20px;background:${C.card};transition:background .15s;}
.py-txn:hover{background:${C.bg};}
.py-txn-left{display:flex;align-items:center;gap:14px;flex:1;min-width:0;}
.py-txn-avatar{width:44px;height:44px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0;}
.py-txn-info{min-width:0;flex:1;}
.py-txn-name{font-size:14.5px;font-weight:700;color:${C.navy};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.py-txn-meta{font-size:12.5px;color:${C.textSec};margin-top:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.py-txn-ref{font-family:monospace;font-size:11px;color:${C.textMuted};background:${C.bg};padding:1px 6px;border-radius:4px;}
.py-txn-right{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.py-txn-amount{font-size:15px;font-weight:800;color:${C.navy};white-space:nowrap;}
.py-txn-status{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.04em;white-space:nowrap;}
.py-txn-receipt-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border:1px solid ${C.border};border-radius:8px;background:#fff;color:${C.textSec};font-size:12px;font-weight:700;transition:border-color .2s,color .2s;}
.py-txn-receipt-btn:hover{border-color:${C.teal};color:${C.teal};}

/* Empty state */
.py-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px;animation:pyFade .4s ease both;}
.py-empty-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:16px;}
.py-empty-title{font-size:18px;font-weight:800;color:${C.navy};margin-bottom:6px;}
.py-empty-text{font-size:14px;color:${C.textSec};line-height:1.55;max-width:360px;}

/* Skeleton */
.py-skeleton{animation:pyFade .3s ease both;}
.py-skel-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;}
.py-skel-card{padding:20px;background:${C.card};border:1px solid ${C.border};border-radius:14px;}
.py-skel-row{display:flex;align-items:center;gap:14px;padding:16px 20px;background:${C.card};border:1px solid ${C.border};margin-top:-1px;}
.py-skel-avatar{width:44px;height:44px;border-radius:50%;flex-shrink:0;}
.py-skel-col{flex:1;display:flex;flex-direction:column;gap:8px;}
.py-skel{border-radius:7px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:pyShimmer 1.3s infinite linear;}
.py-skel-sm{height:12px;width:40%;}
.py-skel-md{height:14px;width:60%;}
.py-skel-lg{height:24px;width:50%;margin-top:8px;}

/* ═══ Receipt Modal ═══ */
.py-overlay{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(17,27,46,0.55);animation:pyFade .2s ease;}
.py-receipt{width:100%;max-width:520px;max-height:90vh;overflow-y:auto;background:#fff;border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(17,27,46,0.3);animation:pyFadeUp .25s ease both;}
.py-receipt::-webkit-scrollbar{width:6px;}
.py-receipt::-webkit-scrollbar-track{background:transparent;}
.py-receipt::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}

.py-receipt-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.py-receipt-brand{display:flex;flex-direction:column;}
.py-receipt-logo{font-size:22px;font-weight:800;color:${C.navy};letter-spacing:-0.025em;}
.py-receipt-label{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};margin-top:2px;}
.py-close-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;border-radius:10px;background:${C.bg};color:${C.textSec};transition:background .2s,color .2s;flex-shrink:0;}
.py-close-btn:hover{background:${C.border};color:${C.text};}

/* Status banner */
.py-receipt-status{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;margin-bottom:20px;}
.py-receipt-status-label{font-size:15px;font-weight:800;display:block;}
.py-receipt-status-sub{font-size:12px;color:${C.textSec};display:block;margin-top:1px;}

/* Section */
.py-receipt-section{margin-bottom:20px;}
.py-receipt-section-title{font-size:11px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.textMuted};margin-bottom:10px;}

/* Parties */
.py-receipt-parties{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.py-receipt-party{padding:14px;border:1px solid ${C.border};border-radius:12px;}
.py-receipt-party-label{font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};display:block;margin-bottom:8px;}
.py-receipt-party-info{display:flex;align-items:center;gap:10px;}
.py-receipt-avatar{width:32px;height:32px;border-radius:50%;background:${C.bg};color:${C.textSec};display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.py-receipt-avatar-teal{background:${C.tealSoft};color:${C.teal};}
.py-receipt-party-name{font-size:13px;font-weight:700;color:${C.navy};}
.py-receipt-party-sub{font-size:11px;color:${C.textMuted};margin-top:1px;}

/* Grid */
.py-receipt-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:${C.border};border:1px solid ${C.border};border-radius:12px;overflow:hidden;}
.py-receipt-field{display:flex;flex-direction:column;gap:3px;padding:12px 16px;background:${C.card};}
.py-receipt-flabel{font-size:11px;font-weight:700;color:${C.textMuted};letter-spacing:0.02em;}
.py-receipt-fvalue{font-size:13.5px;font-weight:700;color:${C.text};}

/* Amount rows */
.py-receipt-amounts{border:1px solid ${C.border};border-radius:12px;overflow:hidden;}
.py-receipt-row{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;font-size:13.5px;}
.py-receipt-row + .py-receipt-row{border-top:1px solid ${C.bg};}
.py-receipt-row span:first-child{color:${C.textSec};font-weight:600;}
.py-receipt-row span:last-child{color:${C.text};font-weight:700;}
.py-receipt-row-total{background:${C.tealSoft};}
.py-receipt-row-total span{color:${C.navy}!important;font-weight:800!important;font-size:14.5px;}
.py-receipt-mono{font-family:monospace;letter-spacing:0.03em;}

/* Footer */
.py-receipt-footer{text-align:center;padding:16px 0;border-top:1px solid ${C.border};margin-top:4px;margin-bottom:16px;}
.py-receipt-footer p{font-size:12px;color:${C.textMuted};}
.py-receipt-footer-sub{margin-top:2px;font-size:11px!important;}

/* Buttons */
.py-receipt-actions{display:flex;flex-direction:column;gap:10px;}
.py-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;border:none;border-radius:10px;background:${C.teal};color:#fff;font-size:14px;font-weight:700;box-shadow:0 4px 14px rgba(39,143,135,0.2);transition:background .2s,box-shadow .2s,transform .15s;}
.py-btn-primary:hover{background:#1F7A73;box-shadow:0 6px 18px rgba(39,143,135,0.3);transform:translateY(-1px);}
.py-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 14px;border:1px solid rgba(154,107,21,0.25);border-radius:8px;background:transparent;color:${C.amber};font-size:12.5px;font-weight:700;transition:border-color .2s,background .2s;}
.py-btn-ghost:hover{background:rgba(154,107,21,0.08);}
.py-btn-full{width:100%;}

/* Animations */
@keyframes pyFade{from{opacity:0;}to{opacity:1;}}
@keyframes pyFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes pyShimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}

/* Responsive */
@media(max-width:768px){
  .py-receipt{padding:22px;max-width:100%;border-radius:16px;}
  .py-overview{grid-template-columns:1fr;}
  .py-txn{flex-wrap:wrap;}
  .py-txn-right{width:100%;justify-content:space-between;margin-top:4px;padding-top:8px;border-top:1px solid ${C.bg};}
  .py-receipt-parties{grid-template-columns:1fr;}
  .py-receipt-grid{grid-template-columns:1fr;}
}
@media(max-width:480px){
  .py-txn-amount{font-size:14px;}
  .py-stat-value{font-size:18px;}
  .py-next-banner{flex-wrap:wrap;}
  .py-receipt-header{flex-direction:column;align-items:flex-start;gap:8px;}
}
@media(prefers-reduced-motion:reduce){
  .py-root *,.py-root *::before,.py-root *::after{animation-duration:0.001s!important;transition-duration:0.001s!important;}
}
`;

export default Payments;
