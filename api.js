/*
 * api.js — fixture data source.
 *
 * Tries the live API-Football feed first, then transparently falls back to a
 * locally simulated round of fixtures so the Quiniela always works — even with
 * no network, no key, or a rate-limited plan. Returns a normalized shape:
 *   { id, home, homeLogo, away, awayLogo, status, source }
 */

const API_KEY = "ff5d12243e17e33b9b4430d302145cdc";
const BASE_URL = "https://v3.football.api-sports.io";

async function fetchLigaMxMatches() {
  try {
    const res = await fetch(`${BASE_URL}/fixtures?league=262&season=2025`, {
      headers: { "x-apisports-key": API_KEY }
    });
    const data = await res.json();
    if (data.response && Array.isArray(data.response) && data.response.length) {
      return data.response.slice(0, 9).map(item => ({
        id: item.fixture.id,
        home: item.teams.home.name,
        homeLogo: item.teams.home.logo,
        away: item.teams.away.name,
        awayLogo: item.teams.away.logo,
        status: item.fixture.status.short,
        source: "live"
      }));
    }
    console.warn("API returned no fixtures, using simulated round.", data);
  } catch (err) {
    console.warn("API unreachable, using simulated round.", err);
  }
  return simulatedRound();
}

/** Generate a plausible full round (9 matches) from the local club set. */
function simulatedRound() {
  const pool = [...TEAMS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const matches = [];
  for (let i = 0; i + 1 < pool.length; i += 2) {
    const home = pool[i], away = pool[i + 1];
    matches.push({
      id: `sim-${home.id}-${away.id}`,
      home: home.name,
      homeLogo: crestFor(home),
      away: away.name,
      awayLogo: crestFor(away),
      status: "NS",
      source: "sim",
      homeId: home.id,
      awayId: away.id
    });
  }
  return matches;
}
