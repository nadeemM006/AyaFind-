import React, { useState } from 'react';
import { supabase } from '../supabase';

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — warm · premium · human · intelligent
   (matching Landing.js design system)
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
  Check: (p) => <svg {...sv} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowLeft: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Eye: (p) => <svg {...sv} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (p) => <svg {...sv} {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Users: (p) => <svg {...sv} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Heart: (p) => <svg {...sv} {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>,
};

/* ═══════════════════════════════════════════════════════
   LOGO — parent & child (care + family + connection)
   ═══════════════════════════════════════════════════════ */
const Logo = ({ dark }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
    <svg width="34" height="34" viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <circle cx="10" cy="6" r="3.5" stroke={dark ? '#fff' : C.navy} strokeWidth="1.8" fill="none"/>
      <path d="M4.5 29v-8c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5v8" stroke={dark ? '#fff' : C.navy} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="20.5" cy="11.5" r="2.8" stroke={C.teal} strokeWidth="1.8" fill="none"/>
      <path d="M16 29v-6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v6" stroke={C.teal} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M15 16.5c-.5-.5-1.2-.5-1.7 0s-.5 1.2 0 1.7L15 20l1.7-1.8c.5-.5.5-1.2 0-1.7s-1.2-.5-1.7 0z" fill={C.coral}/>
    </svg>
    <span style={{ fontSize: '22px', fontWeight: '800', color: dark ? '#fff' : C.navy, letterSpacing: '-0.025em' }}>
      Aya<span style={{ color: C.teal }}>Find</span>
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Other'];
const EXPERIENCE = ['1-2 years', '3-5 years', '5-10 years', '10+ years'];
const chevron = (bg) => `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='#657081' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>"
)}") no-repeat right 16px center ${bg}`;

/* ═══════════════════════════════════════════════════════
   SHARED FIELD STYLES
   ═══════════════════════════════════════════════════════ */
const inputStyle = { width: '100%', padding: '14px 16px', fontSize: '14px', border: `1.5px solid ${C.border}`, borderRadius: '12px', outline: 'none', fontFamily: FF, background: C.bg, color: C.text, transition: 'border-color .2s, background .2s, box-shadow .2s', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '7px' };
const RED = '#D14343';

const toggleBase = { flex: 1, padding: '11px', borderRadius: '10px', fontSize: '14px', fontFamily: FF, cursor: 'pointer', transition: 'all .25s', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const toggleOn = { ...toggleBase, background: C.navy, color: '#fff', fontWeight: '700', border: '1.5px solid transparent', boxShadow: '0 4px 14px rgba(24,36,61,.22)' };
const toggleOff = { ...toggleBase, background: C.bg, color: C.textMuted, fontWeight: '600', border: `1.5px solid ${C.border}` };

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
function Register() {
  const [role, setRole] = useState('parent');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', location: '',
    experience_years: '', rate_per_hour: '', bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [focusField, setFocusField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  /* Field styling — focus (teal) takes precedence, then error (red) */
  const fStyle = (name, extra = {}) => ({
    ...inputStyle,
    ...extra,
    borderColor: focusField === name ? C.teal : errors[name] ? RED : C.border,
    background: focusField === name ? '#fff' : C.bg,
    boxShadow: focusField === name ? '0 0 0 3px rgba(39,143,135,.12)' : 'none',
  });
  const sStyle = (name) => ({
    ...inputStyle,
    appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
    background: chevron(focusField === name ? '#fff' : C.bg),
    paddingRight: '44px', cursor: 'pointer',
    borderColor: focusField === name ? C.teal : errors[name] ? RED : C.border,
    boxShadow: focusField === name ? '0 0 0 3px rgba(39,143,135,.12)' : 'none',
  });
  const FieldErr = ({ name }) => errors[name] ? (
    <div id={`reg-${name}-err`} style={{ fontSize: '12px', color: RED, fontWeight: '500', marginTop: '6px', lineHeight: 1.45 }}>{errors[name]}</div>
  ) : null;

  /* Validation — same rules as before (required fields + email format), surfaced per field */
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your full name.';
    if (!form.email.trim()) errs.email = 'Please enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Please enter a password.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.phone.trim()) errs.phone = 'Please enter your phone number.';
    if (!form.location) errs.location = 'Please select your city.';
    if (role === 'aya') {
      if (!form.experience_years) errs.experience_years = 'Please select your years of experience.';
      if (form.rate_per_hour === '') errs.rate_per_hour = 'Please enter your hourly rate.';
      if (!form.bio.trim()) errs.bio = 'Please write a short bio.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setMessage(null);

    try {
      // Step 1 - Create auth account
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // Step 2 - Save profile to correct table
      const table = role === 'parent' ? 'parents' : 'ayas';
      const profile = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
      };
      if (role === 'aya') {
        profile.experience_years = form.experience_years;
        profile.rate_per_hour = form.rate_per_hour;
        profile.bio = form.bio;
      }

      const { error: profileError } = await supabase
        .from(table)
        .insert([profile]);

      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Account created! Redirecting...' });
      setTimeout(() => {
        window.location.href = role === 'parent' ? '/parent-dashboard' : '/aya-dashboard';
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: FF, color: C.text, background: C.navy, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body{margin:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease both}
        .back-link{color:rgba(255,255,255,.5);text-decoration:none;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:8px;transition:color .2s}
        .back-link:hover{color:#fff}
        .reg-btn{background:${C.teal};color:#fff;width:100%;padding:16px;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:${FF};cursor:pointer;transition:background .2s,box-shadow .2s,transform .2s;box-shadow:0 6px 20px rgba(39,143,135,0.35)}
        .reg-btn:hover:not(:disabled){background:#1F7A73;box-shadow:0 10px 28px rgba(39,143,135,0.45);transform:translateY(-1px)}
        .reg-btn:disabled{opacity:.8;cursor:default}
        .eye-btn{background:none;border:none;cursor:pointer;color:${C.teal};padding:6px;display:flex;align-items:center;border-radius:8px;transition:color .2s}
        .eye-btn:hover{color:#1F7A73}
        .eye-btn:focus-visible{outline:2px solid ${C.teal};outline-offset:2px}
        .pseudo-link{background:none;border:none;padding:0;font:inherit;font-size:inherit;color:${C.teal};font-weight:600;text-decoration:none;cursor:pointer}
        .pseudo-link:hover{text-decoration:underline;text-underline-offset:2px}
        .pseudo-link:focus-visible{outline:2px solid ${C.teal};outline-offset:2px;border-radius:4px}
        @media(prefers-reduced-motion:reduce){
          .fade-up{animation:none!important}
          .reg-btn:hover:not(:disabled){transform:none}
        }
        @media(max-width:600px){
          .reg-card{padding:28px!important;border-radius:16px!important}
          .reg-nav{padding:18px 16px!important}
        }
        @media(max-width:380px){
          .reg-toggle{font-size:12.5px!important;padding:11px 8px!important}
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-12%', right: '-8%', width: '620px', height: '620px', borderRadius: '50%', background: `radial-gradient(circle, ${C.teal}14, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-12%', left: '-10%', width: '520px', height: '520px', borderRadius: '50%', background: `radial-gradient(circle, ${C.coral}0F, transparent 70%)`, pointerEvents: 'none' }} />

      {/* ═══════ TOP NAVBAR ═══════ */}
      <nav className="reg-nav" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '28px 40px' }}>
        <a href="/" className="back-link" style={{ justifySelf: 'start' }} aria-label="Back to home">
          <Ic.ArrowLeft width={16} height={16} /> Back to Home
        </a>
        <Logo dark />
        <div />
      </nav>

      {/* ═══════ CENTER CARD ═══════ */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 64px', position: 'relative', zIndex: 1 }}>
        <div className="reg-card fade-up" style={{ background: C.card, borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '48px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.navy, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Create Account</h1>
          <p style={{ fontSize: '13px', color: C.textSec, margin: '0 0 28px', lineHeight: 1.6 }}>Join AyaFind — Pakistan&rsquo;s intelligent childcare platform</p>

          {/* Role toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button type="button" className="reg-toggle" onClick={() => setRole('parent')} aria-pressed={role === 'parent'} style={role === 'parent' ? toggleOn : toggleOff}>
              <Ic.Users width={17} height={17} style={{ flexShrink: 0 }} /> I&rsquo;m a Parent
            </button>
            <button type="button" className="reg-toggle" onClick={() => setRole('aya')} aria-pressed={role === 'aya'} style={role === 'aya' ? toggleOn : toggleOff}>
              <Ic.Heart width={17} height={17} style={{ flexShrink: 0 }} /> I&rsquo;m an Aya
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="reg-name" style={labelStyle}>Full Name</label>
              <input id="reg-name" name="name" placeholder="Full Name" autoComplete="name" value={form.name} onChange={handleChange} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'reg-name-err' : undefined} style={fStyle('name')} onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)} />
              <FieldErr name="name" />
            </div>

            <div>
              <label htmlFor="reg-email" style={labelStyle}>Email Address</label>
              <input id="reg-email" name="email" type="email" placeholder="Email Address" autoComplete="email" value={form.email} onChange={handleChange} required aria-invalid={!!errors.email} aria-describedby={errors.email ? 'reg-email-err' : undefined} style={fStyle('email')} onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} />
              <FieldErr name="email" />
            </div>

            <div>
              <label htmlFor="reg-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" autoComplete="new-password" value={form.password} onChange={handleChange} required aria-invalid={!!errors.password} aria-describedby={errors.password ? 'reg-password-err' : undefined} style={fStyle('password', { paddingRight: '48px' })} onFocus={() => setFocusField('password')} onBlur={() => setFocusField(null)} />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  {showPassword ? <Ic.EyeOff width={18} height={18} /> : <Ic.Eye width={18} height={18} />}
                </button>
              </div>
              <FieldErr name="password" />
            </div>

            <div>
              <label htmlFor="reg-phone" style={labelStyle}>Phone Number</label>
              <input id="reg-phone" name="phone" type="tel" placeholder="03XX-XXXXXXX" autoComplete="tel" value={form.phone} onChange={handleChange} required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'reg-phone-err' : undefined} style={fStyle('phone')} onFocus={() => setFocusField('phone')} onBlur={() => setFocusField(null)} />
              <FieldErr name="phone" />
            </div>

            <div>
              <label htmlFor="reg-location" style={labelStyle}>City</label>
              <select id="reg-location" name="location" value={form.location} onChange={handleChange} required aria-invalid={!!errors.location} aria-describedby={errors.location ? 'reg-location-err' : undefined} style={sStyle('location')} onFocus={() => setFocusField('location')} onBlur={() => setFocusField(null)}>
                <option value="" disabled>Select City</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              <FieldErr name="location" />
            </div>

            {/* Extra fields — Aya only */}
            {role === 'aya' && (
              <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label htmlFor="reg-exp" style={labelStyle}>Years of Experience</label>
                  <select id="reg-exp" name="experience_years" value={form.experience_years} onChange={handleChange} required aria-invalid={!!errors.experience_years} aria-describedby={errors.experience_years ? 'reg-experience_years-err' : undefined} style={sStyle('experience_years')} onFocus={() => setFocusField('experience_years')} onBlur={() => setFocusField(null)}>
                    <option value="" disabled>Select Experience</option>
                    {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <FieldErr name="experience_years" />
                </div>

                <div>
                  <label htmlFor="reg-rate" style={labelStyle}>Rate per hour PKR</label>
                  <input id="reg-rate" name="rate_per_hour" type="number" min="0" placeholder="e.g. 500" value={form.rate_per_hour} onChange={handleChange} required aria-invalid={!!errors.rate_per_hour} aria-describedby={errors.rate_per_hour ? 'reg-rate_per_hour-err' : undefined} style={fStyle('rate_per_hour')} onFocus={() => setFocusField('rate_per_hour')} onBlur={() => setFocusField(null)} />
                  <FieldErr name="rate_per_hour" />
                </div>

                <div>
                  <label htmlFor="reg-bio" style={labelStyle}>Short Bio</label>
                  <textarea id="reg-bio" name="bio" rows={3} maxLength={200} placeholder="Share your experience, skills, and what makes you a great caregiver…" value={form.bio} onChange={handleChange} required aria-invalid={!!errors.bio} aria-describedby={errors.bio ? 'reg-bio-err' : undefined} style={fStyle('bio', { resize: 'vertical', display: 'block' })} onFocus={() => setFocusField('bio')} onBlur={() => setFocusField(null)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
                    <span id="reg-bio-err" style={{ fontSize: '12px', color: RED, fontWeight: '500' }}>{errors.bio}</span>
                    <span style={{ fontSize: '11px', color: C.textMuted, flexShrink: 0 }}>{form.bio.length}/200</span>
                  </div>
                </div>
              </div>
            )}

            {/* Success / error message */}
            {message && (
              <div className="fade-up" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: message.type === 'success' ? C.greenBg : '#FDECEA',
                color: message.type === 'success' ? C.green : '#D14343',
                borderRadius: '10px', padding: '13px 16px', fontSize: message.type === 'success' ? '13.5px' : '13px', fontWeight: '600', lineHeight: 1.5,
              }}>
                {message.type === 'success' && <Ic.Check width={16} height={16} style={{ flexShrink: 0 }} />}
                <span>{message.text}</span>
              </div>
            )}

            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? 'Creating Account...' : role === 'parent' ? 'Create Parent Account' : 'Create Aya Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: C.textSec, marginBottom: 0 }}>
            Already have an account? <a href="/login" style={{ color: C.teal, fontWeight: '600', textDecoration: 'none' }}>Login</a>
          </p>
          <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: C.textMuted, marginBottom: 0, lineHeight: 1.6 }}>By registering, you agree to our <button type="button" className="pseudo-link">Terms of Service</button> and <button type="button" className="pseudo-link">Privacy Policy</button>.</p>
        </div>
      </main>
    </div>
  );
}

export default Register;
