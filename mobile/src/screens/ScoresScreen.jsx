import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../shared/theme.js';
import { MOCK_LIVE_GAMES } from '../../../shared/api.js';
import SportCategoryBar from '../components/SportCategoryBar';
import SectionHeading   from '../components/SectionHeading';
import ScoreCard        from '../components/ScoreCard';

export default function ScoresScreen() {
  const [selectedSport, setSelectedSport] = useState('all');

  const filtered = selectedSport === 'all'
    ? MOCK_LIVE_GAMES
    : MOCK_LIVE_GAMES.filter((g) => g.sport === selectedSport);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScoreCard game={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeading title="Scores" />
            <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
            <View style={{ height: SPACING.md }} />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No games found.</Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  list: { padding: SPACING.md },
  header: { marginBottom: SPACING.sm },
  empty: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
});
