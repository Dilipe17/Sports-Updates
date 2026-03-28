import React, { useState, useEffect } from 'react';

/* ── IPL team registry ───────────────────────────────────────────────────── */
const IPL_TEAMS = [
  { abbr: 'MI',   name: 'Mumbai Indians',              color: '#004BA0', espnId: 4343, winRate: 0.58 },
  { abbr: 'CSK',  name: 'Chennai Super Kings',          color: '#FDB913', espnId: 4340, winRate: 0.60 },
  { abbr: 'RCB',  name: 'Royal Challengers Bengaluru',  color: '#EC1C24', espnId: 4344, winRate: 0.45 },
  { abbr: 'KKR',  name: 'Kolkata Knight Riders',        color: '#9B6FA5', espnId: 4341, winRate: 0.52 },
  { abbr: 'DC',   name: 'Delhi Capitals',               color: '#17479E', espnId: 4347, winRate: 0.44 },
  { abbr: 'PBKS', name: 'Punjab Kings',                 color: '#ED1C24', espnId: 4342, winRate: 0.43 },
  { abbr: 'RR',   name: 'Rajasthan Royals',             color: '#2D4DA0', espnId: 4345, winRate: 0.47 },
  { abbr: 'SRH',  name: 'Sunrisers Hyderabad',          color: '#F26522', espnId: 4346, winRate: 0.49 },
  { abbr: 'GT',   name: 'Gujarat Titans',               color: '#1C9AD6', espnId: 6601, winRate: 0.62 },
  { abbr: 'LSG',  name: 'Lucknow Super Giants',         color: '#A72056', espnId: 6602, winRate: 0.50 },
];

/* Key players per team for fantasy polls */
const TEAM_PLAYERS = {
  MI:   ['Rohit Sharma', 'Suryakumar Yadav', 'Hardik Pandya', 'Jasprit Bumrah'],
  CSK:  ['MS Dhoni', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Deepak Chahar'],
  RCB:  ['Virat Kohli', 'Faf du Plessis', 'Glenn Maxwell', 'Mohammed Siraj'],
  KKR:  ['Shreyas Iyer', 'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy'],
  DC:   ['Rishabh Pant', 'David Warner', 'Axar Patel', 'Kuldeep Yadav'],
  PBKS: ['Shikhar Dhawan', 'Liam Livingstone', 'Sam Curran', 'Arshdeep Singh'],
  RR:   ['Sanju Samson', 'Jos Buttler', 'Shimron Hetmyer', 'Yuzvendra Chahal'],
  SRH:  ['Pat Cummins', 'Heinrich Klaasen', 'Travis Head', 'Bhuvneshwar Kumar'],
  GT:   ['Shubman Gill', 'David Miller', 'Rashid Khan', 'Mohammed Shami'],
  LSG:  ['KL Rahul', 'Quinton de Kock', 'Marcus Stoinis', 'Ravi Bishnoi'],
};

/* Score range options with seeded community weights */
const SCORE_RANGES = [
  { label: 'Under 150',  key: 'u150',  seed: 8  },
  { label: '150 – 174',  key: '150',   seed: 22 },
  { label: '175 – 199',  key: '175',   seed: 35 },
  { label: '200 – 219',  key: '200',   seed: 24 },
  { label: '220+',       key: '220p',  seed: 11 },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function matchTeam(nameStr) {
  const n = (nameStr || '').toLowerCase();
  return IPL_TEAMS.find(t => {
    if (n.includes(t.abbr.toLowerCase())) return true;
    const words = t.name.toLowerCase().split(' ');
    return words.filter(w => w.length > 4).some(w => n.includes(w));
  }) || null;
}

function calcPrediction(t1, t2) {
  const total = t1.winRate + t2.winRate;
  let p1 = t1.winRate / total;
  const rand = (Math.random() - 0.5) * 0.16;
  p1 = Math.max(0.2, Math.min(0.8, p1 + rand));
  const r = Math.round(p1 * 100);
  return { p1: r, p2: 100 - r };
}

function loadPolls(matchId) {
  try { return JSON.parse(localStorage.getItem(`ipl_poll_${matchId}`) || '{}'); }
  catch { return {}; }
}
function savePolls(matchId, data) {
  try { localStorage.setItem(`ipl_poll_${matchId}`, JSON.stringify(data)); } catch {}
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function WinPredictor({ iplMatches = [], initialTeam }) {
  const [team1,       setTeam1]       = useState(null);
  const [team2,       setTeam2]       = useState(null);
  const [matchInfo,   setMatchInfo]   = useState(null); // { id, label, date, isLive, status }
  const [autoMode,    setAutoMode]    = useState(false);
  const [result,      setResult]      = useState(null);
  const [animating,   setAnimating]   = useState(false);
  const [step,        setStep]        = useState('pick');

  /* Auto-detect featured match from live IPL data */
  useEffect(() => {
    const featured =
      iplMatches.find(m => m.isLive) ||
      iplMatches.find(m => !m.isComplete && !m.isLive) ||
      null;

    if (featured) {
      const t1 = matchTeam(featured.team1Full || featured.team1);
      const t2 = matchTeam(featured.team2Full || featured.team2);
      if (t1 && t2) {
        setTeam1(t1);
        setTeam2(t2);
        setAutoMode(true);
        setMatchInfo({
          id: featured.id,
          label: `${t1.abbr} vs ${t2.abbr}`,
          fullLabel: `${featured.team1Full || featured.team1} vs ${featured.team2Full || featured.team2}`,
          date: featured.formattedDate || '',
          status: featured.status || '',
          isLive: featured.isLive,
        });
        setStep('pick');
        setResult(null);
        return;
      }
    }

    // Fallback: banner team click
    if (initialTeam?.abbr) {
      const found = IPL_TEAMS.find(t => t.abbr === initialTeam.abbr);
      if (found) { setTeam1(found); setTeam2(null); setAutoMode(false); setStep('pick'); setResult(null); }
    }
  }, [iplMatches.length, initialTeam?.abbr]); // eslint-disable-line

  const handlePredict = () => {
    if (!team1 || !team2) return;
    setAnimating(true);
    setResult(null);
    setStep('result');
    setTimeout(() => {
      setResult(calcPrediction(team1, team2));
      setAnimating(false);
    }, 1300);
  };

  const handleReset = () => {
    setResult(null);
    setAnimating(false);
    setStep('pick');
  };

  const matchId = matchInfo?.id || (team1 && team2 ? `${team1.abbr}-${team2.abbr}` : null);

  return (
    <div style={s.wrap} className="fade-in">
      {/* Header */}
      <div style={s.header}>
        <span style={s.badge}>🎯 Win Predictor</span>
        {matchInfo ? (
          <>
            <div style={s.title}>{matchInfo.fullLabel || matchInfo.label}</div>
            <div style={{ ...s.subtitle, color: matchInfo.isLive ? '#4ade80' : '#94a3b8' }}>
              {matchInfo.isLive ? '🔴 LIVE NOW' : (matchInfo.status || matchInfo.date || 'Upcoming')}
            </div>
          </>
        ) : (
          <>
            <div style={s.title}>Who will win?</div>
            <div style={s.subtitle}>Select two IPL teams for a prediction</div>
          </>
        )}
      </div>

      {/* Teams display — auto mode shows badges, manual shows pickers */}
      {step === 'pick' && (
        <>
          {autoMode && team1 && team2 ? (
            <div style={s.autoRow}>
              <AutoTeamBadge team={team1} />
              <div style={s.vsChip}>VS</div>
              <AutoTeamBadge team={team2} />
            </div>
          ) : (
            <div style={s.pickRow}>
              <TeamPicker label="Team 1" selected={team1} onSelect={setTeam1} exclude={team2} accent="#fb923c" />
              <div style={s.vsLabel}>VS</div>
              <TeamPicker label="Team 2" selected={team2} onSelect={setTeam2} exclude={team1} accent="#60a5fa" />
            </div>
          )}
          <button
            style={{ ...s.predictBtn, ...(!team1 || !team2 ? s.predictBtnOff : {}) }}
            onClick={handlePredict}
            disabled={!team1 || !team2}
          >
            🎯 Predict Winner
          </button>
        </>
      )}

      {step === 'result' && (
        <PredictionResult
          team1={team1} team2={team2}
          result={result} animating={animating}
          onReset={handleReset}
        />
      )}

      {/* Fantasy polls — always shown when teams are known */}
      {team1 && team2 && matchId && !animating && (
        <FantasyPolls matchId={matchId} team1={team1} team2={team2} />
      )}

      <div style={s.disclaimer}>* Win prediction is for entertainment — based on historical IPL win rates</div>
    </div>
  );
}

/* ── Auto mode team badge ────────────────────────────────────────────────── */
function AutoTeamBadge({ team }) {
  return (
    <div style={{ ...s.autoBadge, borderColor: team.color + '88' }}>
      <img
        src={`https://a.espncdn.com/i/teamlogos/cricket/500/${team.espnId}.png`}
        alt={team.abbr} style={s.autoLogo}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{team.abbr}</div>
        <div style={{ fontSize: 9, color: team.color, fontWeight: 600 }}>{team.name.split(' ').slice(-1)[0]}</div>
      </div>
    </div>
  );
}

/* ── Manual team picker ──────────────────────────────────────────────────── */
function TeamPicker({ label, selected, onSelect, exclude, accent }) {
  return (
    <div style={s.picker}>
      <div style={{ ...s.pickerLabel, color: accent }}>{label}</div>
      {selected ? (
        <div
          style={{ ...s.selectedCard, borderColor: selected.color + '88' }}
          onClick={() => onSelect(null)}
          title="Tap to change"
        >
          <img
            src={`https://a.espncdn.com/i/teamlogos/cricket/500/${selected.espnId}.png`}
            alt={selected.abbr} style={s.selLogo}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{selected.abbr}</div>
            <div style={{ fontSize: 9, color: '#94a3b8' }}>tap to change</div>
          </div>
        </div>
      ) : (
        <div style={s.teamGrid}>
          {IPL_TEAMS.filter(t => t.abbr !== exclude?.abbr).map(t => (
            <div
              key={t.abbr}
              style={{ ...s.teamChip, borderColor: t.color + '66', background: t.color + '22' }}
              onClick={() => onSelect(t)}
              title={t.name}
            >
              <img
                src={`https://a.espncdn.com/i/teamlogos/cricket/500/${t.espnId}.png`}
                alt={t.abbr} style={s.chipLogo}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span style={s.chipAbbr}>{t.abbr}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Prediction result ───────────────────────────────────────────────────── */
function PredictionResult({ team1, team2, result, animating, onReset }) {
  const p1 = result?.p1 ?? 50;
  const p2 = result?.p2 ?? 50;
  const winner = !animating && result ? (p1 >= p2 ? team1 : team2) : null;

  return (
    <div style={s.resultWrap} className="fade-in">
      {animating ? (
        <div style={s.analyzing}>
          <div className="live-dot" />
          <span style={{ color: '#fb923c', fontWeight: 700, marginLeft: 8 }}>Crunching the numbers…</span>
        </div>
      ) : result ? (
        <>
          <div style={s.resultTeams}>
            <ResultTeam team={team1} pct={p1} isWinner={p1 >= p2} />
            <div style={s.vsResult}>VS</div>
            <ResultTeam team={team2} pct={p2} isWinner={p2 > p1} />
          </div>
          <div style={s.barTrack}>
            <div style={{ ...s.barLeft,  width: `${p1}%`, background: `linear-gradient(90deg, ${team1.color}cc, ${team1.color})` }} />
            <div style={{ ...s.barRight, width: `${p2}%`, background: `linear-gradient(90deg, ${team2.color}, ${team2.color}cc)` }} />
          </div>
          <div style={s.barLabels}>
            <span style={{ color: team1.color }}>{p1}%</span>
            <span style={{ color: team2.color }}>{p2}%</span>
          </div>
          {winner && (
            <div style={s.winnerBanner}>
              🏆 <strong style={{ color: winner.color }}>{winner.name}</strong> predicted to win!
            </div>
          )}
          <button style={s.resetBtn} onClick={onReset}>Re-predict</button>
        </>
      ) : null}
    </div>
  );
}

function ResultTeam({ team, pct, isWinner }) {
  return (
    <div style={{ ...s.resultTeam, ...(isWinner ? s.resultTeamWinner : {}) }}>
      {isWinner && <div style={{ ...s.winBadge, background: team.color }}>WINNER</div>}
      <img
        src={`https://a.espncdn.com/i/teamlogos/cricket/500/${team.espnId}.png`}
        alt={team.abbr} style={s.resultLogo}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{team.abbr}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: team.color }}>{pct}%</div>
    </div>
  );
}

/* ── Fantasy Polls ───────────────────────────────────────────────────────── */
function FantasyPolls({ matchId, team1, team2 }) {
  const players = [
    ...(TEAM_PLAYERS[team1.abbr] || []).slice(0, 3),
    ...(TEAM_PLAYERS[team2.abbr] || []).slice(0, 3),
  ];
  const motmPlayers = [
    ...(TEAM_PLAYERS[team1.abbr] || []).slice(0, 2),
    ...(TEAM_PLAYERS[team2.abbr] || []).slice(0, 2),
  ];

  /* Seed weights for top scorer (favour batting-heavy players) */
  const scorerSeeds = players.map((_, i) => 20 - i * 2);
  /* Seed weights for MOTM */
  const motmSeeds = motmPlayers.map((_, i) => 28 - i * 4);

  const [votes, setVotes] = useState(() => loadPolls(matchId));

  const vote = (pollKey, optionKey) => {
    if (votes[pollKey]) return; // already voted
    const next = { ...votes, [pollKey]: optionKey };
    setVotes(next);
    savePolls(matchId, next);
  };

  return (
    <div style={s.pollsWrap}>
      <div style={s.pollsTitle}>🏆 Fantasy Predictions</div>
      <div style={s.pollsGrid}>

        {/* Poll 1: Predict Score Range */}
        <PollCard
          title={`Predict ${team1.abbr}'s Total Score`}
          options={SCORE_RANGES.map(r => ({ key: r.key, label: r.label, seed: r.seed }))}
          voted={votes['score']}
          onVote={k => vote('score', k)}
          accent={team1.color}
        />

        {/* Poll 2: Top Run Scorer */}
        <PollCard
          title="Top Run Scorer"
          options={players.map((p, i) => ({
            key: p, label: p,
            seed: scorerSeeds[i] || 5,
            teamColor: i < 3 ? team1.color : team2.color,
          }))}
          voted={votes['scorer']}
          onVote={k => vote('scorer', k)}
          accent="#fbbf24"
        />

        {/* Poll 3: Man of the Match */}
        <PollCard
          title="Man of the Match"
          options={motmPlayers.map((p, i) => ({
            key: p, label: p,
            seed: motmSeeds[i] || 10,
            teamColor: i < 2 ? team1.color : team2.color,
          }))}
          voted={votes['motm']}
          onVote={k => vote('motm', k)}
          accent="#a78bfa"
        />

      </div>
    </div>
  );
}

/* ── Individual poll card ────────────────────────────────────────────────── */
function PollCard({ title, options, voted, onVote, accent }) {
  const totalSeeds = options.reduce((sum, o) => sum + o.seed, 0);
  const totalVotes = totalSeeds + (voted ? 1 : 0);

  return (
    <div style={{ ...s.pollCard, borderColor: accent + '44' }}>
      <div style={{ ...s.pollTitle, color: accent }}>{title}</div>
      <div style={s.pollOptions}>
        {options.map(opt => {
          const base = opt.seed;
          const myVotes = (voted === opt.key ? 1 : 0);
          const pct = Math.round(((base + myVotes) / totalVotes) * 100);
          const isChosen = voted === opt.key;
          return (
            <div key={opt.key} style={s.pollOption} onClick={() => onVote(opt.key)}>
              <div style={{
                ...s.pollBar,
                width: voted ? `${pct}%` : '0%',
                background: opt.teamColor
                  ? `${opt.teamColor}44`
                  : `${accent}33`,
                transition: 'width .6s ease',
              }} />
              <div style={s.pollOptionInner}>
                <span style={{ ...s.pollLabel, ...(isChosen ? { color: '#fff', fontWeight: 700 } : {}) }}>
                  {isChosen && '✓ '}{opt.label}
                </span>
                {voted && (
                  <span style={{ ...s.pollPct, color: isChosen ? accent : '#64748b' }}>{pct}%</span>
                )}
                {!voted && (
                  <span style={s.pollVoteHint}>tap to vote</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!voted && <div style={s.pollFooter}>Join {totalSeeds} fans predicting</div>}
      {voted  && <div style={{ ...s.pollFooter, color: accent }}>✓ Your vote is counted!</div>}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  wrap: {
    background: 'linear-gradient(135deg, rgba(20,5,45,.97) 0%, rgba(30,10,55,.93) 100%)',
    border: '1px solid rgba(124,58,237,.35)',
    borderRadius: 20,
    padding: '18px 16px 14px',
    marginBottom: 20,
  },
  header: { textAlign: 'center', marginBottom: 14 },
  badge: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, #7c3aed, #db2777)',
    color: '#fff', fontSize: 11, fontWeight: 800,
    padding: '3px 12px', borderRadius: 999,
    letterSpacing: '.07em', marginBottom: 6,
  },
  title:    { fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.3 },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 3 },

  /* Auto mode */
  autoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 },
  vsChip:  { fontSize: 14, fontWeight: 900, color: '#fb923c', flexShrink: 0 },
  autoBadge: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,.06)', borderRadius: 14,
    padding: '10px 14px', border: '1.5px solid',
    flex: 1, minWidth: 0,
  },
  autoLogo: { width: 38, height: 38, objectFit: 'contain', flexShrink: 0 },

  /* Manual picker */
  pickRow: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 },
  vsLabel: { fontSize: 14, fontWeight: 900, color: '#fb923c', alignSelf: 'center', paddingTop: 22, flexShrink: 0 },
  picker:  { flex: 1, minWidth: 0 },
  pickerLabel: { fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em' },
  teamGrid: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  teamChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '5px 4px', borderRadius: 8, border: '1px solid', cursor: 'pointer',
    width: 44, transition: 'transform .12s',
  },
  chipLogo: { width: 26, height: 26, objectFit: 'contain' },
  chipAbbr: { fontSize: 8, fontWeight: 800, color: '#fff' },
  selectedCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,.06)', borderRadius: 12,
    padding: '10px 12px', cursor: 'pointer',
    border: '1.5px solid', minHeight: 58,
  },
  selLogo: { width: 38, height: 38, objectFit: 'contain' },

  /* Predict button */
  predictBtn: {
    display: 'block', width: '100%',
    background: 'linear-gradient(90deg, #7c3aed, #db2777)',
    color: '#fff', border: 'none', borderRadius: 12,
    padding: '12px', fontSize: 14, fontWeight: 800,
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.03em',
    transition: 'opacity .15s', marginBottom: 2,
  },
  predictBtnOff: { opacity: 0.38, cursor: 'not-allowed' },

  /* Result */
  resultWrap:        { textAlign: 'center' },
  analyzing:         { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' },
  resultTeams:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 },
  vsResult:          { fontSize: 13, fontWeight: 900, color: '#475569' },
  resultTeam:        { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative', transition: 'transform .3s' },
  resultTeamWinner:  { transform: 'scale(1.08)' },
  winBadge:          { position: 'absolute', top: -18, fontSize: 9, fontWeight: 800, color: '#fff', padding: '2px 7px', borderRadius: 6, letterSpacing: '.06em' },
  resultLogo:        { width: 48, height: 48, objectFit: 'contain' },
  barTrack:          { display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: 4, background: 'rgba(30,64,175,.3)' },
  barLeft:           { height: '100%', transition: 'width 1.1s cubic-bezier(.4,0,.2,1)', borderRadius: '999px 0 0 999px' },
  barRight:          { height: '100%', transition: 'width 1.1s cubic-bezier(.4,0,.2,1)', borderRadius: '0 999px 999px 0' },
  barLabels:         { display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 12 },
  winnerBanner:      { fontSize: 13, color: '#e2e8f0', marginBottom: 12, fontWeight: 600 },
  resetBtn: {
    background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.5)',
    color: '#a78bfa', borderRadius: 10, padding: '7px 16px',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 4,
  },

  /* Fantasy polls */
  pollsWrap:  { marginTop: 16, borderTop: '1px solid rgba(124,58,237,.25)', paddingTop: 14 },
  pollsTitle: { fontSize: 13, fontWeight: 800, color: '#a78bfa', marginBottom: 12, textAlign: 'center', letterSpacing: '.04em' },
  pollsGrid:  { display: 'flex', flexDirection: 'column', gap: 12 },
  pollCard: {
    background: 'rgba(15,10,30,.6)', borderRadius: 14,
    border: '1px solid', padding: '12px 14px',
  },
  pollTitle:   { fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' },
  pollOptions: { display: 'flex', flexDirection: 'column', gap: 7 },
  pollOption:  {
    position: 'relative', borderRadius: 8,
    background: 'rgba(30,30,60,.5)', overflow: 'hidden',
    cursor: 'pointer', border: '1px solid rgba(255,255,255,.06)',
    minHeight: 32, transition: 'border-color .15s',
  },
  pollBar:        { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 8, zIndex: 0 },
  pollOptionInner:{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px' },
  pollLabel:      { fontSize: 12, color: '#cbd5e1', fontWeight: 500 },
  pollPct:        { fontSize: 12, fontWeight: 800 },
  pollVoteHint:   { fontSize: 10, color: '#4b5563', fontStyle: 'italic' },
  pollFooter:     { fontSize: 10, color: '#4b5563', marginTop: 8, textAlign: 'right' },

  disclaimer: { fontSize: 9, color: '#374151', textAlign: 'center', marginTop: 14 },
};
