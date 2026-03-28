import React, { useState } from 'react';
import {
  fetchStandingsData, fetchIPLStandings, fetchF1ChampionshipStandings,
  fetchTeamSchedule, STANDINGS_CONFIG,
} from '../../../shared/api.js';

/* ─── IPL team colours (abbr → hex) for fallback badges ─────────────────── */
const IPL_COLORS = {
  MI: '#004BA0', CSK: '#FDB913', RCB: '#EC1C24', KKR: '#9B6FA5',
  DC: '#17479E', PBKS: '#ED1C24', RR: '#2D4DA0', SRH: '#F26522',
  GT: '#1C9AD6', LSG: '#A72056',
};

/* ─── Main panel ─────────────────────────────────────────────────────────── */
export default function StandingsPanel({ sportId }) {
  const [open,         setOpen]         = useState(false);
  const [leagueIdx,    setLeagueIdx]    = useState(0);
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null); // { id, name, logo, leagueId }
  const [schedule,     setSchedule]     = useState(null);
  const [schedLoading, setSchedLoading] = useState(false);

  const configs = STANDINGS_CONFIG[sportId];
  if (!configs) return null;

  const load = async (idx) => {
    setLeagueIdx(idx);
    setLoading(true);
    setError('');
    setSelectedTeam(null);
    setSchedule(null);
    try {
      let result;
      if (sportId === 'f1') {
        const r = await fetchF1ChampionshipStandings();
        result  = r ? { _f1: true, ...r } : null;
      } else if (sportId === 'cricket' && idx === 0) {
        result = await fetchIPLStandings(); // dynamic league ID discovery
      } else {
        const r = await fetchStandingsData(sportId, idx);
        result  = r?.data || null;
      }
      setData(result);
    } catch {
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

  /* ── Team click → schedule ────────────────────────────────────────────── */
  const handleTeamClick = async (teamId, teamName, teamLogo, leagueId) => {
    setSelectedTeam({ id: teamId, name: teamName, logo: teamLogo, leagueId });
    setSchedule(null);
    setSchedLoading(true);
    try {
      const raw = await fetchTeamSchedule(leagueId, teamId);
      setSchedule(raw);
    } catch {
      setSchedule(null);
    } finally {
      setSchedLoading(false);
    }
  };

  const isIPL = sportId === 'cricket' && leagueIdx === 0;

  return (
    <div style={s.wrap}>
      <button
        style={{ ...s.toggleBtn, ...(isIPL ? s.iplToggleBtn : {}) }}
        onClick={toggle}
      >
        <span>{isIPL ? '🏏' : '📊'}</span>
        <span>{isIPL ? 'IPL 2026 Points Table' : 'Standings'}</span>
        <span style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={{ ...s.panel, ...(isIPL ? s.iplPanel : {}) }} className="fade-in">

          {/* League tabs */}
          {configs.length > 1 && !selectedTeam && (
            <div style={s.tabs}>
              {configs.map((c, i) => (
                <button key={c.id}
                  style={{ ...s.tab, ...(i === leagueIdx ? (isIPL ? s.iplTabActive : s.tabActive) : {}) }}
                  onClick={() => load(i)}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Team schedule drill-down */}
          {selectedTeam ? (
            <TeamScheduleView
              team={selectedTeam}
              schedule={schedule}
              loading={schedLoading}
              onBack={() => { setSelectedTeam(null); setSchedule(null); }}
            />
          ) : (
            <>
              {loading && <div style={s.msg}>Loading standings…</div>}
              {error   && <div style={{ ...s.msg, color: '#f87171' }}>{error}</div>}
              {!loading && !error && data && (
                <StandingsTable
                  sportId={sportId}
                  leagueIdx={leagueIdx}
                  data={data}
                  onTeamClick={handleTeamClick}
                />
              )}
              {!loading && !error && !data && (
                <div style={s.msg}>
                  {isIPL
                    ? '🏏 IPL 2026 kicks off tomorrow — standings will appear after the first match!'
                    : 'No standings available.'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Team schedule drill-down view ─────────────────────────────────────── */
function TeamScheduleView({ team, schedule, loading, onBack }) {
  const events = schedule?.events || [];
  return (
    <div style={s.schedWrap}>
      <div style={s.schedHeader}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <div style={s.schedTeamInfo}>
          {team.logo && (
            <img src={team.logo} alt="" style={s.schedLogo}
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          <span style={s.schedTeamName}>{team.name}</span>
        </div>
      </div>

      {loading && <div style={s.msg}>Loading matches…</div>}

      {!loading && events.length === 0 && (
        <div style={s.msg}>No matches found for this team yet.</div>
      )}

      {!loading && events.length > 0 && (
        <div style={s.matchList}>
          {events.map((ev, i) => {
            const comp   = ev.competitions?.[0] || {};
            const comps  = comp.competitors || [];
            const home   = comps.find(c => c.homeAway === 'home') || comps[0] || {};
            const away   = comps.find(c => c.homeAway === 'away') || comps[1] || {};
            const status = ev.status?.type;
            const isLive = status?.state === 'in';
            const isDone = status?.state === 'post';
            const dateStr = ev.date
              ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : '';
            const isWin = (() => {
              if (!isDone) return null;
              const myComp = comps.find(c =>
                (c.team?.displayName || '').toLowerCase().includes(team.name.toLowerCase().split(' ')[0])
              );
              return myComp?.winner === true;
            })();
            const winColor = isWin === true ? '#4ade80' : isWin === false ? '#f87171' : '#94a3b8';

            return (
              <div key={ev.id || i} style={{ ...s.matchRow, borderLeft: `3px solid ${winColor}` }}>
                <div style={s.matchDate}>{dateStr}</div>
                <div style={s.matchTeams}>
                  <span style={s.matchTeam}>{home.team?.shortDisplayName || home.team?.displayName || 'TBD'}</span>
                  <span style={s.matchScore}>
                    {isDone
                      ? `${home.score ?? '-'} – ${away.score ?? '-'}`
                      : isLive ? '🔴 LIVE' : 'vs'}
                  </span>
                  <span style={s.matchTeam}>{away.team?.shortDisplayName || away.team?.displayName || 'TBD'}</span>
                </div>
                <div style={{ ...s.matchResult, color: winColor }}>
                  {isDone && (isWin === true ? 'W' : isWin === false ? 'L' : '–')}
                  {isLive && '●'}
                  {!isDone && !isLive && status?.shortDetail || ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Table renderer ─────────────────────────────────────────────────────── */
function StandingsTable({ sportId, leagueIdx, data, onTeamClick }) {
  const isSoccer  = sportId === 'soccer';
  const isF1      = sportId === 'f1';
  const isCricket = sportId === 'cricket';
  const isIPL     = isCricket && leagueIdx === 0;
  const children  = data.children || [];

  /* ── F1 ──────────────────────────────────────────────────────────────── */
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

  /* ── Cricket / IPL ───────────────────────────────────────────────────── */
  if (isCricket && children.length > 0) {
    const leagueId = data._iplLeagueId;
    return children.map(child => {
      const entries = sortEntries(child.standings?.entries || []);
      if (!entries.length) return null;
      return (
        <div key={child.name} style={s.groupWrap}>
          {isIPL && (
            <div style={s.iplTableHeader}>
              <span>🏏 IPL 2026 Points Table</span>
              <span style={s.iplClickHint}>Click a team to see their matches</span>
            </div>
          )}
          {!isIPL && <div style={{ ...s.groupTitle, color: '#fb923c' }}>🏏 {child.name}</div>}
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {['#', 'Team', 'MP', 'W', 'L', 'NRR', 'Pts'].map(h => (
                  <th key={h} style={h === 'Team' ? s.thLeft : s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const stats   = statsObj(e);
                const logo    = e.team?.logos?.[0]?.href || '';
                const abbr    = e.team?.abbreviation || '';
                const qual    = stats.qualified === 'Y';
                const teamId  = e.team?.id;
                const teamName = e.team?.displayName || 'TBD';
                /* top-4 qualify for IPL playoffs */
                const borderColor = isIPL
                  ? (i < 4 ? '#fb923c' : 'transparent')
                  : (qual ? '#22c55e' : 'none');
                return (
                  <tr
                    key={i}
                    style={{
                      ...s.tr,
                      borderLeft: `2px solid ${borderColor}`,
                      cursor: leagueId && teamId ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (leagueId && teamId) onTeamClick(teamId, teamName, logo, leagueId);
                    }}
                    title={leagueId && teamId ? `View ${teamName} matches` : ''}
                  >
                    <td style={s.tdRank}>{stats.rank || i + 1}</td>
                    <td style={s.tdTeam}>
                      {logo
                        ? <img src={logo} style={s.teamLogo} onError={e => e.target.style.display = 'none'} alt="" />
                        : abbr && <div style={{ ...s.teamAbbrBadge, background: IPL_COLORS[abbr] || '#334155' }}>{abbr}</div>
                      }
                      <span>{teamName}</span>
                      {isIPL && i < 4 && <span style={s.playoffBadge}>Playoff</span>}
                      {!isIPL && qual && <span style={s.qualBadge}>Q</span>}
                    </td>
                    <td style={s.td}>{stats.matchesPlayed || '0'}</td>
                    <td style={{ ...s.td, color: '#4ade80' }}>{stats.matchesWon || '0'}</td>
                    <td style={{ ...s.td, color: '#f87171' }}>{stats.matchesLost || '0'}</td>
                    <td style={{ ...s.td, color: '#67e8f9', fontSize: 11 }}>{stats.netrr || '+0.000'}</td>
                    <td style={{ ...s.td, color: '#fb923c', fontWeight: 700, fontSize: 13 }}>
                      {stats.matchPoints || '0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isIPL && (
            <div style={s.iplLegend}>
              <span style={{ color: '#fb923c' }}>■</span> Top 4 qualify for playoffs
            </div>
          )}
        </div>
      );
    });
  }

  /* ── Default (Soccer / NFL / MLB / NBA) ──────────────────────────────── */
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
        <thead>
          <tr style={s.thead}>
            {['#', 'Team', 'GP', 'W', 'L',
              ...(isSoccer ? ['D', 'GD', 'Pts'] : ['Pct']),
            ].map(h => <th key={h} style={h === 'Team' ? s.thLeft : s.th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const stats    = statsObj(e);
            const logo     = e.team?.logos?.[0]?.href || '';
            const isTop4   = i < 4;
            const isRelzone = isSoccer && i >= entries.length - 3;
            const bl = isTop4 ? '#22c55e' : isRelzone ? '#ef4444' : 'transparent';
            return (
              <tr key={i} style={{ ...s.tr, borderLeft: `2px solid ${bl}` }}>
                <td style={s.tdRank}>{i + 1}</td>
                <td style={s.tdTeam}>
                  {logo && <img src={logo} style={s.teamLogo} onError={e => e.target.style.display = 'none'} alt="" />}
                  <span>{e.team?.displayName || 'TBD'}</span>
                </td>
                <td style={s.td}>{stats.gamesPlayed || '-'}</td>
                <td style={{ ...s.td, color: '#4ade80' }}>{stats.wins || '-'}</td>
                <td style={{ ...s.td, color: '#f87171' }}>{stats.losses || '-'}</td>
                {isSoccer && <td style={s.td}>{stats.ties || '-'}</td>}
                {isSoccer && <td style={s.td}>{stats.pointDifferential || '-'}</td>}
                <td style={{ ...s.td, color: '#fbbf24', fontWeight: 700 }}>
                  {isSoccer ? (stats.points || '-') : (stats.winPercent || '-')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isSoccer && (
        <div style={s.legend}>
          <span style={{ color: '#22c55e' }}>■</span> Champions League &nbsp;
          <span style={{ color: '#ef4444' }}>■</span> Relegation Zone
        </div>
      )}
    </div>
  );
}

/* ─── F1 Jolpica groups ──────────────────────────────────────────────────── */
function F1JolpikaGroup({ entries, label, icon, isConstructor }) {
  if (!entries || !entries.length) return null;
  return (
    <div style={s.groupWrap}>
      <div style={s.groupTitle}>{icon} {label}</div>
      <table style={s.table}>
        <thead>
          <tr style={s.thead}>
            {['#', isConstructor ? 'Constructor' : 'Driver', isConstructor ? 'Nat' : 'Team', 'W', 'Pts'].map((h, i) => (
              <th key={h} style={i <= 1 ? s.thLeft : s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const statsObj = (e) => {
  const obj = {};
  (e.stats || []).forEach(s => { obj[s.name] = s.displayValue || String(s.value || ''); });
  return obj;
};
const sortEntries = (entries) => [...entries].sort((a, b) => {
  const sa = statsObj(a), sb = statsObj(b);
  const ra = parseInt(sa.rank || '0'), rb = parseInt(sb.rank || '0');
  if (ra > 0 && rb > 0) return ra - rb;
  return parseFloat(sb.winPercent || '0') - parseFloat(sa.winPercent || '0');
});

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  wrap:         { marginBottom: 16 },
  iplToggleBtn: { background: 'rgba(251,146,60,.15)', border: '1px solid rgba(251,146,60,.4)', color: '#fb923c' },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px',
    background: 'rgba(30,58,138,.5)', border: '1px solid rgba(30,64,175,.4)',
    borderRadius: 12, color: '#93c5fd', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, transition: 'background .15s',
  },
  chevron:    { fontSize: 14, transition: 'transform .2s', display: 'inline-block' },
  panel:      { background: 'rgba(15,23,42,.5)', borderRadius: 16, border: '1px solid rgba(30,64,175,.3)', overflow: 'hidden' },
  iplPanel:   { border: '1px solid rgba(251,146,60,.25)' },
  tabs:       { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', borderBottom: '1px solid rgba(30,64,175,.25)' },
  tab:        { padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(30,64,175,.35)', color: '#93c5fd', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  tabActive:  { background: '#2563eb', color: '#fff' },
  iplTabActive:{ background: 'rgba(251,146,60,.6)', color: '#fff' },
  msg:        { padding: 20, textAlign: 'center', color: '#93c5fd', fontSize: 13 },
  groupWrap:  { padding: '10px 12px' },
  groupTitle: { fontSize: 12, fontWeight: 700, color: '#93c5fd', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' },
  iplTableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iplClickHint:   { fontSize: 10, color: '#fb923c88', fontStyle: 'italic' },
  iplLegend:  { fontSize: 10, color: '#fb923c', padding: '6px 0 2px', borderTop: '1px solid rgba(251,146,60,.2)', marginTop: 4 },
  playoffBadge: { fontSize: 9, color: '#fb923c', fontWeight: 700, marginLeft: 5, border: '1px solid #fb923c55', borderRadius: 4, padding: '1px 4px' },
  qualBadge:  { fontSize: 9, color: '#4ade80', fontWeight: 700, marginLeft: 4 },
  teamAbbrBadge: { width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#fff', flexShrink: 0 },
  tableWrap:  { overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  thead:      { borderBottom: '1px solid rgba(30,64,175,.4)' },
  th:         { padding: '8px 8px', textAlign: 'center', color: '#60a5fa', fontWeight: 700, whiteSpace: 'nowrap' },
  thLeft:     { padding: '8px 10px', textAlign: 'left', color: '#60a5fa', fontWeight: 700 },
  tr:         { borderBottom: '1px solid rgba(30,64,175,.2)', transition: 'background .15s' },
  tdRank:     { padding: '7px 8px', color: '#93c5fd', fontWeight: 700, textAlign: 'center', width: 28 },
  tdTeam:     { padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 500 },
  td:         { padding: '7px 8px', textAlign: 'center', color: '#cbd5e1' },
  teamLogo:   { width: 18, height: 18, objectFit: 'contain', flexShrink: 0 },
  legend:     { padding: '6px 12px', fontSize: 10, color: '#60a5fa', borderTop: '1px solid rgba(30,64,175,.2)' },

  /* Team schedule panel */
  schedWrap:     { padding: 12 },
  schedHeader:   { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, borderBottom: '1px solid rgba(251,146,60,.2)', paddingBottom: 10 },
  backBtn:       { background: 'none', border: '1px solid rgba(251,146,60,.4)', borderRadius: 8, color: '#fb923c', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 10px' },
  schedTeamInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  schedLogo:     { width: 28, height: 28, objectFit: 'contain' },
  schedTeamName: { fontSize: 14, fontWeight: 700, color: '#fff' },
  matchList:     { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' },
  matchRow:      { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(30,58,138,.25)' },
  matchDate:     { fontSize: 10, color: '#94a3b8', minWidth: 38, fontWeight: 600 },
  matchTeams:    { display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' },
  matchTeam:     { fontSize: 11, color: '#e2e8f0', fontWeight: 600 },
  matchScore:    { fontSize: 11, color: '#60a5fa', fontWeight: 700, padding: '0 4px' },
  matchResult:   { fontSize: 11, fontWeight: 800, minWidth: 16, textAlign: 'right' },
};
