/*
 * engine.js — "El Oráculo" prediction engine.
 *
 * A lightweight, dependency-free Monte Carlo simulator for Liga MX.
 * Goals are modelled as independent Poisson processes whose rate (lambda)
 * is derived from each club's attack/defense multipliers plus home advantage.
 * Everything here is pure — no DOM, no storage — so it can be reasoned about
 * and tested in isolation.
 */

const ENGINE = (() => {
  const BASE_GOALS = 1.35;   // league-average goals per team per match
  const HOME_ADV   = 1.15;   // home scoring boost

  /** Draw a sample from a Poisson distribution (Knuth's algorithm). */
  function poisson(lambda) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }

  /** Expected goals for a home/away pairing. */
  function expectedGoals(home, away) {
    return {
      home: BASE_GOALS * home.att * away.def * HOME_ADV,
      away: BASE_GOALS * away.att * home.def
    };
  }

  /** Simulate one match, returning a {hg, ag} scoreline. */
  function simMatch(home, away) {
    const xg = expectedGoals(home, away);
    return { hg: poisson(xg.home), ag: poisson(xg.away) };
  }

  /**
   * Analytic-ish outcome probabilities for a single match, estimated by
   * sampling. Returns { home, draw, away, xgHome, xgAway } as fractions.
   */
  function matchProbabilities(home, away, samples = 4000) {
    let h = 0, d = 0, a = 0;
    for (let i = 0; i < samples; i++) {
      const m = simMatch(home, away);
      if (m.hg > m.ag) h++; else if (m.hg < m.ag) a++; else d++;
    }
    const xg = expectedGoals(home, away);
    return {
      home: h / samples,
      draw: d / samples,
      away: a / samples,
      xgHome: xg.home,
      xgAway: xg.away
    };
  }

  /** Winner of a single-leg knockout (extra flair breaks ties by rating). */
  function simKnockout(home, away) {
    const m = simMatch(home, away);
    if (m.hg > m.ag) return home;
    if (m.ag > m.hg) return away;
    // Penalty shootout weighted lightly toward the stronger side.
    const edge = (home.att + (1 - home.def)) - (away.att + (1 - away.def));
    return Math.random() < 0.5 + edge * 0.15 ? home : away;
  }

  /**
   * Simulate a single-round-robin regular season (each club plays each
   * other once, home side randomized). Returns a sorted standings array.
   */
  function simSeason(teams) {
    const table = new Map(teams.map(t => [t.id, {
      team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0
    }]));

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeFirst = Math.random() < 0.5;
        const home = homeFirst ? teams[i] : teams[j];
        const away = homeFirst ? teams[j] : teams[i];
        const m = simMatch(home, away);

        const H = table.get(home.id), A = table.get(away.id);
        H.pj++; A.pj++;
        H.gf += m.hg; H.gc += m.ag;
        A.gf += m.ag; A.gc += m.hg;
        if (m.hg > m.ag)      { H.g++; H.pts += 3; A.p++; }
        else if (m.hg < m.ag) { A.g++; A.pts += 3; H.p++; }
        else                  { H.e++; A.e++; H.pts++; A.pts++; }
      }
    }
    return rankTable([...table.values()]);
  }

  /** Sort a table array by points, then goal difference, then goals for. */
  function rankTable(rows) {
    return rows.sort((a, b) =>
      b.pts - a.pts ||
      (b.gf - b.gc) - (a.gf - a.gc) ||
      b.gf - a.gf ||
      a.team.name.localeCompare(b.team.name)
    );
  }

  /**
   * Given a seeded top-8, run the Liguilla (QF -> SF -> Final) with
   * standard reseeding (1v8, 2v7, ...). Returns { champion, rounds }.
   */
  function simLiguilla(seeds) {
    const rounds = [];
    let alive = seeds.slice(0, 8);

    while (alive.length > 1) {
      const pairs = [];
      for (let i = 0; i < alive.length / 2; i++) {
        pairs.push([alive[i], alive[alive.length - 1 - i]]);
      }
      const winners = pairs.map(([hi, lo]) => simKnockout(hi, lo));
      rounds.push({ pairs, winners });
      alive = winners; // winners keep their original seed order for reseeding
    }
    return { champion: alive[0], rounds };
  }

  /**
   * The headline feature: run `runs` full season + Liguilla simulations and
   * tally how often each club is crowned champion, reaches the final, and
   * qualifies for the Liguilla. `onProgress(done, total)` is called between
   * chunks so the UI can animate without freezing.
   */
  function championshipOdds(teams, runs, onProgress) {
    return new Promise(resolve => {
      const champ = new Map(teams.map(t => [t.id, 0]));
      const final = new Map(teams.map(t => [t.id, 0]));
      const liguilla = new Map(teams.map(t => [t.id, 0]));
      const CHUNK = 250;
      let done = 0;

      function step() {
        const end = Math.min(done + CHUNK, runs);
        for (; done < end; done++) {
          const table = simSeason(teams);
          const seeds = table.slice(0, 8).map(r => r.team);
          seeds.forEach(t => liguilla.set(t.id, liguilla.get(t.id) + 1));
          const { champion, rounds } = simLiguilla(seeds);
          rounds[rounds.length - 1].pairs.flat()
            .forEach(t => final.set(t.id, final.get(t.id) + 1));
          champ.set(champion.id, champ.get(champion.id) + 1);
        }
        if (onProgress) onProgress(done, runs);
        if (done < runs) {
          requestAnimationFrame(step);
        } else {
          const results = teams.map(t => ({
            team: t,
            title: champ.get(t.id) / runs,
            final: final.get(t.id) / runs,
            liguilla: liguilla.get(t.id) / runs
          })).sort((a, b) => b.title - a.title);
          resolve(results);
        }
      }
      step();
    });
  }

  return {
    poisson, expectedGoals, simMatch, matchProbabilities,
    simKnockout, simSeason, rankTable, simLiguilla, championshipOdds,
    BASE_GOALS, HOME_ADV
  };
})();
