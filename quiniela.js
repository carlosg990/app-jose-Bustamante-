const matches = [
  { id: 1, home: "América", away: "Cruz Azul" },
  { id: 2, home: "Tigres", away: "Monterrey" }
];

// Cargar predicciones previas si existen
let predictions = JSON.parse(localStorage.getItem("quiniela")) || {};

function renderQuiniela() {
  const container = document.getElementById("quiniela");
  container.innerHTML = "<h2>Quiniela</h2>";

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "card";

    const currentPredict = predictions[match.id];

    div.innerHTML = `
      <p><strong>${match.home} vs ${match.away}</strong></p>
      <button class="${currentPredict === 'home' ? 'selected' : ''}" onclick="predict(${match.id}, 'home')">Local</button>
      <button class="${currentPredict === 'draw' ? 'selected' : ''}" onclick="predict(${match.id}, 'draw')">Empate</button>
      <button class="${currentPredict === 'away' ? 'selected' : ''}" onclick="predict(${match.id}, 'away')">Visitante</button>
    `;

    container.appendChild(div);
  });
}

function predict(matchId, result) {
  predictions[matchId] = result;
  localStorage.setItem("quiniela", JSON.stringify(predictions));
  renderQuiniela();
}

// quiniela.js
let predictions = JSON.parse(localStorage.getItem("quiniela")) || {};

async function renderQuiniela() {
  const container = document.getElementById("quiniela");
  container.innerHTML = "<p>Loading matches...</p>";

  // Fetch real matches from your new API file
  const matches = await fetchLigaMxMatches();

  if (matches.length === 0) {
    container.innerHTML = "<p>No matches available right now.</p>";
    return;
  }

  container.innerHTML = "<h2>Quiniela</h2>";

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "card";

    const currentPredict = predictions[match.id];

    div.innerHTML = `
      <p>
        <img src="${match.homeLogo}" width="20"> <strong>${match.home}</strong> 
        vs 
        <strong>${match.away}</strong> <img src="${match.awayLogo}" width="20">
      </p>
      <div class="match-buttons">
        <button class="${currentPredict === 'home' ? 'selected' : ''}" onclick="predict(${match.id}, 'home')">Local</button>
        <button class="${currentPredict === 'draw' ? 'selected' : ''}" onclick="predict(${match.id}, 'draw')">Empate</button>
        <button class="${currentPredict === 'away' ? 'selected' : ''}" onclick="predict(${match.id}, 'away')">Visitante</button>
      </div>
    `;

    container.appendChild(div);
  });
}

function predict(matchId, result) {
  predictions[matchId] = result;
  localStorage.setItem("quiniela", JSON.stringify(predictions));
  renderQuiniela();
}

renderQuiniela();
