/*
 * bracket.js — the Liguilla playoff predictor + "El Oráculo".
 *
 * Left: an interactive 8-team bracket seeded from the live standings. Pick a
 * winner in each tie and later rounds auto-populate. Right: El Oráculo runs
 * thousands of full simulations to show every club's title probability.
 */

const BRACKET = (() => {
  const KEY = "ligamx_bracket_v2";

  // picks[roundIndex][matchIndex] = winning team id
  let picks = load();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && typeof saved === "object") return saved;
    } catch (_) {}
    return {};
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(picks)); }

  const ROUND_NAMES = ["Cuartos de Final", "Semifinales", "Gran Final", "Campeón"];

  /** Build the rounds structure from seeds + current picks. */
  function buildRounds() {
    const seeds = STANDINGS.getSeeds();
    const rounds = [];
    let current = seeds.slice(0, 8);

    for (let r = 0; current.length > 1; r++) {
      const matches = [];
      for (let m = 0; m < current.length / 2; m++) {
        const home = current[m];
        const away = current[current.length - 1 - m];
        const winnerId = picks[r]?.[m];
        const valid = winnerId === home?.id || winnerId === away?.id;
        matches.push({ home, away, winner: valid ? TEAM_BY_ID[winnerId] : null });
      }
      rounds.push({ name: ROUND_NAMES[r], matches });
      // next round advances only where a valid pick exists
      current = matches.map(x => x.winner).filter(Boolean);
      if (current.length < matches.length) break; // stop building past incomplete round
    }
    return rounds;
  }

  function teamSlot(team, m, r, isWinner) {
    if (!team) return `<div class="slot empty">Por definir</div>`;
    return `
      <button class="slot ${isWinner ? 'slot-win' : ''}" data-round="${r}" data-match="${m}" data-team="${team.id}">
        <img src="${crestFor(team)}" class="crest-sm" alt="">
        <span>${team.name}</span>
      </button>`;
  }

  function render() {
    const container = document.getElementById("bracket");
    if (!container) return;
    const rounds = buildRounds();
    const champ = championFromPicks(rounds);

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h2>Liguilla</h2>
          <p class="muted">Sembrado con la tabla actual. Elige a tus ganadores.</p>
        </div>
        <button id="auto-fill" class="btn-ghost">⚡ Auto-simular</button>
      </div>

      <div class="liguilla-grid">
        <div class="bracket">
          ${rounds.map((round, r) => `
            <div class="round">
              <div class="round-title">${round.name}</div>
              ${round.matches.map((mt, m) => `
                <div class="tie">
                  ${teamSlot(mt.home, m, r, mt.winner?.id === mt.home?.id)}
                  ${teamSlot(mt.away, m, r, mt.winner?.id === mt.away?.id)}
                </div>`).join("")}
            </div>`).join("")}
          <div class="round champ-col">
            <div class="round-title">Campeón</div>
            <div class="champ-box ${champ ? 'has-champ' : ''}">
              ${champ ? `
                <img src="${crestFor(champ)}" class="crest-lg" alt="">
                <strong>${champ.name}</strong>
                <span class="muted">¡Tu campeón!</span>` : `<span class="muted">Completa el bracket</span>`}
            </div>
          </div>
        </div>

        <aside class="oracle">
          <h3>🔮 El Oráculo</h3>
          <p class="muted">Simula miles de temporadas + Liguillas para estimar la probabilidad real de título de cada club.</p>
          <div class="oracle-controls">
            <label>Simulaciones: <strong id="run-label">2000</strong></label>
            <input type="range" id="run-count" min="500" max="10000" step="500" value="2000">
            <button id="run-oracle" class="btn-primary">Consultar al Oráculo</button>
          </div>
          <div id="oracle-progress" class="progress hidden"><div class="progress-bar"></div></div>
          <div id="oracle-results" class="oracle-results"></div>
        </aside>
      </div>`;

    container.querySelectorAll(".slot:not(.empty)").forEach(btn => {
      btn.onclick = () => pick(+btn.dataset.round, +btn.dataset.match, btn.dataset.team);
    });
    document.getElementById("auto-fill").onclick = autoFill;

    const slider = document.getElementById("run-count");
    slider.oninput = () => document.getElementById("run-label").textContent = slider.value;
    document.getElementById("run-oracle").onclick = () => runOracle(+slider.value);
    if (lastOracle) paintOracle(lastOracle);
  }

  function championFromPicks(rounds) {
    const finalRound = rounds.find(r => r.name === "Gran Final");
    return finalRound && finalRound.matches[0]?.winner || null;
  }

  function pick(r, m, teamId) {
    picks[r] = picks[r] || {};
    picks[r][m] = teamId;
    // Invalidate later rounds — their participants may have changed.
    Object.keys(picks).map(Number).filter(k => k > r).forEach(k => delete picks[k]);
    save();
    render();
    const rounds = buildRounds();
    if (championFromPicks(rounds)) APP.celebrate();
  }

  function autoFill() {
    const seeds = STANDINGS.getSeeds();
    const { rounds } = ENGINE.simLiguilla(seeds);
    picks = {};
    rounds.forEach((round, r) => {
      picks[r] = {};
      round.winners.forEach((w, m) => { picks[r][m] = w.id; });
    });
    save();
    render();
    APP.celebrate();
  }

  // ----- El Oráculo -----
  let lastOracle = null;

  async function runOracle(runs) {
    const bar = document.querySelector("#oracle-progress .progress-bar");
    const prog = document.getElementById("oracle-progress");
    const btn = document.getElementById("run-oracle");
    prog.classList.remove("hidden");
    btn.disabled = true;
    btn.textContent = "Consultando…";

    const results = await ENGINE.championshipOdds(TEAMS, runs, (done, total) => {
      bar.style.width = `${Math.round((done / total) * 100)}%`;
    });

    lastOracle = results;
    paintOracle(results);
    btn.disabled = false;
    btn.textContent = "Consultar al Oráculo";
    setTimeout(() => prog.classList.add("hidden"), 400);
  }

  function paintOracle(results) {
    const box = document.getElementById("oracle-results");
    if (!box) return;
    const max = results[0].title || 1;
    box.innerHTML = results.slice(0, 10).map((r, i) => `
      <div class="odds-row" style="animation-delay:${i * 40}ms">
        <span class="odds-rank">${i + 1}</span>
        <img src="${crestFor(r.team)}" class="crest-sm" alt="">
        <span class="odds-name">${r.team.name}</span>
        <div class="odds-bar-track">
          <div class="odds-bar" style="width:${(r.title / max) * 100}%"></div>
        </div>
        <span class="odds-pct">${(r.title * 100).toFixed(1)}%</span>
      </div>`).join("");
  }

  // Re-seed the bracket whenever the standings change.
  document.addEventListener("standings:updated", () => {
    picks = {};
    save();
    const container = document.getElementById("bracket");
    if (container && container.innerHTML) render();
  });

  return { render };
})();
