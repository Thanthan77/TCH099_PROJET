const API_URL = "http://localhost/api/";

const codeInUrl = new URLSearchParams(window.location.search).get("codeEmploye");
const codeSession = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");

// Vérifie la session de connexion
if (!codeSession || (!sessionStorage.getItem("isConnected") && !localStorage.getItem("isConnected"))) {
  window.location.replace("../html/index.html");
}

// Empêche d'accéder à un autre dashboard via URL
if (codeInUrl && codeInUrl !== codeSession) {
  alert("Accès interdit : vous ne pouvez consulter que votre propre tableau de bord.");
  const url = new URL(window.location.href);
  url.searchParams.set("codeEmploye", codeSession);
  window.location.replace(url);
} else {
  window.codeEmploye = codeInUrl || codeSession;
}

  document.addEventListener("DOMContentLoaded", () => {
    chargerRendezVous();
  });

  function showTab(id) {
    document.querySelectorAll(".tab-content").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
  }

  async function chargerRendezVous() {
    try {
        const response = await fetch(`${API_URL}rendezvous`);
        if (!response.ok) throw new Error("Échec du chargement des rendez-vous");

        const rendezvous = await response.json();
        const tbody = document.querySelector("#rdv tbody");
        tbody.innerHTML = "";

        if (rendezvous.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">Aucun rendez-vous</td></tr>`;
            return;
        }

        rendezvous.forEach(rdv => {
            const row = document.createElement("tr");

            let nomAffiche;
            if (rdv.POSTE === "Médecin") {
                nomAffiche = `Dr. ${rdv.NOM_EMPLOYE}`;
            } else {
                nomAffiche = rdv.NOM_EMPLOYE;
            }

            row.innerHTML = `
                <td>${rdv.DATE_RDV}</td>
                <td>${rdv.HEURE}</td>
                <td>${rdv.COURRIEL}</td>
                <td>${nomAffiche}</td>
                <td>${rdv.NOM_SERVICE}</td>
                <td>
                    <button onclick="modifierRdv(${rdv.NUM_RDV})">Modifier</button>
                    <button class="danger" onclick="annulerRdv(${rdv.NUM_RDV})">Annuler</button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Erreur lors du chargement des RDV :", err);
    }
  }

  function modifierRdv(numRdv) {
    alert("Modifier le rendez-vous #" + numRdv);
  }

  function annulerRdv(numRdv) {
    if (confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
        fetch(`${API_URL}rendezvous/${numRdv}`, {
            method: "DELETE"
        })
        .then(res => {
            if (!res.ok) throw new Error("Échec de l'annulation");
            return res.json();
        })
        .then(() => {
            chargerRendezVous();
        })
        .catch(err => {
            alert("Erreur : " + err.message);
        });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
  chargerRendezVous();
  chargerPatients();
});

async function chargerPatients() {
  try {
    const response = await fetch(`${API_URL}patients`);
    if (!response.ok) throw new Error("Échec du chargement des patients");

    const patients = await response.json();
    const tbody = document.querySelector("#table-patients");
    tbody.innerHTML = "";

    if (patients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Aucun patient trouvé</td></tr>`;
      return;
    }

    patients.forEach(p => {
      const row = document.createElement("tr");
      row.classList.add("ligne-patient");
      row.innerHTML = `
        <td class="col-prenom">${p.PRENOM_PATIENT}</td>
        <td class="col-nom">${p.NOM_PATIENT}</td>
        <td class="col-date">${p.DATE_NAISSANCE}</td>
        <td class="col-assurance">${p.NO_ASSURANCE_MALADIE}</td>
        <td>${p.NUM_TEL} / ${p.COURRIEL}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Erreur lors du chargement des patients :", err);
  }
}


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

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "../html/index.html";
    });
  }
});


function toggleFiltres() {
  const filtreSection = document.getElementById("filtreSection");
  if (!filtreSection) {
    console.error("Élément filtre introuvable !");
    return;
  }

  if (filtreSection.classList.contains("hidden")) {
    filtreSection.classList.remove("hidden");
  } else {
    filtreSection.classList.add("hidden");
  }
}


function filtrerPatients() {
  const prenom = document.getElementById('filtrePrenom').value.toLowerCase();
  const nom = document.getElementById('filtreNom').value.toLowerCase();
  const dateNaissance = document.getElementById('filtreDateNaissance').value;
  const assurance = document.getElementById('filtreAssurance').value.toLowerCase();

  const lignes = document.querySelectorAll('.ligne-patient');

  lignes.forEach(ligne => {
    const prenomCell = ligne.querySelector('.col-prenom')?.textContent.toLowerCase() || "";
    const nomCell = ligne.querySelector('.col-nom')?.textContent.toLowerCase() || "";
    const dateCell = ligne.querySelector('.col-date')?.textContent || "";
    const assuranceCell = ligne.querySelector('.col-assurance')?.textContent.toLowerCase() || "";

    const correspond =
      prenomCell.includes(prenom) &&
      nomCell.includes(nom) &&
      dateCell.includes(dateNaissance) &&
      assuranceCell.includes(assurance);

    ligne.style.display = correspond ? '' : 'none';
  });
}


function reinitialiserFiltres() {
  document.getElementById('filtrePrenom').value = '';
  document.getElementById('filtreNom').value = '';
  document.getElementById('filtreDateNaissance').value = '';
  document.getElementById('filtreAssurance').value = '';
  filtrerPatients();
}

document.addEventListener("DOMContentLoaded", function () {
  const filtreIcone = document.querySelector(".filtre-icon");
  if (filtreIcone) {
    filtreIcone.addEventListener("click", toggleFiltres);
  } else {
    console.error("Icône de filtre introuvable !");
  }
});