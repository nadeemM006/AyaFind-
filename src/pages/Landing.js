import React from 'react';

function Landing() {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>🍃 AyaFind</h1>
        <div>
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
          <h2>🤖 AI Matching</h2>
          <p>Our AI finds the best Aya based on your child's age, location, and needs.</p>
        </div>
        <div style={styles.card}>
          <h2>🛡️ Trust Score</h2>
          <p>Every Aya has an AI-generated Trust Score so you always know who you're booking.</p>
        </div>
        <div style={styles.card}>
          <h2>⚡ Book Instantly</h2>
          <p>Send a booking request and get confirmed in minutes — anytime, anywhere.</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 AyaFind · AI for Pakistan's Future</p>
      </footer>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', color: '#1a1a2e' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 40px', background: '#0D7377' },
  logo: { color: 'white', margin: 0, fontSize: '24px' },
  navBtn: { color: 'white', marginRight: '16px', textDecoration: 'none', fontSize: '15px' },
  navBtnPrimary: { background: 'white', color: '#0D7377', padding: '8px 20px',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
  hero: { background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
    color: 'white', textAlign: 'center', padding: '80px 20px' },
  heroTitle: { fontSize: '52px', margin: '0 0 16px', fontWeight: 'bold' },
  heroSub: { fontSize: '18px', maxWidth: '500px', margin: '0 auto 32px', opacity: 0.9 },
  heroBtn: { background: 'white', color: '#0D7377', padding: '14px 36px',
    borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' },
  features: { display: 'flex', justifyContent: 'center', gap: '24px',
    padding: '60px 40px', background: '#f8fafc', flexWrap: 'wrap' },
  card: { background: 'white', borderRadius: '12px', padding: '32px',
    width: '260px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' },
  footer: { textAlign: 'center', padding: '24px', background: '#0D7377', color: 'white' },
};

export default Landing;