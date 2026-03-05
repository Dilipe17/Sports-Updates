/**
 * AWS Lambda – Sports AI Chat
 *
 * Flow:
 *   Mobile app  →  API Gateway  →  This Lambda
 *     1. Fetches live scores + headlines from ESPN's free public API
 *     2. Builds a context-aware prompt
 *     3. Calls AWS Bedrock (Claude 3 Haiku) for the AI response
 *     4. Returns { reply } to the mobile app
 *
 * Required IAM permissions for the Lambda execution role:
 *   - bedrock:InvokeModel  (on resource: arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku*)
 */

'use strict';

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// ─── ESPN helpers ─────────────────────────────────────────────────────────────

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const ESPN_SPORT_PATHS = {
  football:   'football/nfl',
  basketball: 'basketball/nba',
  baseball:   'baseball/mlb',
  soccer:     'soccer/eng.1',
  hockey:     'hockey/nhl',
  all:        'basketball/nba',   // sensible default when no sport selected
};

/**
 * Build a plain-text sports context string from live ESPN data.
 * Returns a best-effort result — never throws so the chat still works
 * even when ESPN is temporarily unavailable.
 */
async function buildSportsContext(sport) {
  try {
    const path = ESPN_SPORT_PATHS[sport] || 'basketball/nba';

    const [scoresRes, newsRes] = await Promise.all([
      fetch(`${ESPN_BASE}/${path}/scoreboard`),
      fetch(`${ESPN_BASE}/${path}/news?limit=5`),
    ]);

    let context = '';

    // ── Scores ──
    if (scoresRes.ok) {
      const scores = await scoresRes.json();
      const events = scores.events || [];

      if (events.length > 0) {
        context += 'CURRENT SCORES:\n';
        events.slice(0, 6).forEach((event) => {
          const comp = event.competitions?.[0];
          const home = comp?.competitors?.find((c) => c.homeAway === 'home');
          const away = comp?.competitors?.find((c) => c.homeAway === 'away');
          const status = event.status?.type?.shortDetail || event.status?.type?.description || '';
          if (home && away) {
            context += `  ${away.team.displayName} ${away.score ?? '-'} @ ${home.team.displayName} ${home.score ?? '-'}  (${status})\n`;
          }
        });
        context += '\n';
      }
    }

    // ── News ──
    if (newsRes.ok) {
      const news = await newsRes.json();
      const articles = news.articles || [];

      if (articles.length > 0) {
        context += 'RECENT HEADLINES:\n';
        articles.slice(0, 5).forEach((a) => {
          context += `  - ${a.headline}\n`;
        });
      }
    }

    return context.trim() || 'No live sports data available right now.';
  } catch (err) {
    console.warn('ESPN fetch failed:', err.message);
    return 'Live sports data is temporarily unavailable.';
  }
}

// ─── CORS headers ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { message, sport = 'all' } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'message is required' }),
      };
    }

    // 1. Fetch live sports context from ESPN
    const sportsContext = await buildSportsContext(sport);

    // 2. Build prompt
    const prompt = [
      'You are a friendly, knowledgeable sports assistant inside a mobile sports app.',
      'You have access to live sports data provided below.',
      'Answer the user\'s question in a conversational, concise way (2–4 sentences max).',
      'If the data does not contain the answer, say so honestly.',
      '',
      `LIVE SPORTS DATA (as of ${new Date().toUTCString()}):`,
      sportsContext,
      '',
      `User: ${message.trim()}`,
    ].join('\n');

    // 3. Call Bedrock – Claude 3 Haiku (fastest + cheapest Claude model)
    const bedrockResponse = await bedrock.send(
      new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      }),
    );

    const parsed = JSON.parse(Buffer.from(bedrockResponse.body).toString());
    const reply = parsed.content?.[0]?.text?.trim() || 'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error('Lambda error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error', detail: err.message }),
    };
  }
};
