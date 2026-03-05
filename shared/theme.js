/**
 * Shared theme constants used by both the Sports Hub web app and the mobile app.
 */

export const COLORS = {
  primary:      '#0f172a',
  secondary:    '#1e3a8a',
  accent:       '#3b82f6',
  accentLight:  '#60a5fa',
  surface:      'rgba(30, 58, 138, 0.4)',
  surfaceLight: 'rgba(30, 64, 175, 0.6)',
  text:         '#ffffff',
  textMuted:    '#93c5fd',
  textDark:     '#1e3a8a',
  success:      '#22c55e',
  warning:      '#eab308',
  border:       'rgba(30, 64, 175, 0.5)',
  overlay:      'rgba(0, 0, 0, 0.7)',
  scoreHome:    '#3b82f6',
  scoreAway:    '#60a5fa',
  // legacy aliases kept for mobile app
  E94560:       '#3b82f6',
};

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const FONT_SIZE = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const FONT_WEIGHT = {
  regular: '400', medium: '500', semibold: '600', bold: '700',
};

export const BORDER_RADIUS = {
  sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
};

export const SHADOW = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 2,  elevation: 2  },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,  elevation: 5  },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3,  shadowRadius: 16, elevation: 10 },
};

export const WEB_SHADOW = {
  sm: '0 1px 3px rgba(0,0,0,0.3)',
  md: '0 4px 12px rgba(0,0,0,0.4)',
  lg: '0 8px 24px rgba(0,0,0,0.5)',
};

export const SPORT_CATEGORIES = [
  { id: 'cricket',    label: 'Cricket',    icon: '🏏' },
  { id: 'soccer',     label: 'Soccer',     icon: '⚽' },
  { id: 'tennis',     label: 'Tennis',     icon: '🎾' },
  { id: 'nfl',        label: 'NFL',        icon: '🏈' },
  { id: 'f1',         label: 'F1',         icon: '🏎️' },
  { id: 'baseball',   label: 'Baseball',   icon: '⚾' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
];
