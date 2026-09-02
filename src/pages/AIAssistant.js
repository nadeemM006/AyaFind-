import React, { useState, useRef, useEffect, useCallback } from 'react';

const BACKEND_URL = 'https://ayafind-production.up.railway.app';

const C = {
  navy: '#18243D', navyDark: '#111B2E', teal: '#278F87', tealSoft: '#E4F1EF',
  coral: '#F47C5C', coralSoft: '#FDF0EC', bg: '#FAF9F5', card: '#FFFFFF',
  text: '#27313D', textSec: '#657081', textMuted: '#9BA5B4', border: '#E9E6E1',
  green: '#34946A', greenBg: '#ECF8F2',
};
const FF = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

const sv = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Ic = {
  Sparkles: (p) => <svg {...sv} {...p}><path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  Send: (p) => <svg {...sv} {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  AlertCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  RefreshCw: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  MapPin: (p) => <svg {...sv} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Award: (p) => <svg {...sv} {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Banknote: (p) => <svg {...sv} {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>,
  CheckCircle: (p) => <svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  ArrowRight: (p) => <svg {...sv} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 19 12 12 5"/></svg>,
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ExternalLink: (p) => <svg {...sv} {...p}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  User: (p) => <svg {...sv} {...p}><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Search: (p) => <svg {...sv} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  CreditCard: (p) => <svg {...sv} {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
};

const STARTER_PROMPTS = [
  { id: 1, text: 'Find an Aya for tomorrow evening' },
  { id: 2, text: 'Help me find childcare for my child' },
  { id: 3, text: 'What is my next booking?' },
  { id: 4, text: 'Show me Ayas that match my family' },
  { id: 5, text: 'Help me understand my booking' },
];

const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};

const expLabel = (v) => {
  if (v === null || v === undefined || v === '') return 'Experienced';
  return `${String(v).replace(/\s*years?$/i, '').trim()} yrs`;
};

/* ═══════════════════════════════════════════════════════
   RICH CONTENT RENDERERS
   ═══════════════════════════════════════════════════════ */

function CaregiverResults({ caregivers, onViewProfile, onBook }) {
  if (!caregivers || !caregivers.length) return null;
  return (
    <div className="ai-rich">
      <p className="ai-rich-label"><Ic.Search width={13} height={13} /> {caregivers.length} caregiver{caregivers.length !== 1 ? 's' : ''} found</p>
      {caregivers.map((c) => (
        <div key={c.id} className="ai-caregiver-card">
          <div className="ai-cg-top">
            <div className="ai-avatar ai-avatar-lg">{initials(c.name)}</div>
            <div className="ai-cg-info">
              <h4 className="ai-cg-name">{c.name}</h4>
              <p className="ai-cg-loc"><Ic.MapPin width={12} height={12} /> {c.location || 'Pakistan'}</p>
            </div>
          </div>
          <div className="ai-cg-details">
            <span><Ic.Shield width={13} height={13} /> Trust: {c.trustScore != null ? c.trustScore : '—'}/100</span>
            <span><Ic.Award width={13} height={13} /> {expLabel(c.experienceYears)}</span>
            {c.ratePerHour != null && <span><Ic.Banknote width={13} height={13} /> PKR {c.ratePerHour}/hr</span>}
          </div>
          {c.languages && c.languages.length > 0 && (
            <div className="ai-cg-tags">{c.languages.map((l) => <span key={l} className="ai-tag">{l}</span>)}</div>
          )}
          {c.matchReason && <p className="ai-cg-reason">{c.matchReason}</p>}
          <div className="ai-cg-actions">
            <button type="button" className="ai-btn-ghost ai-btn-sm" onClick={() => onViewProfile(c)}>View Profile</button>
            <button type="button" className="ai-btn-primary ai-btn-sm" onClick={() => onBook(c)}>Book</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingSummaryCard({ booking }) {
  if (!booking) return null;
  const rate = booking.ratePerHour || 0;
  const duration = booking.duration || 4;
  const total = rate * duration;
  return (
    <div className="ai-rich">
      <div className="ai-summary-card">
        <p className="ai-summary-title"><Ic.Calendar width={14} height={14} /> Booking Summary</p>
        <div className="ai-summary-rows">
          {booking.ayaName && <div className="ai-sr"><span>Caregiver</span><strong>{booking.ayaName}</strong></div>}
          {booking.date && <div className="ai-sr"><span>Date</span><strong>{booking.date}</strong></div>}
          {booking.time && <div className="ai-sr"><span>Time</span><strong>{booking.time}</strong></div>}
          <div className="ai-sr"><span>Duration</span><strong>{duration} hour{duration !== 1 ? 's' : ''}</strong></div>
          {rate > 0 && <div className="ai-sr"><span>Rate</span><strong>PKR {rate}/hr</strong></div>}
          {total > 0 && <div className="ai-sr ai-sr-total"><span>Total</span><strong>PKR {total.toLocaleString()}</strong></div>}
        </div>
      </div>
    </div>
  );
}

function ConfirmationCard({ data, onConfirm, onChange }) {
  if (!data) return null;
  return (
    <div className="ai-rich ai-confirm">
      <div className="ai-confirm-card">
        <p className="ai-confirm-title"><Ic.CheckCircle width={15} height={15} /> Please confirm</p>
        {data.summary && <p className="ai-confirm-summary">{data.summary}</p>}
        <div className="ai-confirm-actions">
          <button type="button" className="ai-btn-primary" onClick={onConfirm}>Confirm</button>
          <button type="button" className="ai-btn-ghost" onClick={onChange}>Change</button>
        </div>
      </div>
    </div>
  );
}

function NavigationCard({ page, title, onNavigate }) {
  return (
    <div className="ai-rich">
      <button type="button" className="ai-nav-card" onClick={() => onNavigate(page)}>
        <span className="ai-nav-text">Go to {title || page}</span>
        <Ic.ArrowRight width={15} height={15} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

function AIAssistant({ profile, bookings, ayas, familyData, onNavigate, onBookAya, onViewProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const processedNav = useRef(new Set());

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isThinking, scrollToBottom]);
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  /* Process navigation structured data */
  useEffect(() => {
    messages.forEach((m, i) => {
      if (m.role === 'assistant' && m.structuredData && m.structuredData.type === 'navigation') {
        const key = `nav-${i}`;
        if (!processedNav.current.has(key)) {
          processedNav.current.add(key);
          const page = m.structuredData.data && m.structuredData.data.page;
          if (page && onNavigate) onNavigate(page);
        }
      }
    });
  }, [messages, onNavigate]);

  /* Shared reply completion — appends the assistant message or surfaces
     a friendly error. Used by both send() and handleRetry(). */
  const completeReply = async (apiMessages) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: profile.id,
          messages: apiMessages,
          familyData: familyData || null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'The AI assistant encountered an error.');
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.reply || '',
        structuredData: data.structuredData || null,
        id: Date.now() + 1,
      };

      // Track the pending action when the AI asks for confirmation
      if (data.structuredData && data.structuredData.type === 'confirmation') {
        setPendingAction(data.structuredData.data);
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err && err.message
          ? err.message
          : 'Could not connect to the AI assistant. Please check your connection and try again.'
      );
    } finally {
      setIsThinking(false);
    }
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isThinking) return;
    if (!profile) {
      setError('Please sign in to use the AI assistant.');
      return;
    }

    setError(null);
    setIsThinking(true);

    const userMsg = { role: 'user', content: trimmed, id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // Build API payload — only user/assistant messages, no IDs
    const apiMessages = newMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    await completeReply(apiMessages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const handleStarterPrompt = (text) => {
    send(text);
  };

  /* Map an AI caregiver (camelCase) to the raw aya row so existing
     BookingFlow / profile views receive the field format they expect */
  const resolveAya = (caregiver) => {
    if (!caregiver) return null;
    const full = (ayas || []).find((a) => a.id === caregiver.id);
    if (full) return full;
    /* Fallback: map camelCase fields back to the aya row format */
    return {
      id: caregiver.id,
      name: caregiver.name,
      location: caregiver.location,
      experience_years: caregiver.experienceYears != null ? caregiver.experienceYears : caregiver.experience_years,
      rate_per_hour: caregiver.ratePerHour != null ? caregiver.ratePerHour : caregiver.rate_per_hour,
      trust_score: caregiver.trustScore != null ? caregiver.trustScore : caregiver.trust_score,
      bio: caregiver.bio || '',
      languages: caregiver.languages || [],
      specialties: caregiver.specialties || [],
      is_available: caregiver.isAvailable != null ? caregiver.isAvailable : true,
    };
  };

  /* Confirmation hands off to the existing BookingFlow — the AI never
     creates bookings or payments itself */
  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.action === 'prepare_booking' && pendingAction.caregiverId) {
      const aya = resolveAya({ id: pendingAction.caregiverId });
      setPendingAction(null);
      if (aya && onBookAya) {
        onBookAya(aya);
        return;
      }
    }
    setPendingAction(null);
    setError('I couldn\u2019t open the booking flow for that caregiver. You can book directly from Find Care.');
  };

  const handleChange = () => {
    setPendingAction(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleViewProfile = (caregiver) => {
    if (onViewProfile) onViewProfile(caregiver);
  };

  const handleBookAya = (caregiver) => {
    const aya = resolveAya(caregiver);
    if (aya && onBookAya) onBookAya(aya);
  };

  const handleRetry = async () => {
    if (!profile || isThinking) return;
    /* Re-request a reply for the existing conversation — the failed
       user message stays in the transcript, so nothing is duplicated */
    const hasUserMsg = messages.some((m) => m.role === 'user');
    if (!hasUserMsg) return;
    setError(null);
    setIsThinking(true);
    const apiMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));
    await completeReply(apiMessages);
  };

  /* ── Render ─────────────────────────────────────── */
  const isEmpty = messages.length === 0;

  const renderStructuredData = (sd, msgId) => {
    if (!sd || !sd.type || !sd.data) return null;
    switch (sd.type) {
      case 'caregiver_results':
        return (
          <CaregiverResults
            caregivers={sd.data.caregivers}
            onViewProfile={handleViewProfile}
            onBook={handleBookAya}
          />
        );
      case 'booking_summary':
        return <BookingSummaryCard booking={sd.data} />;
      case 'confirmation':
        return (
          <ConfirmationCard
            data={sd.data}
            onConfirm={handleConfirm}
            onChange={handleChange}
          />
        );
      case 'navigation':
        return (
          <NavigationCard
            page={sd.data.page}
            title={sd.data.title}
            onNavigate={onNavigate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="ai-workspace">
      <style>{AI_CSS}</style>

      {/* Header */}
      <div className="ai-header">
        <span className="ai-badge"><Ic.Sparkles width={18} height={18} /></span>
        <div>
          <h1 className="ai-title">AyaFind AI Assistant</h1>
          <p className="ai-subtitle">Your childcare concierge — ask me anything about care, bookings, or your family.</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="ai-chat">
        {isEmpty && !isThinking && (
          <div className="ai-empty">
            <div className="ai-empty-icon"><Ic.Sparkles width={28} height={28} /></div>
            <h2 className="ai-empty-title">How can I help you today?</h2>
            <p className="ai-empty-text">Ask me about finding caregivers, your bookings, family preferences, or anything related to childcare on AyaFind.</p>
            <div className="ai-prompts">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="ai-prompt-btn"
                  onClick={() => handleStarterPrompt(p.text)}
                  disabled={isThinking}
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`ai-msg ai-msg-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="ai-msg-avatar"><Ic.Sparkles width={14} height={14} /></div>
            )}
            <div className="ai-msg-body">
              {msg.role === 'user' ? (
                <div className="ai-bubble-user">{msg.content}</div>
              ) : (
                <>
                  {msg.content && <div className="ai-bubble-ai">{msg.content}</div>}
                  {msg.structuredData && renderStructuredData(msg.structuredData, msg.id)}
                </>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="ai-msg-avatar ai-msg-avatar-user"><Ic.User width={14} height={14} /></div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="ai-msg ai-msg-assistant">
            <div className="ai-msg-avatar"><Ic.Sparkles width={14} height={14} /></div>
            <div className="ai-msg-body">
              <div className="ai-typing">
                <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                <span className="ai-typing-text">Thinking</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Pending confirmation bar (if not in structured data) */}
      {pendingAction && messages.length > 0 && !messages[messages.length - 1].structuredData && (
        <div className="ai-confirm-bar">
          <p className="ai-confirm-bar-text">An action is awaiting your confirmation.</p>
          <div className="ai-confirm-bar-actions">
            <button type="button" className="ai-btn-primary ai-btn-sm" onClick={handleConfirm}>Confirm</button>
            <button type="button" className="ai-btn-ghost ai-btn-sm" onClick={handleChange}>Change</button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="ai-error" role="alert">
          <Ic.AlertCircle width={16} height={16} />
          <p>{error}</p>
          <button type="button" className="ai-btn-retry" onClick={handleRetry} title="Retry">
            <Ic.RefreshCw width={14} height={14} />
          </button>
        </div>
      )}

      {/* Composer */}
      <form className="ai-composer" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about childcare, bookings, or your family..."
          disabled={isThinking}
          aria-label="Message the AI assistant"
          autoComplete="off"
        />
        <button
          type="submit"
          className="ai-send"
          disabled={!input.trim() || isThinking}
          aria-label="Send message"
        >
          <Ic.Send width={16} height={16} />
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const AI_CSS = `
.ai-workspace{display:flex;flex-direction:column;height:100vh;max-height:100vh;background:${C.bg};font-family:${FF};-webkit-font-smoothing:antialiased;}
.ai-workspace *,.ai-workspace *::before,.ai-workspace *::after{box-sizing:border-box;}
.ai-workspace button{font-family:inherit;cursor:pointer;}
.ai-workspace :focus-visible{outline:2px solid ${C.teal};outline-offset:2px;}
.ai-workspace h1,.ai-workspace h2,.ai-workspace h3,.ai-workspace h4,.ai-workspace p{margin:0;}

/* Header */
.ai-header{display:flex;align-items:center;gap:14px;padding:20px 28px;border-bottom:1px solid ${C.border};background:${C.card};flex-shrink:0;}
.ai-badge{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:13px;background:${C.tealSoft};color:${C.teal};flex-shrink:0;}
.ai-title{font-size:18px;font-weight:800;color:${C.navy};letter-spacing:-0.02em;}
.ai-subtitle{font-size:13px;color:${C.textSec};margin-top:3px;line-height:1.45;}

/* Chat area */
.ai-chat{flex:1;overflow-y:auto;padding:24px 28px;display:flex;flex-direction:column;gap:18px;scroll-behavior:smooth;}
.ai-chat::-webkit-scrollbar{width:6px;}
.ai-chat::-webkit-scrollbar-track{background:transparent;}
.ai-chat::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}

/* Empty state */
.ai-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 20px 32px;max-width:520px;margin:0 auto;width:100%;}
.ai-empty-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:16px;}
.ai-empty-title{font-size:21px;font-weight:800;color:${C.navy};letter-spacing:-0.02em;}
.ai-empty-text{margin-top:8px;font-size:14px;line-height:1.6;color:${C.textSec};}
.ai-prompts{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px;justify-content:center;}
.ai-prompt-btn{padding:10px 16px;border:1px solid ${C.border};border-radius:10px;background:${C.card};color:${C.text};font-size:13px;font-weight:600;line-height:1.4;transition:border-color .18s,box-shadow .18s,transform .18s;}
.ai-prompt-btn:hover{border-color:${C.teal};box-shadow:0 4px 12px rgba(39,143,135,0.12);transform:translateY(-1px);}
.ai-prompt-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none;}

/* Messages */
.ai-msg{display:flex;align-items:flex-start;gap:10px;animation:aiFadeUp .3s ease both;}
.ai-msg-user{justify-content:flex-end;}
.ai-msg-avatar{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${C.tealSoft};color:${C.teal};flex-shrink:0;margin-top:2px;}
.ai-msg-avatar-user{background:${C.navy};color:#fff;}
.ai-msg-body{max-width:72%;min-width:60px;display:flex;flex-direction:column;gap:8px;}

/* Bubbles */
.ai-bubble-user{padding:12px 16px;border-radius:14px 14px 4px 14px;background:${C.teal};color:#fff;font-size:14px;line-height:1.6;font-weight:500;word-break:break-word;}
.ai-bubble-ai{padding:14px 18px;border-radius:14px 14px 14px 4px;background:${C.card};border:1px solid ${C.border};color:${C.text};font-size:14px;line-height:1.65;word-break:break-word;white-space:pre-wrap;}

/* Typing indicator */
.ai-typing{display:flex;align-items:center;gap:6px;padding:12px 18px;border-radius:14px 14px 14px 4px;background:${C.card};border:1px solid ${C.border};}
.ai-dot{width:7px;height:7px;border-radius:50%;background:${C.teal};animation:aiDot 1.2s infinite ease-in-out;}
.ai-dot:nth-child(2){animation-delay:0.15s;}
.ai-dot:nth-child(3){animation-delay:0.3s;}
.ai-typing-text{font-size:13px;font-weight:600;color:${C.textMuted};margin-left:4px;}

/* Rich content */
.ai-rich{display:flex;flex-direction:column;gap:10px;}
.ai-rich-label{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.teal};}

/* Caregiver result card */
.ai-caregiver-card{padding:16px;border:1px solid ${C.border};border-radius:12px;background:${C.card};transition:border-color .18s,box-shadow .18s;}
.ai-caregiver-card:hover{border-color:rgba(39,143,135,0.3);box-shadow:0 6px 16px rgba(23,36,61,0.06);}
.ai-cg-top{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.ai-avatar{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:${C.tealSoft};color:${C.teal};font-size:12px;font-weight:800;flex-shrink:0;}
.ai-avatar-lg{width:44px;height:44px;font-size:15px;}
.ai-cg-info{flex:1;min-width:0;}
.ai-cg-name{font-size:15px;font-weight:800;color:${C.text};}
.ai-cg-loc{display:flex;align-items:center;gap:4px;margin-top:2px;font-size:12px;color:${C.textSec};}
.ai-cg-details{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;}
.ai-cg-details span{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:${C.textSec};}
.ai-cg-details svg{color:${C.teal};flex-shrink:0;}
.ai-cg-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;}
.ai-tag{padding:3px 9px;border-radius:999px;background:${C.tealSoft};color:#1F7A73;font-size:11.5px;font-weight:700;}
.ai-cg-reason{font-size:12.5px;line-height:1.5;color:${C.textSec};padding:8px 12px;border-radius:8px;background:${C.bg};margin-bottom:8px;}
.ai-cg-actions{display:flex;gap:8px;}

/* Summary card */
.ai-summary-card{padding:16px;border:1px solid ${C.border};border-radius:12px;background:${C.card};}
.ai-summary-title{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${C.teal};margin-bottom:12px;}
.ai-summary-rows{display:flex;flex-direction:column;}
.ai-sr{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:13.5px;border-bottom:1px solid ${C.bg};}
.ai-sr:last-child{border-bottom:none;}
.ai-sr span{color:${C.textSec};font-weight:500;}
.ai-sr strong{color:${C.text};font-weight:700;text-align:right;}
.ai-sr-total{border-top:1.5px solid ${C.border};padding-top:10px;margin-top:4px;}
.ai-sr-total strong{color:${C.teal};font-size:15px;}

/* Confirmation card */
.ai-confirm-card{padding:16px;border:2px solid ${C.teal};border-radius:12px;background:${C.tealSoft};}
.ai-confirm-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:${C.teal};margin-bottom:10px;}
.ai-confirm-summary{font-size:13.5px;line-height:1.6;color:${C.text};margin-bottom:14px;white-space:pre-wrap;}
.ai-confirm-actions{display:flex;gap:10px;}

/* Confirm bar (fallback) */
.ai-confirm-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px;background:${C.tealSoft};border-top:1px solid rgba(39,143,135,0.2);flex-shrink:0;}
.ai-confirm-bar-text{font-size:13px;font-weight:600;color:${C.teal};}
.ai-confirm-bar-actions{display:flex;gap:8px;}

/* Navigation card */
.ai-nav-card{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border:1px solid ${C.border};border-radius:10px;background:${C.card};color:${C.teal};font-size:13.5px;font-weight:700;transition:border-color .18s,box-shadow .18s;}
.ai-nav-card:hover{border-color:${C.teal};box-shadow:0 4px 12px rgba(39,143,135,0.12);}
.ai-nav-text{display:flex;align-items:center;gap:6px;}

/* Buttons */
.ai-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;border:none;border-radius:9px;background:${C.teal};color:#fff;font-size:13px;font-weight:700;transition:background .18s,transform .18s;}
.ai-btn-primary:hover{background:#1F7A73;}
.ai-btn-primary:active{transform:translateY(1px);}
.ai-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border:1px solid ${C.border};border-radius:9px;background:${C.card};color:${C.text};font-size:13px;font-weight:700;transition:border-color .18s,background .18s;}
.ai-btn-ghost:hover{border-color:${C.teal};color:${C.teal};background:${C.tealSoft};}
.ai-btn-sm{padding:7px 14px;font-size:12.5px;}

/* Error */
.ai-error{display:flex;align-items:center;gap:10px;padding:12px 18px;margin:0 28px 8px;border-radius:10px;background:#FBE9E9;border:1px solid rgba(194,59,59,0.18);flex-shrink:0;}
.ai-error svg{color:#C23B3B;flex-shrink:0;}
.ai-error p{flex:1;font-size:13px;font-weight:600;color:#A03030;line-height:1.45;}
.ai-btn-retry{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:#C23B3B;transition:background .18s;}
.ai-btn-retry:hover{background:rgba(194,59,59,0.1);}

/* Composer */
.ai-composer{display:flex;align-items:center;gap:10px;padding:16px 28px 20px;border-top:1px solid ${C.border};background:${C.card};flex-shrink:0;}
.ai-input{flex:1;padding:12px 16px;border:1.5px solid ${C.border};border-radius:12px;background:${C.bg};color:${C.text};font-family:inherit;font-size:14.5px;line-height:1.5;transition:border-color .18s,box-shadow .18s,background .18s;}
.ai-input::placeholder{color:${C.textMuted};}
.ai-input:focus{outline:none;border-color:${C.teal};background:#fff;box-shadow:0 0 0 3px rgba(39,143,135,0.12);}
.ai-input:disabled{opacity:0.6;}
.ai-send{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:none;border-radius:12px;background:${C.teal};color:#fff;flex-shrink:0;transition:background .18s,transform .18s,opacity .18s;}
.ai-send:hover{background:#1F7A73;}
.ai-send:active{transform:scale(0.95);}
.ai-send:disabled{opacity:0.4;cursor:not-allowed;background:${C.textMuted};}

/* Animations */
@keyframes aiFadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
@keyframes aiDot{0%,80%,100%{opacity:0.25;transform:scale(0.8);}40%{opacity:1;transform:scale(1);}}

/* Responsive */
@media(max-width:960px){
  .ai-workspace{height:calc(100vh - 53px);max-height:calc(100vh - 53px);}
}
@media(max-width:768px){
  .ai-workspace{height:calc(100vh - 56px);max-height:calc(100vh - 56px);}
  .ai-header{padding:14px 16px;}
  .ai-chat{padding:16px;}
  .ai-msg-body{max-width:85%;}
  .ai-composer{padding:12px 16px 16px;}
  .ai-empty{padding:32px 12px 24px;}
  .ai-prompts{gap:6px;}
  .ai-prompt-btn{font-size:12.5px;padding:8px 12px;}
  .ai-error{margin:0 16px 8px;}
}
@media(max-width:480px){
  .ai-title{font-size:16px;}
  .ai-subtitle{font-size:12px;}
  .ai-bubble-user,.ai-bubble-ai{font-size:13.5px;}
  .ai-cg-actions{flex-direction:column;}
  .ai-confirm-actions{flex-direction:column;}
}
@media(prefers-reduced-motion:reduce){
  .ai-workspace *,.ai-workspace *::before,.ai-workspace *::after{animation-duration:0.001s!important;transition-duration:0.001s!important;}
}
`;

export default AIAssistant;
