import React, { useState, useEffect } from 'react';

/* Fetch WC knockout stage matches from ESPN */
async function fetchKnockoutMatches() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=200',
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events || []).map(ev => {
      const comp  = ev.competitions?.[0] || {};
      const comps = comp.competitors || [];
      const home  = comps.find(c => c.homeAway === 'home') || comps[0] || {};
      const away  = comps.find(c => c.homeAway === 'away') || comps[1] || {};
      const st    = ev.status?.type || {};
      const note  = comp.notes?.[0]?.headline || comp.type?.text || '';
      return {
        id:         ev.id,
        note,
        round:      detectRound(note, comp.type?.abbreviation || ''),
        team1:      home.team?.shortDisplayName || home.team?.displayName || 'TBD',
        team2:      away.team?.shortDisplayName || away.team?.displayName || 'TBD',
        logo1:      home.team?.logos?.[0]?.href || '',
        logo2:      away.team?.logos?.[0]?.href || '',
        score1:     home.score ?? '',
        score2:     away.score ?? '',
        winner1:    home.winner || false,
        winner2:    away.winner || false,
        isLive:     st.state === 'in',
        isComplete: st.state === 'post',
        clock:      ev.status?.displayClock || '',
        date:       ev.date ? new Date(ev.date) : null,
      };
    }).filter(m => m.round !== 'group');
  } catch {
    return [];
  }
}

function detectRound(note, abbr) {
  const t = (note + ' ' + abbr).toLowerCase();
  if (t.includes('final') && !t.includes('quarter') && !t.includes('semi') && !t.includes('third')) return 'final';
  if (t.includes('semi'))            return 'sf';
  if (t.includes('quarter'))         return 'qf';
  if (t.includes('third') || t.includes('3rd')) return '3rd';
  if (t.includes('round of 16') || t.includes('r16') || t.includes('last 16')) return 'r16';
  if (t.includes('round of 32') || t.includes('r32') || t.includes('last 32')) return 'r32';
  if (t.includes('group'))           return 'group';
  return 'unknown';
}

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', '3rd', 'final'];
const ROUND_LABEL = {
  r32:   '🏆 Round of 32',
  r16:   '⚡ Round of 16',
  qf:    '🔥 Quarter-Finals',
  sf:    '⭐ Semi-Finals',
  '3rd': '🥉 3rd Place',
  final: '🥇 Grand Final',
};

function MatchTile({ m }) {
  const fmt = m.date
    ? m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';
  return (
    <div style={s.tile}>
      <TeamRow
        logo={m.logo1} name={m.team1}
        score={m.isComplete || m.isLive ? m.score1 : ''}
        won={m.winner1} isLive={m.isLive}
      />
      <div style={s.tileDivider} />
      <TeamRow
        logo={m.logo2} name={m.team2}
        score={m.isComplete || m.isLive ? m.score2 : ''}
        won={m.winner2} isLive={m.isLive}
      />
      {m.isLive && (
        <div style={s.tileLiveBadge}>
          <span className="live-dot" style={{ marginRight: 4 }} />
          {m.clock || 'LIVE'}
        </div>
      )}
      {!m.isLive && !m.isComplete && fmt && (
        <div style={s.tileDate}>{fmt}</div>
      )}
      {m.isComplete && !m.isLive && (
        <div style={s.tileFT}>Full Time</div>
      )}
    </div>
  );
}

function TeamRow({ logo, name, score, won, isLive }) {
  return (
    <div style={{ ...s.teamRow, opacity: (score !== '' && !won && !isLive) ? 0.5 : 1 }}>
      {logo
        ? <img src={logo} style={s.tileFlag} alt="" onError={e => { e.target.style.display = 'none'; }} />
        : <div style={s.tileFlagPlaceholder} />
      }
      <span style={{ ...s.tileName, fontWeight: won ? 800 : 500 }}>{name}</span>
      {score !== '' && (
        <span style={{ ...s.tileScore, color: won ? '#4ade80' : '#e2e8f0' }}>{score}</span>
      )}
    </div>
  );
}

export default function WCKnockoutBracket() {
  const [matches,    setMatches]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    fetchKnockoutMatches().then(ms => {
      setMatches(ms);
      if (ms.length > 0) {
        // auto-select earliest available round
        const rounds = [...new Set(ms.map(m => m.round))];
        const first  = ROUND_ORDER.find(r => rounds.includes(r)) || rounds[0];
        setActiveRound(first);
      }
      setLoading(false);
    });
  }, []);

  /* Group matches by round */
  const byRound = {};
  matches.forEach(m => {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  });
  const availableRounds = ROUND_ORDER.filter(r => byRound[r]);

  /* Countdown to knockout stage (Jun 28 2026) */
  const KO_START  = new Date('2026-06-28T00:00:00Z');
  const msToKO    = KO_START - Date.now();
  const daysToKO  = Math.max(0, Math.ceil(msToKO / 86400000));

  if (loading) return (
    <div style={s.wrap}>
      <div style={s.header}>⚡ Knockout Bracket</div>
      <div style={s.placeholder}>Loading bracket…</div>
    </div>
  );

  if (matches.length === 0) return (
    <div style={s.wrap}>
      <div style={s.header}>⚡ Knockout Stage Bracket</div>
      <div style={s.placeholder}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
        <div style={{ color: '#4ade80', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          Group Stage in Progress
        </div>
        <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>
          Top 2 from each group + 8 best 3rd-place teams advance.<br />
          Knockout stage begins <strong style={{ color: '#fff' }}>June 28</strong>
          {daysToKO > 0 && <> · <strong style={{ color: '#facc15' }}>{daysToKO} days away</strong></>}
        </div>
        <div style={s.bracketPreview}>
          {[['R32','16 matches'],['R16','8 matches'],['QF','4 matches'],['SF','2 matches'],['F','1 match']].map(([r, cnt], i) => (
            <React.Fragment key={r}>
              <div style={s.bracketNode}>
                <div style={s.bracketRound}>{r}</div>
                <div style={s.bracketCnt}>{cnt}</div>
              </div>
              {i < 4 && <div style={s.bracketArrow}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const shown = activeRound ? (byRound[activeRound] || []) : [];

  return (
    <div style={s.wrap} className="fade-in">
      <div style={s.header}>⚡ Knockout Bracket · FIFA World Cup 2026</div>

      {/* Round selector */}
      <div style={s.roundTabs}>
        {availableRounds.map(r => (
          <button
            key={r}
            style={{ ...s.roundTab, ...(activeRound === r ? s.roundTabActive : {}) }}
            onClick={() => setActiveRound(r)}
          >
            {ROUND_LABEL[r] || r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Matches */}
      <div style={s.grid}>
        {shown.map(m => <MatchTile key={m.id} m={m} />)}
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const s = {
  wrap: {
    background: 'rgba(10,22,60,.6)',
    border: '1px solid rgba(34,197,94,.25)',
    borderRadius: 18, padding: '14px 14px 16px',
    marginBottom: 16,
  },
  header: {
    fontSize: 12, fontWeight: 800, color: '#4ade80',
    textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12,
  },
  placeholder: {
    textAlign: 'center', padding: '20px 10px',
  },
  bracketPreview: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 16, flexWrap: 'wrap',
  },
  bracketNode: {
    background: 'rgba(34,197,94,.1)',
    border: '1px solid rgba(34,197,94,.3)',
    borderRadius: 8, padding: '6px 10px', textAlign: 'center',
  },
  bracketRound: { fontSize: 11, fontWeight: 800, color: '#4ade80' },
  bracketCnt:   { fontSize: 9,  color: '#64748b', marginTop: 2 },
  bracketArrow: { color: '#334155', fontSize: 14, fontWeight: 700 },

  roundTabs: {
    display: 'flex', gap: 6, overflowX: 'auto',
    scrollbarWidth: 'none', marginBottom: 12,
    WebkitOverflowScrolling: 'touch',
  },
  roundTab: {
    flexShrink: 0, padding: '5px 11px',
    borderRadius: 20, border: '1px solid rgba(34,197,94,.25)',
    background: 'none', color: '#64748b',
    fontSize: 10, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
    transition: 'all .15s',
  },
  roundTabActive: {
    background: 'rgba(34,197,94,.2)',
    border: '1px solid rgba(34,197,94,.6)',
    color: '#4ade80',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 10,
  },
  tile: {
    background: 'rgba(15,23,42,.7)',
    border: '1px solid rgba(30,64,175,.35)',
    borderRadius: 12, padding: '10px 10px 8px',
    position: 'relative',
  },
  teamRow: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '3px 0',
  },
  tileFlag:        { width: 20, height: 20, objectFit: 'contain', flexShrink: 0 },
  tileFlagPlaceholder: { width: 20, height: 20, borderRadius: '50%', background: '#1e3a8a', flexShrink: 0 },
  tileName:        { fontSize: 12, color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tileScore:       { fontSize: 14, fontWeight: 800, minWidth: 18, textAlign: 'right', flexShrink: 0 },
  tileDivider:     { height: 1, background: 'rgba(30,64,175,.3)', margin: '4px 0' },
  tileLiveBadge:   { display: 'flex', alignItems: 'center', fontSize: 9, color: '#4ade80', fontWeight: 800, marginTop: 6, letterSpacing: '.05em' },
  tileDate:        { fontSize: 9, color: '#64748b', marginTop: 6, textAlign: 'center' },
  tileFT:          { fontSize: 9, color: '#94a3b8', marginTop: 6, textAlign: 'center', fontWeight: 600 },
};
