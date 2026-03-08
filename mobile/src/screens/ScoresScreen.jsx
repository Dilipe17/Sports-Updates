import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet,
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

  const renderMatches = () => {
    if (loading) return [1, 2, 3].map(i => <MatchCardSkeleton key={i} />);

    if (!matches.length) return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>{SPORT_CONFIG[activeTab]?.icon}</Text>
        <Text style={styles.emptyText}>No {SPORT_CONFIG[activeTab]?.name} scores right now.</Text>
      </View>
    );

    if (activeTab === 'cricket') {
      const g = { worldcup: [], ipl: [], international: [], domestic: [] };
      matches.forEach(m => { (g[m.leagueGroup] || g.domestic).push(m); });
      return (
        <>
          {g.worldcup.length > 0 && <>
            <SectionHeader icon="🏆" title="Major Events" count={g.worldcup.length} />
            {g.worldcup.map(m => <MatchCard key={m.id} match={m} />)}
          </>}
          {g.ipl.length > 0 && <>
            <SectionHeader icon="🔵" title="IPL T20" count={g.ipl.length} />
            {g.ipl.map(m => <MatchCard key={m.id} match={m} />)}
          </>}
          {g.international.length > 0 && <>
            <SectionHeader icon="🌍" title="International" count={g.international.length} />
            {g.international.map(m => <MatchCard key={m.id} match={m} />)}
          </>}
          {g.domestic.length > 0 && <>
            <SectionHeader icon="🏏" title="Domestic" count={g.domestic.length} />
            {g.domestic.map(m => <MatchCard key={m.id} match={m} />)}
          </>}
        </>
      );
    }

    if (activeTab === 'f1') return (
      <>
        <View style={styles.f1Header}>
          <Text style={styles.f1HeaderText}>{new Date().getFullYear()} F1 Race Calendar</Text>
          <Text style={styles.f1HeaderSub}>Powered by OpenF1</Text>
        </View>
        {matches.map(m => <MatchCard key={m.id} match={m} />)}
      </>
    );

    return matches.map(m => <MatchCard key={m.id} match={m} />);
  };

  return (
    <View style={styles.container}>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeading title="Scores" />
        {renderMatches()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.primary },
  tabBar:        { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBarContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  tab:           { paddingHorizontal: SPACING.sm + 2, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, marginRight: 6 },
  tabActive:     { backgroundColor: COLORS.accent },
  tabText:       { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  tabTextActive: { color: COLORS.text },
  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl * 2 },
  empty: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon:    { fontSize: 36, marginBottom: SPACING.sm },
  emptyText:    { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, textAlign: 'center' },
  f1Header:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  f1HeaderText: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  f1HeaderSub:  { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
});
