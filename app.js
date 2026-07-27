function showSection(sectionId) {
  const sections = ["bracket", "fantasy", "quiniela"];

  sections.forEach(id => {
    document.getElementById(id).style.display =
      id === sectionId ? "block" : "none";
  });
}
