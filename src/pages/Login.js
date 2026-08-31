import React, { useState } from 'react';
import { supabase } from '../supabase';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const { data, error } = await supabase.auth.signInWithPassword({
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
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🍃 AyaFind</h1>
        <h2 style={styles.title}>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="email" type="email"
            placeholder="Email Address" onChange={handleChange} required />
          <input style={styles.input} name="password" type="password"
            placeholder="Password" onChange={handleChange} required />

          {message && <p style={styles.message}>{message}</p>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <a href="/register" style={styles.link}>Register</a>
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
  input: { width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '14px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' },
  message: { textAlign: 'center', marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' },
  registerText: { textAlign: 'center', marginTop: '16px', color: '#64748b' },
  link: { color: '#0D7377', fontWeight: 'bold', textDecoration: 'none' },
};

export default Login;