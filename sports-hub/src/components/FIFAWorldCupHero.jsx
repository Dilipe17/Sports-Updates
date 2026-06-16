import React, { useState } from 'react';

const WC_START  = new Date('2026-06-11T00:00:00Z');
const dayNumber = Math.max(1, Math.ceil((Date.now() - WC_START.getTime()) / (1000 * 60 * 60 * 24)));

/* ── Nation flags ──────────────────────────────────────────────────────────── */
const NATIONS = [
  { flag: '🇧🇷', name: 'Brazil'       }, { flag: '🇦🇷', name: 'Argentina'   },
  { flag: '🇫🇷', name: 'France'       }, { flag: '🇩🇪', name: 'Germany'     },
  { flag: '🇪🇸', name: 'Spain'        }, { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England'     },
  { flag: '🇵🇹', name: 'Portugal'     }, { flag: '🇳🇱', name: 'Netherlands' },
  { flag: '🇧🇪', name: 'Belgium'      }, { flag: '🇮🇹', name: 'Italy'       },
  { flag: '🇺🇸', name: 'USA'          }, { flag: '🇨🇦', name: 'Canada'      },
  { flag: '🇲🇽', name: 'Mexico'       }, { flag: '🇯🇵', name: 'Japan'       },
  { flag: '🇰🇷', name: 'Korea'        }, { flag: '🇲🇦', name: 'Morocco'     },
  { flag: '🇸🇳', name: 'Senegal'      }, { flag: '🇳🇬', name: 'Nigeria'     },
  { flag: '🇬🇭', name: 'Ghana'        }, { flag: '🇭🇷', name: 'Croatia'     },
  { flag: '🇺🇾', name: 'Uruguay'      }, { flag: '🇨🇴', name: 'Colombia'    },
  { flag: '🇨🇱', name: 'Chile'        }, { flag: '🇨🇭', name: 'Switzerland' },
  { flag: '🇩🇰', name: 'Denmark'      }, { flag: '🇦🇹', name: 'Austria'     },
  { flag: '🇸🇦', name: 'Saudi Arabia' }, { flag: '🇦🇺', name: 'Australia'   },
  { flag: '🇪🇨', name: 'Ecuador'      }, { flag: '🇵🇦', name: 'Panama'      },
  { flag: '🇷🇸', name: 'Serbia'       }, { flag: '🇵🇱', name: 'Poland'      },
  { flag: '🇹🇳', name: 'Tunisia'      }, { flag: '🇮🇷', name: 'Iran'        },
  { flag: '🇨🇲', name: 'Cameroon'     }, { flag: '🇶🇦', name: 'Qatar'       },
];

/* ── Star players ──────────────────────────────────────────────────────────── */
const STAR_PLAYERS = [
  { id: 3133500,  name: 'Mbappe',     flag: '🇫🇷', country: 'France',      role: 'Forward',    accent: '#0055a4' },
  { id: 4243985,  name: 'Vinicius',   flag: '🇧🇷', country: 'Brazil',      role: 'Forward',    accent: '#009c3b' },
  { id: 4289657,  name: 'Bellingham', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England',     role: 'Midfielder', accent: '#cf081f' },
  { id: 4432680,  name: 'Pedri',      flag: '🇪🇸', country: 'Spain',       role: 'Midfielder', accent: '#c60b1e' },
  { id: 4289659,  name: 'Foden',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England',     role: 'Midfielder', accent: '#6cabdd' },
  { id: 5082448,  name: 'Yamal',      flag: '🇪🇸', country: 'Spain',       role: 'Forward',    accent: '#aa151b' },
  { id: 5032236,  name: 'Musiala',    flag: '🇩🇪', country: 'Germany',     role: 'Midfielder', accent: '#000000' },
  { id: 3725618,  name: 'Pulisic',    flag: '🇺🇸', country: 'USA',         role: 'Midfielder', accent: '#b22234' },
  { id: 3104489,  name: 'Kane',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England',     role: 'Forward',    accent: '#ffffff' },
  { id: 45843,    name: 'Messi',      flag: '🇦🇷', country: 'Argentina',   role: 'Forward',    accent: '#74acdf' },
  { id: 3901929,  name: 'Rodrygo',    flag: '🇧🇷', country: 'Brazil',      role: 'Forward',    accent: '#009c3b' },
  { id: 3150045,  name: 'B. Fernandes',flag:'🇵🇹', country: 'Portugal',    role: 'Midfielder', accent: '#006600' },
];

/* ── Host venues ───────────────────────────────────────────────────────────── */
const VENUES = [
  { name: 'MetLife Stadium',   city: 'New York/NJ', flag: '🇺🇸', cap: '82,500', role: '🏆 Grand Final', grad: 'linear-gradient(135deg,#0d1b4b,#1a3a6e)' },
  { name: 'Estadio Azteca',    city: 'Mexico City', flag: '🇲🇽', cap: '87,523', role: '⚽ Opening Match', grad: 'linear-gradient(135deg,#1a0a0a,#6b1010)' },
  { name: 'AT&T Stadium',      city: 'Dallas, TX',  flag: '🇺🇸', cap: '80,000', role: '🌟 Semi-Final',   grad: 'linear-gradient(135deg,#0a1628,#1d3a60)' },
  { name: 'SoFi Stadium',      city: 'Los Angeles', flag: '🇺🇸', cap: '70,000', role: '⭐ Quarter-Final', grad: 'linear-gradient(135deg,#0d0d2b,#2d1b5c)' },
  { name: 'BC Place',          city: 'Vancouver',   flag: '🇨🇦', cap: '54,500', role: '🍁 Group Stage',   grad: 'linear-gradient(135deg,#0d1f0d,#1a4a1a)' },
  { name: 'Hard Rock Stadium', city: 'Miami, FL',   flag: '🇺🇸', cap: '65,326', role: '🌊 Group Stage',   grad: 'linear-gradient(135deg,#0d1a1a,#0d3b3b)' },
  { name: 'Arrowhead Stadium', city: 'Kansas City', flag: '🇺🇸', cap: '76,416', role: '⭐ Round of 32',   grad: 'linear-gradient(135deg,#1a0d00,#5c2900)' },
  { name: 'Levi\'s Stadium',   city: 'Santa Clara', flag: '🇺🇸', cap: '68,500', role: '⭐ Round of 32',   grad: 'linear-gradient(135deg,#0d1a0d,#1a3d1a)' },
];

/* ── Sub-components ────────────────────────────────────────────────────────── */
function StatBlock({ num, label }) {
  return (
    <div style={s.statBlock}>
      <span style={s.statNum}>{num}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

function LiveMatchTeaser({ match }) {
  return (
    <div style={s.matchTeaser}>
      <span style={s.teaserLive}><span className="live-dot" style={{ marginRight: 5 }} />LIVE</span>
      <span style={s.teaserTeams}>{match.team1Full || match.team1} vs {match.team2Full || match.team2}</span>
      <span style={s.teaserScore}>{match.score1 || '0'} – {match.score2 || '0'}</span>
      {match.gameClock && <span style={s.teaserClock}>{match.gameClock}</span>}
    </div>
  );
}

function UpcomingMatchTeaser({ match }) {
  return (
    <div style={{ ...s.matchTeaser, background: 'rgba(34,197,94,.07)', borderColor: 'rgba(34,197,94,.2)' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#86efac', letterSpacing: '.06em' }}>🕐 NEXT MATCH</span>
      <span style={s.teaserTeams}>{match.team1Full || match.team1} vs {match.team2Full || match.team2}</span>
      <span style={{ fontSize: 11, color: '#86efac', fontWeight: 600, flexShrink: 0 }}>
        {match.gameClock || match.formattedDate || 'Today'}
      </span>
    </div>
  );
}

function PlayerCard({ player }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const imgUrl  = `https://a.espncdn.com/i/headshots/soccer/players/full/${player.id}.png`;
  const espnUrl = `https://www.espn.com/soccer/player/_/id/${player.id}`;
  return (
    <div
      style={{
        ...s.playerCard,
        borderColor: hovered ? player.accent : player.accent + '55',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'transform .15s, border-color .15s, box-shadow .15s',
        boxShadow: hovered ? `0 6px 20px ${player.accent}44` : 'none',
        cursor: 'pointer',
      }}
      onClick={() => window.open(espnUrl, '_blank', 'noopener')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`View ${player.name} on ESPN`}
    >
      <div style={{ ...s.playerImgWrap, background: `linear-gradient(160deg, ${player.accent}33, #0a1628)` }}>
        {!imgFailed ? (
          <img src={imgUrl} alt={player.name} style={s.playerImg} onError={() => setImgFailed(true)} />
        ) : (
          <span style={s.playerFlagFallback}>{player.flag}</span>
        )}
      </div>
      <div style={s.playerInfo}>
        <div style={s.playerName}>{player.name}</div>
        <div style={s.playerCountry}>{player.flag} {player.country}</div>
        <div style={s.playerRole}>{player.role}</div>
      </div>
    </div>
  );
}

function VenueCard({ venue }) {
  const [hovered, setHovered] = useState(false);
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(venue.name + ' FIFA World Cup 2026')}`;
  return (
    <div
      style={{
        ...s.venueCard,
        background: venue.grad,
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'transform .15s, box-shadow .15s',
        boxShadow: hovered ? '0 8px 24px rgba(34,197,94,.2)' : 'none',
        cursor: 'pointer',
      }}
      onClick={() => window.open(searchUrl, '_blank', 'noopener')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Search ${venue.name}`}
    >
      <div style={s.venueFlag}>{venue.flag}</div>
      <div style={s.venueRole}>{venue.role}</div>
      <div style={s.venueName}>{venue.name}</div>
      <div style={s.venueCity}>{venue.city}</div>
      <div style={s.venueCap}>👥 {venue.cap}</div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function FIFAWorldCupHero({ liveMatch, onViewScores }) {
  return (
    <div style={s.wrap} className="fade-in wc-hero-shimmer">
      <div style={s.trophyBg} aria-hidden="true">🏆</div>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.topRow}>
            <span className="live-dot" />
            <span style={s.liveBadge}>LIVE · DAY {dayNumber}</span>
            <span style={s.editionBadge}>🌍 FIFA WORLD CUP 2026</span>
          </div>
          <h2 className="wc-hero-title" style={s.title}>
            The Greatest Show<br />On Earth Is Live
          </h2>
          <p style={s.subtitle}>🇺🇸 USA &nbsp;·&nbsp; 🇨🇦 Canada &nbsp;·&nbsp; 🇲🇽 Mexico &nbsp;·&nbsp; Jun 11 – Jul 19</p>
        </div>
        <div className="wc-hero-stats" style={s.statsGrid}>
          <StatBlock num="48"              label="Teams"   />
          <StatBlock num="104"             label="Matches" />
          <StatBlock num="3"               label="Nations" />
          <StatBlock num={`Day ${dayNumber}`} label="Today" />
        </div>
      </div>

      {/* ── Live / upcoming teaser ── */}
      {liveMatch && liveMatch.isLive  && <LiveMatchTeaser     match={liveMatch} />}
      {liveMatch && !liveMatch.isLive && <UpcomingMatchTeaser match={liveMatch} />}

      {/* ── Star players ── */}
      <div style={s.sectionLabel}>⭐ Tournament Stars</div>
      <div style={s.playerStrip}>
        {STAR_PLAYERS.map(p => <PlayerCard key={p.id} player={p} />)}
      </div>

      {/* ── Nation flags ── */}
      <div style={s.sectionLabel}>⚽ {NATIONS.length} Competing Nations</div>
      <div style={s.flagStrip}>
        {NATIONS.map(n => (
          <div key={n.name} style={s.flagCard} className="wc-flag-card">
            <span style={s.flagEmoji}>{n.flag}</span>
            <span style={s.flagName}>{n.name}</span>
          </div>
        ))}
      </div>

      {/* ── Host venues ── */}
      <div style={s.sectionLabel}>🏟️ Host Stadiums</div>
      <div style={s.venueStrip}>
        {VENUES.map(v => <VenueCard key={v.name} venue={v} />)}
      </div>

      {/* ── CTA ── */}
      <div style={s.ctaRow}>
        <button style={s.ctaBtn} onClick={onViewScores}>
          ⚽ View Live World Cup Scores
        </button>
        <span style={s.ctaHint}>Switches to Soccer · Shows live match cards</span>
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────────── */
const s = {
  wrap: {
    background: 'linear-gradient(160deg, #050d1a 0%, #0a1f5c 38%, #0d3d1a 100%)',
    border: '1px solid rgba(34,197,94,.25)',
    borderRadius: 20, padding: '22px 20px 18px',
    marginBottom: 20, overflow: 'hidden', position: 'relative',
  },
  trophyBg: {
    position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
    fontSize: 140, opacity: 0.07, lineHeight: 1,
    pointerEvents: 'none', userSelect: 'none', zIndex: 0, filter: 'blur(2px)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 14, gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1,
  },
  headerLeft:  { display: 'flex', flexDirection: 'column', gap: 5 },
  topRow:      { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' },
  liveBadge:   { fontSize: 11, fontWeight: 800, color: '#4ade80', letterSpacing: '.06em', textTransform: 'uppercase' },
  editionBadge: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, rgba(14,40,100,.8), rgba(13,61,26,.8))',
    border: '1px solid rgba(34,197,94,.4)',
    color: '#bbf7d0', fontSize: 10, fontWeight: 800,
    padding: '3px 10px', borderRadius: 999, letterSpacing: '.07em',
  },
  title: { fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.18, letterSpacing: '-.5px', margin: 0, marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#86efac', fontWeight: 500, lineHeight: 1.4, margin: 0 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px 16px', flexShrink: 0, alignSelf: 'flex-start', position: 'relative', zIndex: 1,
  },
  statBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum:   { fontSize: 20, fontWeight: 900, color: '#4ade80', lineHeight: 1, letterSpacing: '-.3px' },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' },
  matchTeaser: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.3)',
    borderRadius: 12, padding: '8px 14px', marginBottom: 12, flexWrap: 'wrap',
    position: 'relative', zIndex: 1,
  },
  teaserLive:   { display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 800, color: '#4ade80', letterSpacing: '.07em', flexShrink: 0 },
  teaserTeams:  { fontSize: 13, fontWeight: 800, color: '#fff', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  teaserScore:  { fontSize: 16, fontWeight: 900, color: '#4ade80', letterSpacing: '.5px', flexShrink: 0 },
  teaserClock:  { fontSize: 11, color: '#94a3b8', fontWeight: 600, flexShrink: 0 },

  sectionLabel: {
    fontSize: 10, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '.08em',
    marginBottom: 10, position: 'relative', zIndex: 1,
  },

  /* ── Players ── */
  playerStrip: {
    display: 'flex', gap: 10, overflowX: 'auto',
    paddingBottom: 4, scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
    marginBottom: 18, position: 'relative', zIndex: 1,
  },
  playerCard: {
    flexShrink: 0, width: 88,
    background: 'rgba(10,22,60,.7)',
    border: '1px solid',
    borderRadius: 14, overflow: 'hidden',
    cursor: 'default',
  },
  playerImgWrap: {
    width: '100%', height: 72,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  playerImg:        { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  playerFlagFallback: { fontSize: 36, lineHeight: 1 },
  playerInfo:       { padding: '6px 7px 8px' },
  playerName:       { fontSize: 10, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  playerCountry:    { fontSize: 9, color: '#94a3b8', marginBottom: 2 },
  playerRole:       { fontSize: 9, color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' },

  /* ── Flags ── */
  flagStrip: {
    display: 'flex', gap: 8, overflowX: 'auto',
    paddingBottom: 4, scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
    marginBottom: 18, position: 'relative', zIndex: 1,
  },
  flagCard:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, width: 54, cursor: 'default' },
  flagEmoji: { fontSize: 26, lineHeight: 1, display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.4))' },
  flagName:  { fontSize: 9, color: '#94a3b8', textAlign: 'center', lineHeight: 1.3, maxWidth: 54, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  /* ── Venues ── */
  venueStrip: {
    display: 'flex', gap: 10, overflowX: 'auto',
    paddingBottom: 4, scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
    marginBottom: 18, position: 'relative', zIndex: 1,
  },
  venueCard: {
    flexShrink: 0, width: 140,
    border: '1px solid rgba(34,197,94,.2)',
    borderRadius: 14, padding: '12px 12px 10px',
    cursor: 'default',
  },
  venueFlag: { fontSize: 22, marginBottom: 4, lineHeight: 1 },
  venueRole: { fontSize: 9, color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 },
  venueName: { fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 3 },
  venueCity: { fontSize: 10, color: '#94a3b8', marginBottom: 4 },
  venueCap:  { fontSize: 10, color: '#64748b', fontWeight: 600 },

  /* ── CTA ── */
  ctaRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  ctaBtn: {
    background: 'linear-gradient(90deg, #16a34a, #15803d)',
    border: '1px solid rgba(34,197,94,.5)',
    borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 800,
    padding: '11px 22px', cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '.03em', boxShadow: '0 4px 16px rgba(34,197,94,.25)',
    transition: 'transform .15s, box-shadow .15s', flexShrink: 0,
  },
  ctaHint: { fontSize: 11, color: '#64748b', fontStyle: 'italic', fontWeight: 500 },
};
