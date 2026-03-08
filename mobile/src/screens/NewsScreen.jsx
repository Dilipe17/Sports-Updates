import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, Linking,
} from 'react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW,
} from '../../../shared/theme.js';
import { fetchESPNHeadlines } from '../../../shared/api.js';
import SportCategoryBar from '../components/SportCategoryBar';
import SectionHeading   from '../components/SectionHeading';

// Map sport category ids to ESPN headline sport keys
const NEWS_SPORT_MAP = {
  all:        'nfl',
  cricket:    'cricket',
  soccer:     'soccer',
  tennis:     'tennis',
  nfl:        'nfl',
  f1:         'nfl',
  baseball:   'baseball',
  basketball: 'basketball',
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NewsScreen() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [articles,      setArticles]      = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    const sportKey = NEWS_SPORT_MAP[selectedSport] || 'nfl';
    fetchESPNHeadlines(sportKey, 15)
      .then(d => {
        setArticles(d.articles?.slice(0, 15) || []);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
      });
  }, [selectedSport]);

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item, idx) => item.id || `news-${idx}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => item.links?.web?.href && Linking.openURL(item.links.web.href)}
            activeOpacity={0.8}
          >
            <Text style={styles.category} numberOfLines={1}>
              {item.categories?.[0]?.description || 'Sports'}
            </Text>
            <Text style={styles.headline} numberOfLines={3}>{item.headline}</Text>
            {!!item.description && (
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            )}
            {!!item.published && (
              <Text style={styles.time}>{timeAgo(item.published)}</Text>
            )}
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeading title="News" />
            <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
            <View style={{ height: SPACING.md }} />
            {loading && (
              <ActivityIndicator color={COLORS.accent} style={{ marginBottom: SPACING.md }} />
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.empty}>No news for this sport.</Text>
          )
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  category: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headline: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  empty: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
});
