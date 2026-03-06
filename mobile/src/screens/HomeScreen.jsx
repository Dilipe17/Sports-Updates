import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/theme.js';
import { SPORT_CONFIG, fetchSportMatches, fetchESPNHeadlines } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import MatchCard, { MatchCardSkeleton, SectionHeader } from '../components/MatchCard';

const SPORTS = Object.entries(SPORT_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

const HEADLINE_SPORT_MAP = {
  cricket: 'cricket', soccer: 'soccer', tennis: 'tennis',
  nfl: 'nfl', f1: 'nfl', baseball: 'baseball', basketball: 'basketball',
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

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('cricket');
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [news,      setNews]      = useState([]);
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

  useEffect(() => {
    const sportKey = HEADLINE_SPORT_MAP[activeTab] || 'nfl';
    fetchESPNHeadlines(sportKey, 5)
      .then(d => setNews(d.articles?.slice(0, 5) || []))
      .catch(() => setNews([]));
  }, [activeTab]);

  const renderMatchContent = () => {
    if (loading) {
      return [1, 2, 3].map(i => <MatchCardSkeleton key={i} />);
    }
    if (!matches.length) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{SPORT_CONFIG[activeTab]?.icon}</Text>
          <Text style={styles.emptyText}>
            No {SPORT_CONFIG[activeTab]?.name} matches right now.
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
    if (activeTab === 'f1') {
      return (
        <>
          <View style={styles.f1Header}>
            <Text style={styles.f1HeaderText}>2025 F1 Race Calendar</Text>
            <Text style={styles.f1HeaderSub}>Powered by OpenF1</Text>
          </View>
          {matches.map(m => <MatchCard key={m.id} match={m} />)}
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

      {/* Scrollable content */}
      <FlatList
        data={[{ key: 'body' }]}
        keyExtractor={i => i.key}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            {renderMatchContent()}

            <View style={{ marginTop: SPACING.xl }}>
              <SectionHeading title="Latest Headlines" />
              {news.length > 0 ? news.map((a, i) => (
                <View key={i} style={styles.newsItem}>
                  <Text style={styles.newsCategory} numberOfLines={1}>
                    {a.categories?.[0]?.description || 'Sports'}
                  </Text>
                  <Text style={styles.newsTitle} numberOfLines={2}>{a.headline}</Text>
                  {!!a.published && (
                    <Text style={styles.newsTime}>{timeAgo(a.published)}</Text>
                  )}
                </View>
              )) : (
                <Text style={styles.emptyText}>No headlines right now.</Text>
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
  f1Header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  f1HeaderText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  f1HeaderSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  newsItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  newsCategory: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  newsTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: 18,
  },
  newsTime: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
  },
});
