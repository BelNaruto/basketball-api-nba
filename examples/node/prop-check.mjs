#!/usr/bin/env node
/**
 * Player prop check: hit rates + next-game projection (Node.js 18+, no dependencies)
 *
 * API:     https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/api-basketball-nba
 * Support: Telegram @pintoflow
 *
 *   export RAPIDAPI_KEY=your_key
 *   node prop-check.mjs <player name> <STAT> <line>
 *   node prop-check.mjs curry PTS 26.5
 *   node prop-check.mjs "jokic" PRA 50.5
 */
const HOST = 'api-basketball-nba.p.rapidapi.com';
const KEY = process.env.RAPIDAPI_KEY;
if (!KEY) { console.error('Set RAPIDAPI_KEY first: export RAPIDAPI_KEY=your_key'); process.exit(1); }

const [name = 'curry', stat = 'PTS', line = '26.5'] = process.argv.slice(2);

async function api(route, params) {
  const url = new URL(`https://${HOST}${route}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { 'x-rapidapi-host': HOST, 'x-rapidapi-key': KEY } });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error?.message || `HTTP ${res.status}`);
  return body.data;
}

const players = await api('/v2/players/search', { q: name });
if (!players.length) { console.log(`No active player found for "${name}".`); process.exit(0); }
const p = players[0];
console.log(`${p.name} (${p.team?.abbreviation}) – ${stat} ${line}\n`);

const [trends, proj] = await Promise.all([
  api(`/v2/players/${p.id}/trends`, { stat, line }),
  api(`/v2/players/${p.id}/projection`, { lines: `${stat}:${line}` }).catch(() => null),
]);

const row = (label, b) => b && console.log(`${label.padEnd(8)} avg ${String(b.average).padStart(5)}  over ${Math.round(b.overRate * 100)}% (${Math.round(b.overRate * b.games)}/${b.games})`);
row('Last 5', trends.last5); row('Last 10', trends.last10); row('Last 20', trends.last20);
row('Season', trends.season); row('Home', trends.home); row('Away', trends.away);
console.log(`Streak   ${trends.currentStreak || '–'}`);
console.log('Last 10  ' + (trends.recentGames || []).map((g) => `${g.value}${g.over ? '✓' : '✗'}`).join(' '));

const pr = proj?.projection?.[stat];
if (pr) {
  console.log(`\nNext game vs ${proj.nextGame?.opponent?.abbreviation}: projected ${pr.projected} ± ${pr.stdDev}`);
  console.log(`Over ${Math.round(pr.overProbability * 100)}% / Under ${Math.round(pr.underProbability * 100)}% → lean ${pr.lean?.toUpperCase()} (fair odds over ${pr.fairOdds?.over}, under ${pr.fairOdds?.under})`);
}
