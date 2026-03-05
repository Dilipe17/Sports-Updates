import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPACING } from '../../../shared/theme.js';
import { fetchESPNScoreboard, normalizeESPNGames, fetchESPNNews, MOCK_LIVE_GAMES, MOCK_NEWS } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import ScoreCard from '../components/ScoreCard';
import NewsCard from '../components/NewsCard';

const ALL_SPORTS = ['cricket', 'football', 'basketball', 'baseball', 'soccer', 'hockey'];

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [games, setGames] = useState(MOCK_LIVE_GAMES);
  const [news, setNews] = useState(MOCK_NEWS);
  const navigate = useNavigate();

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

    async function loadNews() {
      const sport = selectedSport === 'all' ? 'basketball' : selectedSport;
      try {
        const data = await fetchESPNNews(sport, 10);
        if (cancelled) return;
        const articles = (data?.articles ?? []).map((a, i) => ({
          id: a.dataSourceIdentifier ?? `n${i}`,
          title: a.headline ?? a.title ?? '',
          summary: a.description ?? a.summary ?? '',
          sport: selectedSport === 'all' ? sport : selectedSport,
          author: a.byline ?? 'ESPN',
          publishedAt: a.published ?? new Date().toISOString(),
          imageUrl: a.images?.[0]?.url ?? null,
          readingTime: Math.ceil((a.description?.length ?? 200) / 800),
        }));
        if (articles.length > 0) setNews(articles);
      } catch {
        // keep existing news on failure
      }
    }

    loadScores();
    loadNews();
    const interval = setInterval(loadScores, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedSport]);

  const filteredGames = selectedSport === 'all'
    ? games
    : games.filter((g) => g.sport === selectedSport);

  const filteredNews = selectedSport === 'all'
    ? news
    : news.filter((n) => n.sport === selectedSport);

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
