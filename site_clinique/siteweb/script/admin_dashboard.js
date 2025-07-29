const API_URL = "http://localhost/api/";

const codeInUrl = new URLSearchParams(window.location.search).get("codeEmploye");
const codeSession = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");

// Vérifie la session
if (!codeSession || (!sessionStorage.getItem("isConnected") && !localStorage.getItem("isConnected"))) {
  window.location.replace("html/index.html");
}

//Empêche d'accéder à un autre dashboard via URL
if (codeInUrl && codeInUrl !== codeSession) {
  alert("Accès interdit : vous ne pouvez consulter que votre propre tableau de bord.");
  const url = new URL(window.location.href);
  url.searchParams.set("codeEmploye", codeSession);
  window.location.replace(url);
} else {
  window.codeEmploye = codeInUrl || codeSession;
}

document.addEventListener("DOMContentLoaded", () => {
  showTab("comptes");
  chargerEmployes();
  chargerDemandesVacances();

  const filtreIcone = document.querySelector(".filtre-icon");
  if (filtreIcone) {
    filtreIcone.addEventListener("click", toggleFiltres);
  }

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "html/index.html";
    });
  }

  const filtreBtn = document.querySelector("#filtreSection button");
  if (filtreBtn) {
    filtreBtn.addEventListener("click", filtrerEmployes);
  }

  // 🎯 Gestion du modal de création de compte
  const closeBtn = document.getElementById("fermer-modal");
  const annulerBtn = document.getElementById("annuler-modal");
  const modal = document.getElementById("modal-creer-compte");
  const modalContent = document.querySelector(".modal-content");
  const form = document.getElementById("form-nouveau-compte");

  // ✅ Fermer le modal avec X
  if (closeBtn) closeBtn.addEventListener("click", fermerPopup);

  // ✅ Fermer le modal avec bouton Annuler
  if (annulerBtn) annulerBtn.addEventListener("click", fermerPopup);

  // ✅ Fermer en cliquant à l’extérieur du contenu
  if (modal) modal.addEventListener("click", fermerPopup);

  // ⛔ Empêche la fermeture si on clique dans le contenu
  if (modalContent) modalContent.addEventListener("click", (e) => e.stopPropagation());

  // ✅ Soumission du formulaire
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        prenom: formData.get("prenom"),
        nom: formData.get("nom"),
        poste: formData.get("poste"),
        mot_de_passe: "123456" // Valeur par défaut
      };

      try {
        const response = await fetch(`${API_URL}employe/employe_post.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          alert("Compte créé avec succès !");
          form.reset();
          fermerPopup();
          chargerEmployes();
        } else {
          alert("Erreur : " + result.error);
        }
      } catch (error) {
        alert("Erreur réseau : " + error.message);
      }
    });
  }
});

// 🧩 Affiche un onglet spécifique
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// 📊 Charge les employés
async function chargerEmployes() {
  try {
    const response = await fetch(`${API_URL}employes`);
    if (!response.ok) throw new Error("Échec du chargement des employés");

    const employes = await response.json();
    const tbody = document.querySelector("#employe-table-body");
    tbody.innerHTML = "";

    if (employes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">Aucun employé trouvé</td></tr>`;
      return;
    }

    employes.forEach(emp => {
      const row = document.createElement("tr");
      row.classList.add("ligne-employe");
      row.innerHTML = `
        <td class="col-nom">${emp.PRENOM_EMPLOYE} ${emp.NOM_EMPLOYE}</td>
        <td class="col-code">${emp.CODE_EMPLOYE}</td>
        <td class="col-poste">${emp.POSTE}</td>
        <td>
          <button onclick="ouvrirProfil('${emp.CODE_EMPLOYE}')">Profil</button>
          <button class="danger" onclick="supprimerEmploye('${emp.CODE_EMPLOYE}')">Supprimer</button>
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Erreur lors du chargement des employés :", err);
  }
}

function ouvrirProfil(code) {
  window.location.href = `../html/profile.html?codeEmploye=${code}`;
}

function supprimerEmploye(code) {
  if (confirm("Confirmer la suppression de l'employé ?")) {
    fetch(`${API_URL}employe/user/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", CODE_EMPLOYE: code })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "OK") {
          alert(`Employé ${data.codeEmploye} supprimé avec succès`);
          chargerEmployes();
        } else {
          alert(`Erreur : ${data.error}`);
        }
      })
      .catch(err => {
        alert("Erreur réseau : " + err.message);
      });
  }
}

function toggleFiltres() {
  const filtreSection = document.getElementById("filtreSection");
  if (!filtreSection) {
    console.error("Section de filtre non trouvée !");
    return;
  }
  filtreSection.classList.toggle("hidden");
}

function filtrerEmployes() {
  const nom = document.getElementById("filtreNom")?.value.toLowerCase() || "";
  const code = document.getElementById("filtreCode")?.value.toLowerCase() || "";
  const poste = document.getElementById("filtrePoste")?.value.toLowerCase() || "";

  const lignes = document.querySelectorAll(".ligne-employe");

  lignes.forEach(ligne => {
    const nomCell = ligne.querySelector(".col-nom")?.textContent.toLowerCase() || "";
    const codeCell = ligne.querySelector(".col-code")?.textContent.toLowerCase() || "";
    const posteCell = ligne.querySelector(".col-poste")?.textContent.toLowerCase() || "";

    const correspond =
      nomCell.includes(nom) &&
      codeCell.includes(code) &&
      (poste === "" || posteCell === poste);

    ligne.style.display = correspond ? '' : 'none';
  });
}

function reinitialiserFiltres() {
  document.getElementById("filtreNom").value = "";
  document.getElementById("filtreCode").value = "";
  document.getElementById("filtrePoste").value = "";
  filtrerEmployes();
}

window.reinitialiserFiltres = reinitialiserFiltres;

// 🧾 Menu utilisateur
window.toggleUserMenu = function () {
  const menu = document.getElementById("userDropdown");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
};

window.addEventListener("click", function (event) {
  const icon = document.querySelector(".user-menu-icon");
  const menu = document.getElementById("userDropdown");

  if (!menu.contains(event.target) && event.target !== icon) {
    menu.style.display = "none";
  }
});

// 🪟 Fonctions globales du modal
function ouvrirPopup() {
  const modal = document.getElementById("modal-creer-compte");
  if (modal) modal.classList.remove("hidden");
}

function fermerPopup() {
  const modal = document.getElementById("modal-creer-compte");
  if (modal) modal.classList.add("hidden");
}

window.ouvrirPopup = ouvrirPopup;
window.fermerPopup = fermerPopup;
