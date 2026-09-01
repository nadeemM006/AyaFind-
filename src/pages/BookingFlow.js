import React, { useState } from 'react';
import { supabase } from '../supabase';

const BACKEND_URL = 'https://ayafind-production.up.railway.app';

function BookingFlow({ aya, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiReason, setAiReason] = useState('');
  const [form, setForm] = useState({
    childAge: '',
    specialNeeds: '',
    language: 'Urdu',
    date: '',
    time: '',
    duration: '4',
    location: '',
    notes: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStep2 = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/match-ayas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentNeeds: {
            childAge: form.childAge,
            specialNeeds: form.specialNeeds,
            location: form.location,
            language: form.language,
          },
          ayas: [aya],
        }),
      });
      const result = await response.json();
      if (result.success && result.rankings.length > 0) {
        setAiReason(result.rankings[0].reason);
      }
    } catch {
      setAiReason('Experienced and verified Aya matching your requirements.');
    }
    setLoading(false);
    setStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
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
          aya_id: aya.id,
          status: 'pending',
          date: form.date,
          time: form.time,
        }]);

      if (!error) {
        setStep(4);
      } else {
        alert('❌ Booking failed: ' + error.message);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Book {aya.name}</h2>
            <p style={styles.modalSub}>Step {step} of 4</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(step / 4) * 100}%` }} />
        </div>

        {/* Step 1 — Child Details */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>👶 Tell us about your child</h3>
            <p style={styles.stepSub}>This helps AI find the perfect match</p>

            <label style={styles.label}>Child's Age</label>
            <select name="childAge" style={styles.input} onChange={handleChange} value={form.childAge}>
              <option value="">Select age</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1} year{i > 0 ? 's' : ''} old</option>
              ))}
            </select>

            <label style={styles.label}>Special Needs (if any)</label>
            <select name="specialNeeds" style={styles.input} onChange={handleChange} value={form.specialNeeds}>
              <option value="">None</option>
              <option value="Infant care">Infant care</option>
              <option value="Special needs child">Special needs child</option>
              <option value="Multiple children">Multiple children</option>
              <option value="Medical needs">Medical needs</option>
            </select>

            <label style={styles.label}>Preferred Language</label>
            <select name="language" style={styles.input} onChange={handleChange} value={form.language}>
              <option value="Urdu">Urdu</option>
              <option value="English">English</option>
              <option value="Punjabi">Punjabi</option>
              <option value="Sindhi">Sindhi</option>
            </select>

            <button
              style={styles.nextBtn}
              onClick={() => setStep(2)}
              disabled={!form.childAge}>
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — Booking Details */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>📅 Booking Details</h3>
            <p style={styles.stepSub}>When do you need the Aya?</p>

            <label style={styles.label}>Date</label>
            <input
              type="date"
              name="date"
              style={styles.input}
              onChange={handleChange}
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
            />

            <label style={styles.label}>Time</label>
            <input
              type="time"
              name="time"
              style={styles.input}
              onChange={handleChange}
              value={form.time}
            />

            <label style={styles.label}>Duration</label>
            <select name="duration" style={styles.input} onChange={handleChange} value={form.duration}>
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours (Full day)</option>
            </select>

            <label style={styles.label}>Your Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. DHA Lahore, Block C"
              style={styles.input}
              onChange={handleChange}
              value={form.location}
            />

            <label style={styles.label}>Special Instructions (optional)</label>
            <textarea
              name="notes"
              placeholder="Any specific instructions for the Aya..."
              style={{ ...styles.input, height: '80px', resize: 'none' }}
              onChange={handleChange}
              value={form.notes}
            />

            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
              <button
                style={styles.nextBtn}
                onClick={handleStep2}
                disabled={!form.date || !form.time || !form.location || loading}>
                {loading ? 'AI Analyzing...' : 'Get AI Match →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — AI Recommendation */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>🤖 AI Match Result</h3>
            <p style={styles.stepSub}>Here's what our AI found for you</p>

            {/* Aya Card */}
            <div style={styles.ayaMatchCard}>
              <div style={styles.ayaMatchAvatar}>
                {aya.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.ayaMatchInfo}>
                <h4 style={styles.ayaMatchName}>{aya.name}</h4>
                <p style={styles.ayaMatchDetail}>📍 {aya.location}</p>
                <p style={styles.ayaMatchDetail}>⏳ {aya.experience_years} yrs exp</p>
                <div style={styles.trustBadge}>🛡️ Trust Score: {aya.trust_score}/100</div>
              </div>
            </div>

            {/* AI Reason */}
            <div style={styles.aiReasonBox}>
              <p style={styles.aiReasonLabel}>🤖 Why AI recommends her</p>
              <p style={styles.aiReasonText}>{aiReason}</p>
            </div>

            {/* Booking Summary */}
            <div style={styles.summaryBox}>
              <p style={styles.summaryTitle}>📋 Booking Summary</p>
              <div style={styles.summaryRow}>
                <span>Date</span><span>{form.date}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Time</span><span>{form.time}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Duration</span><span>{form.duration} hours</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Location</span><span>{form.location}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Estimated Cost</span>
                <span style={{ color: '#0D7377', fontWeight: 'bold' }}>
                  PKR {aya.rate_per_hour * form.duration}
                </span>
              </div>
            </div>

            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
              <button style={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
                {loading ? 'Confirming...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div style={styles.successStep}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={styles.successTitle}>Booking Sent!</h3>
            <p style={styles.successText}>
              Your booking request has been sent to <b>{aya.name}</b>.
              She will confirm shortly.
            </p>
            <div style={styles.successDetails}>
              <p>📅 {form.date} at {form.time}</p>
              <p>⏳ {form.duration} hours</p>
              <p>📍 {form.location}</p>
              <p style={{ color: '#0D7377', fontWeight: 'bold' }}>
                💰 Estimated: PKR {aya.rate_per_hour * form.duration}
              </p>
            </div>
            <button style={styles.doneBtn} onClick={onSuccess}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal: { background: 'white', borderRadius: '20px', width: '100%',
    maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '24px 24px 0' },
  modalTitle: { margin: 0, color: '#1a1a2e', fontSize: '20px' },
  modalSub: { margin: '4px 0 0', color: '#64748b', fontSize: '13px' },
  closeBtn: { background: '#f1f5f9', border: 'none', borderRadius: '8px',
    width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' },
  progressBar: { height: '4px', background: '#E2E8F0', margin: '16px 24px 0' },
  progressFill: { height: '100%', background: '#0D7377', borderRadius: '2px',
    transition: 'width 0.3s ease' },
  stepContent: { padding: '24px' },
  stepTitle: { color: '#1a1a2e', fontSize: '18px', margin: '0 0 4px' },
  stepSub: { color: '#64748b', fontSize: '14px', margin: '0 0 20px' },
  label: { display: 'block', color: '#374151', fontSize: '13px',
    fontWeight: 'bold', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid #E2E8F0', fontSize: '14px',
    marginBottom: '16px', boxSizing: 'border-box', fontFamily: 'inherit' },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  backBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px' },
  nextBtn: { flex: 2, padding: '12px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px' },
  confirmBtn: { flex: 2, padding: '12px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px' },
  ayaMatchCard: { display: 'flex', gap: '16px', alignItems: 'center',
    background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  ayaMatchAvatar: { width: '56px', height: '56px', borderRadius: '50%',
    background: '#0D7377', color: 'white', fontSize: '24px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ayaMatchInfo: { flex: 1 },
  ayaMatchName: { margin: '0 0 4px', color: '#1a1a2e', fontSize: '16px' },
  ayaMatchDetail: { margin: '0 0 4px', color: '#64748b', fontSize: '13px' },
  trustBadge: { display: 'inline-block', background: '#E8F8F7', color: '#0D7377',
    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  aiReasonBox: { background: '#F0FDF4', borderRadius: '10px',
    padding: '14px', marginBottom: '16px' },
  aiReasonLabel: { color: '#0D7377', fontSize: '12px',
    fontWeight: 'bold', margin: '0 0 6px' },
  aiReasonText: { color: '#374151', fontSize: '13px', lineHeight: 1.6, margin: 0 },
  summaryBox: { background: '#f8fafc', borderRadius: '10px',
    padding: '16px', marginBottom: '16px' },
  summaryTitle: { color: '#1a1a2e', fontSize: '14px',
    fontWeight: 'bold', margin: '0 0 12px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between',
    fontSize: '13px', color: '#64748b', marginBottom: '8px' },
  successStep: { padding: '40px 24px', textAlign: 'center' },
  successIcon: { fontSize: '56px', marginBottom: '16px' },
  successTitle: { color: '#1a1a2e', fontSize: '22px', margin: '0 0 8px' },
  successText: { color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' },
  successDetails: { background: '#f8fafc', borderRadius: '12px',
    padding: '16px', marginBottom: '24px', textAlign: 'left' },
  doneBtn: { width: '100%', padding: '14px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer' },
};

export default BookingFlow;