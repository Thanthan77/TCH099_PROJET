function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

window.onclick = function (event) {
  if (!event.target.matches('.user-menu-icon')) {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown && dropdown.style.display === "block") {
      dropdown.style.display = "none";
    }
  }
};

const modifiables = ["email", "telephone", "adresse"];

document.getElementById("editBtn").addEventListener("click", function () {
  modifiables.forEach(id => {
    const field = document.getElementById(id);
    field.removeAttribute("readonly");
    field.classList.add("editable");
  });

  document.getElementById("editBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
});

document.getElementById("formProfil").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const telephone = document.getElementById("telephone").value;
  const adresse = document.getElementById("adresse").value;

  // Traitement (à adapter à ton API)
  console.log("Envoi des données :", { email, telephone, adresse });

  modifiables.forEach(id => {
    const field = document.getElementById(id);
    field.setAttribute("readonly", true);
    field.classList.remove("editable");
  });

  document.getElementById("editBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";

  alert("Modifications enregistrées avec succès !");
});
