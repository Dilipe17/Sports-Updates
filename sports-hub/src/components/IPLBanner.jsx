import React from 'react';

const IPL_TEAMS = [
  { abbr: 'MI',   name: 'Mumbai Indians',           color: '#004BA0', bg: '#004BA0', espnId: 4343 },
  { abbr: 'CSK',  name: 'Chennai Super Kings',       color: '#FDB913', bg: '#1a1400', espnId: 4340 },
  { abbr: 'RCB',  name: 'Royal Challengers Bengaluru', color: '#EC1C24', bg: '#1a0000', espnId: 4344 },
  { abbr: 'KKR',  name: 'Kolkata Knight Riders',     color: '#9B6FA5', bg: '#1e0d2e', espnId: 4341 },
  { abbr: 'DC',   name: 'Delhi Capitals',             color: '#17479E', bg: '#17479E', espnId: 4347 },
  { abbr: 'PBKS', name: 'Punjab Kings',               color: '#ED1C24', bg: '#1a0000', espnId: 4342 },
  { abbr: 'RR',   name: 'Rajasthan Royals',           color: '#2D4DA0', bg: '#2D4DA0', espnId: 4345 },
  { abbr: 'SRH',  name: 'Sunrisers Hyderabad',        color: '#F26522', bg: '#1a0a00', espnId: 4346 },
  { abbr: 'GT',   name: 'Gujarat Titans',             color: '#1C9AD6', bg: '#001a2e', espnId: 6601 },
  { abbr: 'LSG',  name: 'Lucknow Super Giants',       color: '#A72056', bg: '#1a0010', espnId: 6602 },
];

export default function IPLBanner() {
  return (
    <div style={s.wrap} className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.iplBadge}>🏏 IPL 2026</span>
          <div style={s.title}>Indian Premier League</div>
          <div style={s.subtitle}>Season starts tomorrow · 10 Teams · 74 Matches</div>
        </div>
        <div style={s.headerRight}>
          <div style={s.statBlock}><span style={s.statNum}>10</span><span style={s.statLabel}>Teams</span></div>
          <div style={s.statBlock}><span style={s.statNum}>74</span><span style={s.statLabel}>Matches</span></div>
          <div style={s.statBlock}><span style={s.statNum}>T20</span><span style={s.statLabel}>Format</span></div>
        </div>
      </div>

      {/* Teams strip */}
      <div style={s.teamsScroll}>
        {IPL_TEAMS.map(team => (
          <div key={team.abbr} style={s.teamCard}>
            <div style={{ ...s.logoWrap, background: `${team.color}22`, border: `1.5px solid ${team.color}55` }}>
              <img
                src={`https://a.espncdn.com/i/teamlogos/cricket/500/${team.espnId}.png`}
                alt={team.abbr}
                style={s.logo}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ ...s.logoFallback, color: team.color, display: 'none' }}>{team.abbr}</div>
            </div>
            <div style={s.teamAbbr}>{team.abbr}</div>
            <div style={s.teamName}>{team.name.replace('Royal Challengers Bengaluru', 'RCB Bengaluru')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    background: 'linear-gradient(135deg, rgba(20,10,40,.95) 0%, rgba(30,15,60,.9) 50%, rgba(40,10,20,.95) 100%)',
    border: '1px solid rgba(251,146,60,.3)',
    borderRadius: 20,
    padding: '18px 20px 16px',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: 5 },
  iplBadge: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, #f97316, #fbbf24)',
    color: '#0f0a00',
    fontSize: 11,
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: 999,
    letterSpacing: '.07em',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: 500,
  },
  headerRight: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  statNum: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fb923c',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '.06em',
  },
  teamsScroll: {
    display: 'flex',
    gap: 10,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
  },
  teamCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
    width: 68,
    cursor: 'default',
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: 'contain',
  },
  logoFallback: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '-.5px',
  },
  teamAbbr: {
    fontSize: 11,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '.03em',
  },
  teamName: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.3,
    maxWidth: 68,
  },
};
