/*
 * app.js — application shell: navigation, dashboard, confetti, bootstrap.
 */

const APP = (() => {
  const SECTIONS = ["dashboard", "standings", "bracket", "fantasy", "quiniela"];
  let quinielaLoaded = false;

  function showSection(id) {
    SECTIONS.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.toggle("active-section", s === id);
    });
    document.querySelectorAll(".nav-btn").forEach(btn =>
      btn.classList.toggle("active", btn.dataset.section === id));

    if (id === "quiniela" && !quinielaLoaded) {
      quinielaLoaded = true;
      QUINIELA.render();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- Dashboard -----
  function renderDashboard() {
    const el = document.getElementById("dashboard");
    if (!el) return;
    const ranked = [...TEAMS].sort((a, b) => teamPower(b) - teamPower(a));
    const maxP = teamPower(ranked[0]);
    const featured = pickFeatured(ranked);
    const odds = ENGINE.matchProbabilities(featured.home, featured.away, 3000);

    el.innerHTML = `
      <section class="hero">
        <div class="hero-badge">Temporada 2025 · Powered by El Oráculo</div>
        <h2 class="hero-title">Predice cada jugada de la <span>Liga MX</span></h2>
        <p class="hero-sub">Simula temporadas completas, arma tu Liguilla, drafteá tu Fantasy y compite en la Quiniela — todo impulsado por un motor de simulación Monte Carlo.</p>
        <div class="hero-cta">
          <button class="btn-primary" data-go="bracket">🔮 Consultar al Oráculo</button>
          <button class="btn-ghost" data-go="standings">Ver la tabla</button>
        </div>
      </section>

      <div class="dash-grid">
        <div class="panel">
          <h3>⚡ Power Rankings</h3>
          <div class="power-list">
            ${ranked.map((t, i) => {
              const p = teamPower(t);
              return `
                <div class="power-row" style="animation-delay:${i * 30}ms">
                  <span class="power-rank">${i + 1}</span>
                  <img src="${crestFor(t)}" class="crest-sm" alt="">
                  <span class="power-name">${t.name}</span>
                  <div class="power-track"><div class="power-bar" style="width:${(p / maxP) * 100}%;background:${t.color}"></div></div>
                  <span class="power-val">${p}</span>
                </div>`;
            }).join("")}
          </div>
        </div>

        <div class="panel featured">
          <h3>🎯 Partido destacado</h3>
          <div class="featured-match">
            <div class="fm-team">
              <img src="${crestFor(featured.home)}" class="crest-lg" alt="">
              <strong>${featured.home.name}</strong>
              <span class="fm-xg">${odds.xgHome.toFixed(2)} xG</span>
            </div>
            <div class="fm-mid">
              <span class="fm-vs">VS</span>
              <div class="fm-odds">
                <div><span>${Math.round(odds.home * 100)}%</span><small>Local</small></div>
                <div><span>${Math.round(odds.draw * 100)}%</span><small>Empate</small></div>
                <div><span>${Math.round(odds.away * 100)}%</span><small>Visita</small></div>
              </div>
            </div>
            <div class="fm-team">
              <img src="${crestFor(featured.away)}" class="crest-lg" alt="">
              <strong>${featured.away.name}</strong>
              <span class="fm-xg">${odds.xgAway.toFixed(2)} xG</span>
            </div>
          </div>
          <div class="odds-split">
            <div class="split-home" style="width:${odds.home * 100}%"></div>
            <div class="split-draw" style="width:${odds.draw * 100}%"></div>
            <div class="split-away" style="width:${odds.away * 100}%"></div>
          </div>
          <button class="btn-ghost full" id="reroll-featured">🔁 Otro partido</button>
        </div>
      </div>`;

    el.querySelectorAll("[data-go]").forEach(b => b.onclick = () => showSection(b.dataset.go));
    const reroll = document.getElementById("reroll-featured");
    if (reroll) reroll.onclick = renderDashboard;
  }

  function pickFeatured(ranked) {
    const top = ranked.slice(0, 8);
    let a = top[Math.floor(Math.random() * top.length)];
    let b = top[Math.floor(Math.random() * top.length)];
    while (b === a) b = top[Math.floor(Math.random() * top.length)];
    return { home: a, away: b };
  }

  // ----- Confetti -----
  let cv, ctx, pieces = [], raf = null;
  function ensureCanvas() {
    if (cv) return;
    cv = document.getElementById("confetti");
    ctx = cv.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }
  function resize() {
    if (!cv) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }
  function celebrate(intensity = 1) {
    ensureCanvas();
    const colors = ["#10b981", "#34d399", "#ffd400", "#0a4aa0", "#d81e2c", "#ffffff"];
    const count = Math.round(140 * intensity);
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: Math.random() * cv.width,
        y: -20 - Math.random() * cv.height * 0.3,
        r: 4 + Math.random() * 6,
        c: colors[Math.floor(Math.random() * colors.length)],
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: -0.2 + Math.random() * 0.4,
        life: 100 + Math.random() * 60
      });
    }
    if (!raf) tick();
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rot += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    pieces = pieces.filter(p => p.life > 0 && p.y < cv.height + 40);
    if (pieces.length) { raf = requestAnimationFrame(tick); }
    else { ctx.clearRect(0, 0, cv.width, cv.height); raf = null; }
  }

  function init() {
    document.querySelectorAll(".nav-btn").forEach(btn =>
      btn.onclick = () => showSection(btn.dataset.section));
    renderDashboard();
    STANDINGS.render();
    BRACKET.render();
    FANTASY.render();
    showSection("dashboard");
  }

  document.addEventListener("DOMContentLoaded", init);
  return { showSection, celebrate, renderDashboard };
})();
