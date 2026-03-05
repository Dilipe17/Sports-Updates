import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../../shared/theme.js';
import { MOCK_LIVE_GAMES, MOCK_NEWS } from '../../../shared/api.js';
import SportCategoryBar from '../components/SportCategoryBar';
import SectionHeading   from '../components/SectionHeading';
import ScoreCard        from '../components/ScoreCard';
import NewsCard         from '../components/NewsCard';

/**
 * HomeScreen (mobile) – mirrors the web HomePage in features and layout.
 */
export default function HomeScreen() {
  const [selectedSport, setSelectedSport] = useState('all');
  const navigation = useNavigation();

  const filteredGames = selectedSport === 'all'
    ? MOCK_LIVE_GAMES
    : MOCK_LIVE_GAMES.filter((g) => g.sport === selectedSport);

  const filteredNews = selectedSport === 'all'
    ? MOCK_NEWS
    : MOCK_NEWS.filter((n) => n.sport === selectedSport);

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Sport filter */}
            <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />

            <View style={styles.section}>
              <SectionHeading
                title="Live Scores"
                onSeeAll={() => navigation.navigate('Scores')}
              />
              {filteredGames.length === 0 ? (
                <Text style={styles.empty}>No live games right now.</Text>
              ) : (
                filteredGames.map((game) => <ScoreCard key={game.id} game={game} />)
              )}
            </View>

            <View style={styles.section}>
              <SectionHeading
                title="Latest News"
                onSeeAll={() => navigation.navigate('News')}
              />
              {filteredNews.length === 0 ? (
                <Text style={styles.empty}>No news for this sport.</Text>
              ) : (
                filteredNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))
              )}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SPACING.md,
  },
  section: {
    marginTop: SPACING.xl,
  },
  empty: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
});
