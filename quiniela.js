/*
 * quiniela.js — predictions with model-backed odds and scoring.
 *
 * For each fixture the user calls Local / Empate / Visitante. When the fixture
 * is simulated locally we also show El Oráculo's win/draw/win probabilities and
 * can "play" the round to score the user's predictions (3 pts per hit).
 */

const QUINIELA = (() => {
  const KEY = "ligamx_quiniela_v2";
  let predictions = load();
  let matches = [];
  let played = null; // map id -> actual outcome after "jugar jornada"

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (_) { return {}; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(predictions)); }

  function oddsFor(match) {
    if (match.source !== "sim") return null;
    const h = TEAM_BY_ID[match.homeId], a = TEAM_BY_ID[match.awayId];
    if (!h || !a) return null;
    return ENGINE.matchProbabilities(h, a, 1500);
  }

  function pill(label, value, active, key) {
    return `<button class="q-pill ${active ? 'selected' : ''}" data-key="${key}">
              ${label}${value != null ? `<small>${Math.round(value * 100)}%</small>` : ""}
            </button>`;
  }

  function matchHtml(match) {
    const p = predictions[match.id];
    const odds = oddsFor(match);
    let resultTag = "";
    if (played && played[match.id]) {
      const actual = played[match.id];
      const hit = p === actual;
      resultTag = `<span class="q-result ${hit ? 'hit' : 'miss'}">
        ${hit ? "✓ +3" : "✗ 0"} · ${labelFor(actual)}</span>`;
    }
    return `
      <div class="q-card" data-id="${match.id}">
        <div class="q-teams">
          <span class="q-team"><img src="${match.homeLogo}" class="crest-sm" alt="">${match.home}</span>
          <span class="q-vs">vs</span>
          <span class="q-team q-team-r">${match.away}<img src="${match.awayLogo}" class="crest-sm" alt=""></span>
        </div>
        <div class="q-pills">
          ${pill("Local", odds?.home, p === "home", "home")}
          ${pill("Empate", odds?.draw, p === "draw", "draw")}
          ${pill("Visita", odds?.away, p === "away", "away")}
        </div>
        ${resultTag}
      </div>`;
  }

  function labelFor(k) { return k === "home" ? "Local" : k === "draw" ? "Empate" : "Visitante"; }

  async function render() {
    const container = document.getElementById("quiniela");
    if (!container) return;
    container.innerHTML = `<div class="loading"><div class="spinner"></div><p>Cargando jornada…</p></div>`;

    matches = await fetchLigaMxMatches();
    if (!matches.length) {
      container.innerHTML = `<p class="muted">No hay partidos disponibles ahora mismo.</p>`;
      return;
    }

    const canPlay = matches.every(m => m.source === "sim");
    const src = matches[0].source === "live" ? "En vivo (API-Football)" : "Jornada simulada";

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h2>Quiniela</h2>
          <p class="muted">Fuente: ${src} · Los % son de El Oráculo.</p>
        </div>
        ${canPlay ? `<button id="play-round" class="btn-primary">▶️ Jugar jornada</button>` : ""}
      </div>
      <div id="score-banner"></div>
      <div class="q-list">${matches.map(matchHtml).join("")}</div>`;

    container.querySelectorAll(".q-card").forEach(card => {
      card.querySelectorAll(".q-pill").forEach(btn => {
        btn.onclick = () => predict(card.dataset.id, btn.dataset.key);
      });
    });
    const playBtn = document.getElementById("play-round");
    if (playBtn) playBtn.onclick = playRound;
    renderScore();
  }

  function predict(id, key) {
    predictions[id] = key;
    save();
    played = null; // predictions changed; require replay
    rerenderCards();
    renderScore();
  }

  function playRound() {
    played = {};
    matches.forEach(m => {
      if (m.source !== "sim") return;
      const h = TEAM_BY_ID[m.homeId], a = TEAM_BY_ID[m.awayId];
      const r = ENGINE.simMatch(h, a);
      played[m.id] = r.hg > r.ag ? "home" : r.hg < r.ag ? "away" : "draw";
    });
    rerenderCards();
    renderScore(true);
    APP.celebrate(0.4);
  }

  function rerenderCards() {
    const list = document.querySelector(".q-list");
    if (list) list.innerHTML = matches.map(matchHtml).join("");
    document.querySelectorAll(".q-card").forEach(card => {
      card.querySelectorAll(".q-pill").forEach(btn => {
        btn.onclick = () => predict(card.dataset.id, btn.dataset.key);
      });
    });
  }

  function renderScore(animate) {
    const banner = document.getElementById("score-banner");
    if (!banner) return;
    const picked = matches.filter(m => predictions[m.id]).length;
    if (!played) {
      banner.innerHTML = `<div class="score-line">Pronósticos: <strong>${picked}/${matches.length}</strong></div>`;
      return;
    }
    let hits = 0;
    matches.forEach(m => { if (played[m.id] && predictions[m.id] === played[m.id]) hits++; });
    banner.innerHTML = `
      <div class="score-line ${animate ? 'pop' : ''}">
        Aciertos: <strong>${hits}/${matches.length}</strong> · Puntos: <strong>${hits * 3}</strong>
      </div>`;
  }

  return { render };
})();
