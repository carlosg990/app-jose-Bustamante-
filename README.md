# ⚽🔮 Liga MX Oráculo

A **Fan Command Center** for Liga MX, powered by a home-grown **Monte Carlo simulation engine**. Simulate entire seasons, build your Liguilla bracket, draft a salary-cap Fantasy squad, and play the Quiniela — all with real probabilities generated on the fly, right in your browser. No build step, no backend, no dependencies.

![Liga MX](https://img.shields.io/badge/Liga_MX-Or%C3%A1culo-10b981?style=for-the-badge&logo=soccer&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-yellow?style=for-the-badge&logo=javascript)
![Engine](https://img.shields.io/badge/Monte_Carlo-Poisson-blueviolet?style=for-the-badge)

---

## ✨ Features

- 🏠 **Dashboard** — Power Rankings with animated bars and a live "featured match" predictor showing expected goals (xG) and win/draw/win probabilities.
- 📊 **Tabla General** — A full 18-club regular season you can re-simulate with one click; rows animate (FLIP) into their new positions. Top 6 qualify directly, 7–8 to the repechaje.
- 🏆 **Liguilla + El Oráculo** — An interactive 8-team bracket seeded from the live table, plus **El Oráculo**: run thousands of full season + playoff simulations to estimate every club's real **championship probability**.
- ⚽ **Fantasy** — A salary-cap draft. Pick up to 5 clubs under budget; projected points are derived from the same simulation model (expected goals + clean-sheet probability).
- 🎯 **Quiniela** — Live fixtures from API-Football with a seamless **offline fallback** to a locally simulated round, model-backed odds per match, and a "play the round" scoring mode.
- 🎉 Confetti, glassmorphism, dark UI, and full mobile responsiveness.

---

## 🧠 The Engine (`engine.js`)

Goals are modelled as independent **Poisson** processes. Each club has an attack multiplier and a defense multiplier; combined with a home-advantage factor they produce an expected-goals rate `λ`, which is sampled via Knuth's algorithm:

```
λ_home = BASE · att_home · def_away · HOME_ADV
λ_away = BASE · att_away · def_home
```

From that single primitive the engine builds:

- `matchProbabilities()` — sampled win/draw/loss odds for any pairing.
- `simSeason()` — a full single round-robin, ranked by points → goal difference → goals for.
- `simLiguilla()` — an 8-team knockout with standard reseeding.
- `championshipOdds()` — thousands of season+playoff runs, chunked with `requestAnimationFrame` so the UI never freezes and a progress bar animates live.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (custom properties, glassmorphism, FLIP + canvas animations)
- **Simulation:** Custom Poisson Monte Carlo engine
- **Live data:** [API-Football v3](https://www.api-football.com/) with automatic offline fallback
- **State:** Browser `localStorage`

---

## 📁 Project Structure

| File | Responsibility |
|------|----------------|
| `data.js` | 18-club database, SVG crest generator, power ratings |
| `engine.js` | Poisson Monte Carlo simulation engine |
| `standings.js` | Live table + animated season simulation |
| `bracket.js` | Liguilla bracket + El Oráculo championship odds |
| `fantasy.js` | Salary-cap squad builder |
| `api.js` / `quiniela.js` | Fixture source (live + fallback) and predictions |
| `app.js` | Shell: navigation, dashboard, confetti, bootstrap |
| `index.html` / `styles.css` | Layout and design system |

---

## 🚀 Quick Start

No install required — it's pure static files.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/liga-mx-app.git
   cd liga-mx-app
   ```
2. **Open it.** Double-click `index.html`, or serve it locally for the live API:
   ```bash
   npx serve .
   ```
3. Head to **Liguilla → Consultar al Oráculo** and watch the title race unfold. 🔮

> Ratings and simulations are illustrative and not official Liga MX data.
