/*
 * standings.js — the live league table.
 *
 * Holds a single simulated regular season in memory (persisted to
 * localStorage) and renders it. Users can re-roll the whole season and watch
 * the rows animate into their new positions. The top 8 here seed the Liguilla.
 */

const STANDINGS = (() => {
  const KEY = "ligamx_standings_v2";
  let rows = load();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved) && saved.length === TEAMS.length) {
        return saved.map(r => ({ ...r, team: TEAM_BY_ID[r.teamId] }));
      }
    } catch (_) { /* fall through */ }
    return freshSeason();
  }

  function freshSeason() {
    const table = ENGINE.simSeason(TEAMS);
    save(table);
    return table;
  }

  function save(table) {
    const slim = table.map(r => ({
      teamId: r.team.id, pj: r.pj, g: r.g, e: r.e, p: r.p,
      gf: r.gf, gc: r.gc, pts: r.pts
    }));
    localStorage.setItem(KEY, JSON.stringify(slim));
  }

  function getSeeds() {
    return rows.slice(0, 8).map(r => r.team);
  }

  function zoneClass(index) {
    if (index < 6) return "zone-direct";   // direct to Liguilla
    if (index < 8) return "zone-play";      // play-in / last two spots
    return "";
  }

  function rowHtml(r, i) {
    const gd = r.gf - r.gc;
    return `
      <tr data-team="${r.team.id}" class="${zoneClass(i)}">
        <td class="pos">${i + 1}</td>
        <td class="club">
          <img src="${crestFor(r.team)}" alt="${r.team.name}" class="crest-sm">
          <span>${r.team.name}</span>
        </td>
        <td>${r.pj}</td>
        <td class="hide-sm">${r.g}</td>
        <td class="hide-sm">${r.e}</td>
        <td class="hide-sm">${r.p}</td>
        <td class="hide-sm">${r.gf}:${r.gc}</td>
        <td class="${gd >= 0 ? 'gd-pos' : 'gd-neg'}">${gd >= 0 ? '+' : ''}${gd}</td>
        <td class="pts">${r.pts}</td>
      </tr>`;
  }

  function render() {
    const container = document.getElementById("standings");
    if (!container) return;
    container.innerHTML = `
      <div class="section-head">
        <div>
          <h2>Tabla General</h2>
          <p class="muted">Temporada simulada · 17 jornadas · <span class="chip chip-direct">1–6 directo</span> <span class="chip chip-play">7–8 repechaje</span></p>
        </div>
        <button id="sim-season" class="btn-primary">🎲 Simular temporada</button>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th><th class="club-h">Club</th><th>PJ</th>
              <th class="hide-sm">G</th><th class="hide-sm">E</th><th class="hide-sm">P</th>
              <th class="hide-sm">Goles</th><th>DIF</th><th>PTS</th>
            </tr>
          </thead>
          <tbody id="standings-body">
            ${rows.map(rowHtml).join("")}
          </tbody>
        </table>
      </div>`;

    document.getElementById("sim-season").onclick = simulateSeason;
  }

  function simulateSeason() {
    const btn = document.getElementById("sim-season");
    btn.disabled = true;
    btn.textContent = "Simulando…";

    // FLIP animation: record old positions, re-rank, animate to new ones.
    const body = document.getElementById("standings-body");
    const first = new Map();
    [...body.children].forEach(tr =>
      first.set(tr.dataset.team, tr.getBoundingClientRect().top));

    rows = ENGINE.simSeason(TEAMS);
    save(rows);
    body.innerHTML = rows.map(rowHtml).join("");

    [...body.children].forEach(tr => {
      const last = tr.getBoundingClientRect().top;
      const delta = (first.get(tr.dataset.team) ?? last) - last;
      if (delta) {
        tr.style.transform = `translateY(${delta}px)`;
        tr.style.transition = "transform 0s";
        requestAnimationFrame(() => {
          tr.style.transition = "transform .6s cubic-bezier(.4,0,.2,1)";
          tr.style.transform = "";
        });
      }
    });

    // Let dependent views know the seeds changed.
    document.dispatchEvent(new CustomEvent("standings:updated"));

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "🎲 Simular temporada";
    }, 650);
  }

  return { render, getSeeds, simulateSeason };
})();
