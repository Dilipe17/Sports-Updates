import React from 'react';

/* ── F1 race card ─────────────────────────────────────────────────────────── */
function F1Card({ match, delay }) {
  const badgeColor = match.isLive ? '#16a34a' : match.isComplete ? '#4b5563' : '#2563eb';
  return (
    <div className="fade-in" style={{ ...s.card, animationDelay: `${delay}ms`, borderColor: match.isLive ? 'rgba(34,197,94,.4)' : 'rgba(30,64,175,.35)' }}>
      <div style={s.f1Row}>
        <div style={s.f1Left}>
          <div style={s.f1Circuit}>{match.team1}</div>
          <div style={s.f1Location}>{match.team2Full}</div>
        </div>
        <div style={s.f1Mid}>
          <span style={{ ...s.badge, background: badgeColor }}>
            {match.isLive && <span className="live-dot" style={{ marginRight: 4 }} />}
            {match.status.toUpperCase()}
          </span>
          <div style={s.f1Date}>{match.score1}</div>
          <div style={s.f1Time}>{match.score2}</div>
        </div>
        {match.logo2 && (
          <img src={match.logo2} alt={match.team2} style={s.flag}
            onError={e => { e.target.style.display = 'none'; }} />
        )}
      </div>
    </div>
  );
}

/* ── Regular match card ───────────────────────────────────────────────────── */
export default function MatchCard({ match, delay = 0 }) {
  if (match.isF1) return <F1Card match={match} delay={delay} />;

  const badgeColor  = match.isLive ? '#16a34a' : match.isComplete ? '#4b5563' : '#2563eb';
  const borderColor = match.isLive ? 'rgba(34,197,94,.35)' : 'rgba(30,64,175,.35)';

  return (
    <div className="fade-in" style={{ ...s.card, borderColor, animationDelay: `${delay}ms` }}>
      {/* Header row */}
      <div style={s.headerRow}>
        <div style={s.headerLeft}>
          {match.isInternational && <span style={s.intlBadge}>INTL</span>}
          {match.leagueGroup === 'ipl' && <span style={s.iplBadge}>IPL</span>}
          {match.league && (
            <span style={s.leagueText}>
              {match.league}{match.matchDesc ? ` • ${match.matchDesc}` : ''}
            </span>
          )}
        </div>
        {match.formattedDate && (
          <span style={s.dateText}>📅 {match.formattedDate}</span>
        )}
      </div>

      {/* Teams + score */}
      <div style={s.body}>
        {/* Team 1 */}
        <div style={s.team}>
          <TeamLogo logo={match.logo1} name={match.team1} />
          <div style={s.teamName} title={match.team1Full || match.team1}>{match.team1}</div>
        </div>

        {/* Centre */}
        <div style={s.centre}>
          <span style={{ ...s.badge, background: badgeColor }}>
            {match.isLive && <span className="live-dot" style={{ marginRight: 4 }} />}
            <span>{match.status.toUpperCase()}</span>
          </span>
          <div style={s.score}>
            <span style={s.scoreVal}>{match.score1 || '-'}</span>
            <span style={s.vs}>vs</span>
            <span style={s.scoreVal}>{match.score2 || '-'}</span>
          </div>
          {match.gameClock && (
            <div style={s.clock}>
              🕐 <span>{match.gameClock}</span>
            </div>
          )}
          {match.summary && <div style={s.summary}>{match.summary}</div>}
          {match.potm    && <div style={s.potm}>⭐ POTM: {match.potm}</div>}
          {match.venue   && <div style={s.venue}>{match.venue}</div>}
        </div>

        {/* Team 2 */}
        <div style={s.team}>
          <TeamLogo logo={match.logo2} name={match.team2} />
          <div style={s.teamName} title={match.team2Full || match.team2}>{match.team2}</div>
        </div>
      </div>
    </div>
  );
}

function TeamLogo({ logo, name }) {
  const [failed, setFailed] = React.useState(false);
  if (logo && !failed) {
    return (
      <img src={logo} alt={name} style={s.logo}
        onError={() => setFailed(true)} />
    );
  }
  return (
    <div style={s.logoFallback}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

/* ── Section header (IPL / International / Domestic) ─────────────────────── */
export function SectionHeader({ icon, title, count }) {
  return (
    <div style={sh.row}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={sh.title}>{title}</span>
      <span style={sh.count}>{count}</span>
      <div style={sh.line} />
    </div>
  );
}

/* ── Skeleton loader ──────────────────────────────────────────────────────── */
export function MatchCardSkeleton() {
  return (
    <div style={s.card}>
      <div style={s.body}>
        <div style={sk.team}>
          <div className="skeleton" style={sk.logo} />
          <div className="skeleton" style={sk.name} />
        </div>
        <div style={sk.centre}>
          <div className="skeleton" style={sk.badge} />
          <div className="skeleton" style={sk.score} />
        </div>
        <div style={sk.team}>
          <div className="skeleton" style={sk.logo} />
          <div className="skeleton" style={sk.name} />
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  card: {
    background: 'rgba(30,58,138,0.38)',
    border: '1px solid rgba(30,64,175,.35)',
    borderRadius: 18,
    padding: '14px 18px',
    marginBottom: 10,
    transition: 'background .2s',
  },
  headerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 6, marginBottom: 10,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 },
  intlBadge: {
    background: 'rgba(234,179,8,.18)', color: '#fbbf24',
    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
  },
  iplBadge: {
    background: 'rgba(168,85,247,.18)', color: '#c084fc',
    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
  },
  leagueText: {
    fontSize: 10, fontWeight: 700, color: '#60a5fa',
    textTransform: 'uppercase', letterSpacing: '.05em',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260,
  },
  dateText: { fontSize: 10, color: '#93c5fd', flexShrink: 0 },

  body: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
  },
  team: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: 72, flexShrink: 0,
  },
  logo: { width: 44, height: 44, objectFit: 'contain', marginBottom: 6, borderRadius: '50%' },
  logoFallback: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(30,64,175,.7)', border: '2px solid #2563eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6,
  },
  teamName: {
    fontSize: 11, fontWeight: 700, color: '#fff',
    textAlign: 'center', maxWidth: 70,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },

  centre: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6, minWidth: 0,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 6,
    fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '.04em',
  },
  score: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', gap: 6,
    fontSize: 19, fontWeight: 900, color: '#fff', textAlign: 'center',
  },
  scoreVal: {
    textAlign: 'center', wordBreak: 'break-word',
    maxWidth: 110, lineHeight: 1.25,
  },
  vs:      { fontSize: 12, color: '#2563eb', fontWeight: 700, flexShrink: 0 },
  clock:   { fontSize: 11, color: '#67e8f9', fontWeight: 600, display: 'flex', gap: 4 },
  summary: { fontSize: 11, color: '#34d399', fontWeight: 600, textAlign: 'center' },
  potm:    { fontSize: 10, color: '#fbbf24', textAlign: 'center' },
  venue:   { fontSize: 10, color: '#60a5fa', textAlign: 'center', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  // F1
  f1Row:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  f1Left:     { flex: 1 },
  f1Circuit:  { fontSize: 20, fontWeight: 900, color: '#fff' },
  f1Location: { fontSize: 12, color: '#93c5fd', marginTop: 2 },
  f1Mid:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  f1Date:     { fontSize: 15, fontWeight: 700, color: '#fff' },
  f1Time:     { fontSize: 12, color: '#93c5fd' },
  flag:       { width: 48, height: 36, borderRadius: 4, objectFit: 'cover' },
};

const sh = {
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 10, marginTop: 22,
  },
  title: { fontSize: 11, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '.07em' },
  count: {
    background: 'rgba(30,58,138,.7)', color: '#93c5fd',
    fontSize: 10, padding: '1px 7px', borderRadius: 99,
  },
  line: { flex: 1, height: 1, background: 'rgba(30,64,175,.4)' },
};

const sk = {
  team:   { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 88, gap: 8 },
  logo:   { width: 52, height: 52, borderRadius: '50%' },
  name:   { width: 60, height: 12 },
  centre: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  badge:  { width: 80, height: 22 },
  score:  { width: 120, height: 32 },
};
