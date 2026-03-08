import React, { useState } from 'react';
import { fetchStandingsData, fetchF1ChampionshipStandings, STANDINGS_CONFIG } from '../../../shared/api.js';

export default function StandingsPanel({ sportId }) {
  const [open,        setOpen]        = useState(false);
  const [leagueIdx,   setLeagueIdx]   = useState(0);
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const configs = STANDINGS_CONFIG[sportId];
  if (!configs) return null;

  const load = async (idx) => {
    setLeagueIdx(idx);
    setLoading(true);
    setError('');
    try {
      if (sportId === 'f1') {
        const result = await fetchF1ChampionshipStandings();
        setData(result ? { _f1: true, ...result } : null);
      } else {
        const result = await fetchStandingsData(sportId, idx);
        setData(result?.data || null);
      }
    } catch (e) {
      setError('Failed to load standings. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !data) load(0);
  };

  return (
    <div style={s.wrap}>
      <button style={s.toggleBtn} onClick={toggle}>
        <span>📊</span>
        <span>Standings</span>
        <span style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={s.panel} className="fade-in">
          {/* League selector */}
          {configs.length > 1 && (
            <div style={s.tabs}>
              {configs.map((c, i) => (
                <button key={c.id} style={{ ...s.tab, ...(i === leagueIdx ? s.tabActive : {}) }}
                  onClick={() => load(i)}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {loading && <div style={s.msg}>Loading standings…</div>}
          {error   && <div style={{ ...s.msg, color: '#f87171' }}>{error}</div>}
          {!loading && !error && data && <StandingsTable sportId={sportId} data={data} />}
        </div>
      )}
    </div>
  );
}

/* ── Table renderer ────────────────────────────────────────────────────────── */
function StandingsTable({ sportId, data }) {
  const isSoccer = sportId === 'soccer';
  const isF1     = sportId === 'f1';
  const isCricket= sportId === 'cricket';
  const children = data.children || [];

  // ── F1 (Jolpica data) ───────────────────────────────────────────────────────
  if (isF1 && data._f1) {
    const seasonLabel = data.season ? `${data.season} Season · After Round ${data.round}` : '';
    return (
      <>
        {seasonLabel && <div style={{ padding: '6px 12px 0', fontSize: 11, color: '#60a5fa', fontWeight: 600 }}>{seasonLabel}</div>}
        <F1JolpikaGroup entries={data.drivers}      label="Driver Standings"      icon="🏎️" />
        <F1JolpikaGroup entries={data.constructors} label="Constructor Standings" icon="🏗️" isConstructor />
      </>
    );
  }

  // ── Cricket (groups) ────────────────────────────────────────────────────────
  if (isCricket && children.length > 0) {
    return children.map(child => {
      const entries = sortEntries(child.standings?.entries || []);
      if (!entries.length) return null;
      return (
        <div key={child.name} style={s.groupWrap}>
          <div style={s.groupTitle}>🏏 {child.name}</div>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              {['#','Team','MP','W','L','NRR','Pts'].map(h => <th key={h} style={h==='Team'?s.thLeft:s.th}>{h}</th>)}
            </tr></thead>
            <tbody>{entries.map((e, i) => {
              const stats = statsObj(e);
              const logo  = e.team?.logos?.[0]?.href || '';
              const qual  = stats.qualified === 'Y';
              return (
                <tr key={i} style={{ ...s.tr, borderLeft: qual ? '2px solid #22c55e' : 'none' }}>
                  <td style={s.tdRank}>{stats.rank || i+1}</td>
                  <td style={s.tdTeam}>
                    {logo && <img src={logo} style={s.teamLogo} onError={e=>e.target.style.display='none'} alt="" />}
                    <span>{e.team?.displayName || 'TBD'}</span>
                    {qual && <span style={s.qualBadge}>Q</span>}
                  </td>
                  <td style={s.td}>{stats.matchesPlayed||'-'}</td>
                  <td style={{ ...s.td, color:'#4ade80' }}>{stats.matchesWon||'-'}</td>
                  <td style={{ ...s.td, color:'#f87171' }}>{stats.matchesLost||'-'}</td>
                  <td style={{ ...s.td, color:'#67e8f9' }}>{stats.netrr||'-'}</td>
                  <td style={{ ...s.td, color:'#fbbf24', fontWeight:700 }}>{stats.matchPoints||'-'}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      );
    });
  }

  // ── Default (Soccer / NFL / MLB / NBA) ──────────────────────────────────────
  let entries = [];
  if (children.length > 0) {
    children.forEach(c => entries.push(...(c.standings?.entries || [])));
  } else if (data.standings) {
    entries.push(...(data.standings.entries || []));
  }
  entries = sortEntries(entries);
  if (!entries.length) return <div style={s.msg}>No standings available.</div>;

  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead><tr style={s.thead}>
          {['#','Team','GP','W','L',
            ...(isSoccer ? ['D','GD','Pts'] : ['Pct'])
          ].map(h => <th key={h} style={h==='Team'?s.thLeft:s.th}>{h}</th>)}
        </tr></thead>
        <tbody>{entries.map((e, i) => {
          const stats    = statsObj(e);
          const logo     = e.team?.logos?.[0]?.href || '';
          const isTop4   = i < 4;
          const isRelzone= isSoccer && i >= entries.length - 3;
          const bl       = isTop4 ? '#22c55e' : isRelzone ? '#ef4444' : 'transparent';
          return (
            <tr key={i} style={{ ...s.tr, borderLeft: `2px solid ${bl}` }}>
              <td style={s.tdRank}>{i+1}</td>
              <td style={s.tdTeam}>
                {logo && <img src={logo} style={s.teamLogo} onError={e=>e.target.style.display='none'} alt="" />}
                <span>{e.team?.displayName || 'TBD'}</span>
              </td>
              <td style={s.td}>{stats.gamesPlayed||'-'}</td>
              <td style={{ ...s.td, color:'#4ade80' }}>{stats.wins||'-'}</td>
              <td style={{ ...s.td, color:'#f87171' }}>{stats.losses||'-'}</td>
              {isSoccer && <td style={s.td}>{stats.ties||'-'}</td>}
              {isSoccer && <td style={s.td}>{stats.pointDifferential||'-'}</td>}
              <td style={{ ...s.td, color:'#fbbf24', fontWeight:700 }}>
                {isSoccer ? (stats.points||'-') : (stats.winPercent||'-')}
              </td>
            </tr>
          );
        })}</tbody>
      </table>
      {isSoccer && (
        <div style={s.legend}>
          <span style={{ color:'#22c55e' }}>■</span> Champions League &nbsp;
          <span style={{ color:'#ef4444' }}>■</span> Relegation Zone
        </div>
      )}
    </div>
  );
}

function F1JolpikaGroup({ entries, label, icon, isConstructor }) {
  if (!entries || !entries.length) return null;
  return (
    <div style={s.groupWrap}>
      <div style={s.groupTitle}>{icon} {label}</div>
      <table style={s.table}>
        <thead><tr style={s.thead}>
          {['#', isConstructor ? 'Constructor' : 'Driver', isConstructor ? 'Nat' : 'Team', 'W', 'Pts'].map((h, i) =>
            <th key={h} style={i <= 1 ? s.thLeft : s.th}>{h}</th>
          )}
        </tr></thead>
        <tbody>{entries.map((e, i) => (
          <tr key={i} style={{ ...s.tr, borderLeft: i < 3 ? '2px solid #fbbf24' : 'none' }}>
            <td style={s.tdRank}>{e.rank}</td>
            <td style={s.tdTeam}>
              <span style={{ fontWeight: 700 }}>{e.name}</span>
              {!isConstructor && e.code && <span style={{ fontSize: 10, color: '#60a5fa', marginLeft: 4 }}>({e.code})</span>}
            </td>
            <td style={{ ...s.td, textAlign: 'left', color: '#94a3b8' }}>
              {isConstructor ? (e.nat || '') : (e.team || '')}
            </td>
            <td style={{ ...s.td, color: '#4ade80' }}>{e.wins}</td>
            <td style={{ ...s.td, color: '#fbbf24', fontWeight: 700 }}>{e.points}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function F1Group({ entries, label, icon }) {
  const sorted = [...entries].sort((a,b) => {
    const ra = parseInt(statsObj(a).rank||'99');
    const rb = parseInt(statsObj(b).rank||'99');
    return ra - rb;
  });
  return (
    <div style={s.groupWrap}>
      <div style={s.groupTitle}>{icon} {label}</div>
      <table style={s.table}>
        <thead><tr style={s.thead}>
          {['#','Name','Pts'].map(h => <th key={h} style={h==='Name'?s.thLeft:s.th}>{h}</th>)}
        </tr></thead>
        <tbody>{sorted.slice(0,15).map((e,i) => {
          const stats = statsObj(e);
          const logo  = e.team?.logos?.[0]?.href || '';
          return (
            <tr key={i} style={{ ...s.tr, borderLeft: i<3 ? '2px solid #fbbf24' : 'none' }}>
              <td style={s.tdRank}>{stats.rank||i+1}</td>
              <td style={s.tdTeam}>
                {logo && <img src={logo} style={s.teamLogo} onError={e=>e.target.style.display='none'} alt="" />}
                <span>{e.team?.displayName || 'TBD'}</span>
              </td>
              <td style={{ ...s.td, color:'#fbbf24', fontWeight:700 }}>{stats.championshipPts||'0'}</td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}

// Helpers
const statsObj = (e) => {
  const obj = {};
  (e.stats||[]).forEach(s => { obj[s.name] = s.displayValue || String(s.value||''); });
  return obj;
};
const sortEntries = (entries) => [...entries].sort((a,b) => {
  const sa = statsObj(a), sb = statsObj(b);
  const ra = parseInt(sa.rank||'0'), rb = parseInt(sb.rank||'0');
  if (ra>0 && rb>0) return ra - rb;
  return parseFloat(sb.winPercent||'0') - parseFloat(sa.winPercent||'0');
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  wrap:      { marginBottom: 16 },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px',
    background: 'rgba(30,58,138,.5)', border: '1px solid rgba(30,64,175,.4)',
    borderRadius: 12, color: '#93c5fd', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, transition: 'background .15s',
  },
  chevron:   { fontSize: 14, transition: 'transform .2s', display: 'inline-block' },
  panel:     { background: 'rgba(15,23,42,.5)', borderRadius: 16, border: '1px solid rgba(30,64,175,.3)', overflow: 'hidden' },
  tabs:      { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', borderBottom: '1px solid rgba(30,64,175,.25)' },
  tab:       { padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(30,64,175,.35)', color: '#93c5fd', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { background: '#2563eb', color: '#fff' },
  msg:       { padding: 20, textAlign: 'center', color: '#93c5fd', fontSize: 13 },
  groupWrap: { padding: '10px 12px' },
  groupTitle:{ fontSize: 12, fontWeight: 700, color: '#93c5fd', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' },
  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  thead:     { borderBottom: '1px solid rgba(30,64,175,.4)' },
  th:        { padding: '8px 8px', textAlign: 'center', color: '#60a5fa', fontWeight: 700, whiteSpace: 'nowrap' },
  thLeft:    { padding: '8px 10px', textAlign: 'left', color: '#60a5fa', fontWeight: 700 },
  tr:        { borderBottom: '1px solid rgba(30,64,175,.2)', transition: 'background .15s' },
  tdRank:    { padding: '7px 8px', color: '#93c5fd', fontWeight: 700, textAlign: 'center', width: 32 },
  tdTeam:    { padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 500 },
  td:        { padding: '7px 8px', textAlign: 'center', color: '#cbd5e1' },
  teamLogo:  { width: 18, height: 18, objectFit: 'contain', flexShrink: 0 },
  qualBadge: { fontSize: 9, color: '#4ade80', fontWeight: 700, marginLeft: 4 },
  legend:    { padding: '6px 12px', fontSize: 10, color: '#60a5fa', borderTop: '1px solid rgba(30,64,175,.2)' },
};
