function showSection(sectionId) {
  const sections = ["bracket", "fantasy", "quiniela"];

  sections.forEach(id => {
    document.getElementById(id).style.display = id === sectionId ? "block" : "none";
  });

  // Cambiar estilo visual de los botones de navegación
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    if (btn.getAttribute("onclick").includes(sectionId)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}
