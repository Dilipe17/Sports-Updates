/**
 * Shared theme constants used by both the Sports Hub web app and the mobile app.
 * Any colour, spacing or typography change here propagates to both platforms.
 */

export const COLORS = {
  primary: '#1A1A2E',       // deep navy – main brand background
  secondary: '#16213E',     // slightly lighter navy
  accent: '#E94560',        // sports-red – buttons, badges, highlights
  accentLight: '#FF6B6B',   // lighter accent for hover / pressed states
  surface: '#0F3460',       // card / surface background
  surfaceLight: '#1B4F8A',  // elevated surface
  text: '#FFFFFF',          // primary text on dark backgrounds
  textMuted: '#A0AEC0',     // secondary / helper text
  textDark: '#1A1A2E',      // text on light backgrounds
  success: '#48BB78',       // live indicator, positive change
  warning: '#ECC94B',       // caution / upcoming
  border: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(0,0,0,0.6)',
  scoreHome: '#E94560',
  scoreAway: '#4A90E2',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
};

/** CSS-compatible shadow strings for the web app */
export const WEB_SHADOW = {
  sm: '0 1px 3px rgba(0,0,0,0.3)',
  md: '0 4px 12px rgba(0,0,0,0.4)',
  lg: '0 8px 24px rgba(0,0,0,0.5)',
};

export const SPORT_CATEGORIES = [
  { id: 'football',   label: 'Football',   icon: '🏈' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'baseball',   label: 'Baseball',   icon: '⚾' },
  { id: 'soccer',     label: 'Soccer',     icon: '⚽' },
  { id: 'hockey',     label: 'Hockey',     icon: '🏒' },
  { id: 'tennis',     label: 'Tennis',     icon: '🎾' },
];
