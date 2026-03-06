import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW,
} from '../../../shared/theme.js';
import { SPORT_CONFIG, fetchSportMatches } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';

const SPORTS = Object.entries(SPORT_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState('cricket');
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  const loadMatches = useCallback(async (tab) => {
    setLoading(true);
    const data = await fetchSportMatches(tab);
    // Show only upcoming (not yet complete) matches
    setMatches(data.filter(m => !m.isComplete));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches(activeTab);
  }, [activeTab, loadMatches]);

  return (
    <View style={styles.container}>
      {/* Sport tabs */}
      <FlatList
        data={SPORTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s.id}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === item.id && styles.tabActive]}
            onPress={() => setActiveTab(item.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === item.id && styles.tabTextActive]}>
              {item.icon} {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={matches}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {!!item.league && (
                <Text style={styles.league} numberOfLines={1}>{item.league}</Text>
              )}
              {!!item.formattedDate && (
                <Text style={styles.date} numberOfLines={1}>{item.formattedDate}</Text>
              )}
            </View>
            <View style={styles.matchup}>
              <Text style={styles.team} numberOfLines={1}>{item.team1}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.team} numberOfLines={1}>{item.team2}</Text>
            </View>
            {!!item.gameClock && (
              <Text style={styles.clock}>{item.gameClock}</Text>
            )}
            {!!item.venue && (
              <Text style={styles.venue} numberOfLines={1}>{item.venue}</Text>
            )}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SectionHeading title="Upcoming Schedule" />
            {loading && (
              <ActivityIndicator color={COLORS.accent} style={{ marginBottom: SPACING.md }} />
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{SPORT_CONFIG[activeTab]?.icon}</Text>
              <Text style={styles.emptyText}>
                No upcoming {SPORT_CONFIG[activeTab]?.name} matches.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexGrow: 0,
  },
  tabBarContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  tabTextActive: { color: COLORS.text },
  list: { padding: SPACING.md },
  listHeader: { marginBottom: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
    gap: 4,
  },
  league: {
    color: COLORS.accentLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    flex: 1,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    flexShrink: 0,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
    flexWrap: 'wrap',
  },
  team: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    flex: 1,
  },
  vs: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    paddingHorizontal: SPACING.xs,
  },
  clock: {
    color: '#67e8f9',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: 3,
  },
  venue: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  empty: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
  },
});
