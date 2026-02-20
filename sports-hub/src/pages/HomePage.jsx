import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPACING } from '../../../shared/theme.js';
import { MOCK_LIVE_GAMES, MOCK_NEWS } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import ScoreCard from '../components/ScoreCard';
import NewsCard from '../components/NewsCard';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const navigate = useNavigate();

  const filteredGames = selectedSport === 'all'
    ? MOCK_LIVE_GAMES
    : MOCK_LIVE_GAMES.filter((g) => g.sport === selectedSport);

  const filteredNews = selectedSport === 'all'
    ? MOCK_NEWS
    : MOCK_NEWS.filter((n) => n.sport === selectedSport);

  return (
    <div style={styles.page}>
      {/* Sport filter */}
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />

      <div style={{ height: SPACING.xl }} />

      {/* Live scores */}
      <section>
        <SectionHeading title="Live Scores" onSeeAll={() => navigate('/scores')} />
        {filteredGames.length === 0 ? (
          <p style={styles.empty}>No live games right now.</p>
        ) : (
          <div style={styles.grid}>
            {filteredGames.map((game) => (
              <ScoreCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      <div style={{ height: SPACING.xl }} />

      {/* Latest news */}
      <section>
        <SectionHeading title="Latest News" onSeeAll={() => navigate('/news')} />
        {filteredNews.length === 0 ? (
          <p style={styles.empty}>No news for this sport right now.</p>
        ) : (
          <div style={styles.newsList}>
            {filteredNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 16,
  },
  newsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  empty: {
    color: '#A0AEC0',
    fontStyle: 'italic',
    padding: '24px 0',
  },
};
