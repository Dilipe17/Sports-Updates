import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import {
  SPORT_CATEGORIES, COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING,
} from '../../../shared/theme.js';

/**
 * SportCategoryBar (mobile) – horizontal scrollable pill tabs.
 * Mirrors the web SportCategoryBar in logic and appearance.
 */
export default function SportCategoryBar({ selected, onSelect }) {
  const all = [{ id: 'all', label: 'All', icon: '🏅' }, ...SPORT_CATEGORIES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {all.map(({ id, label, icon }) => {
        const active = selected === id;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onSelect(id)}
            style={[
              styles.pill,
              active ? styles.pillActive : styles.pillInactive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.label, { color: active ? COLORS.text : COLORS.textMuted }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: 6,
    marginRight: SPACING.sm,
  },
  pillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  pillInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  icon: { fontSize: 14 },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
});
