import React from 'react';

/* ═══════════════════════════════════════════════════════
   COMPARE AYAS — side-by-side caregiver comparison
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
  ArrowL: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Check: (p) => <svg {...sv} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Globe: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  Dollar: (p) => <svg {...sv} {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Heart: (p) => <svg {...sv} {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
};

const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};
const expLabel = (a) => { const v = a && a.experience_years; if (v == null || v === '') return 'Experienced'; return `${String(v).replace(/\s*years?$/i, '').trim()} yrs`; };

function CompareAyas({ ayas, parsed, onBack, onBook }) {
  if (!ayas || ayas.length < 2) return null;

  const rows = [
    { label: 'Compatibility', key: 'score', render: (m) => m.score > 0 ? <span className="ca-score">{m.score}% Match</span> : <span className="ca-na">—</span> },
    { label: 'Experience', key: 'exp', render: (m) => expLabel(m.aya) },
    { label: 'Languages', key: 'lang', render: (m) => (m.aya.languages || []).join(', ') || '—' },
    { label: 'Care Specialties', key: 'spec', render: (m) => (m.aya.specialties || []).join(', ') || '—' },
    { label: 'Location', key: 'loc', render: (m) => m.aya.location || '—' },
    { label: 'Hourly Rate', key: 'rate', render: (m) => m.aya.rate_per_hour ? `PKR ${m.aya.rate_per_hour}` : '—' },
    { label: 'Trust Score', key: 'trust', render: (m) => m.aya.trust_score != null ? `${m.aya.trust_score}/100` : '—' },
    { label: 'Verification', key: 'verify', render: () => <span className="ca-verified">{React.createElement(Ic.Check, { width: 13, height: 13 })} Verified</span> },
  ];

  // Find best in each numeric category
  const bestScore = Math.max(...ayas.map(m => m.score || 0));
  const bestTrust = Math.max(...ayas.map(m => (m.aya.trust_score || 0)));
  const bestRate = Math.min(...ayas.filter(m => m.aya.rate_per_hour).map(m => m.aya.rate_per_hour));

  return (
    <div className="ca-root">
      <style>{CA_CSS}</style>
      <button className="ca-back" onClick={onBack}>{React.createElement(Ic.ArrowL, { width: 16, height: 16 })} Back to Results</button>

      <div className="ca-header">
        <h1 className="ca-title">Compare Caregivers</h1>
        <p className="ca-sub">Side-by-side comparison to help you make an informed decision.</p>
      </div>

      {/* Desktop table */}
      <div className="ca-table-wrap">
        <table className="ca-table">
          <thead>
            <tr>
              <th className="ca-th-label" />
              {ayas.map(m => (
                <th key={m.aya.id} className="ca-th-aya">
                  <div className="ca-th-avatar">{initials(m.aya.name)}</div>
                  <p className="ca-th-name">{m.aya.name}</p>
                  <p className="ca-th-loc">{React.createElement(Ic.MapPin, { width: 12, height: 12 })} {m.aya.location || 'Pakistan'}</p>
                  <button className="ca-book-btn" onClick={() => onBook(m.aya)}>Book Now</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} className="ca-row">
                <td className="ca-td-label">{row.label}</td>
                {ayas.map(m => {
                  const isBest = (row.key === 'score' && m.score === bestScore && bestScore > 0)
                    || (row.key === 'trust' && (m.aya.trust_score || 0) === bestTrust && bestTrust > 0)
                    || (row.key === 'rate' && m.aya.rate_per_hour === bestRate && bestRate > 0);
                  return (
                    <td key={m.aya.id} className={`ca-td${isBest ? ' ca-best' : ''}`}>
                      {row.render(m)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Why match */}
            <tr className="ca-row ca-row-reasons">
              <td className="ca-td-label">Why this match?</td>
              {ayas.map(m => (
                <td key={m.aya.id} className="ca-td ca-td-reasons">
                  {(m.reasons || []).slice(0, 4).map((r, i) => (
                    <p key={i} className="ca-reason">{React.createElement(Ic.Check, { width: 11, height: 11 })} {r}</p>
                  ))}
                  {(!m.reasons || m.reasons.length === 0) && <span className="ca-na">—</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="ca-mobile">
        {ayas.map(m => (
          <div key={m.aya.id} className="ca-m-card">
            <div className="ca-m-header">
              <div className="ca-th-avatar">{initials(m.aya.name)}</div>
              <div>
                <p className="ca-th-name">{m.aya.name}</p>
                <p className="ca-th-loc">{React.createElement(Ic.MapPin, { width: 12, height: 12 })} {m.aya.location || 'Pakistan'}</p>
              </div>
              {m.score > 0 && <span className="ca-score ca-score-sm">{m.score}%</span>}
            </div>
            <div className="ca-m-details">
              {rows.map(row => (
                <div key={row.key} className="ca-m-row">
                  <span className="ca-m-label">{row.label}</span>
                  <span className="ca-m-value">{row.render(m)}</span>
                </div>
              ))}
              {m.reasons && m.reasons.length > 0 && (
                <div className="ca-m-row ca-m-reasons">
                  <span className="ca-m-label">Why this match?</span>
                  <div>
                    {m.reasons.slice(0, 3).map((r, i) => (
                      <p key={i} className="ca-reason">{React.createElement(Ic.Check, { width: 11, height: 11 })} {r}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="ca-book-btn ca-book-btn-full" onClick={() => onBook(m.aya)}>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const CA_CSS = `
.ca-root{font-family:${FF};color:${C.text};animation:caFade .35s ease both;}
.ca-root *,.ca-root *::before,.ca-root *::after{box-sizing:border-box;}
.ca-root button{font-family:inherit;cursor:pointer;}
.ca-root h1,.ca-root p{margin:0;}

.ca-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:${C.teal};font-size:13.5px;font-weight:700;padding:4px 0;margin-bottom:20px;}
.ca-back:hover{color:#1F7A73;}

.ca-header{text-align:center;margin-bottom:28px;}
.ca-title{font-size:clamp(22px,3vw,28px);font-weight:800;color:${C.navy};letter-spacing:-0.02em;}
.ca-sub{margin-top:8px;font-size:14.5px;color:${C.textSec};}

/* Desktop table */
.ca-table-wrap{overflow-x:auto;margin-bottom:24px;border:1px solid ${C.border};border-radius:16px;background:${C.card};}
.ca-table{width:100%;border-collapse:collapse;}
.ca-th-label{width:160px;}
.ca-th-aya{text-align:center;padding:24px 16px 18px;border-bottom:2px solid ${C.border};min-width:200px;}
.ca-th-avatar{width:52px;height:52px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;margin:0 auto 10px;}
.ca-th-name{font-size:16px;font-weight:800;color:${C.navy};margin-bottom:4px;}
.ca-th-loc{display:flex;align-items:center;justify-content:center;gap:4px;font-size:12.5px;color:${C.textSec};margin-bottom:12px;}
.ca-book-btn{display:inline-flex;align-items:center;justify-content:center;padding:8px 20px;border:none;border-radius:9px;background:${C.teal};color:#fff;font-size:13px;font-weight:700;transition:background .2s;}
.ca-book-btn:hover{background:#1F7A73;}
.ca-book-btn-full{width:100%;padding:11px;margin-top:12px;}

.ca-row{}
.ca-row td{padding:12px 16px;border-bottom:1px solid ${C.bg};}
.ca-td-label{font-size:12.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:${C.textMuted};padding:12px 16px!important;}
.ca-td{text-align:center;font-size:14px;color:${C.text};font-weight:600;}
.ca-td.ca-best{background:${C.tealSoft};}
.ca-td-reasons{text-align:left;vertical-align:top;}

.ca-row-reasons td{padding-top:16px!important;padding-bottom:16px!important;}
.ca-reason{display:flex;align-items:center;gap:5px;font-size:12.5px;color:${C.textSec};margin:3px 0;line-height:1.4;}
.ca-reason svg{color:${C.green};flex-shrink:0;}

.ca-score{display:inline-flex;padding:4px 12px;border-radius:999px;background:${C.tealSoft};color:#1B7A5A;font-size:14px;font-weight:800;}
.ca-score-sm{font-size:13px;padding:3px 10px;}
.ca-verified{display:inline-flex;align-items:center;gap:5px;color:${C.green};font-weight:700;font-size:13px;}
.ca-na{color:${C.textMuted};}

/* Mobile cards */
.ca-mobile{display:none;}
.ca-m-card{background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:20px;margin-bottom:14px;}
.ca-m-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.ca-m-header .ca-th-avatar{margin:0;flex-shrink:0;width:44px;height:44px;font-size:15px;}
.ca-m-details{display:flex;flex-direction:column;gap:8px;}
.ca-m-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid ${C.bg};}
.ca-m-row:last-child{border-bottom:none;}
.ca-m-label{font-size:12px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:0.04em;flex-shrink:0;}
.ca-m-value{font-size:13.5px;font-weight:600;color:${C.text};text-align:right;}
.ca-m-reasons{flex-direction:column;align-items:flex-start;gap:4px;}
.ca-m-reasons .ca-m-value{text-align:left;}

@keyframes caFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}

@media(max-width:768px){
  .ca-table-wrap{display:none;}
  .ca-mobile{display:block;}
}
`;

export default CompareAyas;
