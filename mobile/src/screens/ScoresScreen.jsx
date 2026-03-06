import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/theme.js';
import { SPORT_CONFIG, fetchSportMatches } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import MatchCard, { MatchCardSkeleton, SectionHeader } from '../components/MatchCard';

const SPORTS = Object.entries(SPORT_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

export default function ScoresScreen() {
  const [activeTab, setActiveTab] = useState('cricket');
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const intervalRef = useRef(null);

  const loadMatches = useCallback(async (tab, force = false) => {
    setLoading(true);
    const data = await fetchSportMatches(tab, force);
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches(activeTab);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => loadMatches(activeTab, true), 60000);
    return () => clearInterval(intervalRef.current);
  }, [activeTab, loadMatches]);

  const renderMatchContent = () => {
    if (loading) {
      return [1, 2, 3].map(i => <MatchCardSkeleton key={i} />);
    }
    if (!matches.length) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{SPORT_CONFIG[activeTab]?.icon}</Text>
          <Text style={styles.emptyText}>
            No {SPORT_CONFIG[activeTab]?.name} scores right now.
          </Text>
        </View>
      );
    }
    if (activeTab === 'cricket') {
      const groups = { ipl: [], international: [], domestic: [] };
      matches.forEach(m => { (groups[m.leagueGroup] || groups.domestic).push(m); });
      return (
        <>
          {groups.ipl.length > 0 && (
            <>
              <SectionHeader icon="🏆" title="IPL T20" count={groups.ipl.length} />
              {groups.ipl.map(m => <MatchCard key={m.id} match={m} />)}
            </>
          )}
          {groups.international.length > 0 && (
            <>
              <SectionHeader icon="🌍" title="International" count={groups.international.length} />
              {groups.international.map(m => <MatchCard key={m.id} match={m} />)}
            </>
          )}
          {groups.domestic.length > 0 && (
            <>
              <SectionHeader icon="🏏" title="Domestic" count={groups.domestic.length} />
              {groups.domestic.map(m => <MatchCard key={m.id} match={m} />)}
            </>
          )}
        </>
      );
    }
    return matches.map(m => <MatchCard key={m.id} match={m} />);
  };

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
        data={[{ key: 'body' }]}
        keyExtractor={i => i.key}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            <SectionHeading title="Scores" />
            {renderMatchContent()}
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
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  content: {
    padding: SPACING.md,
  },
  empty: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
  },
});
