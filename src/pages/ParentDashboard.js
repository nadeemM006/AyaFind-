import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function ParentDashboard() {
  const [ayas, setAyas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
    fetchAyas();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const fetchAyas = async () => {
    const { data, error } = await supabase
      .from('ayas')
      .select('*')
      .eq('is_available', true);
    if (!error) setAyas(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleBook = async (ayaId) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: parentData } = await supabase
      .from('parents')
      .select('id')
      .eq('email', userData.user.email)
      .single();

    const { error } = await supabase
      .from('bookings')
      .insert([{
        parent_id: parentData.id,
        aya_id: ayaId,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      }]);

    if (!error) alert('✅ Booking request sent!');
    else alert('❌ Booking failed: ' + error.message);
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>🍃 AyaFind</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>👋 Welcome, Parent</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Find Your Perfect Aya</h2>
        <p style={styles.headerSub}>AI-matched, verified, and trusted babysitters near you</p>
      </div>

      {/* Ayas Grid */}
      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Finding best Ayas for you...</p>
        ) : ayas.length === 0 ? (
          <p style={styles.loading}>No Ayas available right now.</p>
        ) : (
          <div style={styles.grid}>
            {ayas.map((aya) => (
              <div key={aya.id} style={styles.card}>
                {/* Avatar */}
                <div style={styles.avatar}>
                  {aya.name?.charAt(0).toUpperCase()}
                </div>
                <h3 style={styles.ayaName}>{aya.name}</h3>
                <p style={styles.ayaLocation}>📍 {aya.location}</p>

                {/* Trust Score */}
                <div style={styles.trustBadge}>
                  🛡️ Trust Score: {aya.trust_score}/100
                </div>

                {/* Details */}
                <div style={styles.details}>
                  <span>⏳ {aya.experience_years || 1} yrs exp</span>
                  <span>💰 PKR {aya.rate_per_hour || 500}/hr</span>
                </div>

                <p style={styles.bio}>{aya.bio || 'Experienced and caring Aya.'}</p>

                <button
                  style={styles.bookBtn}
                  onClick={() => handleBook(aya.id)}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Segoe UI, sans-serif' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 40px', background: '#0D7377', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  logo: { color: 'white', margin: 0, fontSize: '22px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'white', fontSize: '14px' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
  header: { background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
    color: 'white', textAlign: 'center', padding: '40px 20px' },
  headerTitle: { fontSize: '28px', margin: '0 0 8px' },
  headerSub: { opacity: 0.9, margin: 0 },
  content: { padding: '32px 40px' },
  loading: { textAlign: 'center', color: '#64748b', fontSize: '18px', marginTop: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px' },
  card: { background: 'white', borderRadius: '16px', padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: '#0D7377',
    color: 'white', fontSize: '28px', fontWeight: 'bold', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  ayaName: { margin: '0 0 4px', color: '#1a1a2e', fontSize: '18px' },
  ayaLocation: { color: '#64748b', margin: '0 0 12px', fontSize: '14px' },
  trustBadge: { background: '#E8F8F7', color: '#0D7377', padding: '6px 12px',
    borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
    display: 'inline-block', marginBottom: '12px' },
  details: { display: 'flex', justifyContent: 'center', gap: '16px',
    marginBottom: '12px', fontSize: '13px', color: '#64748b' },
  bio: { color: '#64748b', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' },
  bookBtn: { width: '100%', padding: '12px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: 'bold', cursor: 'pointer' },
};

export default ParentDashboard;