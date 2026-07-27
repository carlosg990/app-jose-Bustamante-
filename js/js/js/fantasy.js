const teams = ["América", "Chivas", "Tigres", "Pumas"];

let myTeam = [];

function renderFantasy() {
  const container = document.getElementById("fantasy");
  container.innerHTML = "<h2>Fantasy</h2>";

  teams.forEach(team => {
    const btn = document.createElement("button");
    btn.textContent = team;
    btn.onclick = () => addTeam(team);
    container.appendChild(btn);
  });
}

function addTeam(team) {
  if (myTeam.length >= 5) return alert("Máximo 5 equipos");
  myTeam.push(team);
  console.log("Equipo:", myTeam);
}

renderFantasy();
