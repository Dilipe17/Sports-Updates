import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  fetchSportMatches,
  fetchAllSportsMatches,
  getAllCachedMatches,
  SPORT_CONFIG,
} from '../../../shared/api.js';

const BASKETBALL_RULES = [
  'Objective: Score by shooting through the opponent\'s hoop.',
  'Players: 5 per team on court at a time.',
  'Points: 2 for a field goal, 3 from behind the arc, 1 free throw.',
  'Dribbling: Must dribble while moving — no double-dribble.',
  'Shot Clock: 24 seconds in the NBA to attempt a shot.',
  'Quarters: 4 × 12 minutes (NBA), overtime if tied.',
];

let _uid = 0;
const uid = () => `m${++_uid}`;

const WELCOME = {
  id: 'welcome', role: 'ai',
  html: `Hi! I'm your <strong>SportsHub AI</strong> powered by live ESPN data.<br>
    Try asking:<br>
    🏆 Today's live scores?<br>
    🏏 Cricket scores?<br>
    🏎️ Next F1 race?<br>
    📊 NBA standings?<br>
    ⚾ Baseball rules?`,
};

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [draft,    setDraft]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);
  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);

  const addMsg = (role, html, isTyping = false) =>
    setMessages(prev => [...prev, { id: uid(), role, html, isTyping }]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { id: uid(), role: 'user', html: text }]);
    setDraft('');
    setLoading(true);
    scrollBottom();

    // typing indicator
    const typingId = uid();
    setMessages(prev => [...prev, { id: typingId, role: 'ai', isTyping: true, html: '' }]);

    try {
      const html = await buildReply(text.toLowerCase());
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, { id: uid(), role: 'ai', html }]);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, { id: uid(), role: 'ai', html: '⚠️ Could not fetch data. Please try again.' }]);
    } finally {
      setLoading(false);
      scrollBottom();
    }
  }, [draft, loading]);

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Panel */}
      <div style={{ ...s.panel, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transform: open ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity .2s, transform .2s' }}>
        <div style={s.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot" />
            <span style={s.panelTitle}>Sports AI Assistant</span>
          </div>
          <button style={s.iconBtn} onClick={() => setOpen(false)}>✕</button>
        </div>

        <div style={s.messages}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              {m.isTyping ? (
                <div style={{ ...s.bubble, ...s.bubbleAI }}>
                  <span style={s.dot} /><span style={{ ...s.dot, animationDelay: '.2s' }} /><span style={{ ...s.dot, animationDelay: '.4s' }} />
                </div>
              ) : (
                <div style={{ ...s.bubble, ...(m.role === 'user' ? s.bubbleUser : s.bubbleAI) }}
                  dangerouslySetInnerHTML={{ __html: m.html }} />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={s.inputBar}>
          <input ref={inputRef} style={s.input} value={draft}
            onChange={e => setDraft(e.target.value)} onKeyDown={handleKey}
            placeholder="Ask about scores, rules, standings…" disabled={loading} />
          <button style={{ ...s.sendBtn, ...(!draft.trim() || loading ? s.sendDisabled : {}) }}
            onClick={handleSend} disabled={!draft.trim() || loading}>➤</button>
        </div>
      </div>

      {/* FAB */}
      <button style={s.fab} onClick={() => setOpen(o => !o)} title="Sports AI">
        <span style={{ fontSize: 22 }}>{open ? '✕' : '💬'}</span>
      </button>

      <style>{`@keyframes chatDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
    </>
  );
}

/* ── Local AI reply builder ──────────────────────────────────────────────────── */
async function buildReply(q) {
  const fmt = m => {
    let line = `<strong>${m.team1||'TBD'} ${m.score1||''} - ${m.score2||''} ${m.team2||'TBD'}</strong>`.replace(' -  ', ' vs ');
    if (m.isLive)     line = `🔴 ${line} <span style="color:#4ade80;font-size:11px">(${m.gameClock||m.status})</span>`;
    else if (m.isComplete) line = `✅ ${line}${m.summary ? `<br><span style="color:#34d399;font-size:11px"> ↳ ${m.summary}</span>` : ' <span style="color:#93c5fd;font-size:11px">(FT)</span>'}`;
    else              line = `📅 ${line} <span style="color:#93c5fd;font-size:11px">(${m.formattedDate||m.status})</span>`;
    if (m.potm)       line += `<br><span style="color:#fbbf24;font-size:11px"> ⭐ POTM: ${m.potm}</span>`;
    return line;
  };

  const topMatches = (data, n = 4) => {
    const live      = data.filter(m => m.isLive);
    const completed = data.filter(m => m.isComplete);
    const upcoming  = data.filter(m => !m.isLive && !m.isComplete);
    const result = [...live.slice(0,3)];
    if (result.length < n) result.push(...completed.slice(0, n - result.length));
    if (result.length < n) result.push(...upcoming.slice(0, n - result.length));
    return result;
  };

  // ── Rules ──
  if (q.includes('basketball') && q.includes('rule'))
    return `🏀 <strong>Basketball Rules:</strong><br><ul style="margin-left:16px;margin-top:6px">${BASKETBALL_RULES.map(r => `<li>${r}</li>`).join('')}</ul>`;

  if (q.includes('cricket') && q.includes('rule'))
    return `🏏 <strong>Cricket Rules:</strong><br><ul style="margin-left:16px;margin-top:6px"><li>Two teams of 11</li><li>Batters score runs between wickets or with boundaries</li><li>Formats: T20 (20 overs), ODI (50 overs), Test (5 days)</li><li>Out: bowled, caught, LBW, run out, stumped</li><li>Highest total / chasing team wins</li></ul>`;

  if (q.includes('baseball') && q.includes('rule'))
    return `⚾ <strong>Baseball Rules:</strong><br>Two teams of 9 over 9 innings. Batters hit and run bases; score by crossing home plate. Pitchers aim to strike batters out. Most runs wins.`;

  if (q.includes('soccer') && q.includes('rule'))
    return `⚽ <strong>Soccer Rules:</strong><br>Two teams of 11, 90 minutes. Score by putting the ball in the opponent's net. No hands (except goalkeeper in their area). Most goals wins.`;

  // ── F1 ──
  if (q.includes('f1') || q.includes('formula') || q.includes('grand prix')) {
    const data = await fetchSportMatches('f1');
    const upcoming  = data.filter(s => !s.isComplete);
    const completed = data.filter(s => s.isComplete);
    let html = '🏎️ <strong>F1 2025 Season:</strong>';
    if (upcoming.length)  html += `<br><br><strong>Next Race:</strong> ${upcoming[0].team1Full}<br>📍 ${upcoming[0].team2Full}<br>📅 ${upcoming[0].score1} at ${upcoming[0].score2}<br>⏱️ ${upcoming[0].status}`;
    if (completed.length) html += `<br><br><strong>Recent:</strong><br>` + completed.map(r => `${r.team1} (${r.team2}) — ${r.score1}`).join('<br>');
    return html;
  }

  // ── Sport-specific ──
  const sportMap = [
    ['cricket',    'cricket',    '🏏'],
    ['soccer',     'soccer',     '⚽'],
    ['football',   'nfl',        '🏈'],
    ['nfl',        'nfl',        '🏈'],
    ['nba',        'basketball', '🏀'],
    ['basketball', 'basketball', '🏀'],
    ['mlb',        'baseball',   '⚾'],
    ['baseball',   'baseball',   '⚾'],
    ['tennis',     'tennis',     '🎾'],
  ];
  for (const [kw, id, icon] of sportMap) {
    if (q.includes(kw) && !q.includes('rule')) {
      const data = await fetchSportMatches(id);
      return data.length
        ? `${icon} <strong>Top ${SPORT_CONFIG[id].name} Matches:</strong><br><br>` + topMatches(data).map(fmt).join('<br><br>')
        : `No ${SPORT_CONFIG[id].name} matches right now.`;
    }
  }

  // ── Team / result search ──
  if (q.includes('who won') || q.includes('result') || q.includes('score') || q.includes('did')) {
    await fetchAllSportsMatches();
    const cache = getAllCachedMatches();
    const all   = Object.values(cache).flatMap(c => c.matches || []);
    const words = q.replace(/who won|result|did|score|the|of|in|today|\?/gi, '').trim().split(/\s+/).filter(w => w.length > 2);
    const found = all.filter(m => words.some(w =>
      m.team1?.toLowerCase().includes(w) ||
      m.team2?.toLowerCase().includes(w) ||
      m.league?.toLowerCase().includes(w)
    ));
    if (found.length) return `🔍 <strong>Match Results:</strong><br><br>` + found.slice(0,5).map(fmt).join('<br><br>');
    return `🔍 No matches found for that query. Try a specific team or sport name!`;
  }

  // ── All live / today ──
  if (q.includes('live') || q.includes('today') || q.includes('all') || q.includes('match')) {
    await fetchAllSportsMatches();
    const cache = getAllCachedMatches();
    const all   = Object.entries(cache).flatMap(([id, c]) =>
      (c.matches || []).filter(m => !m.isF1).map(m => ({ ...m, _icon: SPORT_CONFIG[id]?.icon || '' }))
    );
    const top = topMatches(all, 6);
    if (!top.length) return '🏆 No active matches right now.';
    return `🏆 <strong>Top Matches Today:</strong><br><br>` + top.map(m => {
      let line = `<strong>${m._icon} ${m.team1||'TBD'} ${m.score1||''} - ${m.score2||''} ${m.team2||'TBD'}</strong>`.replace(' -  ', ' vs ');
      if (m.isLive)      line = `🔴 ${line} <span style="color:#4ade80;font-size:11px">(${m.gameClock||m.status})</span>`;
      else if (m.isComplete) line = `✅ ${line}${m.summary ? `<br><span style="color:#34d399;font-size:11px"> ↳ ${m.summary}</span>` : ''}`;
      else               line = `📅 ${line} <span style="color:#93c5fd;font-size:11px">(${m.formattedDate||m.status})</span>`;
      return line;
    }).join('<br><br>');
  }

  // ── Default ──
  return `I can help with live scores, results, and rules! Try:<br>
    • <strong>"Cricket scores"</strong> — all cricket matches<br>
    • <strong>"Who won India match?"</strong> — search by team<br>
    • <strong>"NBA scores"</strong> — basketball results<br>
    • <strong>"Next F1 race"</strong> — F1 calendar<br>
    • <strong>"Baseball rules"</strong> — sport rules<br>
    • <strong>"Today's scores"</strong> — all sports`;
}

/* ── Styles ──────────────────────────────────────────────────────────────────── */
const s = {
  panel: {
    position: 'fixed', bottom: 90, right: 24,
    width: 360, height: 500,
    maxHeight: 'calc(100vh - 110px)',
    background: 'rgba(15,23,42,.97)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(59,130,246,.3)',
    borderRadius: 20,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', zIndex: 999,
    boxShadow: '0 24px 60px rgba(0,0,0,.5)',
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(30,58,138,.5)',
    borderBottom: '1px solid rgba(30,64,175,.35)',
    flexShrink: 0,
  },
  panelTitle: { color: '#fff', fontWeight: 700, fontSize: 14 },
  iconBtn: { background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' },
  messages: { flex: 1, overflowY: 'auto', padding: 14 },
  bubble: {
    maxWidth: '82%', padding: '9px 13px',
    borderRadius: 14, fontSize: 13, lineHeight: 1.55,
    color: '#fff', wordBreak: 'break-word',
    display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap',
  },
  bubbleUser: { background: '#2563eb', borderBottomRightRadius: 4 },
  bubbleAI:   { background: 'rgba(30,58,138,.7)', borderBottomLeftRadius: 4 },
  dot: {
    display: 'inline-block', width: 7, height: 7,
    borderRadius: '50%', background: '#93c5fd',
    animation: 'chatDot 1s infinite',
  },
  inputBar: {
    display: 'flex', gap: 8, padding: '10px 12px',
    borderTop: '1px solid rgba(30,64,175,.35)',
    background: 'rgba(15,23,42,.8)', flexShrink: 0,
  },
  input: {
    flex: 1, padding: '8px 14px',
    borderRadius: 22, border: '1px solid rgba(30,64,175,.5)',
    background: 'rgba(30,58,138,.4)',
    color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: 'none', background: '#2563eb', color: '#fff',
    cursor: 'pointer', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontFamily: 'inherit',
  },
  sendDisabled: { background: 'rgba(30,64,175,.4)', cursor: 'not-allowed' },
  fab: {
    position: 'fixed', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: '50%',
    background: '#2563eb', border: 'none',
    cursor: 'pointer', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(37,99,235,.5)',
    transition: 'transform .15s',
  },
};
