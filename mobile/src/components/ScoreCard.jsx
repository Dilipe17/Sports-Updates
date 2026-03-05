import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, SHADOW,
} from '../../../shared/theme.js';
import { formatGameClock, getLeadingTeam } from '../../../shared/utils.js';

/**
 * ScoreCard (mobile) – mirrors the web ScoreCard in structure and data shape.
 * Uses React Native primitives instead of HTML/CSS.
 */
export default function ScoreCard({ game }) {
  const {
    sport, homeTeam, awayTeam, homeScore, awayScore,
    quarter, timeRemaining, isLive, venue,
  } = game;

  const leader = getLeadingTeam(homeScore, awayScore);
  const clock  = formatGameClock(timeRemaining, quarter, sport);

  return (
    <View style={styles.card}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        {isLive && <Text style={styles.liveBadge}>● LIVE</Text>}
        {!!clock  && <Text style={styles.clock}>{clock}</Text>}
        {!!venue  && <Text style={styles.venue} numberOfLines={1}>{venue}</Text>}
      </View>

      {/* Score row */}
      <View style={styles.scoreRow}>
        {/* Home team */}
        <View style={styles.teamBlock}>
          <Text style={styles.teamLogo}>{homeTeam.logo}</Text>
          <Text style={styles.teamName}>{homeTeam.name}</Text>
          <Text style={[styles.score, { color: leader === 'home' ? COLORS.accent : COLORS.textMuted }]}>
            {homeScore}
          </Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        {/* Away team */}
        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <Text style={styles.teamLogo}>{awayTeam.logo}</Text>
          <Text style={[styles.teamName, { textAlign: 'right' }]}>{awayTeam.name}</Text>
          <Text style={[styles.score, { color: leader === 'away' ? COLORS.accent : COLORS.textMuted }]}>
            {awayScore}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  liveBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  clock: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  venue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flex: 1,
    textAlign: 'right',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBlock: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  teamBlockRight: {
    alignItems: 'flex-end',
  },
  teamLogo: { fontSize: 28 },
  teamName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  score: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: FONT_SIZE.xxxl * 1.2,
  },
  vs: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.sm,
  },
});
