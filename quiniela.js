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

renderQuiniela();
