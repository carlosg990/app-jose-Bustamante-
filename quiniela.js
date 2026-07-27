let predictions = JSON.parse(localStorage.getItem("quiniela")) || {};

async function renderQuiniela() {
  const container = document.getElementById("quiniela");
  container.innerHTML = "<p>Cargando partidos...</p>";

  const matches = await fetchLigaMxMatches();

  if (!matches || matches.length === 0) {
    container.innerHTML = "<p>No hay partidos disponibles en este momento.</p>";
    return;
  }

  container.innerHTML = "<h2>Quiniela</h2>";

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "card";

    const currentPredict = predictions[match.id];

    div.innerHTML = `
      <p>
        <img src="${match.homeLogo}" width="20" alt="${match.home}"> <strong>${match.home}</strong> 
        vs 
        <strong>${match.away}</strong> <img src="${match.awayLogo}" width="20" alt="${match.away}">
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
