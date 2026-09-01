import React from 'react';

function Landing() {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>🍃 AyaFind</h1>
        <div style={styles.navLinks}>
          <a href="/login" style={styles.navBtn}>Login</a>
          <a href="/register" style={styles.navBtnPrimary}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Apni Aya,<br />Ek Click Mein</h1>
        <p style={styles.heroSub}>
          Pakistan's first AI-powered platform to find, verify,
          and book trusted Ayas for your family.
        </p>
        <a href="/register" style={styles.heroBtn}>Find an Aya Now</a>
      </div>

      {/* Features */}
      <div style={styles.features}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🤖</div>
          <h2 style={styles.cardTitle}>AI Matching</h2>
          <p style={styles.cardText}>Our AI finds the best Aya based on your child's age, location, and needs.</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🛡️</div>
          <h2 style={styles.cardTitle}>Trust Score</h2>
          <p style={styles.cardText}>Every Aya has an AI-generated Trust Score so you always know who you're booking.</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>⚡</div>
          <h2 style={styles.cardTitle}>Book Instantly</h2>
          <p style={styles.cardText}>Send a booking request and get confirmed in minutes — anytime, anywhere.</p>
        </div>
      </div>

      {/* How it works */}
      <div style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNum}>1</div>
            <h3 style={styles.stepTitle}>Create Profile</h3>
            <p style={styles.stepText}>Sign up and tell us about your family and child's needs.</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNum}>2</div>
            <h3 style={styles.stepTitle}>AI Matches</h3>
            <p style={styles.stepText}>Our AI instantly ranks the best verified Ayas near you.</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNum}>3</div>
            <h3 style={styles.stepTitle}>Book & Relax</h3>
            <p style={styles.stepText}>Send a booking request and your Aya is on the way.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Find Your Aya?</h2>
        <p style={styles.ctaSub}>Join thousands of Pakistani families using AyaFind</p>
        <a href="/register" style={styles.ctaBtn}>Get Started Free</a>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 AyaFind · AI for Pakistan's Future</p>
        <p style={styles.footerText}>Made with ❤️ in Pakistan</p>
      </footer>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .features { flex-direction: column !important; padding: 32px 20px !important; }
          .steps { flex-direction: column !important; }
          .nav { padding: 12px 20px !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', color: '#1a1a2e', overflowX: 'hidden' },
  
  // Navbar
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 40px', background: '#0D7377', position: 'sticky', top: 0, zIndex: 100 },
  logo: { color: 'white', margin: 0, fontSize: '22px' },
  navLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: { color: 'white', textDecoration: 'none', fontSize: '14px', padding: '6px 12px' },
  navBtnPrimary: { background: 'white', color: '#0D7377', padding: '8px 18px',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },

  // Hero
  hero: { background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
    color: 'white', textAlign: 'center', padding: '80px 20px' },
  heroTitle: { fontSize: '48px', margin: '0 0 16px', fontWeight: 'bold', lineHeight: 1.2 },
  heroSub: { fontSize: '17px', maxWidth: '480px', margin: '0 auto 32px', opacity: 0.9, lineHeight: 1.6 },
  heroBtn: { background: 'white', color: '#0D7377', padding: '14px 36px',
    borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px',
    display: 'inline-block' },

  // Features
  features: { display: 'flex', justifyContent: 'center', gap: '24px',
    padding: '60px 40px', background: '#f8fafc', flexWrap: 'wrap' },
  card: { background: 'white', borderRadius: '16px', padding: '32px 24px',
    width: '260px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center',
    flex: '1 1 220px', maxWidth: '300px' },
  cardIcon: { fontSize: '36px', marginBottom: '12px' },
  cardTitle: { color: '#0D7377', fontSize: '18px', margin: '0 0 8px' },
  cardText: { color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: 0 },

  // How it works
  howSection: { padding: '60px 40px', textAlign: 'center', background: 'white' },
  sectionTitle: { fontSize: '28px', color: '#1a1a2e', marginBottom: '40px' },
  steps: { display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' },
  step: { textAlign: 'center', flex: '1 1 180px', maxWidth: '220px' },
  stepNum: { width: '48px', height: '48px', borderRadius: '50%', background: '#0D7377',
    color: 'white', fontSize: '20px', fontWeight: 'bold', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  stepTitle: { color: '#1a1a2e', fontSize: '16px', margin: '0 0 8px' },
  stepText: { color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: 0 },

  // CTA
  cta: { background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
    color: 'white', textAlign: 'center', padding: '60px 20px' },
  ctaTitle: { fontSize: '28px', margin: '0 0 8px' },
  ctaSub: { opacity: 0.9, margin: '0 0 28px', fontSize: '16px' },
  ctaBtn: { background: 'white', color: '#0D7377', padding: '14px 36px',
    borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold',
    fontSize: '16px', display: 'inline-block' },

  // Footer
  footer: { background: '#0D7377', color: 'white', textAlign: 'center', padding: '24px 20px' },
  footerText: { margin: '4px 0', fontSize: '13px', opacity: 0.9 },
};

export default Landing;