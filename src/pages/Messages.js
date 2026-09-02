import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatTimeOfDay } from '../utils/parseCareRequest';

const BACKEND_URL = 'https://ayafind-production.up.railway.app';

/* ═══════════════════════════════════════════════════════
   MESSAGES — Parent ↔ Aya communication
   ═══════════════════════════════════════════════════════ */

const C = {
  navy: '#18243D', navyDark: '#111B2E', teal: '#278F87', tealSoft: '#E4F1EF',
  coral: '#F47C5C', coralSoft: '#FDF0EC', bg: '#FAF9F5', card: '#FFFFFF',
  text: '#27313D', textSec: '#657081', textMuted: '#9BA5B4', border: '#E9E6E1',
  green: '#34946A', greenBg: '#ECF8F2',
};
const FF = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

/* ── Icons ──────────────────────────────────────────── */
const sv = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Ic = {
  Send: (p) => <svg {...sv} {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  ArrowLeft: (p) => <svg {...sv} {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  MessageCircle: (p) => <svg {...sv} {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Calendar: (p) => <svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  AlertCircle: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Shield: (p) => <svg {...sv} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: (p) => <svg {...sv} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Refresh: (p) => <svg {...sv} {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
};

/* ── Helpers ────────────────────────────────────────── */
const initials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return (((parts[0] && parts[0][0]) || '') + ((parts[1] && parts[1][0]) || '')).toUpperCase() || 'A';
};
const firstName = (name) => (name || '').trim().split(/\s+/)[0] || '';

const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const msgTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const msgDateLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = localDateStr(new Date());
  const ds = localDateStr(d);
  if (ds === today) return 'Today';
  const yesterday = localDateStr(new Date(Date.now() - 86400000));
  if (ds === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const convTimeLabel = (iso) => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* Group messages by date */
const groupByDate = (messages) => {
  const groups = [];
  let currentLabel = '';
  messages.forEach((m) => {
    const label = msgDateLabel(m.created_at);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [] });
    }
    groups[groups.length - 1].messages.push(m);
  });
  return groups;
};

/* Simple safety check — discourage sharing sensitive info */
const SENSITIVE_PATTERNS = [
  /\b(?:password|passwd|pin|otp)\b/i,
  /\b(?:credit\s*card|debit\s*card|card\s*number|cvv|cvc)\b/i,
  /\b(?:bank\s*account|iban|routing\s*number)\b/i,
];
const containsSensitiveInfo = (text) => SENSITIVE_PATTERNS.some((p) => p.test(text));

const POLL_INTERVAL = 5000;

/* ═══════════════════════════════════════════════════════
   CONVERSATION LIST ITEM
   ═══════════════════════════════════════════════════════ */
function ConvItem({ conv, active, onClick }) {
  const aya = conv.ayas || {};
  const latest = conv.latest_message;
  const booking = conv.bookings || {};
  const time = formatTimeOfDay(booking.time);
  const dateLabel = booking.date
    ? `${localDateStr(new Date()) === booking.date ? 'Today' : new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : '';

  return (
    <button type="button" className={`mg-conv${active ? ' mg-conv-active' : ''}`} onClick={onClick}>
      <div className="mg-conv-avatar">{initials(aya.name)}</div>
      <div className="mg-conv-body">
        <div className="mg-conv-top">
          <span className="mg-conv-name">{aya.name || 'Caregiver'}</span>
          <span className="mg-conv-time">{convTimeLabel(latest ? latest.created_at : conv.updated_at)}</span>
        </div>
        <p className="mg-conv-preview">
          {latest
            ? (latest.sender_role === 'parent' ? 'You: ' : '') + latest.content
            : 'No messages yet'}
        </p>
        {booking.date && (
          <p className="mg-conv-booking">
            <Ic.Calendar width={11} height={11} /> {dateLabel}{time ? ` at ${time}` : ''}
          </p>
        )}
      </div>
      {conv.unread_count > 0 && (
        <span className="mg-conv-unread">{conv.unread_count > 99 ? '99+' : conv.unread_count}</span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   CHAT VIEW — header, messages, composer
   ═══════════════════════════════════════════════════════ */
function ChatView({ conv, messages, parentId, onSend, sending, sendError, onBack, isMobile, loadingMsgs, msgError, onRetry }) {
  const aya = (conv && conv.ayas) || {};
  const booking = (conv && conv.bookings) || {};
  const time = formatTimeOfDay(booking.time);
  const scrollRef = useRef(null);
  const [text, setText] = useState('');
  const [safetyWarn, setSafetyWarn] = useState(false);

  /* Auto-scroll to bottom when messages change */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    if (containsSensitiveInfo(trimmed)) {
      setSafetyWarn(true);
      return;
    }
    setSafetyWarn(false);
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const bookingDateStr = booking.date
    ? `${new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${time ? ` at ${time}` : ''}`
    : '';

  const groups = groupByDate(messages || []);

  return (
    <div className="mg-chat">
      {/* Header */}
      <div className="mg-chat-header">
        {isMobile && (
          <button type="button" className="mg-back-btn" onClick={onBack} aria-label="Back to conversations">
            <Ic.ArrowLeft width={18} height={18} />
          </button>
        )}
        <div className="mg-chat-header-avatar">{initials(aya.name)}</div>
        <div className="mg-chat-header-info">
          <h3 className="mg-chat-header-name">{aya.name || 'Caregiver'}</h3>
          {bookingDateStr && (
            <p className="mg-chat-header-booking">
              <Ic.Calendar width={12} height={12} /> {bookingDateStr}
            </p>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="mg-chat-messages" ref={scrollRef}>
        {loadingMsgs ? (
          <div className="mg-chat-loading">
            <div className="mg-skel-msg" />
            <div className="mg-skel-msg mg-skel-msg-short" />
            <div className="mg-skel-msg" />
          </div>
        ) : msgError ? (
          <div className="mg-chat-empty">
            <div className="mg-chat-empty-icon mg-chat-empty-icon-error"><Ic.AlertCircle width={22} height={22} /></div>
            <p className="mg-chat-empty-title">Couldn't load messages</p>
            <p className="mg-chat-empty-text">{msgError}</p>
            {onRetry && (
              <button type="button" className="mg-btn-primary mg-chat-retry" onClick={onRetry}>Try Again</button>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="mg-chat-empty">
            <div className="mg-chat-empty-icon"><Ic.MessageCircle width={22} height={22} /></div>
            <p className="mg-chat-empty-title">Start a conversation</p>
            <p className="mg-chat-empty-text">Send a message to {firstName(aya.name) || 'your caregiver'} about your booking.</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mg-date-group">
              <span className="mg-date-label">{group.label}</span>
              {group.messages.map((m) => {
                const isParent = m.sender_role === 'parent';
                return (
                  <div key={m.id} className={`mg-bubble${isParent ? ' mg-bubble-parent' : ' mg-bubble-aya'}`}>
                    <p className="mg-bubble-text">{m.content}</p>
                    <span className="mg-bubble-time">
                      {msgTime(m.created_at)}
                      {isParent && m.read_at && <span className="mg-read-dot" />}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Safety warning */}
      {safetyWarn && (
        <div className="mg-safety-warn" role="alert">
          <Ic.Shield width={14} height={14} />
          <p>Please avoid sharing passwords, payment card details, or sensitive personal information in messages.</p>
          <button type="button" className="mg-safety-dismiss" onClick={() => { setSafetyWarn(false); }}>Dismiss</button>
        </div>
      )}

      {/* Send error */}
      {sendError && (
        <div className="mg-send-error" role="alert">
          <Ic.AlertCircle width={14} height={14} />
          <p>{sendError}</p>
        </div>
      )}

      {/* Composer */}
      <div className="mg-composer">
        <textarea
          className="mg-composer-input"
          value={text}
          onChange={(e) => { setText(e.target.value); setSafetyWarn(false); }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${firstName(aya.name) || 'your caregiver'}...`}
          rows={1}
          maxLength={2000}
          disabled={sending}
          aria-label="Type a message"
        />
        <button
          type="button"
          className="mg-send-btn"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="Send message"
        >
          {sending ? <span className="mg-send-spinner" /> : <Ic.Send width={16} height={16} />}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN MESSAGES COMPONENT
   ═══════════════════════════════════════════════════════ */
function Messages({ profile, bookings, activeBookingId }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [convError, setConvError] = useState('');
  const [msgError, setMsgError] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const pollRef = useRef(null);
  const listPollRef = useRef(null);
  const messagesRef = useRef([]);
  const parentId = profile ? profile.id : null;

  /* Keep a ref mirror of messages for interval callbacks */
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  /* ── Responsive detection ─────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Load conversations ───────────────────────────── */
  const loadConversations = useCallback(async () => {
    if (!parentId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations/${parentId}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        setConvError('');
      } else {
        setConvError(data.error || 'Could not load conversations');
      }
    } catch {
      setConvError('Network error. Please check your connection.');
    } finally {
      setLoadingConvs(false);
    }
  }, [parentId]);

  /* ── Load messages for active conversation ────────── */
  const loadMessages = useCallback(async (convId) => {
    if (!convId || !parentId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations/${convId}/messages?parentId=${parentId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setMsgError('');
      } else {
        setMsgError(data.error || 'Could not load messages');
      }
    } catch {
      setMsgError('Network error. Please check your connection.');
    } finally {
      setLoadingMsgs(false);
    }
  }, [parentId]);

  /* ── Mark messages as read ────────────────────────── */
  const markRead = useCallback(async (convId) => {
    if (!convId || !parentId) return;
    try {
      await fetch(`${BACKEND_URL}/api/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, parentId }),
      });
    } catch { /* non-critical */ }
  }, [parentId]);

  /* ── Initial load ─────────────────────────────────── */
  useEffect(() => {
    if (!parentId) { setLoadingConvs(false); return; }
    loadConversations();
  }, [parentId, loadConversations]);

  /* ── Select conversation ──────────────────────────── */
  const selectConversation = useCallback((convId) => {
    setActiveConvId(convId);
    setMessages([]);
    setLoadingMsgs(true);
    setMsgError('');
    setSendError('');
    if (isMobile) setMobileShowChat(true);
    loadMessages(convId);
    markRead(convId).then(() => {
      // Clear the unread badge locally right away; the next list poll
      // restores the true count if the server call failed.
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c)));
    });
  }, [isMobile, loadMessages, markRead]);

  /* ── Active booking from MyBookings ───────────────── */
  const createdForRef = useRef(null);
  useEffect(() => {
    if (!activeBookingId || !parentId || loadingConvs) return;
    const existing = conversations.find((c) => c.booking_id === activeBookingId);
    if (existing) {
      if (existing.id !== activeConvId) selectConversation(existing.id);
    } else if (createdForRef.current !== activeBookingId) {
      // Conversation doesn't exist yet — create it (once per booking)
      createdForRef.current = activeBookingId;
      (async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/conversations/find-or-create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: activeBookingId, parentId }),
          });
          const data = await res.json();
          if (data.success && data.conversation) {
            await loadConversations();
            selectConversation(data.conversation.id);
          }
        } catch { /* will be retried on next conversation load */ }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBookingId, parentId, conversations, loadingConvs]);

  /* ── Polling for new messages ─────────────────────── */
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeConvId || !parentId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/conversations/${activeConvId}/messages?parentId=${parentId}`);
        const data = await res.json();
        if (data.success) {
          const incoming = data.messages || [];
          const prevIds = new Set(messagesRef.current.map((m) => m.id));
          const newMsgs = incoming.filter((m) => !prevIds.has(m.id));
          if (newMsgs.length > 0) {
            // Merge without duplicates — new messages are always the newest
            setMessages([...messagesRef.current, ...newMsgs]);
            // Mark newly arrived aya messages as read
            if (newMsgs.some((m) => m.sender_role === 'aya' && !m.read_at)) {
              markRead(activeConvId);
            }
          }
        }
      } catch { /* polling error — will retry next interval */ }
    }, POLL_INTERVAL);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvId, parentId, markRead]);

  /* ── Poll conversation list for updates ───────────── */
  useEffect(() => {
    if (listPollRef.current) clearInterval(listPollRef.current);
    if (!parentId) return;

    listPollRef.current = setInterval(() => {
      loadConversations();
    }, POLL_INTERVAL * 2);

    return () => { if (listPollRef.current) clearInterval(listPollRef.current); };
  }, [parentId, loadConversations]);

  /* ── Send message ─────────────────────────────────── */
  const handleSend = async (content) => {
    if (!activeConvId || !parentId) return;
    setSending(true);
    setSendError('');

    // Optimistic local message
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversation_id: activeConvId,
      sender_id: parentId,
      sender_role: 'parent',
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, parentId, content }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        // Replace optimistic message with the real server response.
        // Deduplicate in case a poll already fetched this message.
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempId && m.id !== data.message.id);
          return [...withoutTemp, data.message];
        });
        // Refresh conversation list for latest preview
        loadConversations();
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setSendError(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setSendError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  /* ── Back to conversation list (mobile) ───────────── */
  const handleBack = () => {
    setMobileShowChat(false);
    loadConversations();
  };

  /* ── Active conversation object ───────────────────── */
  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || null,
    [conversations, activeConvId]
  );

  /* ── Guest / not authenticated state ──────────────── */
  if (!parentId) {
    return (
      <div className="mg-root">
        <style>{MG_CSS}</style>
        <div className="mg-guest">
          <div className="mg-guest-icon"><Ic.MessageCircle width={26} height={26} /></div>
          <h2 className="mg-guest-title">Sign in to access Messages</h2>
          <p className="mg-guest-text">You need to be signed in as a parent to communicate with your caregivers.</p>
          <button type="button" className="mg-btn-primary" onClick={() => { window.location.href = '/login'; }}>Sign In</button>
        </div>
      </div>
    );
  }

  /* ── No conversations empty state ─────────────────── */
  const showEmpty = !loadingConvs && conversations.length === 0 && !activeConvId;

  /* ── Desktop: two-panel. Mobile: list or chat ─────── */
  const showList = !isMobile || !mobileShowChat;
  const showChat = !isMobile || mobileShowChat;

  return (
    <div className="mg-root">
      <style>{MG_CSS}</style>

      {showEmpty ? (
        <div className="mg-empty-full">
          <div className="mg-empty-icon"><Ic.MessageCircle width={28} height={28} /></div>
          <h2 className="mg-empty-title">Your conversations will appear here</h2>
          <p className="mg-empty-text">Once you connect with an Aya, you can communicate about your booking here.</p>
        </div>
      ) : (
        <div className="mg-layout">
          {/* Conversation list panel */}
          {showList && (
            <div className="mg-list-panel">
              <div className="mg-list-header">
                <h1 className="mg-list-title">Messages</h1>
                <button
                  type="button"
                  className="mg-refresh-btn"
                  onClick={loadConversations}
                  disabled={loadingConvs}
                  aria-label="Refresh conversations"
                >
                  <Ic.Refresh width={15} height={15} />
                </button>
              </div>
              {convError && (
                <div className="mg-error-bar" role="alert">
                  <Ic.AlertCircle width={13} height={13} />
                  <span>{convError}</span>
                </div>
              )}
              <div className="mg-list-scroll">
                {loadingConvs ? (
                  <div className="mg-skel-list">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="mg-skel-conv">
                        <div className="mg-skel-avatar" />
                        <div className="mg-skel-conv-body">
                          <div className="mg-skel mg-skel-name" />
                          <div className="mg-skel mg-skel-preview" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="mg-list-empty">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      active={conv.id === activeConvId}
                      onClick={() => selectConversation(conv.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat panel */}
          {showChat && (
            <div className="mg-chat-panel">
              {activeConvId && activeConv ? (
                <ChatView
                  conv={activeConv}
                  messages={messages}
                  parentId={parentId}
                  onSend={handleSend}
                  sending={sending}
                  sendError={sendError}
                  onBack={handleBack}
                  isMobile={isMobile}
                  loadingMsgs={loadingMsgs}
                  msgError={msgError}
                  onRetry={() => { setLoadingMsgs(true); loadMessages(activeConvId); }}
                />
              ) : (
                <div className="mg-no-selection">
                  <div className="mg-no-sel-icon"><Ic.MessageCircle width={28} height={28} /></div>
                  <p className="mg-no-sel-title">Select a conversation</p>
                  <p className="mg-no-sel-text">Choose a conversation from the list to view messages.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const MG_CSS = `
.mg-root{font-family:${FF};color:${C.text};-webkit-font-smoothing:antialiased;animation:mgFade .3s ease both;min-height:60vh;}
.mg-root *,.mg-root *::before,.mg-root *::after{box-sizing:border-box;}
.mg-root button{font-family:inherit;cursor:pointer;}
.mg-root h1,.mg-root h2,.mg-root h3,.mg-root p{margin:0;}

/* Layout — two-panel desktop */
.mg-layout{display:flex;height:calc(100vh - 120px);min-height:500px;border:1px solid ${C.border};border-radius:16px;overflow:hidden;background:${C.card};}

/* Conversation list panel */
.mg-list-panel{width:360px;min-width:300px;border-right:1px solid ${C.border};display:flex;flex-direction:column;flex-shrink:0;background:${C.card};}
.mg-list-header{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 14px;border-bottom:1px solid ${C.bg};}
.mg-list-title{font-size:18px;font-weight:800;color:${C.navy};letter-spacing:-0.02em;}
.mg-refresh-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;border-radius:8px;background:${C.bg};color:${C.textSec};transition:background .2s,color .2s;}
.mg-refresh-btn:hover{background:${C.border};color:${C.text};}
.mg-refresh-btn:disabled{opacity:0.5;}
.mg-list-scroll{flex:1;overflow-y:auto;}
.mg-list-scroll::-webkit-scrollbar{width:5px;}
.mg-list-scroll::-webkit-scrollbar-track{background:transparent;}
.mg-list-scroll::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
.mg-list-empty{display:flex;align-items:center;justify-content:center;padding:40px 20px;color:${C.textSec};font-size:14px;}

/* Conversation item */
.mg-conv{display:flex;align-items:flex-start;gap:12px;width:100%;padding:14px 18px;border:none;background:transparent;text-align:left;transition:background .15s;border-bottom:1px solid ${C.bg};position:relative;}
.mg-conv:hover{background:${C.bg};}
.mg-conv-active{background:${C.tealSoft}!important;}
.mg-conv-avatar{width:44px;height:44px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0;letter-spacing:0.02em;}
.mg-conv-active .mg-conv-avatar{background:${C.teal};color:#fff;}
.mg-conv-body{flex:1;min-width:0;}
.mg-conv-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:3px;}
.mg-conv-name{font-size:14px;font-weight:800;color:${C.navy};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.mg-conv-time{font-size:11.5px;font-weight:700;color:${C.textMuted};flex-shrink:0;}
.mg-conv-preview{font-size:13px;color:${C.textSec};line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;}
.mg-conv-booking{display:flex;align-items:center;gap:4px;font-size:11.5px;color:${C.textMuted};margin-top:5px;}
.mg-conv-booking svg{color:${C.teal};}
.mg-conv-unread{position:absolute;top:16px;right:16px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:${C.teal};color:#fff;font-size:11px;font-weight:800;}

/* Chat panel */
.mg-chat-panel{flex:1;display:flex;flex-direction:column;min-width:0;background:${C.bg};}
.mg-chat{display:flex;flex-direction:column;height:100%;}

/* Chat header */
.mg-chat-header{display:flex;align-items:center;gap:12px;padding:16px 20px;background:${C.card};border-bottom:1px solid ${C.border};flex-shrink:0;}
.mg-chat-header-avatar{width:40px;height:40px;border-radius:50%;background:${C.tealSoft};color:${C.teal};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0;}
.mg-chat-header-info{flex:1;min-width:0;}
.mg-chat-header-name{font-size:15px;font-weight:800;color:${C.navy};letter-spacing:-0.01em;}
.mg-chat-header-booking{display:flex;align-items:center;gap:5px;font-size:12px;color:${C.textSec};margin-top:2px;}
.mg-chat-header-booking svg{color:${C.teal};}
.mg-back-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:9px;background:${C.bg};color:${C.textSec};flex-shrink:0;transition:background .2s;}
.mg-back-btn:hover{background:${C.border};color:${C.text};}

/* Messages area */
.mg-chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:4px;}
.mg-chat-messages::-webkit-scrollbar{width:5px;}
.mg-chat-messages::-webkit-scrollbar-track{background:transparent;}
.mg-chat-messages::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}

/* Date group */
.mg-date-group{display:flex;flex-direction:column;gap:4px;margin-bottom:8px;}
.mg-date-label{display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.textMuted};padding:8px 0 4px;}

/* Message bubbles */
.mg-bubble{max-width:75%;padding:10px 14px;border-radius:14px;position:relative;animation:mgFade .2s ease both;}
.mg-bubble-parent{align-self:flex-end;background:${C.teal};color:#fff;border-bottom-right-radius:4px;}
.mg-bubble-aya{align-self:flex-start;background:${C.card};color:${C.text};border:1px solid ${C.border};border-bottom-left-radius:4px;}
.mg-bubble-text{font-size:14px;line-height:1.5;word-break:break-word;white-space:pre-wrap;}
.mg-bubble-time{display:flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;margin-top:4px;opacity:0.7;}
.mg-bubble-parent .mg-bubble-time{justify-content:flex-end;color:rgba(255,255,255,0.75);}
.mg-bubble-aya .mg-bubble-time{color:${C.textMuted};}
.mg-read-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.8);}

/* Chat empty state */
.mg-chat-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;flex:1;}
.mg-chat-empty-icon{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:14px;}
.mg-chat-empty-icon-error{background:#FBE9E9;color:#C23B3B;}
.mg-chat-retry{margin-top:16px;padding:10px 22px;}
.mg-chat-empty-title{font-size:16px;font-weight:800;color:${C.navy};margin-bottom:5px;}
.mg-chat-empty-text{font-size:13.5px;color:${C.textSec};line-height:1.5;max-width:300px;}

/* Chat loading skeleton */
.mg-chat-loading{display:flex;flex-direction:column;gap:12px;padding:20px;}
.mg-skel-msg{height:44px;border-radius:14px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:mgShimmer 1.3s infinite linear;max-width:65%;}
.mg-skel-msg-short{max-width:40%;}

/* Composer */
.mg-composer{display:flex;align-items:flex-end;gap:10px;padding:14px 18px;background:${C.card};border-top:1px solid ${C.border};flex-shrink:0;}
.mg-composer-input{flex:1;min-height:42px;max-height:120px;padding:10px 14px;border:1.5px solid ${C.border};border-radius:12px;background:${C.bg};color:${C.text};font-family:inherit;font-size:14px;line-height:1.5;resize:none;transition:border-color .18s,box-shadow .18s,background .18s;}
.mg-composer-input::placeholder{color:${C.textMuted};}
.mg-composer-input:focus{outline:none;border-color:${C.teal};background:#fff;box-shadow:0 0 0 3px rgba(39,143,135,0.12);}
.mg-composer-input:disabled{opacity:0.65;}
.mg-send-btn{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border:none;border-radius:12px;background:${C.teal};color:#fff;flex-shrink:0;transition:background .2s,box-shadow .2s,transform .15s;box-shadow:0 4px 12px rgba(39,143,135,0.2);}
.mg-send-btn:hover:not(:disabled){background:#1F7A73;box-shadow:0 6px 16px rgba(39,143,135,0.3);transform:translateY(-1px);}
.mg-send-btn:disabled{opacity:0.45;cursor:not-allowed;box-shadow:none;}
.mg-send-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:mgSpin .6s linear infinite;}

/* Safety warning */
.mg-safety-warn{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#FFF8E6;border-top:1px solid #F0E6C0;font-size:12.5px;color:#7A5D00;flex-wrap:wrap;}
.mg-safety-warn svg{color:#B8860B;flex-shrink:0;}
.mg-safety-warn p{flex:1;line-height:1.45;min-width:180px;}
.mg-safety-dismiss{background:none;border:none;color:#7A5D00;font-weight:800;font-size:12px;text-decoration:underline;flex-shrink:0;padding:2px 6px;}

/* Send error */
.mg-send-error{display:flex;align-items:center;gap:8px;padding:8px 16px;background:#FBE9E9;border-top:1px solid rgba(194,59,59,0.15);font-size:12.5px;color:#C23B3B;}
.mg-send-error svg{flex-shrink:0;}

/* Error bar */
.mg-error-bar{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#FBE9E9;font-size:12.5px;color:#C23B3B;border-bottom:1px solid rgba(194,59,59,0.12);}
.mg-error-bar svg{flex-shrink:0;}

/* No selection state */
.mg-no-selection{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;flex:1;padding:40px 24px;}
.mg-no-sel-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:14px;}
.mg-no-sel-title{font-size:17px;font-weight:800;color:${C.navy};margin-bottom:5px;}
.mg-no-sel-text{font-size:14px;color:${C.textSec};line-height:1.5;}

/* Full-page empty state */
.mg-empty-full{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px;min-height:60vh;animation:mgFade .4s ease both;}
.mg-empty-icon{display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:18px;}
.mg-empty-title{font-size:20px;font-weight:800;color:${C.navy};margin-bottom:8px;}
.mg-empty-text{font-size:14.5px;color:${C.textSec};line-height:1.55;max-width:400px;}

/* Guest state */
.mg-guest{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px;min-height:60vh;}
.mg-guest-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:${C.tealSoft};color:${C.teal};margin-bottom:16px;}
.mg-guest-title{font-size:20px;font-weight:800;color:${C.navy};margin-bottom:8px;}
.mg-guest-text{font-size:14px;color:${C.textSec};line-height:1.55;margin-bottom:20px;max-width:380px;}
.mg-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border:none;border-radius:10px;background:${C.teal};color:#fff;font-size:14px;font-weight:700;box-shadow:0 4px 14px rgba(39,143,135,0.22);transition:background .2s,transform .15s;}
.mg-btn-primary:hover{background:#1F7A73;transform:translateY(-1px);}

/* Skeleton */
.mg-skel-list{display:flex;flex-direction:column;}
.mg-skel-conv{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid ${C.bg};}
.mg-skel-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:mgShimmer 1.3s infinite linear;flex-shrink:0;}
.mg-skel-conv-body{flex:1;display:flex;flex-direction:column;gap:6px;}
.mg-skel{height:12px;border-radius:6px;background:linear-gradient(90deg,${C.border} 25%,#F4F2ED 50%,${C.border} 75%);background-size:200% 100%;animation:mgShimmer 1.3s infinite linear;}
.mg-skel-name{width:55%;height:13px;}
.mg-skel-preview{width:80%;height:11px;}

/* Animations */
@keyframes mgFade{from{opacity:0;}to{opacity:1;}}
@keyframes mgShimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@keyframes mgSpin{to{transform:rotate(360deg);}}

/* Responsive — mobile */
@media(max-width:768px){
  .mg-layout{height:calc(100vh - 140px);border-radius:12px;}
  .mg-list-panel{width:100%;border-right:none;}
  .mg-chat-panel{position:absolute;inset:0;z-index:2;}
  .mg-layout{position:relative;}
  .mg-bubble{max-width:85%;}
}
@media(max-width:480px){
  .mg-composer{padding:10px 12px;}
  .mg-chat-messages{padding:14px;}
  .mg-chat-header{padding:12px 14px;}
}
@media(prefers-reduced-motion:reduce){
  .mg-root *,.mg-root *::before,.mg-root *::after{animation-duration:0.001s!important;transition-duration:0.001s!important;}
}
`;

export default Messages;
