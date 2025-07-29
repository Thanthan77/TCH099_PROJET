const API_URL = "http://localhost/api/";

// Vérifie la session
const codeInUrl = new URLSearchParams(window.location.search).get("codeEmploye");
const codeSession = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");
if (!codeSession || (!sessionStorage.getItem("isConnected") && !localStorage.getItem("isConnected"))) {
  window.location.replace("index.html");
}
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
  if (filtreIcone) filtreIcone.addEventListener("click", toggleFiltres);

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  const filtreBtn = document.querySelector("#filtreSection button");
  if (filtreBtn) filtreBtn.addEventListener("click", filtrerEmployes);

  // Gestion pop-up création compte
  const btnOuvrir = document.getElementById("btn-creer-compte");
  const modal = document.getElementById("modal-creer-compte");
  const modalContent = document.querySelector(".modal-content");
  const btnFermer = document.getElementById("fermer-modal");
  const btnAnnuler = document.getElementById("annuler-modal");
  const form = document.getElementById("form-nouveau-compte");

  if (btnOuvrir) btnOuvrir.addEventListener("click", () => modal.classList.remove("hidden"));
  if (btnFermer) btnFermer.addEventListener("click", () => modal.classList.add("hidden"));
  if (btnAnnuler) btnAnnuler.addEventListener("click", () => modal.classList.add("hidden"));
  if (modalContent) modalContent.addEventListener("click", (e) => e.stopPropagation());
  if (modal) modal.addEventListener("click", () => modal.classList.add("hidden"));

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const data = {
        prenom: form.prenom.value,
        nom: form.nom.value,
        poste: form.poste.value,
        mot_de_passe: "123456"
      };

      try {
        const res = await fetch(`${API_URL}employe/employe_post.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
          alert("Compte créé avec succès !");
          form.reset();
          modal.classList.add("hidden");
          chargerEmployes();
        } else {
          alert("Erreur : " + result.error);
        }
      } catch (err) {
        alert("Erreur réseau : " + err.message);
      }
    });
  }
});

// Onglets
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Employés
async function chargerEmployes() {
  try {
    const response = await fetch(`${API_URL}employes`);
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
  window.location.href = `profile.html?codeEmploye=${code}`;
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
      .catch(err => alert("Erreur réseau : " + err.message));
  }
}

// Vacances
async function chargerDemandesVacances() {
  try {
    const response = await fetch(`${API_URL}vacances`);
    const demandes = await response.json();
    const tbody = document.querySelector('#vacances table tbody');
    tbody.innerHTML = '';

    demandes.forEach((demande) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${demande.NOM || 'N/A'}</td>
        <td>${demande.ROLE || 'N/A'}</td>
        <td>${demande.DATE_DEBUT}</td>
        <td>${demande.DATE_FIN}</td>
        <td>En attente</td>
        <td>
          <button onclick="traiterExceptionVacances(${demande.ID_EXC}, 'accept')">Accepter</button>
          <button class="danger" onclick="traiterExceptionVacances(${demande.ID_EXC}, 'reject')">Refuser</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    alert("Erreur lors du chargement des vacances");
    console.error(e);
  }
}

async function traiterExceptionVacances(idException, action) {
  try {
    const res = await fetch(`${API_URL}vacance/${idException}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      chargerDemandesVacances();
    } else {
      alert("Erreur : " + data.error);
    }
  } catch (e) {
    alert("Erreur réseau");
    console.error(e);
  }
}

// Filtres
function toggleFiltres() {
  const section = document.getElementById("filtreSection");
  if (section) section.classList.toggle("hidden");
}

function filtrerEmployes() {
  const nom = document.getElementById("filtreNom").value.toLowerCase();
  const code = document.getElementById("filtreCode").value.toLowerCase();
  const poste = document.getElementById("filtrePoste").value.toLowerCase();
  const lignes = document.querySelectorAll(".ligne-employe");

  lignes.forEach(ligne => {
    const nomCell = ligne.querySelector(".col-nom")?.textContent.toLowerCase() || "";
    const codeCell = ligne.querySelector(".col-code")?.textContent.toLowerCase() || "";
    const posteCell = ligne.querySelector(".col-poste")?.textContent.toLowerCase() || "";
    const correspond = nomCell.includes(nom) && codeCell.includes(code) && (poste === "" || posteCell === poste);
    ligne.style.display = correspond ? "" : "none";
  });
}

function reinitialiserFiltres() {
  document.getElementById("filtreNom").value = "";
  document.getElementById("filtreCode").value = "";
  document.getElementById("filtrePoste").value = "";
  filtrerEmployes();
}

window.reinitialiserFiltres = reinitialiserFiltres;
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
