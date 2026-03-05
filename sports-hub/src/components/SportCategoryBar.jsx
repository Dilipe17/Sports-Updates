import React from 'react';
import { SPORT_CATEGORIES, COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../shared/theme.js';

/**
 * SportCategoryBar – horizontal pill tabs for filtering by sport.
 * Mirrors the SportCategoryBar in the mobile app.
 */
export default function SportCategoryBar({ selected, onSelect }) {
  const all = [{ id: 'all', label: 'All', icon: '🏅' }, ...SPORT_CATEGORIES];

  return (
    <div style={styles.container}>
      {all.map(({ id, label, icon }) => {
        const active = selected === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              ...styles.pill,
              backgroundColor: active ? COLORS.accent : COLORS.surface,
              color:           active ? COLORS.text  : COLORS.textMuted,
              border: active
                ? `1px solid ${COLORS.accent}`
                : `1px solid ${COLORS.border}`,
            }}
          >
            <span>{icon}</span>
            <span style={styles.label}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: SPACING.sm,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: `${SPACING.xs + 2}px ${SPACING.md}px`,
    borderRadius: BORDER_RADIUS.full,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    transition: 'all 0.15s',
  },
  label: {},
};
