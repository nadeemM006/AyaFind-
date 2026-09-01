import React, { useState } from 'react';
import { supabase } from '../supabase';

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — warm · premium · human · intelligent
   (matching Landing.js / Register.js design system)
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
  ArrowLeft: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Eye: (p) => <svg {...sv} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (p) => <svg {...sv} {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
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
   SHARED FIELD STYLES
   ═══════════════════════════════════════════════════════ */
const inputStyle = { width: '100%', padding: '14px 16px', fontSize: '14px', border: `1.5px solid ${C.border}`, borderRadius: '12px', outline: 'none', fontFamily: FF, background: C.bg, color: C.text, transition: 'border-color .2s, background .2s, box-shadow .2s', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '7px' };
const RED = '#D14343';

/* Friendly error copy — never expose raw backend messages */
const friendlyError = (error) => {
  const msg = (error && error.message) || '';
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password. Please try again.';
  if (/email not confirmed/i.test(msg)) return 'Please verify your email address before logging in.';
  if (/failed to fetch|network|fetch failed/i.test(msg)) return 'Unable to connect. Please check your internet connection and try again.';
  return 'Something went wrong. Please try again.';
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
  const FieldErr = ({ name }) => errors[name] ? (
    <div id={`log-${name}-err`} style={{ fontSize: '12px', color: RED, fontWeight: '500', marginTop: '6px', lineHeight: 1.45 }}>{errors[name]}</div>
  ) : null;

  /* Validation — same rules as before (required fields + email format), surfaced per field */
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Please enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Please enter your password.';
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
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      // Check which table user belongs to
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('email', form.email)
        .single();

      if (parentData) {
        window.location.href = '/parent-dashboard';
      } else {
        window.location.href = '/aya-dashboard';
      }

    } catch (error) {
      setMessage({ type: 'error', text: friendlyError(error) });
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
        .login-btn{background:${C.teal};color:#fff;width:100%;padding:16px;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:${FF};cursor:pointer;transition:background .2s,box-shadow .2s,transform .2s;box-shadow:0 6px 20px rgba(39,143,135,0.35)}
        .login-btn:hover:not(:disabled){background:#1F7A73;box-shadow:0 10px 28px rgba(39,143,135,0.45);transform:translateY(-1px)}
        .login-btn:disabled{opacity:.8;cursor:default}
        .eye-btn{background:none;border:none;cursor:pointer;color:${C.teal};padding:6px;display:flex;align-items:center;border-radius:8px;transition:color .2s}
        .eye-btn:hover{color:#1F7A73}
        .eye-btn:focus-visible{outline:2px solid ${C.teal};outline-offset:2px}
        .pseudo-link{background:none;border:none;padding:0;font:inherit;font-size:inherit;color:${C.teal};font-weight:600;text-decoration:none;cursor:pointer}
        .pseudo-link:hover{text-decoration:underline;text-underline-offset:2px}
        .pseudo-link:focus-visible{outline:2px solid ${C.teal};outline-offset:2px;border-radius:4px}
        @media(prefers-reduced-motion:reduce){
          .fade-up{animation:none!important}
          .login-btn:hover:not(:disabled){transform:none}
        }
        @media(max-width:600px){
          .login-card{padding:28px!important;border-radius:16px!important}
          .login-nav{padding:18px 16px!important}
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-12%', right: '-8%', width: '620px', height: '620px', borderRadius: '50%', background: `radial-gradient(circle, ${C.teal}14, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-12%', left: '-10%', width: '520px', height: '520px', borderRadius: '50%', background: `radial-gradient(circle, ${C.coral}0F, transparent 70%)`, pointerEvents: 'none' }} />

      {/* ═══════ TOP NAVBAR ═══════ */}
      <nav className="login-nav" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '28px 40px' }}>
        <a href="/" className="back-link" style={{ justifySelf: 'start' }} aria-label="Back to home">
          <Ic.ArrowLeft width={16} height={16} /> Back to Home
        </a>
        <Logo dark />
        <div />
      </nav>

      {/* ═══════ CENTER CARD ═══════ */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 64px', position: 'relative', zIndex: 1 }}>
        <div className="login-card fade-up" style={{ background: C.card, borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '48px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.navy, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ fontSize: '13px', color: C.textSec, margin: '0 0 28px', lineHeight: 1.6 }}>Sign in to continue with AyaFind</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="log-email" style={labelStyle}>Email Address</label>
              <input id="log-email" name="email" type="email" placeholder="Email Address" autoComplete="email" value={form.email} onChange={handleChange} required aria-invalid={!!errors.email} aria-describedby={errors.email ? 'log-email-err' : undefined} style={fStyle('email')} onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} />
              <FieldErr name="email" />
            </div>

            <div>
              <label htmlFor="log-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="log-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" autoComplete="current-password" value={form.password} onChange={handleChange} required aria-invalid={!!errors.password} aria-describedby={errors.password ? 'log-password-err' : undefined} style={fStyle('password', { paddingRight: '48px' })} onFocus={() => setFocusField('password')} onBlur={() => setFocusField(null)} />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  {showPassword ? <Ic.EyeOff width={18} height={18} /> : <Ic.Eye width={18} height={18} />}
                </button>
              </div>
              <FieldErr name="password" />
              <div style={{ textAlign: 'right', marginTop: '6px' }}>
                <button type="button" className="pseudo-link" style={{ fontSize: '12px' }}>Forgot password?</button>
              </div>
            </div>

            {/* Auth error message */}
            {message && (
              <div className="fade-up" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#FDECEA', color: RED,
                borderRadius: '10px', padding: '13px 16px', fontSize: '13px', fontWeight: '600', lineHeight: 1.5,
              }}>
                <span>{message.text}</span>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: C.textSec, marginBottom: 0 }}>
            Don&rsquo;t have an account? <a href="/register" style={{ color: C.teal, fontWeight: '600', textDecoration: 'none' }}>Create one</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
