import React, { useState, useEffect } from 'react';

const TABS = [
  { key: 'goals',   label: '⚽ Goals'   },
  { key: 'assists', label: '🎯 Assists'  },
  { key: 'yellow',  label: '🟨 Cards'   },
];

/* ── Fetch completed WC match IDs from scoreboard ─────────────────────────── */
async function fetchCompletedMatchIds() {
  const res = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=200',
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error('scoreboard');
  const data = await res.json();
  return (data.events || [])
    .filter(ev => ev.status?.type?.state === 'post')
    .map(ev => ev.id);
}

/* ── Fetch one match summary and extract player stats ─────────────────────── */
async function fetchMatchStats(eventId) {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return [];
    const data = await res.json();

    const rows = [];
    const teamPlayers = data.boxscore?.players || [];

    for (const tp of teamPlayers) {
      const teamName = tp.team?.displayName || tp.team?.shortDisplayName || '';
      for (const statGroup of (tp.statistics || [])) {
        const labels = statGroup.names || statGroup.keys || [];
        const gIdx  = labels.findIndex(l => l === 'G'  || l === 'goals');
        const aIdx  = labels.findIndex(l => l === 'A'  || l === 'assists');
        const ycIdx = labels.findIndex(l => l === 'YC' || l === 'yellowCards' || l === 'CAR');

        for (const entry of (statGroup.athletes || [])) {
          const ath   = entry.athlete || {};
          const stats = entry.stats || [];
          const g  = gIdx  >= 0 ? parseInt(stats[gIdx],  10) || 0 : 0;
          const a  = aIdx  >= 0 ? parseInt(stats[aIdx],  10) || 0 : 0;
          const yc = ycIdx >= 0 ? parseInt(stats[ycIdx], 10) || 0 : 0;
          if (g || a || yc) {
            rows.push({
              id:       ath.id       || ath.displayName || '',
              name:     ath.displayName || ath.shortName || '',
              country:  teamName,
              headshot: ath.headshot?.href || '',
              g, a, yc,
            });
          }
        }
      }
    }
    return rows;
  } catch {
    return [];
  }
}

/* ── Aggregate across all matches ─────────────────────────────────────────── */
function buildLeaderboard(allRows) {
  const map = {};
  for (const row of allRows) {
    const key = row.id || row.name;
    if (!key) continue;
    if (!map[key]) map[key] = { ...row, g: 0, a: 0, yc: 0 };
    map[key].g  += row.g;
    map[key].a  += row.a;
    map[key].yc += row.yc;
  }
  const players = Object.values(map);
  const sortBy  = field => [...players].filter(p => p[field] > 0).sort((a, b) => b[field] - a[field]).slice(0, 15);
  return {
    goals:   sortBy('g'),
    assists: sortBy('a'),
    yellow:  sortBy('yc'),
  };
}

export async function fetchWCPlayerStats() {
  const ids = await fetchCompletedMatchIds();
  if (!ids.length) return null;

  // Fetch up to 30 matches in parallel batches of 6
  const batchSize  = 6;
  const limited    = ids.slice(0, 30);
  const allRows    = [];

  for (let i = 0; i < limited.length; i += batchSize) {
    const batch   = limited.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(fetchMatchStats));
    for (const r of results) {
      if (r.status === 'fulfilled') allRows.push(...r.value);
    }
  }

  if (!allRows.length) return null;
  return buildLeaderboard(allRows);
}

/* ── Player row ───────────────────────────────────────────────────────────── */
function PlayerRow({ player, field, rank }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div style={s.row}>
      <span style={s.rank}>{rank}</span>
      <div style={s.avatar}>
        {player.headshot && !imgFailed ? (
          <img src={player.headshot} alt="" style={s.avatarImg} onError={() => setImgFailed(true)} />
        ) : (
          <div style={s.avatarPlaceholder}>{(player.name[0] || '?').toUpperCase()}</div>
        )}
      </div>
      <div style={s.info}>
        <div style={s.name}>{player.name}</div>
        <div style={s.country}>{player.country}</div>
      </div>
      <div style={s.badge}>{player[field]}</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function WCPlayerStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [tab,     setTab]     = useState('goals');

  useEffect(() => {
    fetchWCPlayerStats()
      .then(data => { setStats(data); if (!data) setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const FIELD_MAP = { goals: 'g', assists: 'a', yellow: 'yc' };
  const players   = stats?.[tab] || [];

  return (
    <div style={s.wrap} className="fade-in">
      <div style={s.title}>📊 Tournament Player Stats · FIFA World Cup 2026</div>

      <div style={s.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...s.tab, ...(tab === t.key ? s.tabOn : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={s.skels}>
          {[0,1,2,3,4].map(i => <div key={i} style={s.skel} />)}
          <div style={s.loadHint}>Aggregating stats across all WC matches…</div>
        </div>
      )}

      {!loading && (error || !players.length) && (
        <div style={s.empty}>
          {error
            ? 'Stats are compiled from match summaries. Check back after the next game.'
            : `No ${TABS.find(t => t.key === tab)?.label} data yet — updates as matches are played.`}
        </div>
      )}

      {!loading && players.length > 0 && (
        <div style={s.list}>
          {players.map((p, i) => (
            <PlayerRow key={p.id || i} player={p} field={FIELD_MAP[tab]} rank={i + 1} />
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
  title: {
    fontSize: 12, fontWeight: 800, color: '#4ade80',
    textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12,
  },
  tabs: {
    display: 'flex', gap: 6, marginBottom: 14,
    overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
  },
  tab: {
    flexShrink: 0, padding: '5px 14px', borderRadius: 20,
    border: '1px solid rgba(34,197,94,.2)', background: 'none',
    color: '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .15s',
  },
  tabOn: {
    background: 'rgba(34,197,94,.18)',
    border: '1px solid rgba(34,197,94,.55)', color: '#4ade80',
  },
  list:  { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(15,23,42,.6)',
    border: '1px solid rgba(30,64,175,.2)',
    borderRadius: 12, padding: '8px 12px',
  },
  rank: { width: 18, textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#4ade80', flexShrink: 0 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
    background: 'rgba(30,58,138,.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarImg:         { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  avatarPlaceholder: { fontSize: 14, fontWeight: 800, color: '#93c5fd' },
  info:    { flex: 1, minWidth: 0 },
  name:    { fontSize: 13, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  country: { fontSize: 11, color: '#64748b', marginTop: 1 },
  badge: {
    flexShrink: 0, minWidth: 32, height: 32,
    background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 900, color: '#4ade80',
  },
  skels:    { display: 'flex', flexDirection: 'column', gap: 6 },
  skel: {
    height: 52, borderRadius: 12,
    background: 'rgba(30,58,138,.3)', animation: 'shimmer 1.4s infinite',
  },
  loadHint: { fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 6 },
  empty:    { textAlign: 'center', padding: '18px 8px', fontSize: 12, color: '#64748b', lineHeight: 1.7 },
};
