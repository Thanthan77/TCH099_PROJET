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

document.addEventListener("DOMContentLoaded", () => {
  chargerRendezVous();
  chargerPatients();
  chargerPatientsPourListe();
  showTab("rdv");

  // 🔄 Filtres dynamiques
  const champsFiltre = [
    document.getElementById('filtrePrenom'),
    document.getElementById('filtreNom'),
    document.getElementById('filtreDateNaissance'),
    document.getElementById('filtreAssurance')
  ];
  champsFiltre.forEach(champ => {
    champ.addEventListener("input", filtrerPatients);
  });

  const filtreIcone = document.querySelector(".filtre-icon");
  if (filtreIcone) {
    filtreIcone.addEventListener("click", toggleFiltres);
  }

  // 🔓 Déconnexion
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // 🔁 Service → Professionnel
  const serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    mettreAJourProfessionnels();
    serviceSelect.addEventListener("change", mettreAJourProfessionnels);
  }

  const professionnelSelect = document.getElementById("professionnel");
  if (professionnelSelect && (!serviceSelect || !serviceSelect.value)) {
    professionnelSelect.disabled = true;
    professionnelSelect.innerHTML = '<option value="">-- Sélectionnez un service d\'abord --</option>';
  }

  // 🔍 Recherche patient nom/assurance
  const champNom = document.getElementById("nomPatient");
  champNom?.addEventListener("input", () => {
    const nomTape = champNom.value.trim();
    if (nomTape.length > 0) {
      afficherPatientsFiltres(nomTape);
    } else {
      document.getElementById("listeDeroulantePatients").classList.add("hidden");
    }
  });

  champNom?.addEventListener("focus", () => {
    const nomTape = champNom.value.trim();
    if (nomTape.length > 0) {
      afficherPatientsFiltres(nomTape);
    }
  });

  document.getElementById("assurancePatient")?.addEventListener("input", rechercherPatientParAssurance);

  document.addEventListener("click", (e) => {
    if (!champNom.contains(e.target) && !document.getElementById("listeDeroulantePatients").contains(e.target)) {
      document.getElementById("listeDeroulantePatients").classList.add("hidden");
    }
  });
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
    fetch(`${API_URL}rendezvous/${numRdv}`, { method: "DELETE" })
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

function toggleFiltres() {
  const filtreSection = document.getElementById("filtreSection");
  if (!filtreSection) return;
  filtreSection.classList.toggle("hidden");
}

const professionnelsParService = {
  "Consultation générale": ["Dr. Tremblay", "Infirmière Julie"],
  "Suivi de grossesse": ["Dr. Tremblay"],
  "Suivi de maladies chroniques": ["Dr. Tremblay"],
  "Dépistage ITSS": ["Infirmière Julie"],
  "Vaccination": ["Infirmière Julie"],
  "Prélèvement sanguin / test urinaire": ["Infirmière Julie"],
  "Urgence mineure": ["Dr. Tremblay", "Infirmière Julie"]
};

function mettreAJourProfessionnels() {
  const serviceSelect = document.getElementById("service");
  const professionnelSelect = document.getElementById("professionnel");
  const serviceChoisi = serviceSelect.value;

  professionnelSelect.innerHTML = "";

  if (!serviceChoisi || !professionnelsParService[serviceChoisi]) {
    professionnelSelect.disabled = true;
    const opt = document.createElement("option");
    opt.textContent = "-- Sélectionnez un service d'abord --";
    opt.value = "";
    professionnelSelect.appendChild(opt);
    return;
  }

  professionnelSelect.disabled = false;

  professionnelsParService[serviceChoisi].forEach(pro => {
    const option = document.createElement("option");
    option.value = pro;
    option.textContent = pro;
    professionnelSelect.appendChild(option);
  });
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
