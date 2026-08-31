import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function AyaDashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

const fetchProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      window.location.href = '/login';
      return;
    }

    const { data: ayaData } = await supabase
      .from('ayas')
      .select('*')
      .eq('email', userData.user.email)
      .single();

    if (ayaData) {
      setProfile(ayaData);
      fetchBookings(ayaData.id);
    }
    setLoading(false);
  };

  const fetchBookings = async (ayaId) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, parents(name, phone, location)')
      .eq('aya_id', ayaId)
      .order('created_at', { ascending: false });
    if (data) setBookings(data);
  };

  const handleBookingAction = async (bookingId, action) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: action })
      .eq('id', bookingId);
    if (!error) fetchProfile();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleAvailability = async () => {
    const { error } = await supabase
      .from('ayas')
      .update({ is_available: !profile.is_available })
      .eq('id', profile.id);
    if (!error) setProfile({ ...profile, is_available: !profile.is_available });
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>🍃 AyaFind</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>👩 {profile?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>{profile?.name}</h2>
            <p style={styles.profileDetail}>📍 {profile?.location}</p>
            <p style={styles.profileDetail}>⏳ {profile?.experience_years} years experience</p>
            <p style={styles.profileDetail}>💰 PKR {profile?.rate_per_hour}/hr</p>
            <div style={styles.trustBadge}>🛡️ Trust Score: {profile?.trust_score}/100</div>
          </div>
          <div style={styles.availabilitySection}>
            <p style={styles.availLabel}>Availability</p>
            <button
              onClick={handleAvailability}
              style={profile?.is_available ? styles.availableBtn : styles.unavailableBtn}>
              {profile?.is_available ? '✅ Available' : '❌ Unavailable'}
            </button>
          </div>
        </div>

        {/* Bookings */}
        <h3 style={styles.sectionTitle}>📋 Booking Requests</h3>
        {bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No booking requests yet. Make sure you are set to Available!</p>
          </div>
        ) : (
          <div style={styles.bookingsList}>
            {bookings.map((booking) => (
              <div key={booking.id} style={styles.bookingCard}>
                <div style={styles.bookingInfo}>
                  <h4 style={styles.parentName}>
                    👨‍👩‍👧 {booking.parents?.name || 'Parent'}
                  </h4>
                  <p style={styles.bookingDetail}>📍 {booking.parents?.location}</p>
                  <p style={styles.bookingDetail}>📞 {booking.parents?.phone}</p>
                  <p style={styles.bookingDetail}>📅 {booking.date} at {booking.time}</p>
                </div>
                <div style={styles.bookingActions}>
                  <span style={{
                    ...styles.statusBadge,
                    background: booking.status === 'pending' ? '#FFF3CD' :
                      booking.status === 'confirmed' ? '#D4EDDA' : '#F8D7DA',
                    color: booking.status === 'pending' ? '#856404' :
                      booking.status === 'confirmed' ? '#155724' : '#721C24',
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                  {booking.status === 'pending' && (
                    <div style={styles.actionBtns}>
                      <button
                        style={styles.acceptBtn}
                        onClick={() => handleBookingAction(booking.id, 'confirmed')}>
                        ✅ Accept
                      </button>
                      <button
                        style={styles.declineBtn}
                        onClick={() => handleBookingAction(booking.id, 'declined')}>
                        ❌ Decline
                      </button>
                    </div>
                  )}
                </div>
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
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', fontSize: '18px', color: '#64748b' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 40px', background: '#0D7377' },
  logo: { color: 'white', margin: 0, fontSize: '22px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'white', fontSize: '14px' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
  content: { padding: '32px 40px' },
  profileCard: { background: 'white', borderRadius: '16px', padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex',
    alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: '#0D7377',
    color: 'white', fontSize: '32px', fontWeight: 'bold', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { margin: '0 0 8px', color: '#1a1a2e', fontSize: '22px' },
  profileDetail: { margin: '0 0 4px', color: '#64748b', fontSize: '14px' },
  trustBadge: { display: 'inline-block', background: '#E8F8F7', color: '#0D7377',
    padding: '4px 12px', borderRadius: '20px', fontSize: '13px',
    fontWeight: 'bold', marginTop: '8px' },
  availabilitySection: { textAlign: 'center' },
  availLabel: { color: '#64748b', fontSize: '13px', margin: '0 0 8px' },
  availableBtn: { background: '#D4EDDA', color: '#155724', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  unavailableBtn: { background: '#F8D7DA', color: '#721C24', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  sectionTitle: { color: '#1a1a2e', fontSize: '20px', marginBottom: '16px' },
  emptyState: { background: 'white', borderRadius: '12px', padding: '40px',
    textAlign: 'center', color: '#64748b', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  bookingCard: { background: 'white', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  bookingInfo: { flex: 1 },
  parentName: { margin: '0 0 8px', color: '#1a1a2e', fontSize: '16px' },
  bookingDetail: { margin: '0 0 4px', color: '#64748b', fontSize: '13px' },
  bookingActions: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 'bold' },
  actionBtns: { display: 'flex', gap: '8px', marginTop: '8px' },
  acceptBtn: { background: '#0D7377', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  declineBtn: { background: '#EF4444', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
};

export default AyaDashboard;