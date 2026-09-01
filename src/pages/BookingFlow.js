import React, { useState, useEffect, useRef } from 'react';
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

  // Payment state
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [bookingId, setBookingId] = useState(null); // actual booking ID
  const [paymentId, setPaymentId] = useState(null); // actual payment ID (set after create)
  const [paymentStatus, setPaymentStatus] = useState(null); // 'creating' | 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const paymentAttempted = useRef(false);

  const totalSteps = 5;
  const rate = aya.rate_per_hour || 0;
  const duration = parseInt(form.duration, 10) || 4;
  const serviceTotal = rate * duration;

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

  // Load payment config when reaching checkout step
  useEffect(() => {
    if (step === 4 && !paymentConfig) {
      fetch(`${BACKEND_URL}/api/payments/config`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setPaymentConfig(d.config); })
        .catch(() => setPaymentConfig({ mode: 'sandbox', provider: 'sandbox', isLive: false }));
    }
  }, [step, paymentConfig]);

  // Continue to payment from booking summary (step 3)
  const handleContinueToPayment = async () => {
    setLoading(true);
    try {
      // Create the booking first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        setPaymentError('Please sign in to book care.');
        setLoading(false);
        return;
      }

      const { data: parentData } = await supabase
        .from('parents')
        .select('id')
        .eq('email', userData.user.email)
        .single();

      if (!parentData) {
        setPaymentError('Parent profile not found. Please complete registration.');
        setLoading(false);
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          parent_id: parentData.id,
          aya_id: aya.id,
          status: 'pending',
          date: form.date,
          time: form.time,
          duration: duration,
        }])
        .select('id')
        .single();

      if (bookingError) {
        setPaymentError('Could not create booking. Please try again.');
        setLoading(false);
        return;
      }

      // Store booking ID for payment creation
      setBookingId(bookingData.id);
      setStep(4);
    } catch (err) {
      setPaymentError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  // Handle Confirm & Pay (step 4)
  const handleConfirmPay = async () => {
    if (paymentAttempted.current) return;
    paymentAttempted.current = true;
    setPaymentStatus('creating');
    setPaymentError('');
    setPaymentMessage('');

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        setPaymentStatus('failed');
        setPaymentError('Authentication required. Please sign in.');
        return;
      }

      const { data: parentData } = await supabase
        .from('parents')
        .select('id')
        .eq('email', userData.user.email)
        .single();

      if (!parentData) {
        setPaymentStatus('failed');
        setPaymentError('Parent profile not found.');
        return;
      }

      // Call backend to create payment
      const createRes = await fetch(`${BACKEND_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId, // Use actual booking ID
          parentId: parentData.id,
        }),
      });
      const createData = await createRes.json();

      if (!createData.success) {
        setPaymentStatus('failed');
        setPaymentError(createData.error || 'Could not create payment.');
        return;
      }

      const payId = createData.paymentId;
      setPaymentId(payId);
      setPaymentStatus('processing');
      setPaymentMessage('Your payment is being verified.');

      // Attempt verification
      const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payId,
          parentId: parentData.id,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status === 'paid') {
        setPaymentStatus('paid');
        setPaymentMessage('Payment confirmed successfully.');
        setStep(5);
        return;
      }

      if (verifyData.status === 'pending') {
        setPaymentStatus('pending');
        setPaymentMessage(
          verifyData.isSandbox
            ? 'Payment record created. A live payment gateway has not been connected yet. Your booking is pending confirmation.'
            : 'Your payment is being verified. You will be notified once confirmed.'
        );
        setStep(5);
        return;
      }

      // Failed
      setPaymentStatus('failed');
      setPaymentError(verifyData.message || 'Payment could not be completed.');
    } catch (err) {
      setPaymentStatus('failed');
      setPaymentError('Payment service is currently unavailable. Your booking has been saved.');
    }
  };

  // Cancel payment
  const handleCancelPayment = async () => {
    // Cancel the payment record if one was created
    if (paymentId && paymentStatus !== 'paid') {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const { data: parentData } = await supabase
          .from('parents')
          .select('id')
          .eq('email', userData.user.email)
          .single();
        await fetch(`${BACKEND_URL}/api/payments/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, parentId: parentData ? parentData.id : undefined }),
        });
      } catch { /* silent */ }
    }
    setPaymentStatus('cancelled');
    setStep(3);
  };

  const handleDone = () => {
    onSuccess();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Book {aya.name}</h2>
            <p style={styles.modalSub}>Step {step} of {totalSteps}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>&#x2715;</button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {/* Step 1 - Child Details */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>Tell us about your child</h3>
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
              Next
            </button>
          </div>
        )}

        {/* Step 2 - Booking Details */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>Booking Details</h3>
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
              <button style={styles.backBtn} onClick={() => setStep(1)}>Back</button>
              <button
                style={styles.nextBtn}
                onClick={handleStep2}
                disabled={!form.date || !form.time || !form.location || loading}>
                {loading ? 'AI Analyzing...' : 'Get AI Match'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - AI Recommendation + Booking Summary */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>AI Match Result</h3>
            <p style={styles.stepSub}>Here's what our AI found for you</p>

            {/* Aya Card */}
            <div style={styles.ayaMatchCard}>
              <div style={styles.ayaMatchAvatar}>
                {aya.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.ayaMatchInfo}>
                <h4 style={styles.ayaMatchName}>{aya.name}</h4>
                <p style={styles.ayaMatchDetail}>{aya.location}</p>
                <p style={styles.ayaMatchDetail}>{aya.experience_years} yrs exp</p>
                <div style={styles.trustBadge}>Trust Score: {aya.trust_score}/100</div>
              </div>
            </div>

            {/* AI Reason */}
            <div style={styles.aiReasonBox}>
              <p style={styles.aiReasonLabel}>Why AI recommends her</p>
              <p style={styles.aiReasonText}>{aiReason}</p>
            </div>

            {/* Booking Summary */}
            <div style={styles.summaryBox}>
              <p style={styles.summaryTitle}>Booking Summary</p>
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
                <span>Hourly Rate</span><span>PKR {rate.toLocaleString()}</span>
              </div>
              <div style={{ ...styles.summaryRow, ...styles.summaryRowTotal }}>
                <span>Service Total</span>
                <span>PKR {serviceTotal.toLocaleString()}</span>
              </div>
            </div>

            {paymentError && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{paymentError}</p>
              </div>
            )}

            <div style={styles.btnRow}>
              <button style={styles.backBtn} onClick={() => setStep(2)}>Back</button>
              <button
                style={styles.confirmBtn}
                onClick={handleContinueToPayment}
                disabled={loading}>
                {loading ? 'Creating Booking...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Payment Checkout */}
        {step === 4 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>Payment Checkout</h3>
            <p style={styles.stepSub}>Review and confirm your payment</p>

            {/* Sandbox banner */}
            {paymentConfig && !paymentConfig.isLive && (
              <div style={styles.sandboxBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Sandbox mode: No real payment will be processed. Connect a live gateway to accept payments.</span>
              </div>
            )}

            {/* Checkout Summary */}
            <div style={styles.checkoutCard}>
              <div style={styles.checkoutHeader}>
                <div style={styles.checkoutAvatar}>{aya.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <h4 style={styles.checkoutName}>{aya.name}</h4>
                  <p style={styles.checkoutSub}>Childcare Services</p>
                </div>
              </div>

              <div style={styles.checkoutDivider} />

              <div style={styles.checkoutDetails}>
                <div style={styles.summaryRow}><span>Date</span><span>{form.date}</span></div>
                <div style={styles.summaryRow}><span>Time</span><span>{form.time}</span></div>
                <div style={styles.summaryRow}><span>Duration</span><span>{duration} hours</span></div>
              </div>

              <div style={styles.checkoutDivider} />

              <div style={styles.checkoutAmounts}>
                <div style={styles.summaryRow}><span>Hourly Rate</span><span>PKR {rate.toLocaleString()}</span></div>
                <div style={styles.summaryRow}><span>Duration</span><span>{duration} hours</span></div>
                <div style={{ ...styles.summaryRow, ...styles.summaryRowTotal }}>
                  <span>Total</span><span>PKR {serviceTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={styles.methodBox}>
              <p style={styles.methodLabel}>Payment Method</p>
              <div style={styles.methodValue}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>
                  {paymentConfig && paymentConfig.supportedMethods
                    ? paymentConfig.supportedMethods[0]
                    : 'Payment method'}
                </span>
              </div>
            </div>

            {/* Processing state */}
            {paymentStatus === 'creating' && (
              <div style={styles.processingBox}>
                <div style={styles.spinner} />
                <span>Creating payment...</span>
              </div>
            )}
            {paymentStatus === 'processing' && (
              <div style={styles.processingBox}>
                <div style={styles.spinner} />
                <span>Verifying payment...</span>
              </div>
            )}

            {paymentError && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{paymentError}</p>
              </div>
            )}

            <div style={styles.btnRow}>
              <button
                style={styles.backBtn}
                onClick={handleCancelPayment}
                disabled={paymentStatus === 'creating' || paymentStatus === 'processing'}>
                Cancel
              </button>
              <button
                style={styles.payBtn}
                onClick={handleConfirmPay}
                disabled={
                  loading ||
                  paymentStatus === 'creating' ||
                  paymentStatus === 'processing' ||
                  paymentStatus === 'paid'
                }>
                {paymentStatus === 'creating' || paymentStatus === 'processing'
                  ? 'Processing...'
                  : `Confirm & Pay PKR ${serviceTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 - Result */}
        {step === 5 && (
          <div style={styles.resultStep}>
            {/* Paid success */}
            {paymentStatus === 'paid' && (
              <>
                <div style={styles.resultIconGreen}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 style={styles.resultTitle}>Booking Confirmed</h3>
                <p style={styles.resultText}>
                  Your payment has been confirmed. <b>{aya.name}</b> has been notified of your booking.
                </p>
              </>
            )}

            {/* Pending (sandbox or gateway pending) */}
            {(paymentStatus === 'pending' || (!paymentStatus && paymentId)) && (
              <>
                <div style={styles.resultIconAmber}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 style={styles.resultTitle}>Booking Submitted</h3>
                <p style={styles.resultText}>
                  {paymentMessage || 'Your booking request has been submitted. Payment verification is pending.'}
                </p>
              </>
            )}

            {/* Failed */}
            {paymentStatus === 'failed' && (
              <>
                <div style={styles.resultIconRed}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3 style={styles.resultTitle}>Payment Could Not Be Completed</h3>
                <p style={styles.resultText}>
                  {paymentError || 'Your payment could not be processed. Your booking has been saved as pending.'}
                </p>
              </>
            )}

            {/* Details */}
            <div style={styles.resultDetails}>
              <div style={styles.summaryRow}>
                <span>Caregiver</span><span>{aya.name}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Date & Time</span><span>{form.date} at {form.time}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Duration</span><span>{duration} hours</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Location</span><span>{form.location}</span>
              </div>
              <div style={{ ...styles.summaryRow, ...styles.summaryRowTotal }}>
                <span>Total</span><span>PKR {serviceTotal.toLocaleString()}</span>
              </div>
            </div>

            <button style={styles.doneBtn} onClick={handleDone}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      <style>{BOOKING_CSS}</style>
    </div>
  );
}

const BOOKING_CSS = `
@keyframes bfSpin { to { transform: rotate(360deg); } }
`;

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
  payBtn: { flex: 2, padding: '14px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px',
    boxShadow: '0 4px 14px rgba(13,115,119,0.25)' },
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
  summaryRowTotal: { borderTop: '1px solid #E2E8F0', paddingTop: '10px',
    marginTop: '4px', marginBottom: 0, fontWeight: 'bold',
    color: '#0D7377', fontSize: '15px' },

  // Checkout styles
  sandboxBanner: { display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', background: '#FBF1D8', borderRadius: '10px',
    marginBottom: '16px', fontSize: '12px', color: '#9A6B15',
    fontWeight: 600, lineHeight: 1.5 },
  checkoutCard: { background: '#f8fafc', borderRadius: '14px',
    padding: '20px', marginBottom: '16px' },
  checkoutHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  checkoutAvatar: { width: '44px', height: '44px', borderRadius: '50%',
    background: '#0D7377', color: 'white', fontSize: '18px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkoutName: { margin: 0, color: '#1a1a2e', fontSize: '15px', fontWeight: 700 },
  checkoutSub: { margin: '2px 0 0', color: '#64748b', fontSize: '12px' },
  checkoutDivider: { height: '1px', background: '#E2E8F0', margin: '14px 0' },
  checkoutDetails: {},
  checkoutAmounts: {},
  methodBox: { background: '#f8fafc', borderRadius: '10px',
    padding: '14px 16px', marginBottom: '16px' },
  methodLabel: { fontSize: '11px', fontWeight: 800, color: '#9BA5B4',
    letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' },
  methodValue: { display: 'flex', alignItems: 'center', gap: '10px',
    fontSize: '14px', fontWeight: 700, color: '#1a1a2e' },
  processingBox: { display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px', background: '#E4F1EF', borderRadius: '10px',
    marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: '#278F87' },
  spinner: { width: '18px', height: '18px', border: '2px solid #E4F1EF',
    borderTop: '2px solid #278F87', borderRadius: '50%',
    animation: 'bfSpin 0.8s linear infinite' },
  errorBox: { background: '#FBE9E9', borderRadius: '10px',
    padding: '12px 16px', marginBottom: '16px' },
  errorText: { color: '#C23B3B', fontSize: '13px', fontWeight: 600, margin: 0 },

  // Result styles
  resultStep: { padding: '40px 24px', textAlign: 'center' },
  resultIconGreen: { width: '64px', height: '64px', borderRadius: '50%',
    background: '#ECF8F2', color: '#34946A', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  resultIconAmber: { width: '64px', height: '64px', borderRadius: '50%',
    background: '#FBF1D8', color: '#9A6B15', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  resultIconRed: { width: '64px', height: '64px', borderRadius: '50%',
    background: '#FBE9E9', color: '#C23B3B', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  resultTitle: { color: '#1a1a2e', fontSize: '20px', margin: '0 0 8px', fontWeight: 800 },
  resultText: { color: '#64748b', fontSize: '14px', lineHeight: 1.6,
    margin: '0 0 20px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' },
  resultDetails: { background: '#f8fafc', borderRadius: '12px',
    padding: '16px', marginBottom: '24px', textAlign: 'left' },
  doneBtn: { width: '100%', padding: '14px', background: '#0D7377', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer' },
};

export default BookingFlow;
