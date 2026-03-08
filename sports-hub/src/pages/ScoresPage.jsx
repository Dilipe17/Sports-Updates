import React, { useState, useEffect } from 'react';
import { SPACING } from '../../../shared/theme.js';
import { fetchSportMatches, SPORT_CONFIG } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import MatchCard from '../components/MatchCard';
import BackButton from '../components/BackButton';

const ALL_SPORTS = Object.keys(SPORT_CONFIG); // cricket, soccer, tennis, nfl, f1, baseball, basketball

export default function ScoresPage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const sports = selectedSport === 'all' ? ALL_SPORTS : [selectedSport];
      const results = await Promise.allSettled(sports.map(s => fetchSportMatches(s)));
      if (cancelled) return;
      const all = results.flatMap((r, i) =>
        r.status === 'fulfilled' ? r.value : []
      );
      setMatches(all);
      setLoading(false);
    }

    setLoading(true);
    load();
    const timer = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [selectedSport]);

  const liveMatches     = matches.filter(m => m.isLive);
  const otherMatches    = matches.filter(m => !m.isLive);

  return (
    <div>
      <BackButton />
      <SectionHeading title="Live Scores" />
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
      <div style={{ height: SPACING.lg }} />

      {loading ? (
        <p style={styles.empty}>Loading scores…</p>
      ) : matches.length === 0 ? (
        <p style={styles.empty}>No games found.</p>
      ) : (
        <>
          {liveMatches.length > 0 && (
            <>
              <div style={styles.sectionLabel}>🔴 LIVE NOW</div>
              <div style={styles.grid}>
                {liveMatches.map((m, i) => <MatchCard key={m.id || i} match={m} delay={i * 40} />)}
              </div>
              <div style={{ height: SPACING.lg }} />
            </>
          )}
          <div style={styles.grid}>
            {otherMatches.map((m, i) => <MatchCard key={m.id || i} match={m} delay={i * 40} />)}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4ade80',
    letterSpacing: '.08em',
    marginBottom: 10,
  },
  empty: {
    color: '#A0AEC0',
    fontStyle: 'italic',
    padding: '24px 0',
  },
};
