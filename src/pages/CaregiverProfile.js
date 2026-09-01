import React from 'react';

/* ═══════════════════════════════════════════════════════
   CAREGIVER PROFILE — detailed profile view
   Shows full caregiver info, compatibility, reviews,
   and booking/message CTAs.
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
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Star: (p) => <svg {...sv} {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Globe: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Dollar: (p) => <svg {...sv} {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Check: (p) => <svg {...sv} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  CheckC: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Spark: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3z"/></svg>,
  Msg: (p) => <svg {...sv} {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Heart: (p) => <svg {...sv} {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Users: (p) => <svg {...sv} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
};

const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};
const expLabel = (a) => { const v = a && a.experience_years; if (v == null || v === '') return 'Experienced'; return `${String(v).replace(/\s*years?$/i, '').trim()} years`; };

function CaregiverProfile({ match, profile, onBack, onBook, onCompare, isComparing }) {
  const aya = match.aya;
  const { score, reasons, aiReason } = match;
  const reviews = aya.reviews || [];
  const languages = aya.languages || [];
  const specialties = aya.specialties || [];

  return (
    <div className="cp-root">
      <style>{CP_CSS}</style>

      <button className="cp-back" onClick={onBack}>{React.createElement(Ic.ArrowL, { width: 16, height: 16 })} Back to Results</button>

      <div className="cp-card">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-avatar">{initials(aya.name)}</div>
          <div className="cp-header-info">
            <h1 className="cp-name">{aya.name}</h1>
            <div className="cp-meta">
              {React.createElement(Ic.MapPin, { width: 14, height: 14 })}
              <span>{aya.location || 'Pakistan'}</span>
              {score > 0 && <span className="cp-match-badge">{score}% Match</span>}
            </div>
          </div>
          <div className="cp-header-actions">
            <label className="cp-cb-wrap">
              <input type="checkbox" checked={isComparing} onChange={onCompare} />
              <span>Add to Compare</span>
            </label>
          </div>
        </div>

        {/* Compatibility banner */}
        {score > 0 && reasons && reasons.length > 0 && (
          <div className="cp-compat">
            <div className="cp-compat-head">
              {React.createElement(Ic.Spark, { width: 16, height: 16 })}
              <span>Why AyaFind recommends {aya.name.split(' ')[0]}</span>
            </div>
            <div className="cp-compat-reasons">
              {reasons.map((r, i) => (
                <div key={i} className="cp-compat-reason">
                  {React.createElement(Ic.Check, { width: 13, height: 13 })}
                  <span>{r}</span>
                </div>
              ))}
            </div>
            {aiReason && <p className="cp-ai-reason">{aiReason}</p>}
          </div>
        )}

        {/* Details grid */}
        <div className="cp-details">
          <div className="cp-detail-card">
            <div className="cp-detail-icon cp-icon-teal">{React.createElement(Ic.Award, { width: 18, height: 18 })}</div>
            <p className="cp-detail-label">Experience</p>
            <p className="cp-detail-value">{expLabel(aya)}</p>
          </div>
          <div className="cp-detail-card">
            <div className="cp-detail-icon cp-icon-coral">{React.createElement(Ic.Shield, { width: 18, height: 18 })}</div>
            <p className="cp-detail-label">Trust Score</p>
            <p className="cp-detail-value">{aya.trust_score != null ? `${aya.trust_score}/100` : '—'}</p>
          </div>
          <div className="cp-detail-card">
            <div className="cp-detail-icon cp-icon-teal">{React.createElement(Ic.Dollar, { width: 18, height: 18 })}</div>
            <p className="cp-detail-label">Hourly Rate</p>
            <p className="cp-detail-value">{aya.rate_per_hour ? `PKR ${aya.rate_per_hour}` : '—'}</p>
          </div>
          <div className="cp-detail-card">
            <div className="cp-detail-icon cp-icon-coral">{React.createElement(Ic.Globe, { width: 18, height: 18 })}</div>
            <p className="cp-detail-label">Languages</p>
            <p className="cp-detail-value">{languages.length ? languages.join(', ') : '—'}</p>
          </div>
        </div>

        {/* Bio */}
        {aya.bio && (
          <section className="cp-section">
            <h2 className="cp-section-title">About</h2>
            <p className="cp-bio">{aya.bio}</p>
          </section>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <section className="cp-section">
            <h2 className="cp-section-title">Care Specialties</h2>
            <div className="cp-tags">
              {specialties.map(s => <span key={s} className="cp-tag">{s}</span>)}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section className="cp-section">
            <h2 className="cp-section-title">Languages Spoken</h2>
            <div className="cp-tags">
              {languages.map(l => <span key={l} className="cp-tag cp-tag-teal">{l}</span>)}
            </div>
          </section>
        )}

        {/* Verification */}
        <section className="cp-section">
          <h2 className="cp-section-title">Verification & Trust</h2>
          <div className="cp-verify-list">
            <div className="cp-verify-item">
              {React.createElement(Ic.CheckC, { width: 16, height: 16 })}
              <span>Identity verified</span>
            </div>
            <div className="cp-verify-item">
              {React.createElement(Ic.CheckC, { width: 16, height: 16 })}
              <span>Background check completed</span>
            </div>
            {aya.trust_score >= 85 && (
              <div className="cp-verify-item">
                {React.createElement(Ic.CheckC, { width: 16, height: 16 })}
                <span>High trust score on AyaFind</span>
              </div>
            )}
            {reviews.length > 0 && (
              <div className="cp-verify-item">
                {React.createElement(Ic.CheckC, { width: 16, height: 16 })}
                <span>{reviews.length} positive review{reviews.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="cp-section">
            <h2 className="cp-section-title">Reviews from Families</h2>
            <div className="cp-reviews">
              {reviews.map((r, i) => (
                <div key={i} className="cp-review">
                  <div className="cp-review-top">
                    <span className="cp-review-author">{r.author || 'Verified Parent'}</span>
                    <span className="cp-review-stars">
                      {Array.from({ length: 5 }, (_, j) => (
                        <span key={j} style={{ color: j < (r.rating || 5) ? '#F5A623' : C.border }}>
                          {React.createElement(Ic.Star, { width: 13, height: 13 })}
                        </span>
                      ))}
                    </span>
                  </div>
                  <p className="cp-review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Family compatibility */}
        {profile && (
          <section className="cp-section">
            <h2 className="cp-section-title">Compatibility with Your Family</h2>
            <div className="cp-fam-compat">
              {profile.location && aya.location && (
                <div className="cp-fam-row">
                  {React.createElement(Ic.MapPin, { width: 14, height: 14 })}
                  <span>Caregiver is based in {aya.location}{profile.location && (aya.location || '').toLowerCase().includes(profile.location.toLowerCase()) ? ' — near your location' : ''}</span>
                </div>
              )}
              {profile.child_age != null && (
                <div className="cp-fam-row">
                  {React.createElement(Ic.Heart, { width: 14, height: 14 })}
                  <span>
                    {parseInt(aya.experience_years) >= 3 ? 'Strong' : 'Some'} experience with {profile.child_age <= 2 ? 'infants' : profile.child_age <= 4 ? 'toddlers' : 'school-age children'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="cp-actions">
          <button className="cp-btn-msg" onClick={onBack}>
            {React.createElement(Ic.Msg, { width: 15, height: 15 })} Message
          </button>
          <button className="cp-btn-book" onClick={onBook}>
            Book Now {React.createElement(Ic.ArrowL, { width: 15, height: 15, style: { transform: 'rotate(180deg)' } })}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const CP_CSS = `
.cp-root{font-family:${FF};color:${C.text};max-width:720px;margin:0 auto;animation:cpFade .35s ease both;}
.cp-root *,.cp-root *::before,.cp-root *::after{box-sizing:border-box;}
.cp-root button{font-family:inherit;cursor:pointer;}
.cp-root h1,.cp-root h2,.cp-root p{margin:0;}

.cp-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:${C.teal};font-size:13.5px;font-weight:700;padding:4px 0;margin-bottom:20px;}
.cp-back:hover{color:#1F7A73;}

.cp-card{background:${C.card};border:1px solid ${C.border};border-radius:18px;padding:32px;border-top:3px solid ${C.teal};box-shadow:0 10px 36px rgba(39,143,135,.06);}

/* Header */
.cp-header{display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap;}
.cp-avatar{width:64px;height:64px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;flex-shrink:0;}
.cp-header-info{flex:1;min-width:0;}
.cp-name{font-size:24px;font-weight:800;color:${C.navy};letter-spacing:-0.02em;}
.cp-meta{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:14px;color:${C.textSec};flex-wrap:wrap;}
.cp-meta svg{color:${C.teal};}
.cp-match-badge{display:inline-flex;padding:3px 11px;border-radius:999px;background:${C.tealSoft};color:#1B7A5A;font-size:13px;font-weight:800;}
.cp-header-actions{flex-shrink:0;}
.cp-cb-wrap{display:flex;align-items:center;gap:7px;font-size:13px;color:${C.textSec};font-weight:600;cursor:pointer;}
.cp-cb-wrap input{accent-color:${C.teal};width:16px;height:16px;}

/* Compatibility */
.cp-compat{background:${C.bg};border:1px solid ${C.border};border-radius:14px;padding:20px 22px;margin-bottom:24px;}
.cp-compat-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;letter-spacing:0.03em;color:${C.teal};margin-bottom:12px;}
.cp-compat-reasons{display:flex;flex-direction:column;gap:6px;}
.cp-compat-reason{display:flex;align-items:center;gap:8px;font-size:14px;color:${C.text};font-weight:600;}
.cp-compat-reason svg{color:${C.green};flex-shrink:0;}
.cp-ai-reason{margin-top:12px;padding-top:12px;border-top:1px dashed ${C.border};font-size:13.5px;color:${C.textSec};line-height:1.6;font-style:italic;}

/* Details grid */
.cp-details{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
.cp-detail-card{background:${C.bg};border:1px solid ${C.border};border-radius:12px;padding:16px;text-align:center;}
.cp-detail-icon{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;margin:0 auto 8px;}
.cp-icon-teal{background:${C.tealSoft};color:${C.teal};}
.cp-icon-coral{background:${C.coralSoft};color:${C.coral};}
.cp-detail-label{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};margin:0;}
.cp-detail-value{font-size:15px;font-weight:800;color:${C.text};margin:4px 0 0;}

/* Sections */
.cp-section{margin-bottom:24px;}
.cp-section-title{font-size:16px;font-weight:800;color:${C.navy};margin-bottom:12px;}
.cp-bio{font-size:14.5px;color:${C.textSec};line-height:1.7;}

/* Tags */
.cp-tags{display:flex;flex-wrap:wrap;gap:8px;}
.cp-tag{display:inline-flex;padding:6px 14px;border-radius:999px;border:1px solid ${C.border};background:#fff;font-size:13px;font-weight:600;color:${C.text};}
.cp-tag-teal{border-color:rgba(39,143,135,.3);background:${C.tealSoft};color:#1F7A73;}

/* Verification */
.cp-verify-list{display:flex;flex-direction:column;gap:10px;}
.cp-verify-item{display:flex;align-items:center;gap:10px;font-size:14px;color:${C.text};font-weight:600;}
.cp-verify-item svg{color:${C.green};flex-shrink:0;}

/* Reviews */
.cp-reviews{display:flex;flex-direction:column;gap:14px;}
.cp-review{background:${C.bg};border:1px solid ${C.border};border-radius:12px;padding:16px 18px;}
.cp-review-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.cp-review-author{font-size:13px;font-weight:800;color:${C.text};}
.cp-review-stars{display:flex;gap:2px;}
.cp-review-text{font-size:13.5px;color:${C.textSec};line-height:1.6;}

/* Family compat */
.cp-fam-compat{display:flex;flex-direction:column;gap:10px;}
.cp-fam-row{display:flex;align-items:center;gap:10px;font-size:14px;color:${C.text};font-weight:600;}
.cp-fam-row svg{color:${C.teal};flex-shrink:0;}

/* Actions */
.cp-actions{display:flex;gap:12px;margin-top:8px;}
.cp-btn-book{flex:2;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border:none;border-radius:12px;background:${C.teal};color:#fff;font-size:15px;font-weight:700;box-shadow:0 6px 18px rgba(39,143,135,.22);transition:background .2s,transform .15s;}
.cp-btn-book:hover{background:#1F7A73;transform:translateY(-1px);}
.cp-btn-msg{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border:1.5px solid ${C.border};border-radius:12px;background:#fff;color:${C.text};font-size:14px;font-weight:700;transition:border-color .2s,color .2s,background .2s;}
.cp-btn-msg:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}

@keyframes cpFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}

@media(max-width:640px){
  .cp-card{padding:22px 18px;}
  .cp-details{grid-template-columns:repeat(2,1fr);}
  .cp-header{flex-direction:column;align-items:flex-start;}
  .cp-actions{flex-direction:column;}
  .cp-btn-book,.cp-btn-msg{width:100%;}
}
`;

export default CaregiverProfile;
