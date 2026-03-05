import React, { useState } from 'react';
import { SPACING } from '../../../shared/theme.js';
import { MOCK_LIVE_GAMES } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import ScoreCard from '../components/ScoreCard';

export default function ScoresPage() {
  const [selectedSport, setSelectedSport] = useState('all');

  const filtered = selectedSport === 'all'
    ? MOCK_LIVE_GAMES
    : MOCK_LIVE_GAMES.filter((g) => g.sport === selectedSport);

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
