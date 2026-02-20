import React from 'react';
import {
  COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING, WEB_SHADOW,
} from '../../../shared/theme.js';
import { timeAgo, capitalise } from '../../../shared/utils.js';

/**
 * NewsCard – a single news article preview.
 * Mirrors the mobile NewsCard component in structure and data shape.
 */
export default function NewsCard({ article, onClick }) {
  const { title, summary, sport, author, publishedAt, readingTime } = article;

  return (
    <article style={styles.card} onClick={onClick} role={onClick ? 'button' : undefined}>
      {/* Sport badge */}
      <span style={styles.sportBadge}>{capitalise(sport)}</span>

      {/* Headline */}
      <h3 style={styles.title}>{title}</h3>

      {/* Summary */}
      <p style={styles.summary}>{summary}</p>

      {/* Footer meta */}
      <div style={styles.meta}>
        <span style={styles.author}>{author}</span>
        <span style={styles.dot}>·</span>
        <span style={styles.time}>{timeAgo(publishedAt)}</span>
        {readingTime && (
          <>
            <span style={styles.dot}>·</span>
            <span style={styles.time}>{readingTime} min read</span>
          </>
        )}
      </div>
    </article>
  );
}

const styles = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: `${SPACING.md}px`,
    boxShadow: WEB_SHADOW.md,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  sportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    padding: '2px 8px',
    borderRadius: BORDER_RADIUS.full,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    lineHeight: 1.4,
  },
  summary: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    lineHeight: 1.6,
    flex: 1,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  author: { fontWeight: FONT_WEIGHT.medium },
  dot: { opacity: 0.5 },
  time: {},
};
