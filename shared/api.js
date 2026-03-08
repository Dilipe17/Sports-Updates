/**
 * Shared API layer – Sports Hub
 * Provides live sports data from ESPN + OpenF1 for both web and mobile.
 */

// ─── Sport Configuration ─────────────────────────────────────────────────────

export const SPORT_CONFIG = {
  cricket:    { url: 'https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=cricket&region=in', type: 'cricket-header', name: 'Cricket',    icon: '🏏', region: 'as' },
  soccer:     { url: 'https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=soccer&region=in',  type: 'soccer-header', name: 'Soccer',     icon: '⚽', region: 'eu' },
  tennis:     { url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',                      type: 'espn',          name: 'Tennis',     icon: '🎾', region: 'eu' },
  nfl:        { url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',                    type: 'espn',          name: 'NFL',        icon: '🏈', region: 'na' },
  f1:         { url: `https://api.openf1.org/v1/sessions?year=${new Date().getFullYear()}&session_type=Race`,   type: 'openf1',        name: 'F1',         icon: '🏎️', region: 'eu' },
  baseball:   { url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',                   type: 'espn',          name: 'Baseball',   icon: '⚾', region: 'na' },
  basketball: { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',                 type: 'espn',          name: 'Basketball', icon: '🏀', region: 'na' },
};

export const STANDINGS_CONFIG = {
  soccer:     [
    { id: 'eng.1',          name: 'Premier League' },
    { id: 'esp.1',          name: 'La Liga' },
    { id: 'ita.1',          name: 'Serie A' },
    { id: 'ger.1',          name: 'Bundesliga' },
    { id: 'fra.1',          name: 'Ligue 1' },
    { id: 'uefa.champions', name: 'Champions League' },
  ],
  cricket:    [{ id: '8604', sport: 'cricket',    name: 'T20 World Cup' }],
  nfl:        [{ id: 'nfl',  sport: 'football',   name: 'NFL' }],
  baseball:   [{ id: 'mlb',  sport: 'baseball',   name: 'MLB' }],
  basketball: [{ id: 'nba',  sport: 'basketball', name: 'NBA' }],
  f1:         [{ id: 'f1',   sport: 'racing',     name: 'F1 Standings' }],
};

const SOCCER_LEAGUE_ORDER = ['uefa.champions', 'eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1'];

// ─── Parsers ─────────────────────────────────────────────────────────────────

export function parseESPNData(data, leagueName = '') {
  if (!data?.events?.length) return [];
  const apiLeagueName = data.leagues?.[0]?.name || leagueName;
  return data.events.map(event => {
    const competition = event.competitions?.[0];
    if (!competition) return null;
    const competitors = competition.competitors || [];
    const home = competitors.find(c => c.homeAway === 'home') || competitors[0];
    const away = competitors.find(c => c.homeAway === 'away') || competitors[1];
    if (!home || !away) return null;
    const statusDetail = event.status?.type?.shortDetail || event.status?.type?.description || 'Scheduled';
    const isLive     = event.status?.type?.state === 'in';
    const isComplete = event.status?.type?.state === 'post' || event.status?.type?.completed === true;
    const intlClassId = parseInt(competition.class?.internationalClassId || '0', 10);
    let formattedDate = '';
    if (event.date) {
      const d = new Date(event.date);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        + ' \u2022 ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    let gameClock = '';
    if (isLive)                          gameClock = event.status?.displayClock || statusDetail;
    else if (!isComplete && event.date)  gameClock = new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    else if (isComplete)                 gameClock = statusDetail;
    return {
      id: event.id,
      team1: away?.team?.shortDisplayName || away?.team?.displayName || 'TBD',
      team1Full: away?.team?.displayName || 'TBD',
      score1: away?.score || '-',
      logo1: away?.team?.logo || '',
      team2: home?.team?.shortDisplayName || home?.team?.displayName || 'TBD',
      team2Full: home?.team?.displayName || 'TBD',
      score2: home?.score || '-',
      logo2: home?.team?.logo || '',
      status: statusDetail,
      isLive, isComplete,
      venue: competition.venue?.fullName || '',
      league: apiLeagueName,
      summary: competition.status?.summary || event.status?.summary || '',
      matchDesc: competition.description || competition.shortDescription || '',
      potm: competition.status?.featuredAthletes?.find(a => a.abbreviation === 'POTM')?.athlete?.displayName || '',
      date: event.date || '',
      formattedDate,
      isInternational: intlClassId > 0,
      intlClassId,
      gameClock,
      leagueGroup: 'other',
      leaguePriority: 99,
    };
  }).filter(Boolean);
}

export function parseSportHeader(data, sport = 'cricket') {
  const matches = [];
  if (!data?.sports?.[0]?.leagues) return matches;
  for (const league of data.sports[0].leagues) {
    const leagueName   = league.shortName || league.abbreviation || league.name || '';
    const leagueSlug   = (league.slug || '').toLowerCase();
    const leagueId     = (league.id || '').toString();
    const leagueNameLower = (league.name || '').toLowerCase();
    let leaguePriority = 99;
    if (sport === 'soccer') {
      const idx = SOCCER_LEAGUE_ORDER.findIndex(k => leagueSlug.includes(k) || leagueId.includes(k));
      if (idx !== -1) leaguePriority = idx + 1;
    }
    // For cricket, detect major ICC events early so per-event priority can be assigned below
    // Check all name fields + slug because ESPN sometimes uses shortName/abbreviation that omits "World Cup"
    const leagueFullNameLower  = (league.name || '').toLowerCase();
    const leagueShortNameLower = (league.shortName || league.abbreviation || '').toLowerCase();
    const _wcCheck = s =>
      s.includes('world cup') || s.includes('champions trophy') ||
      s.includes('world test championship') || s.includes('wc ') ||
      (s.includes('icc') && s.includes('final'));
    const isCricketWorldCup = sport === 'cricket' && (
      _wcCheck(leagueFullNameLower) || _wcCheck(leagueShortNameLower) || _wcCheck(leagueSlug)
    );
    for (const ev of (league.events || [])) {
      const competitors = ev.competitors || [];
      if (competitors.length < 2) continue;
      const status    = ev.fullStatus || {};
      const stateType = status.type?.state || ev.status || 'pre';
      const isLive     = stateType === 'in';
      const isComplete = stateType === 'post';
      let isInternational = false, intlClassId = 0;
      if (sport === 'cricket') {
        intlClassId     = parseInt((ev.class || {}).internationalClassId || '0', 10);
        isInternational = intlClassId > 0;
      } else if (sport === 'soccer') {
        isInternational = league.isTournament === true ||
          ['champions','europa','uefa','fifa','copa','afc','concacaf','conmebol','caf'].some(k => leagueSlug.includes(k));
      }
      let formattedDate = '';
      if (ev.date) {
        const d = new Date(ev.date);
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          + ' \u2022 ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      const home = competitors.find(c => c.order === 1) || competitors[0];
      const away = competitors.find(c => c.order === 2) || competitors[1];
      const eventType  = (ev.class || {}).generalClassCard || ev.eventType || '';
      const logoDomain = sport === 'soccer' ? 'soccer' : 'cricket';
      let gameClock = '';
      if (sport === 'soccer') {
        const clock = status.clock;
        const displayClock = status.displayClock || (typeof clock === 'number' ? Math.floor(clock / 60) + "'" : '');
        if (isLive && displayClock)             gameClock = displayClock;
        else if (!isLive && !isComplete && ev.date) gameClock = new Date(ev.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        else if (isComplete)                    gameClock = 'Full Time';
      } else if (sport === 'cricket' && !isLive && !isComplete && ev.date) {
        gameClock = new Date(ev.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      let leagueGroup = 'other';
      if (sport === 'cricket') {
        const lnLower = (league.name || '').toLowerCase();
        const evNameLower = (ev.name || '').toLowerCase();
        // Also detect WC from event name as a fallback (e.g. "Final - ICC Women's World Cup")
        const evIsWorldCup = isCricketWorldCup || _wcCheck(evNameLower);
        if (lnLower.includes('indian premier') || lnLower.includes('ipl') || leagueName.toLowerCase().includes('ipl')) {
          leagueGroup = 'ipl';
          leaguePriority = 2;
        } else if (evIsWorldCup) {
          leagueGroup = 'worldcup';
          // Finals/Semis get sub-priority 0, group stage gets 1
          leaguePriority = (evNameLower.includes('final') || evNameLower.includes('semi')) ? 0 : 1;
        } else if (isInternational) {
          leagueGroup = 'international';
          leaguePriority = 5;
        } else {
          leagueGroup = 'domestic';
          leaguePriority = 10;
        }
      }
      matches.push({
        id: ev.id || ev.competitionId,
        team1: home.displayName || home.name || 'TBD',
        team1Full: home.displayName || home.name || 'TBD',
        score1: home.score || '',
        logo1: home.logo || `https://a.espncdn.com/i/teamlogos/${logoDomain}/500/${home.id}.png`,
        team2: away.displayName || away.name || 'TBD',
        team2Full: away.displayName || away.name || 'TBD',
        score2: away.score || '',
        logo2: away.logo || `https://a.espncdn.com/i/teamlogos/${logoDomain}/500/${away.id}.png`,
        status: isLive
          ? (status.summary || 'Live')
          : isComplete
            ? (status.longSummary || status.summary || 'Completed')
            : (status.summary || 'Scheduled'),
        isLive, isComplete,
        league: leagueName + (eventType ? ' \u2022 ' + eventType : ''),
        matchDesc: ev.title || ev.note || '',
        summary: status.longSummary || status.summary || '',
        potm: '', venue: '',
        date: ev.date || '',
        formattedDate,
        isInternational, intlClassId,
        leaguePriority,
        gameClock,
        leagueGroup,
      });
    }
  }
  return matches;
}

export function parseOpenF1Data(data) {
  if (!Array.isArray(data) || !data.length) return [];
  const now    = new Date();
  const sorted = data
    .filter(s => s.session_name === 'Race')
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  // Consider a session "past" only when its end time has passed (default +2h if no date_end)
  const sessionEnd = s => s.date_end
    ? new Date(s.date_end)
    : new Date(new Date(s.date_start).getTime() + 2 * 60 * 60 * 1000);
  const nextIdx    = sorted.findIndex(s => sessionEnd(s) > now);
  const recentPast = nextIdx > 0 ? sorted.slice(Math.max(0, nextIdx - 2), nextIdx) : [];
  const upcoming   = nextIdx >= 0 ? sorted.slice(nextIdx, nextIdx + 3) : sorted.slice(-3);
  return [...recentPast, ...upcoming].map(session => {
    const raceStart = new Date(session.date_start);
    const raceEnd   = sessionEnd(session);
    const isLive    = raceStart <= now && now <= raceEnd;
    const isPast    = raceEnd < now;
    const daysUntil = Math.ceil((raceStart - now) / (1000 * 60 * 60 * 24));
    const isToday   = raceStart.toDateString() === now.toDateString();
    const status    = isLive ? 'LIVE'
      : isPast    ? 'Completed'
      : isToday   ? 'TODAY'
      : daysUntil === 1 ? 'Tomorrow'
      : `In ${daysUntil} days`;
    const cc = (session.country_code || '').toLowerCase().slice(0, 2);
    return {
      id: session.session_key,
      team1: session.circuit_short_name || 'TBD',
      team1Full: `${session.circuit_short_name} Grand Prix`,
      score1: raceStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      logo1: '',
      team2: session.country_name || '',
      team2Full: `${session.location}, ${session.country_name}`,
      score2: raceStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      logo2: cc ? `https://flagcdn.com/48x36/${cc}.png` : '',
      status, isLive, isComplete: isPast,
      league: `Formula 1 \u2013 ${new Date().getFullYear()}`,
      formattedDate: '', gameClock: '', summary: '', potm: '', venue: '',
      leagueGroup: 'other', leaguePriority: 99,
      isInternational: false, intlClassId: 0, isF1: true,
    };
  });
}

// ─── Unified match fetcher with 60 s cache ───────────────────────────────────

const _matchCache = {};

export async function fetchSportMatches(sportId, forceRefresh = false) {
  const config = SPORT_CONFIG[sportId];
  if (!config) return [];
  const cached = _matchCache[sportId];
  if (!forceRefresh && cached && (Date.now() - cached.ts) < 60000) return cached.matches;
  try {
    const res = await fetch(config.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let matches = [];
    if      (config.type === 'cricket-header') matches = parseSportHeader(data, 'cricket');
    else if (config.type === 'soccer-header')  matches = parseSportHeader(data, 'soccer');
    else if (config.type === 'openf1')          matches = parseOpenF1Data(data);
    else                                        matches = parseESPNData(data);
    matches.sort((a, b) => {
      const lp = (a.leaguePriority || 99) - (b.leaguePriority || 99);
      if (lp !== 0) return lp;
      if (a.isInternational && !b.isInternational) return -1;
      if (!a.isInternational && b.isInternational) return 1;
      const stateOrder = m => m.isLive ? 0 : m.isComplete ? 1 : 2;
      const sd = stateOrder(a) - stateOrder(b);
      if (sd !== 0) return sd;
      if (a.date && b.date) return new Date(b.date) - new Date(a.date);
      return 0;
    });
    _matchCache[sportId] = { matches, ts: Date.now() };
    return matches;
  } catch {
    return _matchCache[sportId]?.matches || [];
  }
}

export function getAllCachedMatches() { return _matchCache; }

// ─── F1 Live Positions (OpenF1 /v1/position + /v1/drivers) ───────────────────

const _f1PosCache = { data: null, ts: 0 };

export async function fetchF1LivePositions() {
  if (_f1PosCache.data && (Date.now() - _f1PosCache.ts) < 10000) return _f1PosCache.data;
  try {
    const [posRes, drvRes] = await Promise.all([
      fetch('https://api.openf1.org/v1/position?session_key=latest'),
      fetch('https://api.openf1.org/v1/drivers?session_key=latest'),
    ]);
    if (!posRes.ok || !drvRes.ok) return _f1PosCache.data;
    const [positions, drivers] = await Promise.all([posRes.json(), drvRes.json()]);

    // Build driver info map
    const driverMap = {};
    for (const d of drivers) driverMap[d.driver_number] = d;

    // Keep only the latest position record per driver
    const latestPos = {};
    for (const p of positions) {
      const existing = latestPos[p.driver_number];
      if (!existing || new Date(p.date) > new Date(existing.date)) latestPos[p.driver_number] = p;
    }

    const leaderboard = Object.values(latestPos)
      .sort((a, b) => a.position - b.position)
      .map(p => ({
        position:     p.position,
        driverNumber: p.driver_number,
        name:         driverMap[p.driver_number]?.name_acronym || `#${p.driver_number}`,
        fullName:     driverMap[p.driver_number]?.full_name    || '',
        team:         driverMap[p.driver_number]?.team_name    || '',
        teamColor:    '#' + (driverMap[p.driver_number]?.team_colour || '444444'),
      }));

    const result = leaderboard.length ? leaderboard : null;
    _f1PosCache.data = result;
    _f1PosCache.ts   = Date.now();
    return result;
  } catch {
    return _f1PosCache.data;
  }
}

export async function fetchAllSportsMatches() {
  await Promise.allSettled(Object.keys(SPORT_CONFIG).map(id => fetchSportMatches(id)));
  return _matchCache;
}

// ─── Standings ───────────────────────────────────────────────────────────────

const _standingsCache = {};

export async function fetchStandingsData(sportId, leagueIdx = 0) {
  const configs = STANDINGS_CONFIG[sportId];
  if (!configs) return null;
  const cfg      = configs[leagueIdx];
  const cacheKey = `${sportId}_${cfg.id}`;
  const cached   = _standingsCache[cacheKey];
  if (cached && (Date.now() - cached.ts) < 300000) return { data: cached.data, cfg, configs };
  const sport = cfg.sport || 'soccer';
  const res   = await fetch(`https://site.api.espn.com/apis/v2/sports/${sport}/${cfg.id}/standings`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  _standingsCache[cacheKey] = { data, ts: Date.now() };
  return { data, cfg, configs };
}

// ─── F1 Championship Standings (Jolpica/Ergast) ──────────────────────────────

const _f1StandingsCache = { data: null, ts: 0 };

export async function fetchF1ChampionshipStandings() {
  if (_f1StandingsCache.data && (Date.now() - _f1StandingsCache.ts) < 300000) {
    return _f1StandingsCache.data;
  }
  try {
    const year = new Date().getFullYear();
    const [drvRes, ctRes] = await Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`),
    ]);
    if (!drvRes.ok || !ctRes.ok) return null;
    const [drvData, ctData] = await Promise.all([drvRes.json(), ctRes.json()]);
    const driverList      = drvData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    const constructorList = ctData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
    const result = {
      drivers: driverList.map(d => ({
        rank:        d.position,
        name:        `${d.Driver.givenName} ${d.Driver.familyName}`,
        code:        d.Driver.code || '',
        team:        d.Constructors?.[0]?.name || '',
        teamNat:     d.Constructors?.[0]?.nationality || '',
        points:      d.points,
        wins:        d.wins,
      })),
      constructors: constructorList.map(c => ({
        rank:   c.position,
        name:   c.Constructor.name,
        nat:    c.Constructor.nationality || '',
        points: c.points,
        wins:   c.wins,
      })),
    };
    _f1StandingsCache.data = result;
    _f1StandingsCache.ts   = Date.now();
    return result;
  } catch {
    return null;
  }
}

// ─── News ────────────────────────────────────────────────────────────────────

export async function fetchESPNHeadlines(sport = 'nfl', limit = 5) {
  const paths = {
    nfl: 'football/nfl', basketball: 'basketball/nba', baseball: 'baseball/mlb',
    soccer: 'soccer/eng.1', cricket: 'cricket/8676', hockey: 'hockey/nhl', tennis: 'tennis/atp',
  };
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${paths[sport] || 'football/nfl'}/news?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Legacy helpers (ScoresPage / mobile app) ────────────────────────────────

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ESPN_SPORT_PATHS = {
  cricket: 'cricket/8676', football: 'football/nfl', basketball: 'basketball/nba',
  baseball: 'baseball/mlb', soccer: 'soccer/eng.1', hockey: 'hockey/nhl',
};

export async function fetchESPNScoreboard(sport = 'basketball') {
  const path = ESPN_SPORT_PATHS[sport] || 'basketball/nba';
  const res  = await fetch(`${ESPN_BASE}/${path}/scoreboard`);
  if (!res.ok) throw new Error(`ESPN API error ${res.status}`);
  return res.json();
}

export function normalizeESPNGames(espnData, sport) {
  return (espnData?.events ?? []).map(event => {
    const comp        = event.competitions?.[0] ?? {};
    const competitors = comp.competitors ?? [];
    const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0] ?? {};
    const away = competitors.find(c => c.homeAway === 'away') ?? competitors[1] ?? {};
    return {
      id: event.id, sport,
      homeTeam: { id: home.team?.id, name: home.team?.displayName ?? 'Home', abbreviation: home.team?.abbreviation ?? '', logo: home.team?.logo ?? '' },
      awayTeam: { id: away.team?.id, name: away.team?.displayName ?? 'Away', abbreviation: away.team?.abbreviation ?? '', logo: away.team?.logo ?? '' },
      homeScore: parseInt(home.score ?? '0', 10),
      awayScore: parseInt(away.score ?? '0', 10),
      quarter: null,
      timeRemaining: event.status?.type?.shortDetail ?? '',
      isLive: event.status?.type?.name === 'STATUS_IN_PROGRESS',
      venue: comp.venue?.fullName ?? '',
    };
  });
}

export async function fetchESPNNews(sport = 'basketball', limit = 10) {
  const path = ESPN_SPORT_PATHS[sport] || 'basketball/nba';
  const res  = await fetch(`${ESPN_BASE}/${path}/news?limit=${limit}`);
  if (!res.ok) throw new Error(`ESPN API error ${res.status}`);
  return res.json();
}

// ─── AI Chat (AWS Bedrock via Lambda + API Gateway) ───────────────────────────

const CHAT_API_URL = 'https://cjer7mu9ek.execute-api.us-east-1.amazonaws.com/default/sports-hub-chat';

export async function sendChatMessage(message, sport = 'all') {
  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sport }),
  });
  if (!res.ok) throw new Error(`Chat API error ${res.status}`);
  return res.json();
}

// ─── Mock data ───────────────────────────────────────────────────────────────

export const MOCK_LIVE_GAMES = [
  { id: 'g1', sport: 'basketball', homeTeam: { id: 't1', name: 'Lakers',  abbreviation: 'LAL', logo: '' }, awayTeam: { id: 't2', name: 'Celtics', abbreviation: 'BOS', logo: '' }, homeScore: 98, awayScore: 101, quarter: 4, timeRemaining: '3:42', isLive: true,  venue: 'Crypto.com Arena' },
  { id: 'g2', sport: 'football',   homeTeam: { id: 't3', name: 'Chiefs',  abbreviation: 'KC',  logo: '' }, awayTeam: { id: 't4', name: '49ers',  abbreviation: 'SF',  logo: '' }, homeScore: 21, awayScore: 17,  quarter: 3, timeRemaining: '8:15', isLive: true,  venue: 'Arrowhead Stadium' },
];

export const MOCK_NEWS = [
  { id: 'n1', title: 'Lakers Rally Late to Defeat Celtics', summary: 'LeBron James delivered 38 points.', sport: 'basketball', author: 'ESPN', publishedAt: '2026-02-20T18:30:00Z', imageUrl: null, readingTime: 3 },
  { id: 'n2', title: 'Chiefs Defense Locks Down 49ers',     summary: 'Patrick Mahomes threw for 312 yards.', sport: 'football', author: 'ESPN', publishedAt: '2026-02-20T16:00:00Z', imageUrl: null, readingTime: 4 },
];
