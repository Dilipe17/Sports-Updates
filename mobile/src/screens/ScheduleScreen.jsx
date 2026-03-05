import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, SHADOW,
} from '../../../shared/theme.js';
import { formatDate } from '../../../shared/utils.js';
import SportCategoryBar from '../components/SportCategoryBar';
import SectionHeading   from '../components/SectionHeading';

const MOCK_SCHEDULE = [
  {
    id: 's1',
    sport: 'basketball',
    homeTeam: { name: 'Warriors', logo: '🟡' },
    awayTeam: { name: 'Bulls',    logo: '🔴' },
    scheduledAt: '2026-02-21T19:30:00Z',
    venue: 'Chase Center',
  },
  {
    id: 's2',
    sport: 'football',
    homeTeam: { name: 'Cowboys',  logo: '🌟' },
    awayTeam: { name: 'Eagles',   logo: '🦅' },
    scheduledAt: '2026-02-22T18:00:00Z',
    venue: 'AT&T Stadium',
  },
  {
    id: 's3',
    sport: 'soccer',
    homeTeam: { name: 'Liverpool', logo: '🔴' },
    awayTeam: { name: 'Chelsea',   logo: '🔵' },
    scheduledAt: '2026-02-23T15:00:00Z',
    venue: 'Anfield',
  },
  {
    id: 's4',
    sport: 'baseball',
    homeTeam: { name: 'Yankees',  logo: '⚾' },
    awayTeam: { name: 'Red Sox',  logo: '🧦' },
    scheduledAt: '2026-02-24T17:05:00Z',
    venue: 'Yankee Stadium',
  },
];

export default function ScheduleScreen() {
  const [selectedSport, setSelectedSport] = useState('all');

  const filtered = selectedSport === 'all'
    ? MOCK_SCHEDULE
    : MOCK_SCHEDULE.filter((g) => g.sport === selectedSport);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.dateBlock}>
              <Text style={styles.date}>{formatDate(item.scheduledAt)}</Text>
              <Text style={styles.time}>
                {new Date(item.scheduledAt).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.matchup}>
              <Text style={styles.team}>{item.homeTeam.logo} {item.homeTeam.name}</Text>
              <Text style={styles.vsLabel}>vs</Text>
              <Text style={styles.team}>{item.awayTeam.logo} {item.awayTeam.name}</Text>
            </View>
            <Text style={styles.venue}>{item.venue}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SectionHeading title="Upcoming Schedule" />
            <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
            <View style={{ height: SPACING.md }} />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No upcoming games.</Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
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
  dateBlock: { marginBottom: SPACING.xs },
  date: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
  },
  time: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.xs,
    flexWrap: 'wrap',
  },
  team: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  vsLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  venue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  empty: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
});
