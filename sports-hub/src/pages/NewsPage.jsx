import React, { useState } from 'react';
import { SPACING } from '../../../shared/theme.js';
import { MOCK_NEWS } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import NewsCard from '../components/NewsCard';

export default function NewsPage() {
  const [selectedSport, setSelectedSport] = useState('all');

  const filtered = selectedSport === 'all'
    ? MOCK_NEWS
    : MOCK_NEWS.filter((n) => n.sport === selectedSport);

  return (
    <div>
      <SectionHeading title="News" />
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
      <div style={{ height: SPACING.lg }} />

      {filtered.length === 0 ? (
        <p style={styles.empty}>No news for this sport.</p>
      ) : (
        <div style={styles.list}>
          {filtered.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  list: {
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
