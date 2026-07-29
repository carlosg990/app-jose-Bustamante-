/*
 * fantasy.js — salary-cap Fantasy builder.
 *
 * Draft up to 5 clubs under a fixed budget. Each club is priced by its power
 * rating, and your squad's projected weekly points are derived from the same
 * simulation model (expected goals scored/conceded across a random fixture).
 */

const FANTASY = (() => {
  const KEY = "ligamx_fantasy_v2";
  const BUDGET = 300;         // millions
  const MAX_PICKS = 5;

  let squad = load();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return saved.filter(id => TEAM_BY_ID[id]);
    } catch (_) {}
    return [];
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(squad)); }

  /** Price a club: power rating mapped to 20M–95M. */
  function priceOf(team) {
    return Math.round(20 + (teamPower(team) / 100) * 75);
  }

  /** Projected weekly fantasy points for one club (goals + clean-sheet + form). */
  function projectedPoints(team) {
    const gf = ENGINE.BASE_GOALS * team.att;              // expected goals for
    const gc = ENGINE.BASE_GOALS * team.def;              // expected goals against
    const cleanSheet = Math.exp(-gc);                      // P(0 conceded)
    return +(gf * 4 + cleanSheet * 5 - gc * 1.5 + 3).toFixed(1);
  }

  const spent = () => squad.reduce((s, id) => s + priceOf(TEAM_BY_ID[id]), 0);
  const projected = () => squad.reduce((s, id) => s + projectedPoints(TEAM_BY_ID[id]), 0);

  function toggle(id) {
    const team = TEAM_BY_ID[id];
    const i = squad.indexOf(id);
    if (i > -1) {
      squad.splice(i, 1);
    } else {
      if (squad.length >= MAX_PICKS) return flash(`Máximo ${MAX_PICKS} clubes.`);
      if (spent() + priceOf(team) > BUDGET) return flash("Presupuesto insuficiente 💸");
      squad.push(id);
    }
    save();
    render();
  }

  let flashMsg = "";
  function flash(msg) { flashMsg = msg; render(); setTimeout(() => { flashMsg = ""; }, 1800); }

  function cardHtml(team) {
    const price = priceOf(team);
    const pts = projectedPoints(team);
    const picked = squad.includes(team.id);
    const affordable = picked || (spent() + price <= BUDGET && squad.length < MAX_PICKS);
    return `
      <button class="fantasy-card ${picked ? 'picked' : ''} ${affordable ? '' : 'locked'}"
              data-team="${team.id}" ${affordable ? '' : 'disabled'}
              style="--team:${team.color}">
        <img src="${crestFor(team)}" class="crest-md" alt="">
        <span class="fc-name">${team.name}</span>
        <div class="fc-stats">
          <span class="fc-price">$${price}M</span>
          <span class="fc-pts">${pts} pts</span>
        </div>
      </button>`;
  }

  function render() {
    const container = document.getElementById("fantasy");
    if (!container) return;
    const remaining = BUDGET - spent();
    const budgetPct = Math.min(100, (spent() / BUDGET) * 100);

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h2>Fantasy</h2>
          <p class="muted">Arma tu escuadra de ${MAX_PICKS} clubes bajo presupuesto.</p>
        </div>
      </div>

      <div class="fantasy-dash">
        <div class="stat">
          <span class="stat-label">Presupuesto</span>
          <span class="stat-value">$${remaining}M<small>/ $${BUDGET}M</small></span>
          <div class="budget-track"><div class="budget-bar" style="width:${budgetPct}%"></div></div>
        </div>
        <div class="stat">
          <span class="stat-label">Escuadra</span>
          <span class="stat-value">${squad.length}<small>/ ${MAX_PICKS}</small></span>
        </div>
        <div class="stat highlight">
          <span class="stat-label">Puntos proyectados</span>
          <span class="stat-value">${projected().toFixed(1)}</span>
        </div>
      </div>

      ${flashMsg ? `<div class="flash">${flashMsg}</div>` : ""}

      <div class="fantasy-grid">
        ${TEAMS.map(cardHtml).join("")}
      </div>`;

    container.querySelectorAll(".fantasy-card:not(.locked)").forEach(btn => {
      btn.onclick = () => toggle(btn.dataset.team);
    });
  }

  return { render };
})();
