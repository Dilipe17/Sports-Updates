import React from 'react';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, WEB_SHADOW,
} from '../../../shared/theme.js';
import { formatGameClock, getLeadingTeam } from '../../../shared/utils.js';

/**
 * ScoreCard – displays a single live or completed game.
 * Mirrors the mobile ScoreCard component in structure and data shape.
 */
export default function ScoreCard({ game }) {
  const {
    sport, homeTeam, awayTeam, homeScore, awayScore,
    quarter, timeRemaining, isLive, venue,
  } = game;

  const leader = getLeadingTeam(homeScore, awayScore);
  const clock  = formatGameClock(timeRemaining, quarter, sport);

  return (
    <div style={styles.card}>
      {/* Status bar */}
      <div style={styles.statusBar}>
        {isLive && <span style={styles.liveBadge}>● LIVE</span>}
        {clock   && <span style={styles.clock}>{clock}</span>}
        {venue   && <span style={styles.venue}>{venue}</span>}
      </div>

      {/* Score row */}
      <div style={styles.scoreRow}>
        {/* Home team */}
        <div style={styles.teamBlock}>
          {homeTeam.logo?.startsWith('http')
            ? <img src={homeTeam.logo} alt={homeTeam.name} style={styles.teamLogo} />
            : <span style={{ fontSize: 28 }}>{homeTeam.logo || homeTeam.abbreviation}</span>}
          <span style={styles.teamName}>{homeTeam.name}</span>
          <span
            style={{
              ...styles.score,
              color: leader === 'home' ? COLORS.accent : COLORS.textMuted,
            }}
          >
            {homeScore}
          </span>
        </div>

        <span style={styles.vs}>VS</span>

        {/* Away team */}
        <div style={{ ...styles.teamBlock, alignItems: 'flex-end' }}>
          {awayTeam.logo?.startsWith('http')
            ? <img src={awayTeam.logo} alt={awayTeam.name} style={styles.teamLogo} />
            : <span style={{ fontSize: 28 }}>{awayTeam.logo || awayTeam.abbreviation}</span>}
          <span style={styles.teamName}>{awayTeam.name}</span>
          <span
            style={{
              ...styles.score,
              color: leader === 'away' ? COLORS.accent : COLORS.textMuted,
            }}
          >
            {awayScore}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: `${SPACING.md}px`,
    boxShadow: WEB_SHADOW.md,
    border: `1px solid ${COLORS.border}`,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  liveBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
    letterSpacing: '0.5px',
  },
  clock: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  venue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  teamBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    gap: 4,
  },
  teamLogo: { fontSize: 28, width: 32, height: 32, objectFit: 'contain' },
  teamName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  score: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 1,
  },
  vs: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    padding: `0 ${SPACING.sm}px`,
  },
};
