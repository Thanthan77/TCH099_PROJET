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
  chargerAfficherHoraires();
  chargerDemandesVacances();
  chargerAssignationsServices();

  // 🔐 Déconnexion
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // 🔍 Filtres dynamiques
  const filtreIcone = document.querySelector(".filtre-icon");
  if (filtreIcone) filtreIcone.addEventListener("click", toggleFiltres);

  const filtreBtn = document.querySelector("#filtreSection button");
  if (filtreBtn) filtreBtn.addEventListener("click", filtrerEmployes);

  ["filtrePrenom", "filtreNom", "filtreCode", "filtrePoste"].forEach(id => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("input", filtrerEmployes);
  });

  // 👤 Création de compte
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
  if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}


  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const motDePasse = genererMotDePasse();

      const data = {
        prenom: form.prenom.value.trim(),
        nom: form.nom.value.trim(),
        etat_civil: form.etat_civil.value.trim(),
        courriel: form.courriel.value.trim(),
        telephone: form.telephone.value.trim(),
        adresse: form.adresse.value.trim(),
        date_naissance: form.date_naissance.value,
        sexe: form.sexe.value,
        poste: form.poste.value,
        mot_de_passe: motDePasse
      };

      try {
        const res = await fetch(`${API_URL}employe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await res.json();

        if (res.ok) {
          alert(`Compte créé avec succès !\nMot de passe généré : ${motDePasse}`);
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

  // 📅 Génération des disponibilités
  const btnCharger = document.getElementById("btn-charger-disponibilites");
  const popupDispo = document.getElementById("popup-disponibilites");
  const formDispo = document.getElementById("form-disponibilites");

  if (btnCharger && popupDispo && formDispo) {
    btnCharger.addEventListener("click", () => {
      popupDispo.classList.remove("hidden");
    });

    formDispo.addEventListener("submit", async (e) => {
      e.preventDefault();
      const debut = document.getElementById("dateDebutDispo").value;
      const fin = document.getElementById("dateFinDispo").value;

      if (!debut || !fin || debut >= fin) {
        alert("Veuillez entrer une période valide.");
        return;
      }

      try {
        // 1️⃣ GET des horaires et vacances
        const resInfos = await fetch(`${API_URL}disponibilites/generation`);
        const infos = await resInfos.json();

        if (!resInfos.ok) throw new Error(infos.error || "Erreur lors du chargement des données");

        // 2️⃣ POST pour générer les disponibilités
        const resGen = await fetch(`${API_URL}disponibilites/generation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateDebut: debut,
            dateFin: fin,
            horaires: infos.horaires,
            vacances: infos.vacances
          })
        });

        const result = await resGen.json();
        if (resGen.ok) {
          alert(`✅ ${result.message}\nTotal créés : ${result.total_insertions}`);
          fermerPopupDisponibilites();
        } else {
          throw new Error(result.error || "Erreur inconnue");
        }
      } catch (err) {
        alert("❌ Erreur : " + err.message);
      }
    });
  }
});

// 🔚 Fermer le popup
function fermerPopupDisponibilites() {
  const popup = document.getElementById("popup-disponibilites");
  if (popup) popup.classList.add("hidden");
}




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
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur lors du chargement des employés :", err);
  }
}

// A remettre en dessous du bouton profile
//<button class="danger" onclick="supprimerEmploye('${emp.CODE_EMPLOYE}')">Supprimer</button>

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
    const response = await fetch(`${API_URL}conge`);
    const demandes = await response.json();
    const tbody = document.querySelector('#vacances table tbody');
    tbody.innerHTML = '';

    demandes.forEach((demande) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${(demande.PRENOM || '') + ' ' + (demande.NOM || '')}</td>
        <td>${demande.ROLE || 'N/A'}</td>
        <td>${demande.DATE_DEBUT}</td>
        <td>${demande.DATE_FIN}</td>
        <td>En Attente</td>
        <td>
          <div class="action-buttons">
            <button onclick="traiterExceptionVacances(${demande.ID_EXC}, 'accepter')">Accepter</button>
            <button class="danger" onclick="traiterExceptionVacances(${demande.ID_EXC}, 'refuser')">Refuser</button>

          </div>
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
    const res = await fetch(`${API_URL}conge/${idException}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: action,
        id_exc: idException
      })
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
  const prenom = document.getElementById("filtrePrenom").value.toLowerCase();
  const nom = document.getElementById("filtreNom").value.toLowerCase();
  const code = document.getElementById("filtreCode").value.toLowerCase();
  const poste = document.getElementById("filtrePoste").value.toLowerCase();
  const lignes = document.querySelectorAll(".ligne-employe");

  lignes.forEach(ligne => {
    const nomComplet = ligne.querySelector(".col-nom")?.textContent.toLowerCase() || "";
    const codeCell = ligne.querySelector(".col-code")?.textContent.toLowerCase() || "";
    const posteCell = ligne.querySelector(".col-poste")?.textContent.toLowerCase() || "";

    const [prenomCell = "", nomCell = ""] = nomComplet.split(" ");

    const correspond =
      prenomCell.startsWith(prenom) &&
      nomCell.startsWith(nom) &&
      codeCell.includes(code) &&
      (poste === "" || posteCell === poste);

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

function genererMotDePasse() {
  const minuscules = "abcdefghijklmnopqrstuvwxyz";
  const majuscules = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const chiffres = "0123456789";
  const speciaux = "!@#$%^&*(),.?\":{}|<>";

  const all = minuscules + majuscules + chiffres + speciaux;

  let motDePasse = [
    getRandomChar(minuscules),
    getRandomChar(majuscules),
    getRandomChar(chiffres),
    getRandomChar(speciaux)
  ];

  while (motDePasse.length < 10) {
    motDePasse.push(getRandomChar(all));
  }

  return shuffleArray(motDePasse).join('');
}

function getRandomChar(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function chargerAssignationsServices() {
  try {
    const response = await fetch(`${API_URL}service_employe`);
    if (!response.ok) throw new Error("Réponse réseau invalide");

    const assignations = await response.json();
    const tbody = document.getElementById("service-assignation-body");
    tbody.innerHTML = "";

    if (!Array.isArray(assignations) || assignations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">Aucune assignation trouvée</td></tr>`;
      return;
    }

    assignations.forEach(emp => {
      const tr = document.createElement("tr");

      const tdNom = document.createElement("td");
      tdNom.textContent = `${emp.PRENOM_EMPLOYE} ${emp.NOM_EMPLOYE}`;

      const tdPoste = document.createElement("td");
      if (emp.POSTE.toLowerCase() === "infirmier" && emp.SEXE === "Femme") {
        tdPoste.textContent = "Infirmière";
      } else {
        tdPoste.textContent = emp.POSTE;
      }

      const tdServices = document.createElement("td");
      const ul = document.createElement("ul");

      if (Array.isArray(emp.SERVICES) && emp.SERVICES.length > 0) {
        emp.SERVICES.forEach(service => {
          const li = document.createElement("li");
          li.textContent = service;
          ul.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "Aucun service";
        ul.appendChild(li);
      }

      tdServices.appendChild(ul);

      const tdAction = document.createElement("td");
      const btn = document.createElement("button");
      btn.textContent = "Modifier";
      btn.onclick = () => modifierAssignation(emp.CODE_EMPLOYE);
      tdAction.appendChild(btn);

      tr.appendChild(tdNom);
      tr.appendChild(tdPoste);
      tr.appendChild(tdServices);
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });


  } catch (err) {
    console.error("Erreur lors du chargement des assignations de services :", err);
    const tbody = document.getElementById("service-assignation-body");
    tbody.innerHTML = `<tr><td colspan="4">Erreur de chargement</td></tr>`;
  }
}

async function modifierAssignation(codeEmploye) {
  try {
    const response = await fetch(`${API_URL}service_employe`);
    const assignations = await response.json();
    const employe = assignations.find(e => e.CODE_EMPLOYE === codeEmploye);

    if (!employe) return alert("Employé non trouvé.");

    document.getElementById("popup-nom-employe").textContent = `${employe.PRENOM_EMPLOYE} ${employe.NOM_EMPLOYE}`;
    document.getElementById("popup-poste-employe").textContent = employe.SEXE === "Femme" && employe.POSTE === "Infirmier" ? "Infirmière" : employe.POSTE;
    document.getElementById("popup-code-employe").value = codeEmploye;

    const serviceCheckboxes = document.getElementById("liste-services-checkboxes");
    serviceCheckboxes.innerHTML = "";

    // Charger tous les services disponibles
    const allServices = await fetch(`${API_URL}services`);
    const servicesList = await allServices.json();

    servicesList.forEach(service => {
      const card = document.createElement("label");
      card.classList.add("service-card");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "services[]";
      checkbox.value = service.NOM;
      checkbox.id = `srv-${service.ID_SERVICE}`;
      checkbox.checked = employe.SERVICES.includes(service.NOM);

      const span = document.createElement("span");
      span.textContent = service.NOM;

      card.appendChild(checkbox);
      card.appendChild(span);
      serviceCheckboxes.appendChild(card);
    });

    document.getElementById("popupModifierAssignation").classList.remove("hidden");

  } catch (e) {
    console.error("Erreur lors de la modification d’assignation :", e);
    alert("Impossible de charger les données.");
  }
}

function fermerPopup() {
  document.getElementById('popupModifierAssignation').classList.add('hidden');
}

document.getElementById("form-modifier-assignation").addEventListener("submit", async function (e) {
  e.preventDefault();

  const codeEmploye = document.getElementById("popup-code-employe").value;
  const checkboxes = document.querySelectorAll("#liste-services-checkboxes input[type='checkbox']");
  const services = [];

  checkboxes.forEach(cb => {
    if (cb.checked) services.push(cb.value);
  });

  try {
    const res = await fetch(`${API_URL}service_employe`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codeEmploye,
        services
      })
    });

    const result = await res.json();

    if (res.ok) {
      alert("Assignations mises à jour avec succès !");
      fermerPopup();
      chargerAssignationsServices();
    } else {
      alert("Erreur : " + result.error);
    }
  } catch (err) {
    console.error("Erreur lors de l'enregistrement des assignations :", err);
    alert("Erreur réseau.");
  }
});

function escapeHtml(str) {
  return (str ?? '').toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function chargerAfficherHoraires() {
  try {
    const res = await fetch(`${API_URL}horaires`);
    const data = await res.json();

    const tbody = document.querySelector('#horaire table tbody');

    if (!Array.isArray(data) || !data.length) {
      tbody.innerHTML = '<tr><td colspan="3">Aucun horaire disponible</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(h => `
      <tr>
        <td>${escapeHtml(h.NOM_EMPLOYE)}</td>
        <td>${escapeHtml(h.JOURS)}</td>
        <td>${escapeHtml(h.HEURE)}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Erreur lors du chargement des horaires :", error);
    const tbody = document.querySelector('#horaire table tbody');
    tbody.innerHTML = '<tr><td colspan="3">Erreur de chargement des horaires</td></tr>';
  }
}