const teams = ["América", "Chivas", "Tigres", "Pumas"];

let myTeam = JSON.parse(localStorage.getItem("fantasy")) || [];

function renderFantasy() {
  const container = document.getElementById("fantasy");
  container.innerHTML = "<h2>Fantasy</h2>";

  const teamDiv = document.createElement("div");
  teamDiv.innerHTML = "<h3>Tu equipo:</h3>";

  myTeam.forEach(t => {
    const p = document.createElement("p");
    p.textContent = t;
    teamDiv.appendChild(p);
  });

  container.appendChild(teamDiv);

  teams.forEach(team => {
    const btn = document.createElement("button");
    btn.textContent = team;
    btn.onclick = () => addTeam(team);
    container.appendChild(btn);
  });
}

function addTeam(team) {
  if (myTeam.includes(team)) return alert("Ya lo tienes");
  if (myTeam.length >= 5) return alert("Máximo 5 equipos");

  myTeam.push(team);
  localStorage.setItem("fantasy", JSON.stringify(myTeam));
  renderFantasy();
}

renderFantasy();
