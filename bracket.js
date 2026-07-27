const bracketData = [
  { id: 1, team1: "América", team2: "Chivas" },
  { id: 2, team1: "Tigres", team2: "Pumas" }
];

let bracketWinners = JSON.parse(localStorage.getItem("bracket")) || {};

function renderBracket() {
  const container = document.getElementById("bracket");
  container.innerHTML = "<h2>Liguilla (Bracket)</h2>";

  bracketData.forEach(match => {
    const div = document.createElement("div");
    div.className = "card";

    const winner = bracketWinners[match.id];

    div.innerHTML = `
      <p><strong>${match.team1} vs ${match.team2}</strong></p>
      <button class="${winner === match.team1 ? 'selected' : ''}" onclick="pickWinner(${match.id}, '${match.team1}')">${match.team1}</button>
      <button class="${winner === match.team2 ? 'selected' : ''}" onclick="pickWinner(${match.id}, '${match.team2}')">${match.team2}</button>
    `;

    container.appendChild(div);
  });
}

function pickWinner(matchId, team) {
  bracketWinners[matchId] = team;
  localStorage.setItem("bracket", JSON.stringify(bracketWinners));
  renderBracket();
}

renderBracket();
