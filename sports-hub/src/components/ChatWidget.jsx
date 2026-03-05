import React, { useState, useRef, useCallback, useEffect } from 'react';
import { COLORS, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, WEB_SHADOW, SPORT_CATEGORIES } from '../../../shared/theme.js';
import { sendChatMessage } from '../../../shared/api.js';

const SPORT_FILTERS = [{ id: 'all', label: 'All', icon: '🏅' }, ...SPORT_CATEGORIES];

let _id = 0;
const uid = () => `m${++_id}`;

const WELCOME = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm your AI sports assistant. Ask me about live scores, news, standings — I pull live data from ESPN!",
};

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [draft, setDraft]     = useState('');
  const [sport, setSport]     = useState('all');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const scrollToBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setDraft('');
    setLoading(true);
    scrollToBottom();

    try {
      const { reply } = await sendChatMessage(text, sport);
      setMessages((prev) => [...prev, { id: uid(), role: 'ai', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'ai',
          text: '⚠️ Cannot connect to the AI backend. Deploy the Lambda first — see lambda/chat/DEPLOY.md.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [draft, loading, sport]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Chat panel ─────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="Sports AI Assistant"
        style={{
          ...styles.panel,
          // CSS-only open/close so no layout thrash
          opacity:        open ? 1 : 0,
          pointerEvents:  open ? 'all' : 'none',
          transform:      open ? 'translateY(0)' : 'translateY(20px)',
          transition:     'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={styles.panelHeader}>
          <span style={styles.panelTitle}>🤖 Sports AI Assistant</span>
          <button style={styles.iconBtn} onClick={() => setOpen(false)} title="Close">✕</button>
        </div>

        {/* Sport chips */}
        <div style={styles.chipRow}>
          {SPORT_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSport(s.id)}
              style={{ ...styles.chip, ...(sport === s.id ? styles.chipActive : {}) }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 6,
                marginBottom: 10,
              }}
            >
              {m.role === 'ai' && <span style={styles.avatar}>🤖</span>}
              <div
                style={{
                  ...styles.bubble,
                  ...(m.role === 'user' ? styles.bubbleUser : styles.bubbleAI),
                  ...(m.isError ? styles.bubbleError : {}),
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
              <span style={styles.avatar}>🤖</span>
              <div style={{ ...styles.bubble, ...styles.bubbleAI, ...styles.typingBubble }}>
                <span style={styles.dot} />
                <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={styles.inputBar}>
          <input
            ref={inputRef}
            style={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about scores, news, standings…"
            disabled={loading}
            aria-label="Chat input"
          />
          <button
            style={{
              ...styles.sendBtn,
              ...(!draft.trim() || loading ? styles.sendBtnDisabled : {}),
            }}
            onClick={handleSend}
            disabled={!draft.trim() || loading}
            title="Send"
          >
            ➤
          </button>
        </div>
      </div>

      {/* ── Floating action button ──────────────────────────────────── */}
      <button
        style={styles.fab}
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={open}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>{open ? '✕' : '🤖'}</span>
      </button>

      {/* Typing dot keyframes */}
      <style>{`
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

const styles = {
  panel: {
    position:        'fixed',
    bottom:          96,
    right:           24,
    width:           360,
    height:          520,
    maxHeight:       'calc(100vh - 120px)',
    backgroundColor: COLORS.secondary,
    borderRadius:    BORDER_RADIUS.xl,
    boxShadow:       WEB_SHADOW.lg,
    border:          `1px solid ${COLORS.border}`,
    display:         'flex',
    flexDirection:   'column',
    overflow:        'hidden',
    zIndex:          999,
  },

  panelHeader: {
    display:         'flex',
    justifyContent:  'space-between',
    alignItems:      'center',
    padding:         '12px 16px',
    backgroundColor: COLORS.surface,
    borderBottom:    `1px solid ${COLORS.border}`,
    flexShrink:      0,
  },
  panelTitle: {
    color:      COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
    fontSize:   FONT_SIZE.md,
  },
  iconBtn: {
    background: 'none',
    border:     'none',
    color:      COLORS.textMuted,
    cursor:     'pointer',
    fontSize:   16,
    padding:    4,
    lineHeight: 1,
  },

  chipRow: {
    display:    'flex',
    gap:        6,
    padding:    '8px 12px',
    overflowX:  'auto',
    flexShrink: 0,
    borderBottom: `1px solid ${COLORS.border}`,
    scrollbarWidth: 'none',
  },
  chip: {
    whiteSpace:      'nowrap',
    padding:         '4px 10px',
    borderRadius:    BORDER_RADIUS.full,
    border:          `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.surface,
    color:           COLORS.textMuted,
    fontSize:        FONT_SIZE.xs,
    cursor:          'pointer',
    fontFamily:      'inherit',
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor:     COLORS.accent,
    color:           COLORS.text,
    fontWeight:      FONT_WEIGHT.semibold,
  },

  messages: {
    flex:       1,
    overflowY:  'auto',
    padding:    12,
  },
  avatar: {
    fontSize:   16,
    flexShrink: 0,
    lineHeight: 1,
  },
  bubble: {
    maxWidth:    '78%',
    padding:     '8px 12px',
    borderRadius: BORDER_RADIUS.lg,
    fontSize:    FONT_SIZE.sm,
    lineHeight:  1.55,
    color:       COLORS.text,
    wordBreak:   'break-word',
  },
  bubbleUser: {
    backgroundColor:   COLORS.accent,
    borderBottomRightRadius: BORDER_RADIUS.xs,
  },
  bubbleAI: {
    backgroundColor:  COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.xs,
  },
  bubbleError: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderLeft: '3px solid #4A90E2',
    color: '#90C4FF',
  },

  typingBubble: {
    display:    'flex',
    gap:        4,
    alignItems: 'center',
    padding:    '10px 14px',
  },
  dot: {
    display:         'inline-block',
    width:           7,
    height:          7,
    borderRadius:    '50%',
    backgroundColor: COLORS.textMuted,
    animation:       'chatDotBounce 1s infinite',
  },

  inputBar: {
    display:         'flex',
    gap:             8,
    padding:         '10px 12px',
    borderTop:       `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.primary,
    flexShrink:      0,
  },
  input: {
    flex:            1,
    padding:         '8px 14px',
    borderRadius:    BORDER_RADIUS.full,
    border:          'none',
    outline:         'none',
    backgroundColor: COLORS.surface,
    color:           COLORS.text,
    fontSize:        FONT_SIZE.sm,
    fontFamily:      'inherit',
  },
  sendBtn: {
    width:           36,
    height:          36,
    borderRadius:    BORDER_RADIUS.full,
    border:          'none',
    backgroundColor: COLORS.accent,
    color:           COLORS.text,
    cursor:          'pointer',
    fontSize:        14,
    fontWeight:      FONT_WEIGHT.bold,
    flexShrink:      0,
    fontFamily:      'inherit',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceLight,
    cursor:          'not-allowed',
  },

  fab: {
    position:        'fixed',
    bottom:          28,
    right:           28,
    width:           56,
    height:          56,
    borderRadius:    BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    border:          'none',
    cursor:          'pointer',
    boxShadow:       WEB_SHADOW.md,
    zIndex:          1000,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    transition:      'transform 0.15s ease, background-color 0.15s ease',
  },
};
