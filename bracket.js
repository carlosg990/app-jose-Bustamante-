const bracketData = [
  { id: 1, title: "Cuartos de Final 1", team1: "América", team2: "Chivas" },
  { id: 2, title: "Cuartos de Final 2", team1: "Tigres", team2: "Pumas" }
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
      <small style="color: var(--text-muted);">${match.title}</small>
      <div class="match-info">
        <strong>${match.team1}</strong>
        <span>vs</span>
        <strong>${match.team2}</strong>
      </div>
      <div class="bracket-buttons">
        <button class="${winner === match.team1 ? 'selected' : ''}" onclick="pickWinner(${match.id}, '${match.team1}')">Gana ${match.team1}</button>
        <button class="${winner === match.team2 ? 'selected' : ''}" onclick="pickWinner(${match.id}, '${match.team2}')">Gana ${match.team2}</button>
      </div>
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
