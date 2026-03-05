import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, SHADOW,
} from '../../../shared/theme.js';
import { timeAgo, capitalise, truncate } from '../../../shared/utils.js';

/**
 * NewsCard (mobile) – mirrors the web NewsCard in structure and data shape.
 */
export default function NewsCard({ article, onPress }) {
  const { title, summary, sport, author, publishedAt, readingTime } = article;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.sportBadge}>{capitalise(sport)}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.summary} numberOfLines={3}>{truncate(summary, 140)}</Text>
      <View style={styles.meta}>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.dot}> · </Text>
        <Text style={styles.time}>{timeAgo(publishedAt)}</Text>
        {readingTime ? (
          <>
            <Text style={styles.dot}> · </Text>
            <Text style={styles.time}>{readingTime} min read</Text>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
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
    gap: SPACING.sm,
    ...SHADOW.md,
  },
  sportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    lineHeight: FONT_SIZE.lg * 1.4,
  },
  summary: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    lineHeight: FONT_SIZE.md * 1.6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  author: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
  },
  dot: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    opacity: 0.5,
  },
  time: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
