import React, { useState, useEffect } from 'react';
import { SPACING } from '../../../shared/theme.js';
import { fetchESPNHeadlines } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import NewsCard from '../components/NewsCard';

// Sports that have ESPN news endpoints
const NEWS_SPORTS = ['cricket', 'soccer', 'nfl', 'basketball', 'baseball', 'tennis', 'f1'];

function normalizeArticles(espnData, sport) {
  return (espnData?.articles || []).map((a, i) => ({
    id:          a.dataSourceIdentifier || a.id || `${sport}-${i}`,
    title:       a.headline || a.title || '',
    summary:     a.description || a.abstract || '',
    sport,
    author:      a.byline || 'ESPN',
    publishedAt: a.published || new Date().toISOString(),
    readingTime: Math.max(1, Math.ceil(((a.description || '').split(' ').length) / 200)),
    url:         a.links?.web?.href || '',
  })).filter(a => a.title);
}

export default function NewsPage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [articles, setArticles]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    async function load() {
      try {
        const sports  = selectedSport === 'all' ? NEWS_SPORTS : [selectedSport];
        const limit   = selectedSport === 'all' ? 6 : 25;
        const results = await Promise.allSettled(sports.map(s => fetchESPNHeadlines(s, limit)));
        if (cancelled) return;

        const all = results.flatMap((r, i) =>
          r.status === 'fulfilled' ? normalizeArticles(r.value, sports[i]) : []
        );
        all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        setArticles(all);
      } catch {
        if (!cancelled) setError('Failed to load news.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
  }, [selectedSport]);

  return (
    <div>
      <SectionHeading title="News" />
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
      <div style={{ height: SPACING.lg }} />

      {loading ? (
        <p style={styles.empty}>Loading news…</p>
      ) : error ? (
        <p style={{ ...styles.empty, color: '#f87171' }}>{error}</p>
      ) : articles.length === 0 ? (
        <p style={styles.empty}>No news for this sport.</p>
      ) : (
        <div style={styles.list}>
          {articles.map(a => (
            <NewsCard
              key={a.id}
              article={a}
              onClick={() => a.url && window.open(a.url, '_blank', 'noopener,noreferrer')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  list:  { display: 'flex', flexDirection: 'column', gap: 16 },
  empty: { color: '#A0AEC0', fontStyle: 'italic', padding: '24px 0' },
};
