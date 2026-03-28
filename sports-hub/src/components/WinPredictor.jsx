import React, { useState, useEffect } from 'react';

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

function calcPrediction(t1, t2) {
  const total = t1.winRate + t2.winRate;
  let p1 = t1.winRate / total;
  // Add small random factor ±8% for fun
  const rand = (Math.random() - 0.5) * 0.16;
  p1 = Math.max(0.2, Math.min(0.8, p1 + rand));
  return { p1: Math.round(p1 * 100), p2: 100 - Math.round(p1 * 100) };
}

export default function WinPredictor({ initialTeam }) {
  const [team1,     setTeam1]     = useState(null);
  const [team2,     setTeam2]     = useState(null);
  const [result,    setResult]    = useState(null);
  const [animating, setAnimating] = useState(false);
  const [step,      setStep]      = useState('pick'); // 'pick' | 'result'

  // Allow banner team click to pre-select team1
  useEffect(() => {
    if (initialTeam?.abbr) {
      const found = IPL_TEAMS.find(t => t.abbr === initialTeam.abbr);
      if (found) {
        setTeam1(found);
        setTeam2(null);
        setResult(null);
        setStep('pick');
      }
    }
  }, [initialTeam?.abbr]);

  const handlePredict = () => {
    if (!team1 || !team2) return;
    setAnimating(true);
    setResult(null);
    setStep('result');
    setTimeout(() => {
      setResult(calcPrediction(team1, team2));
      setAnimating(false);
    }, 1400);
  };

  const reset = () => {
    setTeam1(null);
    setTeam2(null);
    setResult(null);
    setAnimating(false);
    setStep('pick');
  };

  return (
    <div style={s.wrap} className="fade-in">
      <div style={s.header}>
        <span style={s.badge}>🎯 Win Predictor</span>
        <div style={s.title}>Who will win?</div>
        <div style={s.subtitle}>Pick two IPL teams · get an instant prediction</div>
      </div>

      {step === 'pick' && (
        <>
          <div style={s.pickRow}>
            <TeamPicker
              label="Team 1" selected={team1}
              onSelect={setTeam1} exclude={team2}
              accent="#fb923c"
            />
            <div style={s.vsLabel}>VS</div>
            <TeamPicker
              label="Team 2" selected={team2}
              onSelect={setTeam2} exclude={team1}
              accent="#60a5fa"
            />
          </div>

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
          onReset={reset}
        />
      )}

      <div style={s.disclaimer}>* For entertainment only — based on historical IPL win rates</div>
    </div>
  );
}

/* ── Team picker sub-component ─────────────────────────────────────────────── */
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
          {IPL_TEAMS
            .filter(t => t.abbr !== exclude?.abbr)
            .map(t => (
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
            ))
          }
        </div>
      )}
    </div>
  );
}

/* ── Prediction result ─────────────────────────────────────────────────────── */
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

          {/* Probability bar */}
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

          <button style={s.resetBtn} onClick={onReset}>Try Another Match</button>
        </>
      ) : null}
    </div>
  );
}

function ResultTeam({ team, pct, isWinner }) {
  return (
    <div style={{ ...s.resultTeam, ...(isWinner ? s.resultTeamWinner : {}) }}>
      {isWinner && (
        <div style={{ ...s.winBadge, background: team.color }}>WINNER</div>
      )}
      <img
        src={`https://a.espncdn.com/i/teamlogos/cricket/500/${team.espnId}.png`}
        alt={team.abbr} style={s.resultLogo}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{team.abbr}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: team.color }}>{pct}%</div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const s = {
  wrap: {
    background: 'linear-gradient(135deg, rgba(20,5,45,.97) 0%, rgba(30,10,55,.93) 100%)',
    border: '1px solid rgba(124,58,237,.35)',
    borderRadius: 20,
    padding: '18px 16px 14px',
    marginBottom: 20,
  },
  header: { textAlign: 'center', marginBottom: 16 },
  badge: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, #7c3aed, #db2777)',
    color: '#fff', fontSize: 11, fontWeight: 800,
    padding: '3px 12px', borderRadius: 999,
    letterSpacing: '.07em', marginBottom: 6,
  },
  title:    { fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 3 },

  /* Pick step */
  pickRow: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 },
  vsLabel: { fontSize: 15, fontWeight: 900, color: '#fb923c', alignSelf: 'center', paddingTop: 22, flexShrink: 0 },

  picker:      { flex: 1, minWidth: 0 },
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

  predictBtn: {
    display: 'block', width: '100%',
    background: 'linear-gradient(90deg, #7c3aed, #db2777)',
    color: '#fff', border: 'none', borderRadius: 12,
    padding: '12px', fontSize: 14, fontWeight: 800,
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.03em',
    transition: 'opacity .15s',
  },
  predictBtnOff: { opacity: 0.38, cursor: 'not-allowed' },

  /* Result step */
  resultWrap:   { textAlign: 'center' },
  analyzing:    { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' },

  resultTeams:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  vsResult:     { fontSize: 13, fontWeight: 900, color: '#475569' },

  resultTeam: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    position: 'relative', transition: 'transform .3s',
  },
  resultTeamWinner: { transform: 'scale(1.08)' },
  winBadge: {
    position: 'absolute', top: -18, fontSize: 9, fontWeight: 800,
    color: '#fff', padding: '2px 7px', borderRadius: 6, letterSpacing: '.06em',
  },
  resultLogo: { width: 48, height: 48, objectFit: 'contain' },

  barTrack: { display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: 4, background: 'rgba(30,64,175,.3)' },
  barLeft:  { height: '100%', transition: 'width 1.1s cubic-bezier(.4,0,.2,1)', borderRadius: '999px 0 0 999px' },
  barRight: { height: '100%', transition: 'width 1.1s cubic-bezier(.4,0,.2,1)', borderRadius: '0 999px 999px 0' },
  barLabels:{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 14 },

  winnerBanner: { fontSize: 14, color: '#e2e8f0', marginBottom: 14, fontWeight: 600 },
  resetBtn: {
    background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.5)',
    color: '#a78bfa', borderRadius: 10, padding: '8px 18px',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },

  disclaimer: { fontSize: 9, color: '#374151', textAlign: 'center', marginTop: 12 },
};
