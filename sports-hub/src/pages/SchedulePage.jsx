import React, { useState } from 'react';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, WEB_SHADOW,
} from '../../../shared/theme.js';
import { formatDate } from '../../../shared/utils.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';

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

export default function SchedulePage() {
  const [selectedSport, setSelectedSport] = useState('all');

  const filtered = selectedSport === 'all'
    ? MOCK_SCHEDULE
    : MOCK_SCHEDULE.filter((g) => g.sport === selectedSport);

  return (
    <div>
      <SectionHeading title="Upcoming Schedule" />
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
      <div style={{ height: SPACING.lg }} />

      {filtered.length === 0 ? (
        <p style={styles.empty}>No upcoming games.</p>
      ) : (
        <div style={styles.list}>
          {filtered.map((game) => (
            <div key={game.id} style={styles.card}>
              <div style={styles.dateBlock}>
                <span style={styles.date}>{formatDate(game.scheduledAt)}</span>
                <span style={styles.time}>
                  {new Date(game.scheduledAt).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div style={styles.matchup}>
                <span style={styles.team}>
                  {game.homeTeam.logo} {game.homeTeam.name}
                </span>
                <span style={styles.vsLabel}>vs</span>
                <span style={styles.team}>
                  {game.awayTeam.logo} {game.awayTeam.name}
                </span>
              </div>
              <span style={styles.venue}>{game.venue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    boxShadow: WEB_SHADOW.md,
    border: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.lg,
    flexWrap: 'wrap',
  },
  dateBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 90,
  },
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
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  team: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  vsLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  venue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  empty: {
    color: '#A0AEC0',
    fontStyle: 'italic',
    padding: '24px 0',
  },
};
