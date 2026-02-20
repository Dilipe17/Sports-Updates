/**
 * Shared API layer – used identically by the Sports Hub web app and the mobile app.
 * Swap BASE_URL to point at your real sports-data provider.
 */

const BASE_URL = 'https://api.sports-updates.example.com/v1';

/** Generic fetcher with basic error handling */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ─── Live Scores ─────────────────────────────────────────────────────────────

/**
 * Fetch current live scores for a given sport.
 * @param {string} sport - e.g. 'football' | 'basketball' | 'soccer' …
 * @returns {Promise<LiveGame[]>}
 */
export async function fetchLiveScores(sport = 'all') {
  return apiFetch(`/scores/live?sport=${sport}`);
}

/**
 * Fetch completed game scores for a specific date.
 * @param {string} date - ISO date string, e.g. '2026-02-20'
 * @param {string} sport
 * @returns {Promise<Game[]>}
 */
export async function fetchScoresByDate(date, sport = 'all') {
  return apiFetch(`/scores?date=${date}&sport=${sport}`);
}

// ─── News ─────────────────────────────────────────────────────────────────────

/**
 * Fetch latest sports news articles.
 * @param {{ sport?: string, page?: number, limit?: number }} params
 * @returns {Promise<Article[]>}
 */
export async function fetchNews({ sport = 'all', page = 1, limit = 20 } = {}) {
  return apiFetch(`/news?sport=${sport}&page=${page}&limit=${limit}`);
}

/**
 * Fetch a single article by ID.
 * @param {string|number} articleId
 * @returns {Promise<Article>}
 */
export async function fetchArticle(articleId) {
  return apiFetch(`/news/${articleId}`);
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Fetch upcoming game schedule.
 * @param {{ sport?: string, teamId?: string, days?: number }} params
 * @returns {Promise<ScheduledGame[]>}
 */
export async function fetchSchedule({ sport = 'all', teamId, days = 7 } = {}) {
  const params = new URLSearchParams({ sport, days });
  if (teamId) params.set('teamId', teamId);
  return apiFetch(`/schedule?${params}`);
}

// ─── Teams ────────────────────────────────────────────────────────────────────

/**
 * Fetch team details + current standing.
 * @param {string|number} teamId
 * @returns {Promise<Team>}
 */
export async function fetchTeam(teamId) {
  return apiFetch(`/teams/${teamId}`);
}

/**
 * Fetch standings for a sport/league.
 * @param {string} sport
 * @param {string} [league]
 * @returns {Promise<Standing[]>}
 */
export async function fetchStandings(sport, league) {
  const params = new URLSearchParams({ sport });
  if (league) params.set('league', league);
  return apiFetch(`/standings?${params}`);
}

// ─── Mock data helpers (for development / testing) ───────────────────────────

export const MOCK_LIVE_GAMES = [
  {
    id: 'g1',
    sport: 'basketball',
    homeTeam: { id: 't1', name: 'Lakers',   abbreviation: 'LAL', logo: '🟡' },
    awayTeam: { id: 't2', name: 'Celtics',  abbreviation: 'BOS', logo: '🟢' },
    homeScore: 98,
    awayScore: 101,
    quarter: 4,
    timeRemaining: '3:42',
    isLive: true,
    venue: 'Crypto.com Arena',
  },
  {
    id: 'g2',
    sport: 'football',
    homeTeam: { id: 't3', name: 'Chiefs',   abbreviation: 'KC',  logo: '🔴' },
    awayTeam: { id: 't4', name: '49ers',    abbreviation: 'SF',  logo: '🟠' },
    homeScore: 21,
    awayScore: 17,
    quarter: 3,
    timeRemaining: '8:15',
    isLive: true,
    venue: 'Arrowhead Stadium',
  },
  {
    id: 'g3',
    sport: 'soccer',
    homeTeam: { id: 't5', name: 'Man City', abbreviation: 'MCI', logo: '🔵' },
    awayTeam: { id: 't6', name: 'Arsenal',  abbreviation: 'ARS', logo: '🔴' },
    homeScore: 2,
    awayScore: 2,
    quarter: null,
    timeRemaining: "72'",
    isLive: true,
    venue: 'Etihad Stadium',
  },
];

export const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'Lakers Rally Late to Defeat Celtics in Overtime Thriller',
    summary: 'LeBron James delivered 38 points, 10 rebounds and 8 assists as the Lakers overcame a 15-point deficit.',
    sport: 'basketball',
    author: 'Sports Desk',
    publishedAt: '2026-02-20T18:30:00Z',
    imageUrl: null,
    readingTime: 3,
  },
  {
    id: 'n2',
    title: 'Chiefs Defense Locks Down 49ers in AFC Championship Rematch',
    summary: 'Patrick Mahomes threw for 312 yards and two touchdowns as Kansas City dominated San Francisco.',
    sport: 'football',
    author: 'Sports Desk',
    publishedAt: '2026-02-20T16:00:00Z',
    imageUrl: null,
    readingTime: 4,
  },
  {
    id: 'n3',
    title: 'Manchester City and Arsenal Share the Spoils in Premier League Classic',
    summary: 'A pulsating 2–2 draw at the Etihad leaves both title hopefuls level on points.',
    sport: 'soccer',
    author: 'Sports Desk',
    publishedAt: '2026-02-20T14:45:00Z',
    imageUrl: null,
    readingTime: 3,
  },
];
