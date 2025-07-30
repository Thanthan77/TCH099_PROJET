const API_URL = "http://localhost/api/";

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

let tousLesPatients = [];
let rendezVousGlobaux = [];

document.addEventListener("DOMContentLoaded", () => {
  chargerRendezVous();
  chargerPatients();
  chargerPatientsPourListe();
  showTab("rdv");

  const champsFiltre = [
    document.getElementById('filtrePrenom'),
    document.getElementById('filtreNom'),
    document.getElementById('filtreDateNaissance'),
    document.getElementById('filtreAssurance')
  ];
  champsFiltre.forEach(champ => champ.addEventListener("input", filtrerPatients));

  document.querySelector(".filtre-icon")?.addEventListener("click", toggleFiltres);

  document.getElementById("btn-logout")?.addEventListener("click", e => {
    e.preventDefault();
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
  });

  document.getElementById("nomPatient")?.addEventListener("input", () => {
    const nomTape = document.getElementById("nomPatient").value.trim();
    afficherPatientsFiltres(nomTape);
  });

  document.getElementById("nomPatient")?.addEventListener("focus", () => {
    const nomTape = document.getElementById("nomPatient").value.trim();
    afficherPatientsFiltres(nomTape);
  });

  document.getElementById("assurancePatient")?.addEventListener("input", rechercherPatientParAssurance);

  document.addEventListener("click", (e) => {
    if (!document.getElementById("nomPatient").contains(e.target) &&
        !document.getElementById("listeDeroulantePatients").contains(e.target)) {
      document.getElementById("listeDeroulantePatients").classList.add("hidden");
    }
  });
});

function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

let professionnelsParService = {}; // 🆕 Déclaration globale (à mettre en haut du fichier JS)

async function chargerRendezVous() {
  try {
    const response = await fetch(`${API_URL}rendezvous`);
    if (!response.ok) throw new Error("Échec du chargement des rendez-vous");

    const rendezvous = await response.json();
    rendezVousGlobaux = rendezvous;

    // 🆕 Réinitialise le dictionnaire des professionnels
    professionnelsParService = {};

    const tbody = document.querySelector("#rdv tbody");
    tbody.innerHTML = "";

    if (rendezvous.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Aucun rendez-vous</td></tr>`;
      return;
    }

    rendezvous.forEach(rdv => {
      // Ajout au tableau
      const row = document.createElement("tr");
      const nomAffiche = rdv.POSTE === "Médecin" ? `Dr. ${rdv.NOM_EMPLOYE}` : rdv.NOM_EMPLOYE;

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

      // 🆕 Enregistrement du professionnel par service
      const nomService = rdv.NOM_SERVICE;
      if (!professionnelsParService[nomService]) {
        professionnelsParService[nomService] = new Set();
      }
      professionnelsParService[nomService].add(nomAffiche);
    });

  } catch (err) {
    console.error("Erreur lors du chargement des RDV :", err);
  }
}

function modifierRdv(numRdv) {
  const rdv = rendezVousGlobaux.find(r => r.NUM_RDV === numRdv);
  if (!rdv) return;

  const patient = tousLesPatients.find(p => p.COURRIEL === rdv.COURRIEL);
  if (!patient) {
    alert("Patient introuvable.");
    return;
  }

  document.getElementById("popupNumRdv").value = rdv.NUM_RDV;
  document.getElementById("popupNomPatient").value = `${patient.PRENOM_PATIENT} ${patient.NOM_PATIENT}`;
  document.getElementById("popupAssurancePatient").value = patient.NO_ASSURANCE_MALADIE;
  document.getElementById("popupDate").value = rdv.DATE_RDV;
  document.getElementById("popupHeure").value = rdv.HEURE;

  const serviceSelect = document.getElementById("popupService");
  serviceSelect.innerHTML = "";

  const servicesPossibles = [
    "Consultation générale",
    "Suivi de grossesse",
    "Suivi de maladies chroniques",
    "Dépistage ITSS",
    "Vaccination",
    "Prélèvement sanguin / test urinaire",
    "Urgence mineure"
  ];

  servicesPossibles.forEach(service => {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    if (service === rdv.NOM_SERVICE) option.selected = true;
    serviceSelect.appendChild(option);
  });

  // Récupérer le nom du professionnel actuel
  const proNom = rdv.POSTE === "Médecin" ? `Dr. ${rdv.NOM_EMPLOYE}` : rdv.NOM_EMPLOYE;

  // Charger uniquement les professionnels du service (et ne pas forcer d'ajout)
  mettreAJourProfessionnelsPopup(); // pas de paramètre

  // Sélectionner le pro si présent
  setTimeout(() => {
    const proSelect = document.getElementById("popupProfessionnel");
    for (let option of proSelect.options) {
      if (option.value === proNom) {
        option.selected = true;
        break;
      }
    }
  }, 50);

  document.getElementById("popupModification").classList.remove("hidden");
}


function fermerPopup() {
  document.getElementById("popupModification").classList.add("hidden");
}

function annulerRdv(numRdv) {
  if (confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
    fetch(`${API_URL}rendezvous/${numRdv}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Échec de l'annulation");
        return res.json();
      })
      .then(() => {
        chargerRendezVous();
      })
      .catch(err => alert("Erreur : " + err.message));
  }
}

async function chargerPatients() {
  try {
    const response = await fetch(`${API_URL}patients`);
    if (!response.ok) throw new Error("Échec du chargement des patients");

    const patients = await response.json();
    tousLesPatients = patients;

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
        <td class="col-no_tel">${p.NUM_TEL}</td>
        <td class="col-courriel">${p.COURRIEL}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur lors du chargement des patients :", err);
  }
}

async function chargerPatientsPourListe() {
  try {
    const res = await fetch(`${API_URL}patients`);
    tousLesPatients = await res.json();
  } catch (e) {
    console.error("Erreur chargement patients :", e);
  }
}

function afficherPatientsFiltres(nomTape) {
  const liste = document.getElementById("listeDeroulantePatients");
  liste.innerHTML = "";

  const filtres = tousLesPatients.filter(p => {
    const nomComplet = `${p.PRENOM_PATIENT} ${p.NOM_PATIENT}`.toLowerCase();
    return nomComplet.includes(nomTape.toLowerCase());
  });

  if (filtres.length === 0) {
    liste.classList.add("hidden");
    return;
  }

  filtres.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.PRENOM_PATIENT} ${p.NOM_PATIENT} — ${p.NO_ASSURANCE_MALADIE}`;
    li.onclick = () => {
      document.getElementById("nomPatient").value = `${p.PRENOM_PATIENT} ${p.NOM_PATIENT}`;
      document.getElementById("assurancePatient").value = p.NO_ASSURANCE_MALADIE;
      liste.classList.add("hidden");
    };
    liste.appendChild(li);
  });

  liste.classList.remove("hidden");
}

function rechercherPatientParAssurance() {
  const numero = document.getElementById("assurancePatient").value.trim();
  if (numero.length < 5 || tousLesPatients.length === 0) return;

  const match = tousLesPatients.find(p => p.NO_ASSURANCE_MALADIE === numero);
  if (match) {
    document.getElementById("nomPatient").value = `${match.PRENOM_PATIENT} ${match.NOM_PATIENT}`;
  }
}

function filtrerPatients() {
  const prenom = document.getElementById('filtrePrenom').value.toLowerCase().trim();
  const nom = document.getElementById('filtreNom').value.toLowerCase().trim();
  const dateNaissance = document.getElementById('filtreDateNaissance').value.trim();
  const assurance = document.getElementById('filtreAssurance').value.toLowerCase().trim();

  const lignes = document.querySelectorAll('.ligne-patient');

  lignes.forEach(ligne => {
    const prenomCell = ligne.querySelector('.col-prenom')?.textContent.toLowerCase().trim() || "";
    const nomCell = ligne.querySelector('.col-nom')?.textContent.toLowerCase().trim() || "";
    const dateCell = ligne.querySelector('.col-date')?.textContent.trim() || "";
    const assuranceCell = ligne.querySelector('.col-assurance')?.textContent.toLowerCase().trim() || "";

    const correspond =
      (!prenom || prenomCell.startsWith(prenom)) &&
      (!nom || nomCell.startsWith(nom)) &&
      (!dateNaissance || dateCell.includes(dateNaissance)) &&
      (!assurance || assuranceCell.startsWith(assurance));

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

function toggleFiltres() {
  const filtreSection = document.getElementById("filtreSection");
  if (!filtreSection) return;
  filtreSection.classList.toggle("hidden");
}

function ouvrirListeServices() {
  document.getElementById("popupServiceDisplay").classList.add("hidden");
  document.getElementById("popupService").classList.remove("hidden");
}

function changerServiceEtFermer() {
  const selected = document.getElementById("popupService").value;
  document.getElementById("popupServiceDisplay").textContent = selected;
  document.getElementById("popupServiceDisplay").classList.remove("hidden");
  document.getElementById("popupService").classList.add("hidden");

  // Met à jour les professionnels selon le nouveau service
  mettreAJourProfessionnelsPopup();
}

function mettreAJourProfessionnelsPopup() {
  const service = document.getElementById("popupService").value;
  const select = document.getElementById("popupProfessionnel");

  select.innerHTML = "";

  const professionnels = professionnelsParService[service];

  if (!professionnels || professionnels.size === 0) {
    const option = document.createElement("option");
    option.textContent = "Aucun professionnel disponible";
    option.disabled = true;
    select.appendChild(option);
    return;
  }

  [...professionnels].forEach(nom => {
    const option = document.createElement("option");
    option.value = nom;
    option.textContent = nom;
    select.appendChild(option);
  });
}

function mettreAJourProfessionnelsSuivi() {
  const service = document.getElementById("service").value;
  const select = document.getElementById("professionnel");

  select.innerHTML = "";

  const professionnels = professionnelsParService[service];

  if (!professionnels || professionnels.size === 0) {
    const option = document.createElement("option");
    option.textContent = "Aucun professionnel disponible";
    option.disabled = true;
    select.appendChild(option);
    select.disabled = true;
    return;
  }

  [...professionnels].forEach(nom => {
    const option = document.createElement("option");
    option.value = nom;
    option.textContent = nom;
    select.appendChild(option);
  });

  select.disabled = false;
}
