import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — warm · premium · human · intelligent
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
  Heart: (p) => <svg {...sv} {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>,
  Spark: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3z"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Users: (p) => <svg {...sv} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Msg: (p) => <svg {...sv} {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Check: (p) => <svg {...sv} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Arrow: (p) => <svg {...sv} {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
  Menu: (p) => <svg {...sv} {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: (p) => <svg {...sv} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Home: (p) => <svg {...sv} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
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
const BENEFITS = [
  { icon: 'Heart', title: 'Personalized Care', desc: 'Care recommendations based on the child\u2019s needs and family preferences.' },
  { icon: 'Spark', title: 'Intelligent Matching', desc: 'AyaFind evaluates compatibility instead of simply listing caregivers.' },
  { icon: 'Shield', title: 'Trust Insights', desc: 'Understand important trust signals before making a decision.' },
  { icon: 'Users', title: 'Built for Your Family', desc: 'Designed around real family routines, preferences, and childcare needs.' },
];
const STEPS = [
  { n: '01', title: 'Tell Us What You Need', desc: 'Share your child\u2019s needs, schedule, preferences, and care requirements.' },
  { n: '02', title: 'AyaFind Understands', desc: 'Our intelligent system analyzes the requirements.' },
  { n: '03', title: 'Discover Compatible Care', desc: 'See caregivers ranked by compatibility and relevant trust signals.' },
  { n: '04', title: 'Choose With Confidence', desc: 'Review the information and make your decision.' },
];
const NAV = [
  { label: 'Home', href: '/' }, { label: 'How It Works', href: '#how' },
  { label: 'For Parents', href: '#parents' }, { label: 'For Ayas', href: '#ayas' },
  { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' },
];
const CHIPS = [
  { k: 'Child age', v: '2 years', c: C.teal },
  { k: 'Schedule', v: 'Tomorrow \u00b7 6\u201310 PM', c: C.coral },
  { k: 'Language', v: 'Urdu', c: C.teal },
  { k: 'Care type', v: 'Toddler', c: C.coral },
];
const RESULTS = [
  { name: 'Ayesha K.', pct: 96, info: 'Toddler care \u00b7 Urdu + English' },
  { name: 'Fatima R.', pct: 91, info: 'Infant specialist \u00b7 Urdu + Punjabi' },
  { name: 'Sadia M.', pct: 87, info: 'Experienced Aya \u00b7 Urdu' },
];
const TEXT = "I need an Aya for my 2-year-old tomorrow evening, preferably Urdu-speaking.";

/* ═══════════════════════════════════════════════════════
   INTERACTIVE DEMO HOOK
   ═══════════════════════════════════════════════════════ */
function useAiDemo() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing');
  const [chipIdx, setChipIdx] = useState(0);
  const [resIdx, setResIdx] = useState(0);
  const [ci, setCi] = useState(0);
  useEffect(() => {
    let t;
    if (phase === 'typing') {
      if (ci < TEXT.length) t = setTimeout(() => { setText(TEXT.slice(0, ci + 1)); setCi(ci + 1); }, 48);
      else t = setTimeout(() => setPhase('understanding'), 400);
    } else if (phase === 'understanding') {
      t = setTimeout(() => { setPhase('extracting'); setChipIdx(0); }, 1400);
    } else if (phase === 'extracting') {
      if (chipIdx < CHIPS.length) t = setTimeout(() => setChipIdx(chipIdx + 1), 380);
      else t = setTimeout(() => setPhase('processing'), 700);
    } else if (phase === 'processing') {
      t = setTimeout(() => { setPhase('results'); setResIdx(0); }, 1800);
    } else if (phase === 'results') {
      if (resIdx < RESULTS.length) t = setTimeout(() => setResIdx(resIdx + 1), 450);
      else t = setTimeout(() => setPhase('pause'), 3200);
    } else if (phase === 'pause') {
      t = setTimeout(() => { setText(''); setPhase('typing'); setChipIdx(0); setResIdx(0); setCi(0); }, 500);
    }
    return () => clearTimeout(t);
  }, [phase, ci, chipIdx, resIdx]);
  return { text, phase, chipIdx, resIdx };
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
function Landing() {
  const [menu, setMenu] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const refs = useRef([]);
  const demo = useAiDemo();
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [aiVis, setAiVis] = useState(false);
  const aiRef = useRef(null);

  const handleContact = (e) => {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.message) return;
    setSent(true);
    setTimeout(() => { setSent(false); setContact({ name: '', email: '', message: '' }); }, 3500);
  };

  useEffect(() => {
    const fn = () => setNavSolid(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis'); }),
      { threshold: 0.05 }
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!aiRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAiVis(true); }, { threshold: 0.12 });
    obs.observe(aiRef.current);
    return () => obs.disconnect();
  }, []);

  const fr = (i) => (el) => { refs.current[i] = el; };

  /* ────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: FF, color: C.text, background: C.bg, lineHeight: 1.5, overflowX: 'hidden' }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0}
        @media(prefers-reduced-motion:reduce){
          .fade,.lift,.fade-up,.ai-s{transition:none!important;animation:none!important}
          .fade{opacity:1!important;transform:none!important}
        }
        .fade{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
        .fade.vis{opacity:1;transform:translateY(0)}
        .lift{transition:transform .3s ease,box-shadow .3s ease}
        .lift:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(24,36,61,.07)}
        .nav-a{color:${C.textSec};text-decoration:none;font-size:14px;font-weight:600;transition:color .2s}
        .nav-a:hover{color:${C.navy}}
        .btn-p{background:${C.navy};color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer;display:inline-block;transition:all .25s}
        .btn-p:hover{background:${C.navyDark};transform:translateY(-1px);box-shadow:0 6px 20px rgba(24,36,61,.18)}
        .btn-s{background:transparent;color:${C.navy};padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;border:1.5px solid ${C.border};cursor:pointer;display:inline-block;transition:all .25s}
        .btn-s:hover{border-color:${C.navy}}
        .mob-link{display:block;padding:16px 0;font-size:16px;font-weight:600;color:${C.navy};text-decoration:none;border-bottom:1px solid ${C.border}}
        .ai-s{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease}
        .ai-s.go{opacity:1;transform:translateY(0)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease both}
        @media(max-width:960px){
          .hero-grid{flex-direction:column!important;text-align:center}
          .hero-vis{max-width:480px!important;width:100%!important}
          .hero-ctas{justify-content:center!important}
          .why-g{grid-template-columns:1fr!important}
          .why-first{grid-column:auto!important;padding:28px 24px!important}
          .why-rest{grid-template-columns:1fr!important}
          .how-tl{padding-left:0!important}
          .how-dot{display:none!important}
          .about-g{flex-direction:column!important}
          .about-vis{max-width:100%!important}
          .paths-row{flex-direction:column!important}
          .foot-g{grid-template-columns:1fr 1fr!important}
          .nav-links{display:none!important}
          .contact-inner{flex-direction:column!important}
        }
        @media(max-width:600px){
          .foot-g{grid-template-columns:1fr!important}
          .hero-title{font-size:32px!important}
          .sec{padding:72px 20px!important}
        }
        @media(min-width:961px){.mob-btn{display:none!important}}
      `}</style>

      {/* ═══════ NAVBAR ═══════ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '18px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: navSolid ? 'rgba(255,255,255,.97)' : 'transparent', backdropFilter: navSolid ? 'blur(12px)' : 'none', boxShadow: navSolid ? '0 1px 20px rgba(24,36,61,.05)' : 'none', transition: 'all .4s ease' }}>
        <a href="/" style={{ textDecoration: 'none' }} aria-label="AyaFind home"><Logo dark={!navSolid} /></a>
        <div className="nav-links" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          {NAV.map((l) => <a key={l.label} href={l.href} className="nav-a" style={!navSolid ? { color: 'rgba(255,255,255,.72)' } : {}}>{l.label}</a>)}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/login" className="nav-a" style={!navSolid ? { color: 'rgba(255,255,255,.8)' } : {}}>Login</a>
          <a href="/register" className="btn-p" style={navSolid ? {} : { background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.18)', color: '#fff' }}>Get Started</a>
          <button onClick={() => setMenu(!menu)} aria-label="Toggle menu" className="mob-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: navSolid ? C.navy : '#fff', padding: '4px' }}>
            {menu ? <Ic.X /> : <Ic.Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 200, padding: '20px 24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <Logo /><button onClick={() => setMenu(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.navy, padding: '4px' }}><Ic.X /></button>
          </div>
          {NAV.map((l) => <a key={l.label} href={l.href} className="mob-link" onClick={() => setMenu(false)}>{l.label}</a>)}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/login" onClick={() => setMenu(false)} className="btn-s" style={{ textAlign: 'center' }}>Login</a>
            <a href="/register" onClick={() => setMenu(false)} className="btn-p" style={{ textAlign: 'center' }}>Get Started</a>
          </div>
        </div>
      )}

      {/* ═══════ HERO ═══════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: C.navy, padding: '140px 48px 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '8%', right: '6%', width: '520px', height: '520px', borderRadius: '50%', background: `radial-gradient(circle, ${C.teal}10, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: '380px', height: '380px', borderRadius: '50%', background: `radial-gradient(circle, ${C.coral}0A, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="hero-grid" style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: '72px', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <div style={{ flex: '1 1 480px' }}>
            <h1 className="hero-title" style={{ fontSize: '50px', fontWeight: '800', lineHeight: 1.12, color: '#fff', margin: '0 0 22px', letterSpacing: '-0.03em' }}>
              Intelligent childcare,<br />built around your family.
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,.65)', maxWidth: '480px', lineHeight: 1.72, margin: '0 0 40px' }}>
              AyaFind helps families discover childcare that fits their child&rsquo;s needs, preferences, and routine — with intelligent matching and trust insights.
            </p>
            <div className="hero-ctas" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href="/register" style={{ background: C.coral, color: '#fff', padding: '15px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block', transition: 'all .25s', boxShadow: `0 6px 20px ${C.coral}44` }}>Find Care</a>
              <a href="/register" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.22)', display: 'inline-block', transition: 'all .25s' }}>Join as an Aya</a>
            </div>
          </div>

          {/* Right — Interactive AI Demo */}
          <div className="hero-vis" style={{ flex: '1 1 420px', maxWidth: '480px' }}>
            <div style={{ background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(24px)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,.08)', minHeight: '380px' }}>
              {/* Status line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: demo.phase === 'typing' ? 'rgba(255,255,255,.3)' : demo.phase === 'pause' || demo.phase === 'results' ? C.green : C.coral, transition: 'background .3s' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {demo.phase === 'typing' ? 'Input' : demo.phase === 'understanding' ? 'Analyzing' : demo.phase === 'extracting' ? 'Extracting' : demo.phase === 'processing' ? 'Matching' : 'Complete'}
                </span>
              </div>

              {/* Parent request card */}
              <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', marginBottom: '16px', minHeight: '64px', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                <span style={{ fontSize: '14.5px', color: C.text, lineHeight: 1.6, fontWeight: '500' }}>
                  {demo.text || '\u00A0'}
                  <span style={{ display: 'inline-block', width: '2px', height: '16px', background: C.coral, marginLeft: '1px', verticalAlign: 'text-bottom', animation: 'spin 1s step-end infinite', borderRadius: '1px', opacity: demo.phase === 'typing' ? 1 : 0, transition: 'opacity .3s' }} />
                </span>
              </div>

              {/* Extraction */}
              {(demo.phase !== 'typing') && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,.4)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {demo.phase === 'understanding' ? (
                      <><span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: C.coral, borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Understanding your request...</>
                    ) : demo.phase === 'extracting' ? (
                      'Extracting requirements...'
                    ) : (
                      <><Ic.Check width={11} height={11} style={{ color: C.green }} /> Requirements ready</>
                    )}
                  </div>
                  {demo.chipIdx > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {CHIPS.slice(0, demo.chipIdx).map((ch, i) => (
                        <div key={i} className="fade-up" style={{ background: 'rgba(255,255,255,.06)', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)' }}>{ch.k}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{ch.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Processing */}
              {demo.phase === 'processing' && (
                <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', color: 'rgba(255,255,255,.5)', fontSize: '13px', fontWeight: '600' }}>
                  <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,.2)', borderTopColor: C.coral, borderRadius: '50%', display: 'inline-block', animation: 'spin .65s linear infinite' }} />
                  Finding compatible care...
                </div>
              )}

              {/* Results */}
              {(demo.phase === 'results' || demo.phase === 'pause') && demo.resIdx > 0 && (
                <div className="fade-up">
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,.4)', marginBottom: '8px' }}>
                    {demo.resIdx >= RESULTS.length ? `${RESULTS.length} compatible caregivers` : 'Matching...'}
                  </div>
                  {RESULTS.slice(0, demo.resIdx).map((r, i) => (
                    <div key={r.name} className="fade-up" style={{ background: '#fff', borderRadius: '10px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', boxShadow: '0 1px 6px rgba(0,0,0,.03)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === 0 ? C.teal : C.tealSoft, color: i === 0 ? '#fff' : C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>{r.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: C.navy }}>{r.name}</div>
                        <div style={{ fontSize: '10.5px', color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.info}</div>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: C.teal, flexShrink: 0 }}>{r.pct}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY AYAFIND ═══════ */}
      <section ref={fr(0)} className="fade sec" style={{ maxWidth: '1240px' }}>
        <h2 style={st.secT}>Why families choose AyaFind</h2>
        <p style={st.secSub}>A smarter approach to finding childcare — built on compatibility, trust, and real family needs.</p>
        <div className="why-g">
          {/* Feature card — spans full width */}
          <div className="why-first lift" style={{ background: C.card, borderRadius: '20px', padding: '40px 36px', border: `1px solid ${C.border}`, display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '20px', boxShadow: '0 2px 16px rgba(24,36,61,.04)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: C.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, flexShrink: 0 }}>
              {Ic[BENEFITS[0].icon]({ width: 32, height: 32 })}
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: C.navy, margin: '0 0 8px' }}>{BENEFITS[0].title}</h3>
              <p style={{ fontSize: '15px', color: C.textSec, lineHeight: 1.65, margin: 0 }}>{BENEFITS[0].desc}</p>
            </div>
          </div>
          {/* Remaining 3 cards */}
          <div className="why-rest" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {BENEFITS.slice(1).map((b, i) => (
              <div key={b.title} className="lift" style={{ background: C.card, borderRadius: '16px', padding: '28px 24px', border: `1px solid ${C.border}`, borderTop: `3px solid ${(i + 1) % 2 === 0 ? C.teal : C.coral}`, boxShadow: '0 2px 12px rgba(24,36,61,.03)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: (i + 1) % 2 === 0 ? C.tealSoft : C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: (i + 1) % 2 === 0 ? C.teal : C.coral, marginBottom: '16px' }}>
                  {Ic[b.icon]({ width: 20, height: 20 })}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.navy, margin: '0 0 6px' }}>{b.title}</h3>
                <p style={{ fontSize: '13.5px', color: C.textSec, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how" ref={fr(1)} className="fade" style={{ background: '#fff', padding: '112px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={st.secT}>How it works</h2>
          <p style={st.secSub}>From your first request to a confident decision — in four clear steps.</p>
          <div className="how-tl" style={{ position: 'relative', paddingLeft: '56px' }}>
            <div style={{ position: 'absolute', left: '15px', top: '8px', bottom: '8px', width: '2px', background: `linear-gradient(180deg, ${C.teal}, ${C.coral})`, opacity: 0.22 }} />
            {STEPS.map((step, i) => (
              <div key={step.n} className="fade" ref={fr(10 + i)} style={{ paddingLeft: '28px', paddingBottom: i < 3 ? '52px' : '0', position: 'relative' }}>
                <div className="how-dot" style={{ position: 'absolute', left: '-56px', top: '2px', width: '32px', height: '32px', borderRadius: '50%', background: i % 2 === 0 ? C.teal : C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '800', boxShadow: `0 2px 10px ${i % 2 === 0 ? C.teal : C.coral}30`, zIndex: 1 }}>{i + 1}</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: i % 2 === 0 ? C.teal : C.coral, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Step {step.n}</div>
                <h3 style={{ fontSize: '21px', fontWeight: '700', color: C.navy, margin: '0 0 8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14.5px', color: C.textSec, lineHeight: 1.65, margin: 0, maxWidth: '440px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AI INTELLIGENCE ═══════ */}
      <section ref={(el) => { fr(2)(el); aiRef.current = el; }} className="fade sec" style={{ maxWidth: '1240px' }}>
        <h2 style={st.secT}>More than a search.<br />An intelligent care experience.</h2>
        <p style={st.secSub}>AyaFind transforms a simple request into intelligent, compatibility-driven results.</p>
        <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          {/* Stage 1 — Request */}
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ background: C.card, borderRadius: '18px', padding: '28px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(24,36,61,.03)', transitionDelay: '0s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.coral }}><Ic.Msg width={16} height={16} /></div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Parent&rsquo;s Request</span>
            </div>
            <p style={{ fontSize: '15px', color: C.text, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
              &ldquo;I need an Urdu-speaking Aya for my toddler tomorrow evening.&rdquo;
            </p>
          </div>
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ textAlign: 'center', padding: '10px 0', color: C.textMuted, transitionDelay: '.12s' }}><Ic.Arrow width={20} height={20} /></div>

          {/* Stage 2 — Understanding */}
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ background: C.card, borderRadius: '18px', padding: '28px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(24,36,61,.03)', transitionDelay: '.24s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: C.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal }}><Ic.Spark width={16} height={16} /></div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Understands Context</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Age: Toddler', 'Schedule: Tomorrow evening', 'Language: Urdu', 'Care: Childcare', 'Location: Nearby', 'Preferences'].map((f) => (
                <span key={f} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', color: C.text }}>{f}</span>
              ))}
            </div>
          </div>
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ textAlign: 'center', padding: '10px 0', color: C.textMuted, transitionDelay: '.36s' }}><Ic.Arrow width={20} height={20} /></div>

          {/* Stage 3 — Compatibility */}
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ background: C.card, borderRadius: '18px', padding: '28px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(24,36,61,.03)', transitionDelay: '.48s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.coral }}><Ic.Shield width={16} height={16} /></div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Compatibility Analysis</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['Experience match', 'Schedule fit', 'Language aligned', 'Proximity', 'Trust signals'].map((f) => (
                <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', color: C.textSec }}>
                  <Ic.Check width={13} height={13} style={{ color: C.green, flexShrink: 0 }} />{f}
                </span>
              ))}
            </div>
          </div>
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ textAlign: 'center', padding: '10px 0', color: C.textMuted, transitionDelay: '.6s' }}><Ic.Arrow width={20} height={20} /></div>

          {/* Stage 4 — Results */}
          <div className={`ai-s${aiVis ? ' go' : ''}`} style={{ background: C.navy, borderRadius: '18px', padding: '28px', color: '#fff', transitionDelay: '.72s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.Users width={16} height={16} style={{ color: '#fff' }} /></div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Relevant Caregivers</span>
            </div>
            {RESULTS.map((r) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{r.name}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)', flex: 1 }}>{r.info}</span>
                <span style={{ fontWeight: '800', fontSize: '15px', color: C.teal }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOR PARENTS / FOR AYAS ═══════ */}
      <section id="parents" ref={fr(3)} className="fade" style={{ background: '#fff', padding: '112px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <h2 style={st.secT}>Two sides of one platform</h2>
          <p style={st.secSub}>AyaFind serves both families and caregivers with tools designed for each.</p>
          <div className="paths-row" id="ayas" style={{ display: 'flex', gap: '28px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="lift" style={{ flex: '1 1 380px', maxWidth: '480px', background: C.bg, borderRadius: '20px', padding: '48px 36px', borderTop: `4px solid ${C.teal}`, boxShadow: '0 2px 12px rgba(24,36,61,.03)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: C.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, marginBottom: '20px' }}><Ic.Home width={26} height={26} /></div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>For Parents</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: C.navy, margin: '0 0 10px' }}>Find care that fits your family.</h3>
              <p style={{ fontSize: '14.5px', color: C.textSec, lineHeight: 1.7, margin: '0 0 28px' }}>Describe your childcare needs and let AyaFind surface compatible caregivers — ranked by relevance and trust.</p>
              <a href="/register" className="btn-p" style={{ background: C.teal }}>Find an Aya</a>
            </div>
            <div className="lift" style={{ flex: '1 1 380px', maxWidth: '480px', background: C.bg, borderRadius: '20px', padding: '48px 36px', borderTop: `4px solid ${C.coral}`, boxShadow: '0 2px 12px rgba(24,36,61,.03)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.coral, marginBottom: '20px' }}><Ic.Users width={26} height={26} /></div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>For Ayas</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: C.navy, margin: '0 0 10px' }}>Build your professional childcare profile.</h3>
              <p style={{ fontSize: '14.5px', color: C.textSec, lineHeight: 1.7, margin: '0 0 28px' }}>Present your experience, availability, and strengths to families actively looking for caregivers like you.</p>
              <a href="/register" className="btn-p" style={{ background: C.coral }}>Join as an Aya</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT ═══════ */}
      <section id="about" ref={fr(4)} className="fade sec" style={{ maxWidth: '1240px' }}>
        <h2 style={st.secT}>Built to make childcare easier to choose.</h2>
        <div className="about-g" style={{ display: 'flex', gap: '56px', alignItems: 'center', marginTop: '8px' }}>
          {/* Visual */}
          <div className="about-vis" style={{ flex: '0 0 280px', maxWidth: '280px' }}>
            <svg viewBox="0 0 260 240" width="260" fill="none" style={{ display: 'block' }}>
              <circle cx="130" cy="120" r="105" fill={C.tealSoft} opacity=".5"/>
              <circle cx="100" cy="130" r="72" fill={C.coralSoft} opacity=".45"/>
              <circle cx="90" cy="68" r="18" stroke={C.navy} strokeWidth="2" fill="none"/>
              <path d="M65 160v-22c0-14 11-25 25-25s25 11 25 25v22" stroke={C.navy} strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="165" cy="92" r="14" stroke={C.teal} strokeWidth="2" fill="none"/>
              <path d="M145 160v-16c0-11 9-20 20-20s20 9 20 20v16" stroke={C.teal} strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M128 108c-3.5-3.5-9-3.5-12.5 0s-3.5 9 0 12.5L128 133l12.5-12.5c3.5-3.5 3.5-9 0-12.5s-9-3.5-12.5 0z" fill={C.coral} opacity=".65"/>
            </svg>
          </div>
          {/* Copy */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '16px', color: C.textSec, lineHeight: 1.8, margin: '0 0 28px' }}>
              AyaFind brings intelligent technology into the childcare discovery experience, helping families understand their options while giving caregivers a professional way to present their experience and strengths.
            </p>
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
              {[['Better information.', C.teal], ['Better matches.', C.coral], ['Better care.', C.green]].map(([t, c]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: C.navy }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" ref={fr(5)} className="fade" style={{ background: '#fff', padding: '112px 24px' }}>
        <div className="contact-inner" style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', gap: '64px', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 320px' }}>
            <h2 style={{ ...st.secT, textAlign: 'left' }}>Let&rsquo;s talk.</h2>
            <p style={{ fontSize: '16px', color: C.textSec, lineHeight: 1.7, margin: '12px 0 0', maxWidth: '360px' }}>
              Have a question, suggestion, or want to learn more about AyaFind? We&rsquo;d love to hear from you.
            </p>
          </div>
          <div style={{ flex: '1 1 400px' }}>
            {sent ? (
              <div className="fade-up" style={{ background: C.greenBg, borderRadius: '16px', padding: '40px', border: `1px solid ${C.green}30`, textAlign: 'center' }}>
                <Ic.Check width={28} height={28} style={{ color: C.green, marginBottom: '10px' }} />
                <div style={{ fontSize: '17px', fontWeight: '700', color: C.navy, marginBottom: '4px' }}>Thank you!</div>
                <div style={{ fontSize: '14px', color: C.textSec }}>We&rsquo;ll get back to you soon.</div>
              </div>
            ) : (
              <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Your name" required style={{ width: '100%', padding: '15px 18px', fontSize: '14px', border: `1.5px solid ${C.border}`, borderRadius: '12px', outline: 'none', fontFamily: FF, background: C.bg, transition: 'border-color .2s', color: C.text }} onFocus={(e) => e.target.style.borderColor = C.teal} onBlur={(e) => e.target.style.borderColor = C.border} />
                <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email address" required style={{ width: '100%', padding: '15px 18px', fontSize: '14px', border: `1.5px solid ${C.border}`, borderRadius: '12px', outline: 'none', fontFamily: FF, background: C.bg, transition: 'border-color .2s', color: C.text }} onFocus={(e) => e.target.style.borderColor = C.teal} onBlur={(e) => e.target.style.borderColor = C.border} />
                <textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} placeholder="Your message" required rows={4} style={{ width: '100%', padding: '15px 18px', fontSize: '14px', border: `1.5px solid ${C.border}`, borderRadius: '12px', outline: 'none', fontFamily: FF, background: C.bg, resize: 'vertical', transition: 'border-color .2s', color: C.text }} onFocus={(e) => e.target.style.borderColor = C.teal} onBlur={(e) => e.target.style.borderColor = C.border} />
                <button type="submit" className="btn-p" style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '12px' }}>Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section ref={fr(6)} className="fade" style={{ background: C.navy, padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '420px', height: '420px', borderRadius: '50%', background: `radial-gradient(circle, ${C.teal}10, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>Find care with confidence.</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,.6)', marginBottom: '36px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            Discover childcare that fits your family&rsquo;s needs.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ background: C.coral, color: '#fff', padding: '15px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', transition: 'all .25s', display: 'inline-block', boxShadow: `0 6px 20px ${C.coral}44` }}>Find an Aya</a>
            <a href="/register" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.2)', transition: 'all .25s', display: 'inline-block' }}>Join as an Aya</a>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ background: C.navyDark, color: '#fff', padding: '72px 40px 36px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="foot-g" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr', gap: '48px', marginBottom: '56px' }}>
            <div>
              <Logo dark />
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', lineHeight: 1.7, marginTop: '16px', maxWidth: '260px' }}>
                Intelligent childcare matching for Pakistani families. Find caregivers who fit your child&rsquo;s needs.
              </p>
            </div>
            {[
              { title: 'Product', links: [['How It Works', '#how'], ['For Parents', '#parents'], ['For Ayas', '#ayas']] },
              { title: 'Company', links: [['About', '#about'], ['Contact', '#contact']] },
              { title: 'Support', links: [['Help', '#'], ['FAQs', '#']] },
              { title: 'Legal', links: [['Privacy', '#'], ['Terms', '#']] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,.3)', marginBottom: '18px' }}>{col.title}</div>
                {col.links.map(([l, h]) => (
                  <a key={l} href={h} style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,.5)', textDecoration: 'none', marginBottom: '12px', transition: 'color .2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,.5)'}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)' }}>&copy; 2026 AyaFind</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.28)', marginTop: '3px' }}>Built with care in Pakistan</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const st = {
  secT: { fontSize: '36px', fontWeight: '800', color: C.navy, margin: '0 0 12px', letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.2 },
  secSub: { fontSize: '16px', color: C.textSec, maxWidth: '540px', margin: '0 auto 52px', textAlign: 'center', lineHeight: 1.7 },
};

export default Landing;
