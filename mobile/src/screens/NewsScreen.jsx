import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../shared/theme.js';
import { MOCK_NEWS } from '../../../shared/api.js';
import SportCategoryBar from '../components/SportCategoryBar';
import SectionHeading   from '../components/SectionHeading';
import NewsCard         from '../components/NewsCard';

export default function NewsScreen() {
  const [selectedSport, setSelectedSport] = useState('all');

  const filtered = selectedSport === 'all'
    ? MOCK_NEWS
    : MOCK_NEWS.filter((n) => n.sport === selectedSport);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NewsCard article={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeading title="News" />
            <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
            <View style={{ height: SPACING.md }} />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No news for this sport.</Text>
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
