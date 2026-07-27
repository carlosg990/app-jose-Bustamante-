// js/api.js
const API_KEY = "ff5d12243e17e33b9b4430d302145cdc";
const BASE_URL = "https://v3.football.api-sports.io";

async function fetchLigaMxMatches() {
  try {
    const response = await fetch(`${BASE_URL}/fixtures?league=262&season=2025`, {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });

    const data = await response.json();
    
    // Map API structure to a simplified format for your app
    return data.response.map(item => ({
      id: item.fixture.id,
      home: item.teams.home.name,
      homeLogo: item.teams.home.logo,
      away: item.teams.away.name,
      awayLogo: item.teams.away.logo,
      status: item.fixture.status.short
    }));
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return [];
  }
}
