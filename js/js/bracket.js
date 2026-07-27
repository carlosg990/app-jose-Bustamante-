const bracketData = [
  { id: 1, team1: "América", team2: "Chivas" },
  { id: 2, team1: "Tigres", team2: "Pumas" }
];

let winners = JSON.parse(localStorage.getItem("bracket")) || {};

function renderBracket() {
  const container = document.getElementById("bracket");
  container.innerHTML = "<h2>Liguilla</h2>";

  bracketData.forEach(match => {
    const selected = winners[match.id] || "Sin elegir";

    const div = document.createElement("div");
    div.innerHTML = `
      <p>${match.team1} vs ${match.team2}</p>
      <p>Ganador: <strong>${selected}</strong></p>
      <button onclick="pickWinner(${match.id}, '${match.team1}')">${match.team1}</button>
      <button onclick="pickWinner(${match.id}, '${match.team2}')">${match.team2}</button>
    `;
    container.appendChild(div);
  });
}

function pickWinner(matchId, team) {
  winners[matchId] = team;
  localStorage.setItem("bracket", JSON.stringify(winners));
  renderBracket();
}

renderBracket();
