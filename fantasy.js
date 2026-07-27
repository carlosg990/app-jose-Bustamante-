const teams = ["América", "Chivas", "Tigres", "Pumas", "Cruz Azul", "Monterrey"];

let myTeam = JSON.parse(localStorage.getItem("fantasy")) || [];

function renderFantasy() {
  const container = document.getElementById("fantasy");
  container.innerHTML = "<h2>Fantasy</h2><p>Selecciona hasta 5 equipos:</p>";

  const buttonsDiv = document.createElement("div");

  teams.forEach(team => {
    const btn = document.createElement("button");
    btn.textContent = team;
    if (myTeam.includes(team)) {
      btn.classList.add("selected");
    }
    btn.onclick = () => toggleTeam(team);
    buttonsDiv.appendChild(btn);
  });

  container.appendChild(buttonsDiv);

  // Lista de seleccionados
  const selectedDiv = document.createElement("div");
  selectedDiv.className = "my-team-list";
  selectedDiv.innerHTML = `
    <h3>Mi Selección (${myTeam.length}/5):</h3>
    <ul>
      ${myTeam.map(t => `<li>${t}</li>`).join("")}
    </ul>
  `;

  container.appendChild(selectedDiv);
}

function toggleTeam(team) {
  const index = myTeam.indexOf(team);

  if (index > -1) {
    // Si ya está, lo quita
    myTeam.splice(index, 1);
  } else {
    // Si no está, valida límite y agrega
    if (myTeam.length >= 5) {
      alert("Solo puedes seleccionar hasta 5 equipos.");
      return;
    }
    myTeam.push(team);
  }

  localStorage.setItem("fantasy", JSON.stringify(myTeam));
  renderFantasy();
}

renderFantasy();
