#!/usr/bin/env node
/**
 * Today's NBA predictions in your terminal (Node.js 18+, no dependencies)
 *
 * API:     https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/api-basketball-nba
 * Support: Telegram @pintoflow
 *
 *   export RAPIDAPI_KEY=your_key
 *   node todays-predictions.mjs [YYYYMMDD] [league]
 *   node todays-predictions.mjs 20260410 nba
 */
const HOST = 'api-basketball-nba.p.rapidapi.com';
const KEY = process.env.RAPIDAPI_KEY;
if (!KEY) { console.error('Set RAPIDAPI_KEY first: export RAPIDAPI_KEY=your_key'); process.exit(1); }

const [date, league = 'nba'] = process.argv.slice(2);
const pct = (x) => (x == null ? '  –  ' : (x * 100).toFixed(0).padStart(3) + '%');

const url = new URL(`https://${HOST}/v2/predictions`);
url.searchParams.set('league', league);
if (date) url.searchParams.set('date', date);

const res = await fetch(url, { headers: { 'x-rapidapi-host': HOST, 'x-rapidapi-key': KEY } });
const body = await res.json();
if (!res.ok || body.error) { console.error(body.error?.message || `HTTP ${res.status}`); process.exit(1); }

const { data, meta } = body;
console.log(`${league.toUpperCase()} predictions for ${meta.date || 'today'} (${data.length} games)\n`);
for (const g of data) {
  const p = g.prediction;
  const score = g.status?.state === 'pre' ? '' : `  [${g.away.score}-${g.home.score} ${g.status.shortDetail}]`;
  if (!p) { console.log(`${g.shortName}${score}  – no prediction`); continue; }
  const fav = p.predictedWinnerId === g.home.id ? g.home.abbreviation : g.away.abbreviation;
  const value = p.market?.edge?.valueSide ? `  VALUE: ${p.market.edge.valueSide === 'home' ? g.home.abbreviation : g.away.abbreviation}` : '';
  console.log(
    `${g.shortName.padEnd(12)} ${g.away.abbreviation} ${pct(p.away.winProbability)} | ${g.home.abbreviation} ${pct(p.home.winProbability)}` +
    `  proj ${p.away.projectedScore}-${p.home.projectedScore}  total ${p.projectedTotal}  pick ${fav} (${p.confidence})${value}${score}`,
  );
}
if (meta.record?.total) console.log(`\nPicks correct: ${meta.record.correct}/${meta.record.total}`);
