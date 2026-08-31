import React, { useState } from 'react';
import { supabase } from '../supabase';

function Register() {
  const [role, setRole] = useState('parent');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', location: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Step 1 - Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // Step 2 - Save profile to correct table
      const table = role === 'parent' ? 'parents' : 'ayas';
      const { error: profileError } = await supabase
        .from(table)
        .insert([{
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
        }]);

      if (profileError) throw profileError;

      setMessage('✅ Account created! Redirecting...');
      setTimeout(() => {
        window.location.href = role === 'parent' ? '/parent-dashboard' : '/aya-dashboard';
      }, 1500);

    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🍃 AyaFind</h1>
        <h2 style={styles.title}>Create Account</h2>

        <div style={styles.toggle}>
          <button
            style={role === 'parent' ? styles.activeBtn : styles.inactiveBtn}
            onClick={() => setRole('parent')}>
            👨‍👩‍👧 I am a Parent
          </button>
          <button
            style={role === 'aya' ? styles.activeBtn : styles.inactiveBtn}
            onClick={() => setRole('aya')}>
            👩 I am an Aya
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="name"
            placeholder="Full Name" onChange={handleChange} required />
          <input style={styles.input} name="email" type="email"
            placeholder="Email Address" onChange={handleChange} required />
          <input style={styles.input} name="password" type="password"
            placeholder="Password" onChange={handleChange} required />
          <input style={styles.input} name="phone"
            placeholder="Phone Number" onChange={handleChange} required />
          <input style={styles.input} name="location"
            placeholder="City (e.g. Lahore)" onChange={handleChange} required />

          {message && <p style={styles.message}>{message}</p>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : `Register as ${role === 'parent' ? 'Parent' : 'Aya'}`}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account? <a href="/login" style={styles.link}>Login</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: 'white', borderRadius: '16px', padding: '40px',
    width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  logo: { textAlign: 'center', margin: '0 0 8px', fontSize: '28px' },
  title: { textAlign: 'center', color: '#1a1a2e', margin: '0 0 24px', fontSize: '22px' },
  toggle: { display: 'flex', gap: '10px', marginBottom: '24px' },
  activeBtn: { flex: 1, padding: '10px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  inactiveBtn: { flex: 1, padding: '10px', background: '#f1f5f9', color: '#64748b',
    border: 'none', borderRadius: '8px', cursor: 'pointer' },
  input: { width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '14px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' },
  message: { textAlign: 'center', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' },
  loginText: { textAlign: 'center', marginTop: '16px', color: '#64748b' },
  link: { color: '#0D7377', fontWeight: 'bold', textDecoration: 'none' },
};

export default Register;