import React, { useState, useEffect } from 'react';
import { SPACING } from '../../../shared/theme.js';
import { fetchESPNScoreboard, normalizeESPNGames, MOCK_LIVE_GAMES } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import ScoreCard from '../components/ScoreCard';

const ALL_SPORTS = ['cricket', 'football', 'basketball', 'baseball', 'soccer', 'hockey'];

export default function ScoresPage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [games, setGames] = useState(MOCK_LIVE_GAMES);

  useEffect(() => {
    let cancelled = false;

    async function loadScores() {
      const sportsToFetch = selectedSport === 'all' ? ALL_SPORTS : [selectedSport];
      const results = await Promise.allSettled(
        sportsToFetch.map((s) => fetchESPNScoreboard(s).then((d) => normalizeESPNGames(d, s)))
      );
      if (cancelled) return;
      const fetched = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value);
      if (fetched.length > 0) setGames(fetched);
    }

    loadScores();
    const interval = setInterval(loadScores, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedSport]);

  const filtered = selectedSport === 'all'
    ? games
    : games.filter((g) => g.sport === selectedSport);

  return (
    <div>
      <SectionHeading title="Scores" />
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
      <div style={{ height: SPACING.lg }} />

      {filtered.length === 0 ? (
        <p style={styles.empty}>No games found.</p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((game) => (
            <ScoreCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 16,
  },
  empty: {
    color: '#A0AEC0',
    fontStyle: 'italic',
    padding: '24px 0',
  },
};
