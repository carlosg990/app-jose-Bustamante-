const bracketData = [
  { team1: "América", team2: "Chivas" },
  { team1: "Tigres", team2: "Pumas" }
];

function renderBracket() {
  const container = document.getElementById("bracket");
  container.innerHTML = "<h2>Liguilla</h2>";

  bracketData.forEach(match => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${match.team1} vs ${match.team2}</p>
      <button onclick="pickWinner('${match.team1}')">${match.team1}</button>
      <button onclick="pickWinner('${match.team2}')">${match.team2}</button>
    `;
    container.appendChild(div);
  });
}

function pickWinner(team) {
  alert("Ganador: " + team);
}

renderBracket();
