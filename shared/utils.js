/**
 * Shared utility functions used by both the web and mobile apps.
 */

/**
 * Format an ISO date string to a readable label.
 * @param {string} isoDate
 * @returns {string}  e.g. "Feb 20, 2026"
 */
export function formatDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate));
}

/**
 * Return a relative time label (e.g. "2 hours ago").
 * @param {string} isoDate
 * @returns {string}
 */
export function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Format a game clock string for display (no-op pass-through for now,
 * but a single place to customise later).
 * @param {string|null} timeRemaining
 * @param {number|null} quarter
 * @param {string}      sport
 * @returns {string}
 */
export function formatGameClock(timeRemaining, quarter, sport) {
  if (!timeRemaining) return '';
  if (sport === 'soccer') return timeRemaining; // already like "72'"
  const quarterLabel =
    sport === 'basketball' ? `Q${quarter}` :
    sport === 'football'   ? `Q${quarter}` :
    `P${quarter}`;
  return `${quarterLabel} · ${timeRemaining}`;
}

/**
 * Determine which team is winning, or return 'tie'.
 * @returns {'home'|'away'|'tie'}
 */
export function getLeadingTeam(homeScore, awayScore) {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'tie';
}

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to `maxLength` characters, appending "…" if needed.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str = '', maxLength = 100) {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}
