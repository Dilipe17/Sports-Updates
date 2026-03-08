import React, { useState, useEffect } from 'react';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, WEB_SHADOW,
} from '../../../shared/theme.js';
import { fetchSportMatches, SPORT_CONFIG } from '../../../shared/api.js';
import SectionHeading from '../components/SectionHeading';
import SportCategoryBar from '../components/SportCategoryBar';
import BackButton from '../components/BackButton';

const ALL_SPORTS = Object.keys(SPORT_CONFIG);

export default function SchedulePage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [schedule, setSchedule]           = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const sports  = selectedSport === 'all' ? ALL_SPORTS : [selectedSport];
      const results = await Promise.allSettled(sports.map(s => fetchSportMatches(s)));
      if (cancelled) return;

      const upcoming = results.flatMap(r =>
        r.status === 'fulfilled' ? r.value.filter(m => !m.isLive && !m.isComplete) : []
      );
      upcoming.sort((a, b) => {
        if (a.date && b.date) return new Date(a.date) - new Date(b.date);
        return 0;
      });
      setSchedule(upcoming);
      setLoading(false);
    }

    load();
  }, [selectedSport]);

  return (
    <div>
      <BackButton />
      <SectionHeading title="Upcoming Schedule" />
      <SportCategoryBar selected={selectedSport} onSelect={setSelectedSport} />
      <div style={{ height: SPACING.lg }} />

      {loading ? (
        <p style={styles.empty}>Loading schedule…</p>
      ) : schedule.length === 0 ? (
        <p style={styles.empty}>No upcoming games found.</p>
      ) : (
        <div style={styles.list}>
          {schedule.map((game, i) => (
            <div key={game.id || i} style={styles.card}>
              {/* Date / league row */}
              <div style={styles.topRow}>
                <span style={styles.time}>{game.gameClock || game.formattedDate || '–'}</span>
                <span style={styles.league}>{game.league}</span>
              </div>

              {/* Matchup row */}
              <div style={styles.matchup}>
                <div style={styles.teamBlock}>
                  {game.logo1 && (
                    <img src={game.logo1} alt="" style={styles.logo}
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <span style={styles.team}>{game.team1Full || game.team1}</span>
                </div>

                <span style={styles.vs}>vs</span>

                <div style={{ ...styles.teamBlock, alignItems: 'flex-end', textAlign: 'right' }}>
                  {game.logo2 && (
                    <img src={game.logo2} alt="" style={styles.logo}
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <span style={styles.team}>{game.team2Full || game.team2}</span>
                </div>
              </div>

              {/* Venue */}
              {game.venue && <span style={styles.venue}>{game.venue}</span>}
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
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
  },
  league: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  matchup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  teamBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logo: {
    width: 28,
    height: 28,
    objectFit: 'contain',
    flexShrink: 0,
  },
  team: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  vs: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
    padding: '0 8px',
    flexShrink: 0,
  },
  venue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  empty: {
    color: '#A0AEC0',
    fontStyle: 'italic',
    padding: '24px 0',
  },
};
