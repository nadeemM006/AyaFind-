import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';

/* ═══════════════════════════════════════════════════════
   MY FAMILY — AyaFind's intelligent family understanding
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
  Users: (p) => <svg {...sv} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Plus: (p) => <svg {...sv} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: (p) => <svg {...sv} {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Eye: (p) => <svg {...sv} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: (p) => <svg {...sv} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  CheckCircle: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Circle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/></svg>,
  Sparkles: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Globe: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  Heart: (p) => <svg {...sv} {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Home: (p) => <svg {...sv} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Target: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Lock: (p) => <svg {...sv} {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Trash: (p) => <svg {...sv} {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Baby: (p) => <svg {...sv} {...p}><path d="M9 12h.01M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 011.8 3.9 2 2 0 010 3.6 9 9 0 01-17.6 0 2 2 0 010-3.6A9 9 0 0112 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>,
  Star: (p) => <svg {...sv} {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  ArrowRight: (p) => <svg {...sv} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 19 12 12 5"/></svg>,
  Save: (p) => <svg {...sv} {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Info: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

/* ── Constants ───────────────────────────────────────── */
const LANGUAGES = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Arabic', 'Other'];
const CARE_TYPES = ['Infant Care', 'Toddler Care', 'Preschool Age', 'After-School Care', 'Special Needs', 'Homework Help', 'Meal Preparation'];
const SCHEDULES = ['Mornings', 'Afternoons', 'Evenings', 'Full Day', 'Weekdays Only', 'Weekends', 'Flexible'];
const EXPERIENCE_LEVELS = ['1+ years', '2+ years', '3+ years', '5+ years', '10+ years'];
const DISTANCES = ['Within 3 km', 'Within 5 km', 'Within 10 km', 'Within 15 km', 'Within 20 km', 'No preference'];
const ENVIRONMENTS = ['Care at our home', "Care at caregiver's home", 'Outdoor/public setting', 'Depends on booking'];
const GENDERS = ['Male', 'Female', 'Prefer not to say'];

const PRIORITY_OPTIONS = [
  { key: 'safety', label: 'Safety & verification', desc: 'Background checks, verified identity, trusted referrals' },
  { key: 'experience', label: 'Experience with young children', desc: 'Proven track record with infants and toddlers' },
  { key: 'language', label: 'Language compatibility', desc: 'Caregiver speaks your preferred languages' },
  { key: 'education', label: 'Educational activities', desc: 'Learning, reading, and developmental play' },
  { key: 'nearby', label: 'Nearby caregiver', desc: 'Short commute, familiar neighborhood' },
  { key: 'flexibility', label: 'Flexible availability', desc: 'Adapts to changing schedules and last-minute needs' },
  { key: 'personality', label: 'Personality fit', desc: 'Warm, patient, and compatible with your family' },
  { key: 'affordability', label: 'Affordability', desc: 'Fair and transparent pricing' },
];

/* ── Helpers ─────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);
const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || '?';
};

const ageFromDob = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

const ageLabel = (child) => {
  if (child.dateOfBirth) {
    const a = ageFromDob(child.dateOfBirth);
    if (a !== null) return a <= 0 ? 'Under 1 year' : `${a} year${a === 1 ? '' : 's'} old`;
  }
  if (child.age != null && child.age !== '') return `${child.age} year${Number(child.age) === 1 ? '' : 's'} old`;
  return '';
};

const STORAGE_KEY = (email) => `ayafind_family_${(email || 'guest').toLowerCase()}`;

const emptyChild = () => ({
  id: uid(), name: '', dateOfBirth: '', age: '', gender: '',
  careType: '', languages: [], routine: '', activities: '',
  interests: '', personality: '', notes: '',
});

const defaultFamilyData = () => ({
  children: [],
  priorities: [],
  carePreferences: {
    languages: [], careType: '', schedule: '', experience: '',
    maxDistance: '', careEnvironment: '',
  },
  environment: { petsAtHome: false, smokeFree: false },
});

/* ═══════════════════════════════════════════════════════
   CHILD PROFILE MODAL
   ═══════════════════════════════════════════════════════ */
function ChildModal({ child, isNew, onSave, onClose }) {
  const [form, setForm] = useState({ ...child });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleLang = (lang) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSaving(true);
    onSave({ ...form, name: form.name.trim() });
  };

  return (
    <div className="mf-overlay" role="dialog" aria-modal="true" aria-label={isNew ? 'Add Child' : 'Edit Child'} onClick={onClose}>
      <div className="mf-modal" onClick={e => e.stopPropagation()}>
        <div className="mf-modal-head">
          <h2 className="mf-modal-title">{isNew ? 'Add Child' : 'Edit Child Profile'}</h2>
          <button type="button" className="mf-iconbtn" onClick={onClose} aria-label="Close"><Ic.X width={18} height={18} /></button>
        </div>
        <p className="mf-modal-sub">Help AyaFind understand your child so we can find better care.</p>

        <div className="mf-modal-body">
          <div className="mf-field">
            <label className="mf-label">Name <span className="mf-req">*</span></label>
            <input className="mf-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Child's name" />
          </div>

          <div className="mf-row2">
            <div className="mf-field">
              <label className="mf-label">Date of Birth</label>
              <input className="mf-input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
            </div>
            <div className="mf-field">
              <label className="mf-label">Gender</label>
              <select className="mf-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="mf-field">
            <label className="mf-label">Care Type</label>
            <select className="mf-select" value={form.careType} onChange={e => set('careType', e.target.value)}>
              <option value="">Select care type</option>
              {CARE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="mf-field">
            <label className="mf-label">Languages</label>
            <div className="mf-tag-grid">
              {LANGUAGES.map(lang => (
                <button key={lang} type="button"
                  className={`mf-tag${form.languages.includes(lang) ? ' mf-tag-on' : ''}`}
                  onClick={() => toggleLang(lang)}>
                  {form.languages.includes(lang) && <Ic.Check width={12} height={12} />}
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="mf-field">
            <label className="mf-label">Typical Routine</label>
            <input className="mf-input" value={form.routine} onChange={e => set('routine', e.target.value)} placeholder="e.g. School 8-2, nap after lunch" />
          </div>

          <div className="mf-field">
            <label className="mf-label">Activities & Interests</label>
            <input className="mf-input" value={form.interests} onChange={e => set('interests', e.target.value)} placeholder="e.g. Drawing, outdoor play, reading" />
          </div>

          <div className="mf-field">
            <label className="mf-label">Personality</label>
            <input className="mf-input" value={form.personality} onChange={e => set('personality', e.target.value)} placeholder="e.g. Energetic, shy, curious" />
          </div>

          <div className="mf-field">
            <label className="mf-label">Additional Notes for AyaFind</label>
            <textarea className="mf-textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Anything else AyaFind should consider when matching caregivers..." />
          </div>
        </div>

        <div className="mf-modal-foot">
          <button type="button" className="mf-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="mf-btn-primary" onClick={handleSave} disabled={!form.name.trim() || saving}>
            <Ic.Save width={14} height={14} /> {saving ? 'Saving...' : 'Save Child'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CHILD VIEW MODAL
   ═══════════════════════════════════════════════════════ */
function ChildViewModal({ child, onClose, onEdit }) {
  const al = ageLabel(child);
  return (
    <div className="mf-overlay" role="dialog" aria-modal="true" aria-label="Child Profile" onClick={onClose}>
      <div className="mf-modal mf-modal-view" onClick={e => e.stopPropagation()}>
        <div className="mf-modal-head">
          <div className="mf-view-head-left">
            <div className="mf-avatar mf-avatar-lg">{initials(child.name)}</div>
            <div>
              <h2 className="mf-modal-title">{child.name}</h2>
              {al && <p className="mf-view-age">{al}</p>}
            </div>
          </div>
          <button type="button" className="mf-iconbtn" onClick={onClose} aria-label="Close"><Ic.X width={18} height={18} /></button>
        </div>

        <div className="mf-view-grid">
          {child.gender && <ViewField label="Gender" value={child.gender} />}
          {child.careType && <ViewField label="Care Type" value={child.careType} />}
          {child.languages && child.languages.length > 0 && <ViewField label="Languages" value={child.languages.join(' \u00B7 ')} />}
          {child.routine && <ViewField label="Typical Routine" value={child.routine} />}
          {child.interests && <ViewField label="Activities & Interests" value={child.interests} />}
          {child.personality && <ViewField label="Personality" value={child.personality} />}
          {child.notes && <ViewField label="Additional Notes" value={child.notes} full />}
        </div>

        <div className="mf-modal-foot">
          <button type="button" className="mf-btn-ghost" onClick={onClose}>Close</button>
          <button type="button" className="mf-btn-primary" onClick={onEdit}><Ic.Edit width={14} height={14} /> Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

function ViewField({ label, value, full }) {
  return (
    <div className={`mf-view-field${full ? ' mf-view-field-full' : ''}`}>
      <span className="mf-view-flabel">{label}</span>
      <span className="mf-view-fvalue">{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
function MyFamily({ profile, onNavigate }) {
  const [data, setData] = useState(defaultFamilyData);
  const [loaded, setLoaded] = useState(false);
  const [childModal, setChildModal] = useState(null); // null | 'new' | child obj
  const [viewChild, setViewChild] = useState(null);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editingPriorities, setEditingPriorities] = useState(false);
  const [editingEnv, setEditingEnv] = useState(false);

  /* ── Load from localStorage, seed from profile ── */
  useEffect(() => {
    if (!profile) { setLoaded(true); return; }
    try {
      const raw = localStorage.getItem(STORAGE_KEY(profile.email));
      let parsed = raw ? JSON.parse(raw) : defaultFamilyData();
      // Seed from existing parent data
      if (!parsed.children || parsed.children.length === 0) {
        if (profile.child_age != null && profile.child_age !== '') {
          parsed.children = [{
            ...emptyChild(), name: 'Child', age: String(profile.child_age),
            careType: Number(profile.child_age) <= 2 ? 'Infant Care' : Number(profile.child_age) <= 4 ? 'Toddler Care' : 'After-School Care',
          }];
        }
      }
      if (!parsed.carePreferences) parsed.carePreferences = defaultFamilyData().carePreferences;
      if (!parsed.environment) parsed.environment = defaultFamilyData().environment;
      if (!parsed.priorities) parsed.priorities = [];
      // Seed location
      if (profile.location && !parsed.carePreferences.location) {
        parsed.carePreferences.location = profile.location;
      }
      setData(parsed);
    } catch { setData(defaultFamilyData()); }
    setLoaded(true);
  }, [profile]);

  /* ── Persist ── */
  const persist = useCallback((next) => {
    setData(next);
    if (profile) {
      try { localStorage.setItem(STORAGE_KEY(profile.email), JSON.stringify(next)); } catch {}
    }
  }, [profile]);

  /* ── Child CRUD ── */
  const addChild = () => setChildModal('new');
  const editChild = (c) => { setViewChild(null); setChildModal(c); };
  const openViewChild = (c) => setViewChild(c);
  const saveChild = (child) => {
    const next = { ...data };
    const idx = next.children.findIndex(c => c.id === child.id);
    if (idx >= 0) next.children = next.children.map(c => c.id === child.id ? child : c);
    else next.children = [...next.children, child];
    persist(next);
    setChildModal(null);
    // Sync child_age to parent table for first/youngest child
    if (profile && next.children.length > 0) {
      const youngest = next.children.reduce((a, b) => {
        const aa = ageFromDob(a.dateOfBirth) ?? Number(a.age) ?? 99;
        const bb = ageFromDob(b.dateOfBirth) ?? Number(b.age) ?? 99;
        return aa < bb ? a : b;
      });
      const age = ageFromDob(youngest.dateOfBirth) ?? Number(youngest.age) ?? null;
      if (age !== null && age !== profile.child_age) {
        supabase.from('parents').update({ child_age: age }).eq('id', profile.id).then(() => {});
      }
    }
  };
  const deleteChild = (id) => {
    const next = { ...data, children: data.children.filter(c => c.id !== id) };
    persist(next);
    setViewChild(null);
  };

  /* ── Priority toggle ── */
  const togglePriority = (key) => {
    const next = { ...data };
    next.priorities = next.priorities.includes(key)
      ? next.priorities.filter(k => k !== key)
      : [...next.priorities, key];
    persist(next);
  };

  /* ── Preference change ── */
  const setPref = (key, value) => {
    const next = { ...data, carePreferences: { ...data.carePreferences, [key]: value } };
    persist(next);
  };
  const togglePrefLang = (lang) => {
    const langs = data.carePreferences.languages || [];
    setPref('languages', langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang]);
  };

  /* ── Environment change ── */
  const setEnv = (key, value) => {
    const next = { ...data, environment: { ...data.environment, [key]: value } };
    persist(next);
  };

  /* ── Profile completeness ── */
  const completeness = useMemo(() => {
    const factors = [];
    const total = 10;
    if (data.children.length > 0) factors.push('children');
    const hasChildDetail = data.children.some(c => c.name && c.name !== 'Child' && (c.dateOfBirth || c.languages.length > 0 || c.interests));
    if (hasChildDetail) factors.push('childDetail');
    if (data.priorities.length >= 3) factors.push('priorities');
    if ((data.carePreferences.languages || []).length > 0) factors.push('languages');
    if (data.carePreferences.careType) factors.push('careType');
    if (data.carePreferences.schedule) factors.push('schedule');
    if (data.carePreferences.experience) factors.push('experience');
    if (data.carePreferences.maxDistance) factors.push('distance');
    if (data.carePreferences.careEnvironment) factors.push('environment');
    if (profile && profile.location) factors.push('location');
    return { count: factors.length, total, pct: Math.round((factors.length / total) * 100), factors };
  }, [data, profile]);

  /* ── Matching factors ── */
  const matchingFactors = useMemo(() => {
    const has = [];
    const missing = [];
    const check = (label, ok) => (ok ? has.push(label) : missing.push(label));
    check('Child age', data.children.some(c => c.dateOfBirth || c.age));
    check('Language preference', (data.carePreferences.languages || []).length > 0);
    check('Care type', !!data.carePreferences.careType);
    check('Schedule', !!data.carePreferences.schedule);
    check('Family priorities', data.priorities.length >= 2);
    check('Location', !!(profile && profile.location));
    check('Experience level', !!data.carePreferences.experience);
    check('Care environment', !!data.carePreferences.careEnvironment);
    return { has, missing };
  }, [data, profile]);

  /* ── AI Summary ── */
  const aiSummary = useMemo(() => {
    if (data.children.length === 0 && data.priorities.length === 0 && !data.carePreferences.careType) return null;
    const parts = [];
    if (data.children.length > 0) {
      const ages = data.children.map(c => ageLabel(c)).filter(Boolean);
      if (ages.length > 0) parts.push(`${data.children.length === 1 ? 'a' : data.children.length} ${data.children.length === 1 ? 'child' : 'children'} (${ages.join(', ')})`);
    }
    const langs = data.carePreferences.languages || [];
    if (langs.length > 0) parts.push(`speaks ${langs.join(' and ')}`);
    if (data.carePreferences.careType) parts.push(`needs ${data.carePreferences.careType.toLowerCase()}`);
    if (data.carePreferences.schedule) parts.push(`available during ${data.carePreferences.schedule.toLowerCase()}`);
    const topPriorities = data.priorities.slice(0, 2).map(k => PRIORITY_OPTIONS.find(p => p.key === k)?.label?.toLowerCase()).filter(Boolean);
    if (topPriorities.length > 0) parts.push(`values ${topPriorities.join(' and ')}`);
    if (parts.length === 0) return null;
    return `You're looking for a caregiver who ${parts.slice(1).join(', ')}${parts[0] ? ` for ${parts[0]}` : ''}.`;
  }, [data]);

  const prefs = data.carePreferences;

  if (!loaded) return null;

  return (
    <div className="mf-root">
      <style>{MF_CSS}</style>

      {/* ─── FAMILY OVERVIEW ─── */}
      <header className="mf-overview">
        <div className="mf-overview-text">
          <h1 className="mf-title">Your Family</h1>
          <p className="mf-subtitle">Help AyaFind understand your family's needs so we can find better care for you.</p>
        </div>
        <div className="mf-completeness">
          <div className="mf-completeness-ring">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke={C.border} strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none" stroke={C.teal} strokeWidth="4"
                strokeDasharray={`${(completeness.pct / 100) * 150.8} 150.8`}
                strokeLinecap="round" transform="rotate(-90 28 28)" />
              <text x="28" y="32" textAnchor="middle" fill={C.navy} fontSize="14" fontWeight="800" fontFamily={FF}>{completeness.pct}%</text>
            </svg>
          </div>
          <div className="mf-completeness-text">
            <p className="mf-completeness-label">Family profile {completeness.pct}% complete</p>
            <p className="mf-completeness-sub">Complete your profile to help AyaFind make more personalized recommendations.</p>
          </div>
        </div>
      </header>

      {/* ─── Overview Summary Cards ─── */}
      <div className="mf-summary-grid">
        {data.children.length > 0 && <SummaryCard icon={<Ic.Users width={16} height={16} />} label="Children" value={`${data.children.length} ${data.children.length === 1 ? 'child' : 'children'}`} />}
        {(prefs.languages || []).length > 0 && <SummaryCard icon={<Ic.Globe width={16} height={16} />} label="Languages" value={prefs.languages.join(' \u00B7 ')} />}
        {prefs.careType && <SummaryCard icon={<Ic.Heart width={16} height={16} />} label="Care Type" value={prefs.careType} />}
        {profile && profile.location && <SummaryCard icon={<Ic.MapPin width={16} height={16} />} label="Location" value={profile.location} />}
        {prefs.schedule && <SummaryCard icon={<Ic.Clock width={16} height={16} />} label="Schedule" value={prefs.schedule} />}
      </div>

      {/* ─── CHILDREN ─── */}
      <section className="mf-section" aria-label="Children">
        <div className="mf-section-head">
          <div>
            <h2 className="mf-section-title">Children</h2>
            <p className="mf-section-sub">Each child helps AyaFind personalize caregiver recommendations.</p>
          </div>
          <button type="button" className="mf-btn-coral" onClick={addChild}><Ic.Plus width={14} height={14} /> Add Child</button>
        </div>
        {data.children.length === 0 ? (
          <div className="mf-empty">
            <div className="mf-empty-icon"><Ic.Baby width={24} height={24} /></div>
            <h3 className="mf-empty-title">No child profiles yet</h3>
            <p className="mf-empty-text">Add your child's information to help AyaFind personalize recommendations.</p>
            <button type="button" className="mf-btn-primary" onClick={addChild}><Ic.Plus width={14} height={14} /> Add Your First Child</button>
          </div>
        ) : (
          <div className="mf-children-grid">
            {data.children.map(child => (
              <ChildCard key={child.id} child={child} onView={() => openViewChild(child)} onEdit={() => editChild(child)} onDelete={() => deleteChild(child.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ─── WHAT MATTERS TO US ─── */}
      <section className="mf-section" aria-label="Family priorities">
        <div className="mf-section-head">
          <div>
            <h2 className="mf-section-title">What Matters to Us</h2>
            <p className="mf-section-sub">Choose the things that are most important when AyaFind recommends a caregiver.</p>
          </div>
          {!editingPriorities && (
            <button type="button" className="mf-btn-ghost-sm" onClick={() => setEditingPriorities(true)}>
              <Ic.Edit width={13} height={13} /> {data.priorities.length > 0 ? 'Edit' : 'Select'}
            </button>
          )}
        </div>
        {data.priorities.length === 0 && !editingPriorities ? (
          <div className="mf-empty-inline">
            <p>Tell us what matters most to your family.</p>
            <button type="button" className="mf-btn-ghost-sm" onClick={() => setEditingPriorities(true)}>Choose Priorities</button>
          </div>
        ) : (
          <div className="mf-priorities">
            {PRIORITY_OPTIONS.map(opt => {
              const on = data.priorities.includes(opt.key);
              return (
                <button key={opt.key} type="button"
                  className={`mf-priority${on ? ' mf-priority-on' : ''}${!editingPriorities && !on ? ' mf-priority-off' : ''}`}
                  onClick={() => editingPriorities && togglePriority(opt.key)}
                  disabled={!editingPriorities}>
                  <div className="mf-priority-check">
                    {on ? <Ic.CheckCircle width={16} height={16} /> : <Ic.Circle width={16} height={16} />}
                  </div>
                  <div>
                    <p className="mf-priority-label">{opt.label}</p>
                    <p className="mf-priority-desc">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
            {editingPriorities && (
              <button type="button" className="mf-btn-primary mf-mt12" onClick={() => setEditingPriorities(false)}>
                <Ic.Check width={14} height={14} /> Done
              </button>
            )}
          </div>
        )}
      </section>

      {/* ─── CARE PREFERENCES ─── */}
      <section className="mf-section" aria-label="Care preferences">
        <div className="mf-section-head">
          <div>
            <h2 className="mf-section-title">Our Care Preferences</h2>
            <p className="mf-section-sub">These preferences help AyaFind find the right caregiver for your family.</p>
          </div>
          <button type="button" className="mf-btn-ghost-sm" onClick={() => setEditingPrefs(!editingPrefs)}>
            <Ic.Edit width={13} height={13} /> {editingPrefs ? 'Done' : 'Edit Preferences'}
          </button>
        </div>

        {editingPrefs ? (
          <div className="mf-prefs-edit">
            <div className="mf-field">
              <label className="mf-label">Preferred Languages</label>
              <div className="mf-tag-grid">
                {LANGUAGES.map(lang => (
                  <button key={lang} type="button"
                    className={`mf-tag${(prefs.languages || []).includes(lang) ? ' mf-tag-on' : ''}`}
                    onClick={() => togglePrefLang(lang)}>
                    {(prefs.languages || []).includes(lang) && <Ic.Check width={12} height={12} />}
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="mf-row2">
              <div className="mf-field">
                <label className="mf-label">Care Type</label>
                <select className="mf-select" value={prefs.careType} onChange={e => setPref('careType', e.target.value)}>
                  <option value="">Select</option>
                  {CARE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mf-field">
                <label className="mf-label">Schedule</label>
                <select className="mf-select" value={prefs.schedule} onChange={e => setPref('schedule', e.target.value)}>
                  <option value="">Select</option>
                  {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mf-row2">
              <div className="mf-field">
                <label className="mf-label">Caregiver Experience</label>
                <select className="mf-select" value={prefs.experience} onChange={e => setPref('experience', e.target.value)}>
                  <option value="">Select</option>
                  {EXPERIENCE_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="mf-field">
                <label className="mf-label">Maximum Distance</label>
                <select className="mf-select" value={prefs.maxDistance} onChange={e => setPref('maxDistance', e.target.value)}>
                  <option value="">Select</option>
                  {DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="mf-prefs-display">
            <PrefRow icon={<Ic.Globe width={16} height={16} />} label="Languages"
              value={(prefs.languages || []).length > 0 ? prefs.languages.join(' \u00B7 ') : null} />
            <PrefRow icon={<Ic.Heart width={16} height={16} />} label="Care"
              value={prefs.careType || null} />
            <PrefRow icon={<Ic.Clock width={16} height={16} />} label="Schedule"
              value={prefs.schedule || null} />
            <PrefRow icon={<Ic.Award width={16} height={16} />} label="Experience"
              value={prefs.experience || null} />
            <PrefRow icon={<Ic.MapPin width={16} height={16} />} label="Distance"
              value={prefs.maxDistance || null} />
          </div>
        )}
      </section>

      {/* ─── CARE ENVIRONMENT ─── */}
      <section className="mf-section" aria-label="Care environment">
        <div className="mf-section-head">
          <div>
            <h2 className="mf-section-title">Care Environment</h2>
            <p className="mf-section-sub">Help AyaFind understand your preferred care setting.</p>
          </div>
          {!editingEnv && (
            <button type="button" className="mf-btn-ghost-sm" onClick={() => setEditingEnv(true)}>
              <Ic.Edit width={13} height={13} /> Edit
            </button>
          )}
        </div>
        {editingEnv ? (
          <div className="mf-env-edit">
            <div className="mf-field">
              <label className="mf-label">Preferred Care Setting</label>
              <div className="mf-env-options">
                {ENVIRONMENTS.map(env => (
                  <button key={env} type="button"
                    className={`mf-env-opt${prefs.careEnvironment === env ? ' mf-env-opt-on' : ''}`}
                    onClick={() => setPref('careEnvironment', env)}>
                    {prefs.careEnvironment === env ? <Ic.CheckCircle width={16} height={16} /> : <Ic.Circle width={16} height={16} />}
                    <span>{env}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mf-env-checks">
              <label className="mf-check">
                <input type="checkbox" checked={data.environment.petsAtHome} onChange={e => setEnv('petsAtHome', e.target.checked)} />
                <span>Pets at home</span>
              </label>
              <label className="mf-check">
                <input type="checkbox" checked={data.environment.smokeFree} onChange={e => setEnv('smokeFree', e.target.checked)} />
                <span>Smoke-free environment preferred</span>
              </label>
            </div>
            <button type="button" className="mf-btn-primary mf-mt12" onClick={() => setEditingEnv(false)}>
              <Ic.Check width={14} height={14} /> Done
            </button>
          </div>
        ) : (
          <div className="mf-env-display">
            {prefs.careEnvironment ? (
              <div className="mf-env-badge"><Ic.Home width={14} height={14} /> {prefs.careEnvironment}</div>
            ) : (
              <p className="mf-env-empty">No care setting selected yet.</p>
            )}
            <div className="mf-env-tags">
              {data.environment.petsAtHome && <span className="mf-env-tag">Pets at home</span>}
              {data.environment.smokeFree && <span className="mf-env-tag">Smoke-free preferred</span>}
            </div>
          </div>
        )}
      </section>

      {/* ─── AI FAMILY PROFILE ─── */}
      <section className="mf-section mf-ai-section" aria-label="AI family profile">
        <div className="mf-ai-badge"><Ic.Sparkles width={16} height={16} /> AyaFind Intelligence</div>
        <h2 className="mf-section-title">AyaFind Understands Your Family</h2>
        {aiSummary ? (
          <>
            <p className="mf-ai-summary">{aiSummary}</p>
            <div className="mf-ai-status">
              <Ic.CheckCircle width={13} height={13} /> Profile used for matching
            </div>
          </>
        ) : (
          <>
            <p className="mf-ai-placeholder">Complete your family preferences to generate your personalized AyaFind profile.</p>
            <button type="button" className="mf-btn-primary" onClick={() => { if (data.children.length === 0) addChild(); else setEditingPrefs(true); }}>
              <Ic.ArrowRight width={14} height={14} /> Complete Profile
            </button>
          </>
        )}
      </section>

      {/* ─── MATCHING FACTORS ─── */}
      <section className="mf-section" aria-label="Matching factors">
        <h2 className="mf-section-title">Your Matching Factors</h2>
        <p className="mf-section-sub">Information AyaFind uses for personalized caregiver matching.</p>
        <div className="mf-factors">
          {matchingFactors.has.map(f => (
            <div key={f} className="mf-factor mf-factor-on">
              <Ic.CheckCircle width={15} height={15} /> <span>{f}</span>
            </div>
          ))}
          {matchingFactors.missing.map(f => (
            <div key={f} className="mf-factor mf-factor-off">
              <Ic.Circle width={15} height={15} /> <span>{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRIVACY ─── */}
      <section className="mf-privacy" aria-label="Privacy information">
        <div className="mf-privacy-icon"><Ic.Lock width={16} height={16} /></div>
        <div>
          <h3 className="mf-privacy-title">Your Privacy Matters</h3>
          <p className="mf-privacy-text">
            Family information is used internally by AyaFind to improve caregiver matching. Not every detail is shared with caregivers automatically.
            Sensitive information is only shared when necessary and appropriate for a booking.
          </p>
        </div>
      </section>

      {/* ─── MODALS ─── */}
      {childModal && (
        <ChildModal
          child={childModal === 'new' ? emptyChild() : childModal}
          isNew={childModal === 'new'}
          onSave={saveChild}
          onClose={() => setChildModal(null)}
        />
      )}
      {viewChild && (
        <ChildViewModal
          child={viewChild}
          onClose={() => setViewChild(null)}
          onEdit={() => editChild(viewChild)}
        />
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */
function SummaryCard({ icon, label, value }) {
  return (
    <div className="mf-summary-card">
      <div className="mf-summary-icon">{icon}</div>
      <div>
        <p className="mf-summary-label">{label}</p>
        <p className="mf-summary-value">{value}</p>
      </div>
    </div>
  );
}

function ChildCard({ child, onView, onEdit, onDelete }) {
  const al = ageLabel(child);
  const personalityBits = [child.personality, child.interests].filter(Boolean).join(' \u00B7 ');
  return (
    <article className="mf-child-card">
      <div className="mf-child-top">
        <div className="mf-avatar mf-avatar-coral">{initials(child.name)}</div>
        <div className="mf-child-info">
          <h3 className="mf-child-name">{child.name}</h3>
          {al && <p className="mf-child-age">{al}</p>}
        </div>
        <button type="button" className="mf-iconbtn mf-iconbtn-sm" onClick={onDelete} aria-label="Remove child" title="Remove"><Ic.Trash width={14} height={14} /></button>
      </div>
      <div className="mf-child-meta">
        {child.languages && child.languages.length > 0 && (
          <span className="mf-child-meta-item"><Ic.Globe width={12} height={12} /> {child.languages.join(' \u00B7 ')}</span>
        )}
        {child.careType && (
          <span className="mf-child-meta-item"><Ic.Heart width={12} height={12} /> {child.careType}</span>
        )}
      </div>
      {personalityBits && <p className="mf-child-personality">&ldquo;{personalityBits}&rdquo;</p>}
      <div className="mf-child-actions">
        <button type="button" className="mf-btn-ghost-sm" onClick={onView}><Ic.Eye width={13} height={13} /> View Profile</button>
        <button type="button" className="mf-btn-ghost-sm" onClick={onEdit}><Ic.Edit width={13} height={13} /> Edit</button>
      </div>
    </article>
  );
}

function PrefRow({ icon, label, value }) {
  return (
    <div className="mf-pref-row">
      <div className="mf-pref-icon">{icon}</div>
      <div className="mf-pref-content">
        <span className="mf-pref-label">{label}</span>
        <span className={`mf-pref-value${!value ? ' mf-pref-empty' : ''}`}>{value || 'Not set'}</span>
      </div>
    </div>
  );
}

export default MyFamily;

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const MF_CSS = `
.mf-root{font-family:${FF};color:${C.text};-webkit-font-smoothing:antialiased;animation:mfFade .35s ease both;}
.mf-root *,.mf-root *::before,.mf-root *::after{box-sizing:border-box;}
.mf-root button{font-family:inherit;cursor:pointer;}
.mf-root h1,.mf-root h2,.mf-root h3,.mf-root p{margin:0;}
.mf-overview{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:28px;flex-wrap:wrap;}
.mf-title{font-size:clamp(24px,3vw,30px);font-weight:800;color:${C.navy};letter-spacing:-0.025em;line-height:1.2;}
.mf-subtitle{margin-top:8px;font-size:15px;color:${C.textSec};line-height:1.55;max-width:520px;}
.mf-completeness{display:flex;align-items:center;gap:14px;flex-shrink:0;}
.mf-completeness-ring{flex-shrink:0;}
.mf-completeness-label{font-size:13.5px;font-weight:700;color:${C.navy};}
.mf-completeness-sub{font-size:12px;color:${C.textMuted};line-height:1.5;margin-top:2px;max-width:220px;}
.mf-summary-grid{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:32px;}
.mf-summary-card{display:flex;align-items:center;gap:12px;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:14px 18px;min-width:170px;flex:1;max-width:240px;}
.mf-summary-icon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.mf-summary-label{font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};}
.mf-summary-value{font-size:14px;font-weight:700;color:${C.text};margin-top:2px;}
.mf-section{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:24px 28px;margin-bottom:24px;animation:mfFadeUp .35s ease both;}
.mf-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px;}
.mf-section-title{font-size:18px;font-weight:800;color:${C.navy};letter-spacing:-0.015em;}
.mf-section-sub{font-size:13.5px;color:${C.textSec};margin-top:4px;line-height:1.5;}
.mf-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:40px 20px;}
.mf-empty-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:14px;}
.mf-empty-title{font-size:16px;font-weight:800;color:${C.navy};margin-bottom:6px;}
.mf-empty-text{font-size:13.5px;color:${C.textSec};line-height:1.55;margin-bottom:18px;max-width:340px;}
.mf-empty-inline{text-align:center;padding:24px 16px;color:${C.textSec};font-size:14px;}
.mf-empty-inline button{margin-top:10px;}
.mf-children-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
.mf-child-card{background:${C.bg};border:1px solid ${C.border};border-radius:14px;padding:20px;transition:transform .2s,box-shadow .2s,border-color .2s;}
.mf-child-card:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(23,36,61,.07);border-color:rgba(39,143,135,.2);}
.mf-child-top{display:flex;align-items:center;gap:14px;margin-bottom:12px;}
.mf-child-info{flex:1;min-width:0;}
.mf-child-name{font-size:16px;font-weight:800;color:${C.navy};}
.mf-child-age{font-size:13px;color:${C.textSec};margin-top:2px;}
.mf-child-meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;}
.mf-child-meta-item{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:${C.textSec};font-weight:600;}
.mf-child-meta-item svg{color:${C.teal};flex-shrink:0;}
.mf-child-personality{font-size:13px;color:${C.textSec};font-style:italic;line-height:1.5;margin-bottom:12px;}
.mf-child-actions{display:flex;gap:8px;padding-top:12px;border-top:1px solid ${C.border};}
.mf-avatar{width:44px;height:44px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;}
.mf-avatar-lg{width:52px;height:52px;font-size:18px;}
.mf-avatar-coral{background:${C.coralSoft};color:${C.coral};}
.mf-priorities{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}
.mf-priority{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1.5px solid ${C.border};border-radius:12px;background:#fff;text-align:left;transition:all .2s;font-family:inherit;}
.mf-priority:hover:not(:disabled){border-color:rgba(39,143,135,.3);background:${C.tealSoft};}
.mf-priority-on{border-color:${C.teal};background:${C.tealSoft};}
.mf-priority-off{opacity:.55;}
.mf-priority:disabled{cursor:default;}
.mf-priority-check{display:flex;align-items:center;justify-content:center;width:22px;height:22px;flex-shrink:0;margin-top:1px;}
.mf-priority-on .mf-priority-check{color:${C.teal};}
.mf-priority:not(.mf-priority-on) .mf-priority-check{color:${C.textMuted};}
.mf-priority-label{font-size:14px;font-weight:700;color:${C.navy};}
.mf-priority-desc{font-size:12px;color:${C.textSec};margin-top:2px;line-height:1.45;}
.mf-prefs-display{display:flex;flex-direction:column;gap:1px;background:${C.border};border:1px solid ${C.border};border-radius:12px;overflow:hidden;}
.mf-pref-row{display:flex;align-items:center;gap:14px;padding:14px 18px;background:${C.card};}
.mf-pref-icon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.mf-pref-content{display:flex;flex-direction:column;gap:1px;}
.mf-pref-label{font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.textMuted};}
.mf-pref-value{font-size:14px;font-weight:700;color:${C.text};}
.mf-pref-empty{color:${C.textMuted};font-weight:500;font-style:italic;}
.mf-prefs-edit{display:flex;flex-direction:column;gap:18px;}
.mf-env-options{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:8px;}
.mf-env-opt{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1.5px solid ${C.border};border-radius:11px;background:#fff;font-family:inherit;font-size:13.5px;font-weight:600;color:${C.text};transition:all .2s;}
.mf-env-opt:hover{border-color:rgba(39,143,135,.3);}
.mf-env-opt-on{border-color:${C.teal};background:${C.tealSoft};color:${C.navy};font-weight:700;}
.mf-env-opt svg{flex-shrink:0;}
.mf-env-opt-on svg{color:${C.teal};}
.mf-env-opt:not(.mf-env-opt-on) svg{color:${C.textMuted};}
.mf-env-checks{display:flex;flex-direction:column;gap:10px;margin-top:14px;}
.mf-check{display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:600;color:${C.text};cursor:pointer;}
.mf-check input{accent-color:${C.teal};width:16px;height:16px;cursor:pointer;}
.mf-env-display{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.mf-env-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:11px;background:${C.tealSoft};color:#1F7A73;font-size:14px;font-weight:700;}
.mf-env-badge svg{color:${C.teal};}
.mf-env-empty{font-size:14px;color:${C.textMuted};font-style:italic;}
.mf-env-tags{display:flex;gap:8px;}
.mf-env-tag{display:inline-flex;padding:5px 12px;border-radius:999px;background:${C.bg};border:1px solid ${C.border};font-size:12px;font-weight:600;color:${C.textSec};}
.mf-ai-section{background:linear-gradient(135deg,${C.card} 0%,${C.tealSoft} 100%);border-top:3px solid ${C.teal};}
.mf-ai-badge{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${C.teal};margin-bottom:12px;}
.mf-ai-summary{font-size:16px;font-weight:600;color:${C.navy};line-height:1.65;margin:14px 0;max-width:600px;}
.mf-ai-status{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:${C.greenBg};color:${C.green};font-size:12px;font-weight:700;margin-top:4px;}
.mf-ai-placeholder{font-size:14.5px;color:${C.textSec};line-height:1.55;margin:14px 0 18px;}
.mf-factors{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}
.mf-factor{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;}
.mf-factor-on{background:${C.greenBg};color:${C.green};}
.mf-factor-on svg{color:${C.green};}
.mf-factor-off{background:${C.bg};color:${C.textMuted};border:1px solid ${C.border};}
.mf-factor-off svg{color:${C.textMuted};}
.mf-privacy{display:flex;align-items:flex-start;gap:14px;background:${C.bg};border:1px solid ${C.border};border-radius:14px;padding:20px 24px;margin-top:8px;margin-bottom:8px;}
.mf-privacy-icon{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:${C.card};border:1px solid ${C.border};color:${C.textSec};flex-shrink:0;}
.mf-privacy-title{font-size:14px;font-weight:800;color:${C.navy};margin-bottom:4px;}
.mf-privacy-text{font-size:13px;color:${C.textSec};line-height:1.6;}
.mf-field{display:flex;flex-direction:column;gap:6px;}
.mf-label{font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.textSec};}
.mf-req{color:${C.coral};}
.mf-input{width:100%;padding:12px 14px;border:1.5px solid ${C.border};border-radius:11px;font-family:${FF};font-size:14px;color:${C.text};background:${C.bg};transition:border-color .2s,box-shadow .2s,background .2s;box-sizing:border-box;}
.mf-input:focus{outline:none;border-color:${C.teal};background:#fff;box-shadow:0 0 0 3px rgba(39,143,135,.12);}
.mf-select{width:100%;padding:12px 14px;border:1.5px solid ${C.border};border-radius:11px;font-family:${FF};font-size:14px;color:${C.text};background:${C.bg};transition:border-color .2s;box-sizing:border-box;appearance:none;-webkit-appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path d="M1 1l5 5 5-5" stroke="#657081" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')}") ;background-repeat:no-repeat;background-position:right 14px center;}
.mf-select:focus{outline:none;border-color:${C.teal};}
.mf-textarea{width:100%;padding:12px 14px;border:1.5px solid ${C.border};border-radius:11px;font-family:${FF};font-size:14px;color:${C.text};background:${C.bg};resize:vertical;transition:border-color .2s,box-shadow .2s;box-sizing:border-box;}
.mf-textarea:focus{outline:none;border-color:${C.teal};background:#fff;box-shadow:0 0 0 3px rgba(39,143,135,.12);}
.mf-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.mf-tag-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}
.mf-tag{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border:1.5px solid ${C.border};border-radius:999px;background:#fff;font-family:${FF};font-size:13px;font-weight:600;color:${C.text};transition:all .2s;cursor:pointer;}
.mf-tag:hover{border-color:rgba(39,143,135,.3);background:${C.tealSoft};}
.mf-tag-on{border-color:${C.teal};background:${C.tealSoft};color:${C.navy};font-weight:700;}
.mf-tag-on svg{color:${C.teal};}
.mf-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 22px;border:none;border-radius:11px;background:${C.teal};color:#fff;font-family:${FF};font-size:13.5px;font-weight:700;box-shadow:0 4px 14px rgba(39,143,135,.2);transition:background .2s,box-shadow .2s,transform .15s;}
.mf-btn-primary:hover:not(:disabled){background:#1F7A73;box-shadow:0 6px 18px rgba(39,143,135,.3);transform:translateY(-1px);}
.mf-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.mf-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border:1.5px solid ${C.border};border-radius:10px;background:#fff;color:${C.text};font-family:${FF};font-size:13px;font-weight:700;transition:all .2s;}
.mf-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.mf-btn-ghost-sm{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1px solid ${C.border};border-radius:9px;background:#fff;color:${C.textSec};font-family:${FF};font-size:12.5px;font-weight:700;transition:all .2s;}
.mf-btn-ghost-sm:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.mf-btn-coral{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 18px;border:none;border-radius:10px;background:${C.coral};color:#fff;font-family:${FF};font-size:13px;font-weight:700;box-shadow:0 4px 14px rgba(244,124,92,.18);transition:background .2s,transform .15s;}
.mf-btn-coral:hover{background:#E86A48;transform:translateY(-1px);}
.mf-iconbtn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:9px;background:${C.bg};color:${C.textSec};transition:background .2s,color .2s;flex-shrink:0;}
.mf-iconbtn:hover{background:${C.border};color:${C.text};}
.mf-iconbtn-sm{width:28px;height:28px;border-radius:8px;background:transparent;}
.mf-iconbtn-sm:hover{background:${C.coralSoft};color:${C.coral};}
.mf-mt12{margin-top:12px;}
.mf-overlay{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(17,27,46,.55);animation:mfFade .2s ease;z-index:100;}
.mf-modal{width:100%;max-width:560px;max-height:90vh;overflow-y:auto;background:#fff;border-radius:18px;padding:28px;box-shadow:0 24px 60px rgba(17,27,46,.3);animation:mfFadeUp .25s ease both;}
.mf-modal::-webkit-scrollbar{width:6px;}
.mf-modal::-webkit-scrollbar-track{background:transparent;}
.mf-modal::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
.mf-modal-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:6px;}
.mf-modal-title{font-size:19px;font-weight:800;color:${C.navy};}
.mf-modal-sub{font-size:13.5px;color:${C.textSec};line-height:1.5;margin-bottom:22px;}
.mf-modal-body{display:flex;flex-direction:column;gap:16px;margin-bottom:24px;}
.mf-modal-foot{display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid ${C.border};}
.mf-modal-view{max-width:500px;}
.mf-view-head-left{display:flex;align-items:center;gap:14px;}
.mf-view-age{font-size:13px;color:${C.textSec};margin-top:2px;}
.mf-view-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:${C.border};border:1px solid ${C.border};border-radius:12px;overflow:hidden;margin:20px 0;}
.mf-view-field{display:flex;flex-direction:column;gap:3px;padding:13px 16px;background:${C.card};}
.mf-view-field-full{grid-column:1/-1;}
.mf-view-flabel{font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.textMuted};}
.mf-view-fvalue{font-size:14px;font-weight:600;color:${C.text};line-height:1.5;}
@keyframes mfFade{from{opacity:0;}to{opacity:1;}}
@keyframes mfFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@media(max-width:1024px){.mf-summary-card{max-width:none;min-width:150px;}.mf-children-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));}}
@media(max-width:768px){.mf-overview{flex-direction:column;gap:16px;}.mf-summary-grid{gap:8px;}.mf-summary-card{min-width:140px;flex:1 1 calc(50% - 8px);max-width:none;}.mf-section{padding:20px;}.mf-priorities{grid-template-columns:1fr;}.mf-env-options{grid-template-columns:1fr;}.mf-row2{grid-template-columns:1fr;}.mf-view-grid{grid-template-columns:1fr;}.mf-modal{padding:22px;border-radius:16px;}.mf-children-grid{grid-template-columns:1fr;}}
@media(max-width:480px){.mf-section{padding:18px 16px;}.mf-summary-card{flex:1 1 100%;}.mf-child-actions{flex-direction:column;}.mf-child-actions button{width:100%;}.mf-modal-foot{flex-direction:column;}.mf-modal-foot button{width:100%;}.mf-completeness{flex-direction:column;align-items:flex-start;}}
@media(max-width:390px){.mf-overview{margin-bottom:20px;}.mf-title{font-size:22px;}.mf-section{padding:16px 14px;margin-bottom:16px;}.mf-summary-grid{margin-bottom:20px;}}
@media(prefers-reduced-motion:reduce){.mf-root *,.mf-root *::before,.mf-root *::after{animation-duration:0.001s!important;transition-duration:0.001s!important;}}
`;
