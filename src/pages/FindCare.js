import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseCareRequest } from '../utils/parseCareRequest';
import CaregiverProfile from './CaregiverProfile';
import CompareAyas from './CompareAyas';

const BACKEND_URL = 'https://ayafind-production.up.railway.app';

/* ═══════════════════════════════════════════════════════
   FIND CARE — intelligent care matching experience
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
  Search: (p) => <svg {...sv} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Spark: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3z"/></svg>,
  Check: (p) => <svg {...sv} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  CheckC: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Star: (p) => <svg {...sv} {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Filter: (p) => <svg {...sv} {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ArrowR: (p) => <svg {...sv} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 19 12 12 5"/></svg>,
  ArrowL: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Edit: (p) => <svg {...sv} {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Users: (p) => <svg {...sv} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Dollar: (p) => <svg {...sv} {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Msg: (p) => <svg {...sv} {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Refresh: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Baby: (p) => <svg {...sv} {...p}><path d="M9 12h.01M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 011.8 3.9 2 2 0 010 3.6 9 9 0 01-17.6 0 2 2 0 010-3.6A9 9 0 0112 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>,
  Globe: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  Heart: (p) => <svg {...sv} {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
};

const DEMO_CAREGIVERS = [
  { id: 'd1', name: 'Ayesha Khan', location: 'DHA, Lahore', experience_years: '8', rate_per_hour: 800, trust_score: 96, bio: 'Experienced caregiver specializing in toddler and infant care. Fluent in Urdu and English with first-aid certification.', languages: ['Urdu', 'English'], specialties: ['Toddler Care', 'Infant Care', 'Special Needs'], is_available: true, reviews: [{ author: 'Sara M.', text: 'Ayesha is wonderful with our toddler. Patient, caring, and very professional.', rating: 5 }] },
  { id: 'd2', name: 'Fatima Rizwan', location: 'Gulberg, Lahore', experience_years: '5', rate_per_hour: 650, trust_score: 91, bio: 'Warm and attentive caregiver with strong experience in early childhood development. Speaks Urdu and Punjabi.', languages: ['Urdu', 'Punjabi'], specialties: ['Toddler Care', 'Preschool Age', 'Meal Preparation'], is_available: true, reviews: [{ author: 'Ahmed R.', text: 'Fatima has been fantastic. Our kids love her and she always goes above and beyond.', rating: 5 }] },
  { id: 'd3', name: 'Sadia Malik', location: 'Model Town, Lahore', experience_years: '3', rate_per_hour: 500, trust_score: 87, bio: 'Dedicated and reliable caregiver with a passion for child development. Speaks Urdu fluently.', languages: ['Urdu'], specialties: ['Toddler Care', 'After-School Care', 'Homework Help'], is_available: true, reviews: [{ author: 'Nadia K.', text: 'Sadia is reliable and our daughter enjoys spending time with her.', rating: 4 }] },
];

/* ── Local compatibility scoring ─────────────────────── */
function scoreCaregiver(aya, req) {
  let score = 50;
  const reasons = [];
  const loc = (aya.location || '').toLowerCase();
  const rLoc = (req.location || '').toLowerCase();
  if (rLoc && loc && (loc.includes(rLoc) || rLoc.includes(loc.split(',')[0]))) { score += 15; reasons.push('Near your location'); }
  if (req.language) {
    const langs = (aya.languages || []).map(l => l.toLowerCase());
    const bio = (aya.bio || '').toLowerCase();
    if (langs.includes(req.language.toLowerCase()) || bio.includes(req.language.toLowerCase())) { score += 15; reasons.push(`Speaks ${req.language}`); }
  }
  if (req.careType) {
    const specs = (aya.specialties || []).map(s => s.toLowerCase());
    const bio = (aya.bio || '').toLowerCase();
    const ct = req.careType.toLowerCase();
    if (specs.some(s => s.includes(ct)) || bio.includes(ct)) { score += 12; reasons.push(`Experienced with ${req.careType.toLowerCase()} care`); }
  }
  if (req.age) {
    const age = typeof req.age === 'number' ? req.age : null;
    if (age !== null) {
      if (age <= 2 && (aya.specialties || []).some(s => /infant|baby/i.test(s))) { score += 10; reasons.push('Specializes in infant care'); }
      else if (age <= 4 && (aya.specialties || []).some(s => /toddler/i.test(s))) { score += 10; reasons.push('Experienced with toddlers'); }
      else if (age <= 12) { score += 6; reasons.push('Suitable for school-age children'); }
    }
  }
  if (req.dateLabel) { reasons.push('Available at your requested time'); score += 8; }
  const ts = typeof aya.trust_score === 'number' ? aya.trust_score : parseInt(aya.trust_score) || 0;
  if (ts >= 90) { score += 5; reasons.push('Highly trusted on AyaFind'); }
  if (ts >= 95) score += 3;
  const exp = parseInt(typeof aya.experience_years === 'string' ? aya.experience_years : String(aya.experience_years)) || 0;
  if (exp >= 5) { score += 3; reasons.push(`${exp} years of experience`); }
  score = Math.min(score, 98);
  return { score, reasons };
}

/* ── Helpers ─────────────────────────────────────────── */
const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};
const expLabel = (a) => { const v = a && a.experience_years; if (v == null || v === '') return 'Experienced'; return `${String(v).replace(/\s*years?$/i, '').trim()} yrs`; };
const rateLabel = (a) => a && a.rate_per_hour != null && a.rate_per_hour !== '' ? `PKR ${a.rate_per_hour}/hr` : '';

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
function FindCare({ ayas: propAyas, rankings, profile, profileLoading, onBook }) {
  const [step, setStep] = useState('input'); // input | requirements | loading | results | empty
  const [requestText, setRequestText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedAya, setSelectedAya] = useState(null);
  const [viewStep, setViewStep] = useState('main'); // main | profile | compare | booking
  const [compareList, setCompareList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ location: '', language: '', careType: '', rating: 0, maxPrice: 0 });
  const [allAyas, setAllAyas] = useState(propAyas || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterOpts, setFilterOpts] = useState({ locations: [], languages: [], careTypes: [], maxPrice: 1000 });
  const resultsRef = useRef(null);
  const inputRef = useRef(null);

  // Load caregivers
  useEffect(() => {
    if (propAyas && propAyas.length) { setAllAyas(propAyas); return; }
    (async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data } = await supabase.from('ayas').select('*').eq('is_available', true);
        if (data && data.length) setAllAyas(data); else setAllAyas(DEMO_CAREGIVERS);
      } catch { setAllAyas(DEMO_CAREGIVERS); }
    })();
  }, [propAyas]);

  // Compute filter options
  useEffect(() => {
    if (!allAyas.length) return;
    const locs = [...new Set(allAyas.map(a => (a.location || '').split(',')[0].trim()).filter(Boolean))];
    const langs = [...new Set(allAyas.flatMap(a => a.languages || []))];
    const specs = [...new Set(allAyas.flatMap(a => a.specialties || []))];
    const maxP = Math.max(...allAyas.map(a => a.rate_per_hour || 0), 500);
    setFilterOpts({ locations: locs, languages: langs, careTypes: specs, maxPrice: maxP });
    setFilters(f => ({ ...f, maxPrice: maxP }));
  }, [allAyas]);

  // Filtered results
  const filtered = matches.filter(m => {
    const a = m.aya;
    if (filters.location && !(a.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.language && !(a.languages || []).some(l => l.toLowerCase().includes(filters.language.toLowerCase()))) return false;
    if (filters.careType && !(a.specialties || []).some(s => s.toLowerCase().includes(filters.careType.toLowerCase()))) return false;
    if (filters.rating && (a.trust_score || 0) < filters.rating * 20) return false;
    if (filters.maxPrice && (a.rate_per_hour || 0) > filters.maxPrice) return false;
    return true;
  });

  const hasActiveFilters = filters.location || filters.language || filters.careType || filters.rating > 0 || (filters.maxPrice > 0 && filters.maxPrice < filterOpts.maxPrice);

  const handleFindMatches = useCallback(async () => {
    if (!requestText.trim() || loading) return;
    const p = parseCareRequest(requestText);
    setParsed(p);
    setLoading(true);
    setError('');
    setStep('loading');

    try {
      let list = allAyas;
      // Try backend AI matching first
      if (allAyas.length) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/match-ayas`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parentNeeds: {
                childAge: p.age || p.ageWord || '', location: (profile && profile.location) || '',
                specialNeeds: p.specialNeeds || '', language: p.language ? p.language.charAt(0).toUpperCase() + p.language.slice(1) : '',
              },
              ayas: allAyas,
            }),
          });
          const result = await res.json();
          if (result && result.success && Array.isArray(result.rankings) && result.rankings.length) {
            const ranked = result.rankings.map(r => {
              if (!r || !r.name) return null;
              const aya = allAyas.find(a => a.name === r.name);
              if (!aya) return null;
              const local = scoreCaregiver(aya, { ...p, location: (profile && profile.location) || '' });
              return { aya, score: typeof r.match_score === 'number' ? Math.min(Math.round(r.match_score), 98) : local.score, reasons: local.reasons, aiReason: r.reason };
            }).filter(Boolean).sort((a, b) => b.score - a.score);
            if (ranked.length) { setMatches(ranked); setStep('results'); setLoading(false); return; }
          }
        } catch { /* Backend unavailable, use local scoring */ }
      }
      // Fallback: local scoring
      const scored = list.map(aya => {
        const s = scoreCaregiver(aya, { ...p, location: (profile && profile.location) || '' });
        return { aya, score: s.score, reasons: s.reasons, aiReason: '' };
      }).sort((a, b) => b.score - a.score);
      setMatches(scored.length ? scored : []);
      setStep(scored.length ? 'results' : 'empty');
    } catch {
      setError('Something went wrong. Please try again.');
      setStep('input');
    }
    setLoading(false);
  }, [requestText, allAyas, profile, loading]);

  const handleReset = () => { setStep('input'); setRequestText(''); setParsed(null); setMatches([]); setCompareList([]); setError(''); setShowFilters(false); setFilters(f => ({ location: '', language: '', careType: '', rating: 0, maxPrice: filterOpts.maxPrice })); };

  const toggleCompare = (aya) => { setCompareList(prev => prev.find(c => c.id === aya.id) ? prev.filter(c => c.id !== aya.id) : prev.length < 3 ? [...prev, aya] : prev); };

  const openProfile = (match) => { setSelectedAya(match); setViewStep('profile'); };
  const openCompare = () => { if (compareList.length >= 2) setViewStep('compare'); };
  const openBooking = (aya) => {
    if (onBook) { onBook(aya); return; }
    setSelectedAya({ aya, score: matches.find(m => m.aya.id === aya.id)?.score, reasons: matches.find(m => m.aya.id === aya.id)?.reasons });
    setViewStep('booking');
  };

  /* ── Profile view ── */
  if (viewStep === 'profile' && selectedAya) {
    return <CaregiverProfile match={selectedAya} profile={profile} onBack={() => { setViewStep('main'); setSelectedAya(null); }} onBook={() => openBooking(selectedAya.aya)} onCompare={() => { toggleCompare(selectedAya.aya); setViewStep('main'); }} isComparing={compareList.some(c => c.id === selectedAya.aya.id)} />;
  }
  if (viewStep === 'compare' && compareList.length >= 2) {
    return <CompareAyas ayas={compareList.map(a => ({ aya: a, ...scoreCaregiver(a, parsed || {}) }))} parsed={parsed} onBack={() => setViewStep('main')} onBook={openBooking} />;
  }
  if (viewStep === 'booking' && selectedAya) {
    return <BookingSummary aya={selectedAya.aya} parsed={parsed} profile={profile} onBack={() => { setViewStep('main'); setSelectedAya(null); }} onConfirm={() => { if (onBook) onBook(selectedAya.aya); }} />;
  }

  /* ── Render ── */
  return (
    <div className="fc-root">
      <style>{FC_CSS}</style>

      {/* ─── INPUT STEP ─── */}
      {step === 'input' && (
        <div className="fc-input-wrap">
          <div className="fc-header">
            <h1 className="fc-title">Find the right care for your family</h1>
            <p className="fc-subtitle">Tell AyaFind what you need, and we'll help you find caregivers who fit.</p>
          </div>
          <div className="fc-ai-card">
            <div className="fc-ai-badge">{React.createElement(Ic.Spark, { width: 16, height: 16 })}<span>AyaFind Intelligence</span></div>
            <textarea
              ref={inputRef} className="fc-textarea" value={requestText}
              onChange={e => setRequestText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleFindMatches(); } }}
              placeholder="Describe the care you need...&#10;&#10;Example: I need an Urdu-speaking Aya for my 3-year-old tomorrow from 6–10 PM near Lahore."
              rows={4} disabled={loading}
            />
            {parsed && parsed.chips && parsed.chips.length > 0 && (
              <div className="fc-chips">
                <span className="fc-chips-label">{React.createElement(Ic.CheckC, { width: 13, height: 13 })} Understood</span>
                {parsed.chips.map(ch => <span key={ch} className="fc-chip">{ch}</span>)}
              </div>
            )}
            <div className="fc-ai-actions">
              <button className="fc-btn-primary" onClick={handleFindMatches} disabled={!requestText.trim() || loading}>
                {loading ? 'Finding matches...' : <>{React.createElement(Ic.Search, { width: 16, height: 16 })} Find Matches</>}
              </button>
            </div>
          </div>
          {error && <div className="fc-error">{React.createElement(Ic.Refresh, { width: 15, height: 15 })}<span>{error}</span><button className="fc-error-btn" onClick={handleReset}>Try again</button></div>}

          {/* ─── REQUIREMENTS STEP (inline) ─── */}
          {parsed && parsed.chips.length > 0 && step === 'input' && (
            <div className="fc-req-preview">
              <p className="fc-req-label">AyaFind understood these requirements:</p>
              <div className="fc-req-grid">
                {parsed.age != null && <ReqCard icon={React.createElement(Ic.Baby, { width: 18, height: 18 })} label="Child" value={`${parsed.age} years old`} />}
                {parsed.ageWord && <ReqCard icon={React.createElement(Ic.Baby, { width: 18, height: 18 })} label="Child" value={parsed.ageWord.charAt(0).toUpperCase() + parsed.ageWord.slice(1)} />}
                {parsed.specialNeeds && <ReqCard icon={React.createElement(Ic.Heart, { width: 18, height: 18 })} label="Care" value={parsed.specialNeeds} />}
                {parsed.dateLabel && <ReqCard icon={React.createElement(Ic.Calendar, { width: 18, height: 18 })} label="Date" value={parsed.dateLabel} />}
                {parsed.timeLabel && <ReqCard icon={React.createElement(Ic.Clock, { width: 18, height: 18 })} label="Time" value={parsed.timeLabel} />}
                {parsed.language && <ReqCard icon={React.createElement(Ic.Globe, { width: 18, height: 18 })} label="Language" value={parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)} />}
                {parsed.budget && <ReqCard icon={React.createElement(Ic.Dollar, { width: 18, height: 18 })} label="Budget" value={`PKR ${parsed.budget}/hr`} />}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── LOADING STATE ─── */}
      {step === 'loading' && (
        <div className="fc-loading">
          <div className="fc-loading-spinner" />
          <h2 className="fc-loading-title">Finding compatible caregivers</h2>
          <p className="fc-loading-sub">AyaFind is analyzing your requirements and matching caregivers...</p>
          <div className="fc-loading-bar"><div className="fc-loading-fill" /></div>
        </div>
      )}

      {/* ─── EMPTY STATE ─── */}
      {step === 'empty' && (
        <div className="fc-empty">
          <div className="fc-empty-icon">{React.createElement(Ic.Search, { width: 28, height: 28 })}</div>
          <h2 className="fc-empty-title">No caregivers matched all your requirements</h2>
          <p className="fc-empty-sub">Try adjusting your request or relaxing some filters to see more options.</p>
          <div className="fc-empty-actions">
            <button className="fc-btn-primary" onClick={handleReset}>Start Over</button>
            <button className="fc-btn-ghost" onClick={() => { setStep('results'); setMatches(allAyas.map(a => ({ aya: a, score: 0, reasons: [] }))); }}>Browse All Caregivers</button>
          </div>
        </div>
      )}

      {/* ─── RESULTS STEP ─── */}
      {step === 'results' && (
        <div className="fc-results-wrap">
          {/* Header */}
          <div className="fc-results-header">
            <div>
              <h1 className="fc-title fc-title-sm">Your Best Matches</h1>
              <p className="fc-subtitle fc-subtitle-sm">Ranked by how well each caregiver fits your family's needs.</p>
            </div>
            <button className="fc-btn-ghost fc-btn-sm" onClick={handleReset}>{React.createElement(Ic.Edit, { width: 14, height: 14 })} New Request</button>
          </div>

          {/* Requirements summary */}
          {parsed && parsed.chips.length > 0 && (
            <div className="fc-req-bar">
              {parsed.chips.map(ch => <span key={ch} className="fc-chip fc-chip-sm">{ch}</span>)}
              {profile && profile.location && <span className="fc-chip fc-chip-sm fc-chip-loc">{React.createElement(Ic.MapPin, { width: 12, height: 12 })} {profile.location}</span>}
              <button className="fc-chip-edit" onClick={() => { setStep('input'); if (inputRef.current) inputRef.current.focus(); }}>Edit</button>
            </div>
          )}

          {/* Filter bar */}
          <div className="fc-filter-bar">
            <button className={`fc-filter-toggle${showFilters ? ' active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              {React.createElement(Ic.Filter, { width: 15, height: 15 })} Filters {hasActiveFilters && <span className="fc-filter-dot" />}
            </button>
            {!showFilters && hasActiveFilters && (
              <div className="fc-active-filters">
                {filters.location && <span className="fc-af">{filters.location} <button onClick={() => setFilters(f => ({ ...f, location: '' }))}>{React.createElement(Ic.X, { width: 12, height: 12 })}</button></span>}
                {filters.language && <span className="fc-af">{filters.language} <button onClick={() => setFilters(f => ({ ...f, language: '' }))}>{React.createElement(Ic.X, { width: 12, height: 12 })}</button></span>}
                {filters.careType && <span className="fc-af">{filters.careType} <button onClick={() => setFilters(f => ({ ...f, careType: '' }))}>{React.createElement(Ic.X, { width: 12, height: 12 })}</button></span>}
                <button className="fc-clear-all" onClick={() => setFilters({ location: '', language: '', careType: '', rating: 0, maxPrice: filterOpts.maxPrice })}>Clear all</button>
              </div>
            )}
            <div className="fc-results-count">{filtered.length} of {matches.length} matches</div>
            {compareList.length >= 2 && (
              <button className="fc-btn-compare" onClick={openCompare}>Compare ({compareList.length})</button>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="fc-filter-panel">
              <div className="fc-fp-grid">
                <div className="fc-fp-group">
                  <label className="fc-fp-label">Location</label>
                  <select className="fc-fp-select" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
                    <option value="">All locations</option>
                    {filterOpts.locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="fc-fp-group">
                  <label className="fc-fp-label">Language</label>
                  <select className="fc-fp-select" value={filters.language} onChange={e => setFilters(f => ({ ...f, language: e.target.value }))}>
                    <option value="">All languages</option>
                    {filterOpts.languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="fc-fp-group">
                  <label className="fc-fp-label">Care Type</label>
                  <select className="fc-fp-select" value={filters.careType} onChange={e => setFilters(f => ({ ...f, careType: e.target.value }))}>
                    <option value="">All types</option>
                    {filterOpts.careTypes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fc-fp-group">
                  <label className="fc-fp-label">Min. Rating</label>
                  <select className="fc-fp-select" value={filters.rating} onChange={e => setFilters(f => ({ ...f, rating: Number(e.target.value) }))}>
                    <option value={0}>Any</option>
                    <option value={3}>3+ stars</option>
                    <option value={4}>4+ stars</option>
                    <option value={4.5}>4.5+ stars</option>
                  </select>
                </div>
                <div className="fc-fp-group fc-fp-group-full">
                  <label className="fc-fp-label">Max Price: PKR {filters.maxPrice}/hr</label>
                  <input type="range" className="fc-fp-range" min={100} max={filterOpts.maxPrice} step={50} value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="fc-fp-actions">
                <button className="fc-btn-ghost fc-btn-sm" onClick={() => setFilters({ location: '', language: '', careType: '', rating: 0, maxPrice: filterOpts.maxPrice })}>Reset Filters</button>
                <button className="fc-btn-primary fc-btn-sm" onClick={() => setShowFilters(false)}>Apply</button>
              </div>
            </div>
          )}

          {/* Results grid */}
          {filtered.length > 0 ? (
            <div className="fc-grid" ref={resultsRef}>
              {filtered.map(m => (
                <MatchCard key={m.aya.id} match={m} onProfile={() => openProfile(m)} onBook={() => openBooking(m.aya)}
                  compareChecked={compareList.some(c => c.id === m.aya.id)} onToggleCompare={() => toggleCompare(m.aya)} />
              ))}
            </div>
          ) : (
            <div className="fc-no-results">
              <p>No caregivers match your current filters.</p>
              <button className="fc-btn-ghost" onClick={() => setFilters({ location: '', language: '', careType: '', rating: 0, maxPrice: filterOpts.maxPrice })}>Clear Filters</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */
function ReqCard({ icon, label, value }) {
  return <div className="fc-req-card"><div className="fc-req-icon">{icon}</div><div><p className="fc-req-label-sm">{label}</p><p className="fc-req-value">{value}</p></div></div>;
}

function MatchCard({ match, onProfile, onBook, compareChecked, onToggleCompare }) {
  const { aya, score, reasons } = match;
  return (
    <article className="fc-match-card">
      <div className="fc-match-top">
        <label className="fc-cb-wrap">
          <input type="checkbox" checked={compareChecked} onChange={onToggleCompare} />
          <span className="fc-cb-label">Compare</span>
        </label>
        {score > 0 && <span className="fc-match-pct">{score}% Match</span>}
      </div>
      <div className="fc-match-body" onClick={onProfile} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onProfile()}>
        <div className="fc-match-avatar">{initials(aya.name)}</div>
        <h3 className="fc-match-name">{aya.name}</h3>
        <div className="fc-match-meta">
          {React.createElement(Ic.MapPin, { width: 13, height: 13 })}<span>{aya.location || 'Pakistan'}</span>
          <span className="fc-dot" />
          {React.createElement(Ic.Award, { width: 13, height: 13 })}<span>{expLabel(aya)} exp</span>
        </div>
        <div className="fc-match-meta2">
          {rateLabel(aya) && <span>{React.createElement(Ic.Dollar, { width: 13, height: 13 })} {rateLabel(aya)}</span>}
          {aya.trust_score != null && <span>{React.createElement(Ic.Shield, { width: 13, height: 13 })} {aya.trust_score}/100</span>}
          {aya.languages && aya.languages.length > 0 && <span>{React.createElement(Ic.Globe, { width: 13, height: 13 })} {aya.languages.join(', ')}</span>}
        </div>
      </div>
      {reasons && reasons.length > 0 && (
        <div className="fc-match-why">
          <p className="fc-match-why-label">Why this match?</p>
          {reasons.slice(0, 4).map((r, i) => <p key={i} className="fc-match-reason">{React.createElement(Ic.Check, { width: 12, height: 12 })} {r}</p>)}
        </div>
      )}
      <div className="fc-match-actions">
        <button className="fc-btn-ghost fc-btn-sm" onClick={onProfile}>View Profile</button>
        <button className="fc-btn-primary fc-btn-sm" onClick={onBook}>Book Now</button>
      </div>
    </article>
  );
}

function BookingSummary({ aya, parsed, profile, onBack, onConfirm }) {
  const duration = parsed && parsed.durationHours ? parsed.durationHours : 4;
  const rate = aya.rate_per_hour || 0;
  const total = rate * duration;
  const dateStr = parsed && parsed.dateLabel ? parsed.dateLabel : 'Select date';
  const timeStr = parsed && parsed.timeLabel ? parsed.timeLabel : 'Select time';
  return (
    <div className="fc-booking-wrap">
      <button className="fc-back-btn" onClick={onBack}>{React.createElement(Ic.ArrowL, { width: 16, height: 16 })} Back to Results</button>
      <div className="fc-booking-card">
        <h2 className="fc-booking-title">Booking Summary</h2>
        <div className="fc-booking-aya">
          <div className="fc-match-avatar fc-avatar-lg">{initials(aya.name)}</div>
          <div><h3 className="fc-booking-name">{aya.name}</h3><p className="fc-booking-loc">{React.createElement(Ic.MapPin, { width: 13, height: 13 })} {aya.location}</p></div>
        </div>
        <div className="fc-booking-details">
          <div className="fc-bd-row"><span>Date</span><span>{dateStr}</span></div>
          <div className="fc-bd-row"><span>Time</span><span>{timeStr}</span></div>
          <div className="fc-bd-row"><span>Duration</span><span>{duration} hours</span></div>
          <div className="fc-bd-row"><span>Hourly Rate</span><span>PKR {rate}</span></div>
          <div className="fc-bd-row fc-bd-total"><span>Estimated Total</span><span>PKR {total.toLocaleString()}</span></div>
        </div>
        <div className="fc-booking-actions">
          <button className="fc-btn-ghost" onClick={onBack}>Edit Details</button>
          <button className="fc-btn-primary" onClick={onConfirm}>Continue to Payment</button>
        </div>
        <p className="fc-booking-note">Payment processing will be available in the next step. No charges are made until confirmed.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const FC_CSS = `
.fc-root{font-family:${FF};color:${C.text};-webkit-font-smoothing:antialiased;}
.fc-root *,.fc-root *::before,.fc-root *::after{box-sizing:border-box;}
.fc-root button{font-family:inherit;cursor:pointer;}
.fc-root h1,.fc-root h2,.fc-root h3,.fc-root p{margin:0;}

/* Header */
.fc-header{text-align:center;margin-bottom:32px;animation:fcFade .4s ease both;}
.fc-title{font-size:clamp(26px,3.5vw,36px);font-weight:800;color:${C.navy};letter-spacing:-0.025em;line-height:1.2;}
.fc-title-sm{text-align:left;font-size:clamp(22px,3vw,28px);}
.fc-subtitle{margin-top:10px;font-size:16px;color:${C.textSec};line-height:1.6;max-width:540px;margin-left:auto;margin-right:auto;}
.fc-subtitle-sm{text-align:left;max-width:none;margin:4px 0 0;font-size:14.5px;}

/* Input card */
.fc-input-wrap{max-width:720px;margin:0 auto;animation:fcFade .4s ease both;}
.fc-ai-card{background:${C.card};border:1px solid ${C.border};border-radius:18px;padding:28px;border-top:3px solid ${C.teal};box-shadow:0 12px 40px rgba(39,143,135,0.08);}
.fc-ai-badge{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};margin-bottom:16px;}
.fc-textarea{width:100%;min-height:120px;padding:16px 18px;border:1.5px solid ${C.border};border-radius:14px;background:${C.bg};color:${C.text};font-family:inherit;font-size:15.5px;line-height:1.6;resize:vertical;transition:border-color .2s,box-shadow .2s,background .2s;}
.fc-textarea::placeholder{color:${C.textMuted};}
.fc-textarea:focus{outline:none;border-color:${C.teal};background:#fff;box-shadow:0 0 0 3px rgba(39,143,135,0.12);}
.fc-textarea:disabled{opacity:.65;}

/* Chips */
.fc-chips{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:14px;}
.fc-chips-label{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};}
.fc-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:999px;border:1px solid ${C.border};background:#fff;font-size:12.5px;font-weight:600;color:${C.text};}
.fc-chip-sm{padding:4px 10px;font-size:11.5px;}
.fc-chip-loc{border-color:rgba(39,143,135,.3);background:${C.tealSoft};color:#1F7A73;}
.fc-chip-edit{background:none;border:none;color:${C.teal};font-size:12px;font-weight:700;padding:4px 8px;}
.fc-chip-edit:hover{color:#1F7A73;text-decoration:underline;}

/* Buttons */
.fc-ai-actions{display:flex;margin-top:16px;}
.fc-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;border:none;border-radius:11px;background:${C.teal};color:#fff;font-size:14.5px;font-weight:700;box-shadow:0 6px 18px rgba(39,143,135,.22);transition:background .2s,box-shadow .2s,transform .15s;}
.fc-btn-primary:hover{background:#1F7A73;box-shadow:0 8px 22px rgba(39,143,135,.3);transform:translateY(-1px);}
.fc-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
.fc-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 20px;border:1.5px solid ${C.border};border-radius:11px;background:#fff;color:${C.text};font-size:13.5px;font-weight:700;transition:border-color .2s,color .2s,background .2s;}
.fc-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.fc-btn-sm{padding:9px 16px;font-size:13px;}
.fc-btn-compare{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border:none;border-radius:10px;background:${C.coral};color:#fff;font-size:13px;font-weight:700;transition:background .2s;}
.fc-btn-compare:hover{background:#E86A48;}

/* Requirements preview */
.fc-req-preview{margin-top:28px;animation:fcFade .3s ease both;}
.fc-req-label{font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};margin-bottom:12px;}
.fc-req-label-sm{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};margin:0;}
.fc-req-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;}
.fc-req-card{display:flex;align-items:center;gap:12px;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:14px 16px;}
.fc-req-icon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.fc-req-value{font-size:14.5px;font-weight:700;color:${C.text};margin:2px 0 0;}

/* Error */
.fc-error{display:flex;align-items:center;gap:10px;margin-top:18px;padding:14px 18px;border-radius:12px;background:#FBE9E9;border:1px solid rgba(194,59,59,.15);font-size:13.5px;color:#A03030;font-weight:600;}
.fc-error-btn{background:none;border:none;color:#C23B3B;font-weight:800;font-size:13px;text-decoration:underline;margin-left:auto;white-space:nowrap;}

/* Loading */
.fc-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center;animation:fcFade .4s ease both;}
.fc-loading-spinner{width:48px;height:48px;border:3px solid ${C.border};border-top-color:${C.teal};border-radius:50%;animation:fcSpin .8s linear infinite;margin-bottom:24px;}
.fc-loading-title{font-size:22px;font-weight:800;color:${C.navy};margin-bottom:8px;}
.fc-loading-sub{font-size:14.5px;color:${C.textSec};margin-bottom:28px;}
.fc-loading-bar{width:200px;height:4px;border-radius:2px;background:${C.border};overflow:hidden;}
.fc-loading-fill{height:100%;background:${C.teal};border-radius:2px;animation:fcLoad 2s ease-in-out infinite;}

/* Empty */
.fc-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px;animation:fcFade .4s ease both;}
.fc-empty-icon{display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:16px;}
.fc-empty-title{font-size:20px;font-weight:800;color:${C.navy};margin-bottom:8px;}
.fc-empty-sub{font-size:14.5px;color:${C.textSec};max-width:420px;line-height:1.6;margin-bottom:24px;}
.fc-empty-actions{display:flex;gap:12px;}

/* Results */
.fc-results-wrap{animation:fcFade .4s ease both;}
.fc-results-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px;}
.fc-req-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:12px 16px;background:${C.card};border:1px solid ${C.border};border-radius:12px;margin-bottom:16px;}

/* Filter bar */
.fc-filter-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;}
.fc-filter-toggle{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border:1.5px solid ${C.border};border-radius:10px;background:#fff;color:${C.text};font-size:13px;font-weight:700;transition:all .2s;}
.fc-filter-toggle:hover,.fc-filter-toggle.active{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.fc-filter-dot{width:6px;height:6px;border-radius:50%;background:${C.coral};margin-left:2px;}
.fc-active-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.fc-af{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;background:${C.tealSoft};color:#1F7A73;font-size:11.5px;font-weight:700;}
.fc-af button{background:none;border:none;color:#1F7A73;padding:0;display:flex;}
.fc-clear-all{background:none;border:none;color:${C.coral};font-size:12px;font-weight:700;}
.fc-results-count{margin-left:auto;font-size:13px;color:${C.textSec};font-weight:600;}

/* Filter panel */
.fc-filter-panel{background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:20px 22px;margin-bottom:20px;animation:fcFade .25s ease both;}
.fc-fp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;}
.fc-fp-group{display:flex;flex-direction:column;gap:6px;}
.fc-fp-group-full{grid-column:1/-1;}
.fc-fp-label{font-size:12px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:${C.textSec};}
.fc-fp-select{width:100%;padding:10px 12px;border:1.5px solid ${C.border};border-radius:10px;font-family:inherit;font-size:13.5px;color:${C.text};background:#fff;transition:border-color .2s;}
.fc-fp-select:focus{outline:none;border-color:${C.teal};}
.fc-fp-range{width:100%;accent-color:${C.teal};}
.fc-fp-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;}

/* Grid + Cards */
.fc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px;}
.fc-match-card{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:22px;transition:transform .2s,box-shadow .2s,border-color .2s;animation:fcFade .35s ease both;}
.fc-match-card:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(23,36,61,.08);border-color:rgba(39,143,135,.25);}
.fc-match-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.fc-cb-wrap{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:${C.textSec};font-weight:600;}
.fc-cb-wrap input{accent-color:${C.teal};width:16px;height:16px;cursor:pointer;}
.fc-cb-label{user-select:none;}
.fc-match-pct{display:inline-flex;padding:4px 12px;border-radius:999px;background:linear-gradient(135deg,${C.tealSoft},${C.greenBg});color:#1B7A5A;font-size:13px;font-weight:800;}
.fc-match-body{cursor:pointer;}
.fc-match-avatar{width:48px;height:48px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0;margin-bottom:12px;}
.fc-avatar-lg{width:56px;height:56px;font-size:20px;}
.fc-match-name{font-size:17px;font-weight:800;color:${C.navy};margin-bottom:6px;}
.fc-match-meta{display:flex;align-items:center;gap:6px;font-size:13px;color:${C.textSec};margin-bottom:6px;flex-wrap:wrap;}
.fc-match-meta svg{color:${C.teal};flex-shrink:0;}
.fc-dot{width:3px;height:3px;border-radius:50%;background:${C.textMuted};}
.fc-match-meta2{display:flex;align-items:center;gap:12px;font-size:12.5px;color:${C.textSec};flex-wrap:wrap;}
.fc-match-meta2 span{display:inline-flex;align-items:center;gap:4px;}
.fc-match-meta2 svg{color:${C.teal};flex-shrink:0;}

/* Why match */
.fc-match-why{margin-top:14px;padding:12px 14px;border-radius:11px;background:${C.bg};border:1px solid ${C.border};}
.fc-match-why-label{font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.teal};margin-bottom:6px;}
.fc-match-reason{display:flex;align-items:center;gap:6px;font-size:12.5px;color:${C.textSec};margin:3px 0;line-height:1.4;}
.fc-match-reason svg{color:${C.green};flex-shrink:0;}

/* Card actions */
.fc-match-actions{display:flex;gap:10px;margin-top:16px;}
.fc-match-actions button{flex:1;}

/* No results */
.fc-no-results{text-align:center;padding:40px 20px;}
.fc-no-results p{font-size:15px;color:${C.textSec};margin-bottom:16px;}

/* Booking */
.fc-booking-wrap{max-width:560px;margin:0 auto;animation:fcFade .35s ease both;}
.fc-back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:${C.teal};font-size:13.5px;font-weight:700;padding:4px 0;margin-bottom:20px;}
.fc-back-btn:hover{color:#1F7A73;}
.fc-booking-card{background:${C.card};border:1px solid ${C.border};border-radius:18px;padding:28px;border-top:3px solid ${C.teal};box-shadow:0 10px 36px rgba(39,143,135,.08);}
.fc-booking-title{font-size:20px;font-weight:800;color:${C.navy};margin-bottom:20px;}
.fc-booking-aya{display:flex;align-items:center;gap:14px;margin-bottom:22px;}
.fc-booking-name{font-size:17px;font-weight:800;color:${C.text};}
.fc-booking-loc{display:flex;align-items:center;gap:4px;font-size:13px;color:${C.textSec};margin-top:3px;}
.fc-booking-details{border:1px solid ${C.border};border-radius:12px;overflow:hidden;margin-bottom:20px;}
.fc-bd-row{display:flex;justify-content:space-between;padding:12px 16px;font-size:14px;}
.fc-bd-row + .fc-bd-row{border-top:1px solid ${C.bg};}
.fc-bd-row span:first-child{color:${C.textSec};font-weight:600;}
.fc-bd-row span:last-child{color:${C.text};font-weight:700;}
.fc-bd-total{background:${C.tealSoft};}
.fc-bd-total span{color:${C.navy}!important;font-weight:800!important;font-size:15px;}
.fc-booking-actions{display:flex;gap:12px;}
.fc-booking-actions button{flex:1;}
.fc-booking-note{margin-top:14px;font-size:12.5px;color:${C.textMuted};text-align:center;line-height:1.5;}

/* Animations */
@keyframes fcFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
@keyframes fcSpin{to{transform:rotate(360deg);}}
@keyframes fcLoad{0%{width:0;}50%{width:70%;}100%{width:100%;}}

/* Responsive */
@media(max-width:768px){
  .fc-grid{grid-template-columns:1fr;}
  .fc-results-header{flex-direction:column;}
  .fc-filter-bar{flex-wrap:wrap;}
  .fc-results-count{margin-left:0;width:100%;margin-top:4px;}
  .fc-fp-grid{grid-template-columns:1fr 1fr;}
  .fc-req-grid{grid-template-columns:1fr 1fr;}
}
@media(max-width:480px){
  .fc-ai-card{padding:20px;}
  .fc-fp-grid{grid-template-columns:1fr;}
  .fc-req-grid{grid-template-columns:1fr;}
  .fc-match-actions{flex-direction:column;}
  .fc-booking-actions{flex-direction:column;}
  .fc-empty-actions{flex-direction:column;width:100%;}
  .fc-empty-actions button{width:100%;}
}
`;

export default FindCare;
