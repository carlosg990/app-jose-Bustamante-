/*
 * data.js — Liga MX club database.
 *
 * Each club carries an attack multiplier (`att`) and a defense multiplier
 * (`def`). These feed the Poisson goal model in engine.js:
 *   - att  > 1  => scores more than an average side
 *   - def  < 1  => concedes fewer than an average side (lower is better)
 * Ratings are hand-tuned to reflect recent Liga MX form, not official stats.
 */

const TEAMS = [
  { id: "ame", name: "América",         abbr: "AME", color: "#ffd400", ink: "#0a1a3f", att: 1.36, def: 0.80 },
  { id: "czl", name: "Cruz Azul",       abbr: "CAZ", color: "#0a4aa0", ink: "#ffffff", att: 1.28, def: 0.82 },
  { id: "tol", name: "Toluca",          abbr: "TOL", color: "#d81e2c", ink: "#ffffff", att: 1.33, def: 0.90 },
  { id: "tig", name: "Tigres UANL",     abbr: "TIG", color: "#f7a600", ink: "#00318a", att: 1.26, def: 0.85 },
  { id: "mty", name: "Monterrey",       abbr: "MTY", color: "#123c7b", ink: "#ffffff", att: 1.27, def: 0.90 },
  { id: "pum", name: "Pumas UNAM",      abbr: "PUM", color: "#1a2f6e", ink: "#f6c945", att: 1.10, def: 0.95 },
  { id: "gdl", name: "Guadalajara",     abbr: "GDL", color: "#c8102e", ink: "#ffffff", att: 1.13, def: 0.98 },
  { id: "leo", name: "León",            abbr: "LEO", color: "#0b7a3b", ink: "#ffffff", att: 1.08, def: 1.00 },
  { id: "pac", name: "Pachuca",         abbr: "PAC", color: "#1f3a93", ink: "#ffffff", att: 1.16, def: 1.05 },
  { id: "nec", name: "Necaxa",          abbr: "NEC", color: "#e2001a", ink: "#ffffff", att: 1.02, def: 1.05 },
  { id: "san", name: "Santos Laguna",   abbr: "SAN", color: "#0a7d3a", ink: "#ffffff", att: 1.00, def: 1.08 },
  { id: "atl", name: "Atlas",           abbr: "ATL", color: "#b10021", ink: "#0a0a0a", att: 0.95, def: 1.02 },
  { id: "jua", name: "FC Juárez",       abbr: "JUA", color: "#0a8f4e", ink: "#ffffff", att: 0.98, def: 1.10 },
  { id: "asl", name: "Atl. San Luis",   abbr: "ASL", color: "#c1121f", ink: "#f2b807", att: 1.05, def: 1.15 },
  { id: "tij", name: "Tijuana",         abbr: "TIJ", color: "#c8102e", ink: "#0a0a0a", att: 0.96, def: 1.08 },
  { id: "pue", name: "Puebla",          abbr: "PUE", color: "#1b3a6b", ink: "#ffffff", att: 0.85, def: 1.20 },
  { id: "que", name: "Querétaro",       abbr: "QRO", color: "#0a1a3f", ink: "#ffffff", att: 0.82, def: 1.18 },
  { id: "maz", name: "Mazatlán",        abbr: "MAZ", color: "#5b2c86", ink: "#ffffff", att: 0.88, def: 1.22 }
];

const TEAM_BY_ID = Object.fromEntries(TEAMS.map(t => [t.id, t]));

/**
 * A single composite "power" score (0-100) for display/ranking.
 * Blends attacking output and defensive solidity.
 */
function teamPower(t) {
  const attScore = (t.att - 0.80) / (1.36 - 0.80);   // normalized 0..1
  const defScore = (1.22 - t.def) / (1.22 - 0.80);   // normalized 0..1
  return Math.round((attScore * 0.55 + defScore * 0.45) * 100);
}

/** Build an SVG data-URI crest for a club (initials on a shield). */
function crestFor(t) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g${t.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${t.color}"/>
          <stop offset="1" stop-color="${shade(t.color, -28)}"/>
        </linearGradient>
      </defs>
      <path d="M50 4 L92 18 V52 C92 78 72 92 50 98 C28 92 8 78 8 52 V18 Z"
            fill="url(#g${t.id})" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
      <text x="50" y="60" font-family="Outfit, Arial, sans-serif" font-size="34"
            font-weight="700" text-anchor="middle" fill="${t.ink}">${t.abbr}</text>
    </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.trim());
}

/** Lighten/darken a hex color by `amt` (-100..100). */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + Math.round(2.55 * amt));
  const g = clamp(((n >> 8) & 0xff) + Math.round(2.55 * amt));
  const b = clamp((n & 0xff) + Math.round(2.55 * amt));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
