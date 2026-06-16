import React, { useState, useEffect } from 'react';

const STATS_TABS = [
  { key: 'goals',   label: '⚽ Goals',        abbr: 'G'  },
  { key: 'assists', label: '🎯 Assists',       abbr: 'A'  },
  { key: 'clean',   label: '🧤 Clean Sheets',  abbr: 'CS' },
  { key: 'yellow',  label: '🟨 Yellow Cards',  abbr: 'YC' },
];

/* Map ESPN category displayName / abbreviation → our key */
function mapCategory(displayName = '', abbr = '') {
  const n = displayName.toLowerCase();
  const a = abbr.toLowerCase();
  if (n.includes('goal') || a === 'g')     return 'goals';
  if (n.includes('assist') || a === 'a')   return 'assists';
  if (n.includes('clean') || a === 'cs')   return 'clean';
  if (n.includes('yellow') || a === 'yc')  return 'yellow';
  return null;
}

async function fetchWCStats() {
  const ENDPOINTS = [
    'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/leaders',
    'https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/leaders',
  ];
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const categories = data.categories || [];
      if (!categories.length) continue;

      const result = { goals: [], assists: [], clean: [], yellow: [] };
      for (const cat of categories) {
        const key = mapCategory(cat.displayName, cat.abbreviation);
        if (!key) continue;
        for (const entry of (cat.leaders || []).slice(0, 10)) {
          const athlete = entry.athlete || {};
          const team    = entry.team || athlete.team || {};
          result[key].push({
            id:       athlete.id || '',
            name:     athlete.displayName || athlete.shortName || 'Unknown',
            country:  team.displayName || team.shortDisplayName || '',
            countryAbbr: team.abbreviation || '',
            headshot: athlete.headshot?.href || '',
            flag:     athlete.flag?.href || '',
            value:    entry.value ?? entry.displayValue ?? 0,
          });
        }
      }
      return result;
    } catch { /* try next */ }
  }
  return null;
}

function PlayerRow({ player, stat, rank }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div style={s.row}>
      <span style={s.rank}>{rank}</span>

      <div style={s.avatar}>
        {player.headshot && !imgFailed ? (
          <img
            src={player.headshot} alt={player.name}
            style={s.avatarImg}
            onError={() => setImgFailed(true)}
          />
        ) : player.flag && !imgFailed ? (
          <img
            src={player.flag} alt={player.country}
            style={{ ...s.avatarImg, objectFit: 'cover' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={s.avatarPlaceholder}>{(player.name[0] || '?')}</div>
        )}
      </div>

      <div style={s.playerInfo}>
        <div style={s.playerName}>{player.name}</div>
        <div style={s.playerCountry}>{player.country}</div>
      </div>

      <div style={s.statBadge}>{player.value}</div>
    </div>
  );
}

export default function WCPlayerStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('goals');
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetchWCStats().then(data => {
      setStats(data);
      setLoading(false);
      if (!data) setError(true);
    });
  }, []);

  const players = stats?.[tab] || [];

  return (
    <div style={s.wrap} className="fade-in">
      <div style={s.header}>
        <span style={s.title}>📊 FIFA World Cup 2026 · Player Stats</span>
      </div>

      {/* Tab strip */}
      <div style={s.tabs}>
        {STATS_TABS.map(t => (
          <button
            key={t.key}
            style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div style={s.loading}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} style={s.skeleton} />)}
        </div>
      )}

      {!loading && error && (
        <div style={s.empty}>
          Stats are updated after matches. Check back during or after a game.
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <div style={s.empty}>
          No {STATS_TABS.find(t => t.key === tab)?.label} data yet — updates live during matches.
        </div>
      )}

      {!loading && !error && players.length > 0 && (
        <div style={s.list}>
          {players.map((p, i) => (
            <PlayerRow key={p.id || i} player={p} stat={tab} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const s = {
  wrap: {
    background: 'rgba(10,22,60,.6)',
    border: '1px solid rgba(34,197,94,.22)',
    borderRadius: 18, padding: '14px 14px 16px',
    marginBottom: 16,
  },
  header: { marginBottom: 12 },
  title: {
    fontSize: 12, fontWeight: 800, color: '#4ade80',
    textTransform: 'uppercase', letterSpacing: '.07em',
  },

  tabs: {
    display: 'flex', gap: 6, overflowX: 'auto',
    scrollbarWidth: 'none', marginBottom: 14,
    WebkitOverflowScrolling: 'touch',
  },
  tab: {
    flexShrink: 0, padding: '5px 12px',
    borderRadius: 20, border: '1px solid rgba(34,197,94,.2)',
    background: 'none', color: '#64748b',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
    transition: 'all .15s',
  },
  tabActive: {
    background: 'rgba(34,197,94,.18)',
    border: '1px solid rgba(34,197,94,.55)',
    color: '#4ade80',
  },

  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(15,23,42,.6)',
    border: '1px solid rgba(30,64,175,.2)',
    borderRadius: 12, padding: '8px 12px',
  },
  rank: {
    width: 20, textAlign: 'center',
    fontSize: 11, fontWeight: 800, color: '#4ade80', flexShrink: 0,
  },

  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    overflow: 'hidden', flexShrink: 0,
    background: 'rgba(30,58,138,.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarImg:         { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  avatarPlaceholder: { fontSize: 14, fontWeight: 800, color: '#93c5fd' },

  playerInfo: { flex: 1, minWidth: 0 },
  playerName: {
    fontSize: 13, fontWeight: 700, color: '#e2e8f0',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  playerCountry: { fontSize: 11, color: '#64748b', marginTop: 1 },

  statBadge: {
    flexShrink: 0,
    minWidth: 32, height: 32,
    background: 'rgba(34,197,94,.15)',
    border: '1px solid rgba(34,197,94,.3)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 900, color: '#4ade80',
  },

  loading: { display: 'flex', flexDirection: 'column', gap: 6 },
  skeleton: {
    height: 52, borderRadius: 12,
    background: 'linear-gradient(90deg,rgba(30,58,138,.3) 25%,rgba(30,58,138,.5) 50%,rgba(30,58,138,.3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  },
  empty: {
    textAlign: 'center', padding: '20px 10px',
    fontSize: 12, color: '#64748b', lineHeight: 1.6,
  },
};
