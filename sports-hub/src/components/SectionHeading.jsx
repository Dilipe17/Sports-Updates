import React from 'react';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../shared/theme.js';

/** Reusable section heading with an optional "See all" link. */
export default function SectionHeading({ title, onSeeAll }) {
  return (
    <div style={styles.row}>
      <h2 style={styles.title}>{title}</h2>
      {onSeeAll && (
        <button onClick={onSeeAll} style={styles.seeAll}>
          See all →
        </button>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  seeAll: {
    background: 'none',
    border: 'none',
    color: COLORS.accent,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    cursor: 'pointer',
    padding: 0,
  },
};
