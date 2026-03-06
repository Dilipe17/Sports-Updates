import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOW,
} from '../../../shared/theme.js';

function TeamLogo({ logo, name }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      <Image
        source={{ uri: logo }}
        style={s.logo}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={s.logoFallback}>
      <Text style={s.logoFallbackText}>{(name || '?')[0].toUpperCase()}</Text>
    </View>
  );
}

function F1Card({ match }) {
  const badgeColor = match.isLive ? COLORS.success : match.isComplete ? '#4b5563' : COLORS.accent;
  return (
    <View style={[s.card, match.isLive && s.cardLive]}>
      <View style={s.f1Row}>
        <View style={s.f1Left}>
          <Text style={s.f1Circuit}>{match.team1}</Text>
          <Text style={s.f1Location} numberOfLines={1}>{match.team2Full}</Text>
        </View>
        <View style={s.f1Mid}>
          <View style={[s.badge, { backgroundColor: badgeColor }]}>
            {match.isLive && <Text style={s.liveDot}>● </Text>}
            <Text style={s.badgeText}>{match.status.toUpperCase()}</Text>
          </View>
          <Text style={s.f1Date}>{match.score1}</Text>
          <Text style={s.f1Time}>{match.score2}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MatchCard({ match }) {
  if (match.isF1) return <F1Card match={match} />;

  const badgeColor = match.isLive ? COLORS.success : match.isComplete ? '#4b5563' : COLORS.accent;

  return (
    <View style={[s.card, match.isLive && s.cardLive]}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          {match.isInternational && (
            <View style={s.intlBadge}><Text style={s.intlBadgeText}>INTL</Text></View>
          )}
          {match.leagueGroup === 'ipl' && (
            <View style={s.iplBadge}><Text style={s.iplBadgeText}>IPL</Text></View>
          )}
          {!!match.league && (
            <Text style={s.leagueText} numberOfLines={1}>
              {match.league}{match.matchDesc ? ` \u2022 ${match.matchDesc}` : ''}
            </Text>
          )}
        </View>
        {!!match.formattedDate && (
          <Text style={s.dateText} numberOfLines={1}>{match.formattedDate}</Text>
        )}
      </View>

      {/* Body */}
      <View style={s.body}>
        <View style={s.team}>
          <TeamLogo logo={match.logo1} name={match.team1} />
          <Text style={s.teamName} numberOfLines={2}>{match.team1}</Text>
        </View>

        <View style={s.centre}>
          <View style={[s.badge, { backgroundColor: badgeColor }]}>
            {match.isLive && <Text style={s.liveDot}>● </Text>}
            <Text style={s.badgeText}>{match.status.toUpperCase()}</Text>
          </View>
          <View style={s.scoreRow}>
            <Text style={s.scoreVal}>{match.score1 || '-'}</Text>
            <Text style={s.vs}>vs</Text>
            <Text style={s.scoreVal}>{match.score2 || '-'}</Text>
          </View>
          {!!match.gameClock && (
            <Text style={s.clock}>{'\u{1F550}'} {match.gameClock}</Text>
          )}
          {!!match.summary && (
            <Text style={s.summary} numberOfLines={2}>{match.summary}</Text>
          )}
          {!!match.venue && (
            <Text style={s.venue} numberOfLines={1}>{match.venue}</Text>
          )}
        </View>

        <View style={s.team}>
          <TeamLogo logo={match.logo2} name={match.team2} />
          <Text style={s.teamName} numberOfLines={2}>{match.team2}</Text>
        </View>
      </View>
    </View>
  );
}

export function MatchCardSkeleton() {
  return (
    <View style={s.card}>
      <View style={s.body}>
        <View style={s.team}>
          <View style={sk.logo} />
          <View style={sk.name} />
        </View>
        <View style={s.centre}>
          <View style={sk.badge} />
          <View style={sk.score} />
        </View>
        <View style={s.team}>
          <View style={sk.logo} />
          <View style={sk.name} />
        </View>
      </View>
    </View>
  );
}

export function SectionHeader({ icon, title, count }) {
  return (
    <View style={sh.row}>
      <Text style={sh.icon}>{icon}</Text>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.countBadge}>
        <Text style={sh.countText}>{count}</Text>
      </View>
      <View style={sh.line} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  cardLive: {
    borderColor: 'rgba(34,197,94,0.35)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
    gap: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  intlBadge: {
    backgroundColor: 'rgba(234,179,8,0.18)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  intlBadgeText: {
    color: '#fbbf24',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  iplBadge: {
    backgroundColor: 'rgba(168,85,247,0.18)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  iplBadgeText: {
    color: '#c084fc',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  leagueText: {
    color: COLORS.accentLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    flex: 1,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    flexShrink: 0,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  team: {
    width: 70,
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
  },
  logoFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30,64,175,0.7)',
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoFallbackText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  teamName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.md,
  },
  liveDot: {
    color: COLORS.text,
    fontSize: 8,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreVal: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  vs: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  clock: {
    color: '#67e8f9',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  summary: {
    color: '#34d399',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
  venue: {
    color: COLORS.accentLight,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
  // F1
  f1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  f1Left: { flex: 1 },
  f1Circuit: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  f1Location: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  f1Mid: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  f1Date: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  f1Time: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
});

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  icon: { fontSize: FONT_SIZE.md },
  title: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  countBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
});

const sk = StyleSheet.create({
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 4,
  },
  name: {
    width: 50,
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
  badge: {
    width: 70,
    height: 20,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
  },
  score: {
    width: 100,
    height: 28,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
});
