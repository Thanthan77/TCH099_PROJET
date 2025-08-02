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
let optionHeure = [];
let heureSelect;
let rdvAvantChangement = [];

document.addEventListener("DOMContentLoaded", () => {
  // ⬇️ Chargement initial
  chargerRendezVous();
  chargerPatients();
  chargerPatientsPourListe();
  chargerServicesPourCreation();
  mettreAJourProfessionnelsSuivi();
  showTab("rdv");

  // ✅ Filtres dynamiques patients
  ["filtrePrenom", "filtreNom", "filtreDateNaissance", "filtreAssurance"].forEach(id => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("input", filtrerPatients);
  });

  // ✅ Filtres dynamiques rendez-vous
  ["filtreDateRdv", "filtreNomPatientRdv", "filtreNomProRdv", "filtreServiceRdv"].forEach(id => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("input", filtrerRendezVous);
  });

  // ✅ Toggle affichage filtre patients
  document.querySelector("#patients .filtre-icon")?.addEventListener("click", () => {
    document.getElementById("filtreSection")?.classList.toggle("hidden");
  });

  // ✅ Toggle affichage filtre rendez-vous
  document.querySelector("#rdv .filtre-icon")?.addEventListener("click", () => {
    document.getElementById("filtreSectionRdv")?.classList.toggle("hidden");
  });

  // ✅ Déconnexion
  document.getElementById("btn-logout")?.addEventListener("click", e => {
    e.preventDefault();
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
  });

  // ✅ Liste déroulante du nom du patient (form création)
  const champNomPatient = document.getElementById("nomPatient");
  champNomPatient?.addEventListener("input", () => {
    afficherPatientsFiltres(champNomPatient.value.trim());
  });
  champNomPatient?.addEventListener("focus", () => {
    afficherPatientsFiltres(champNomPatient.value.trim());
  });

  // ✅ Remplir automatiquement nom si on tape l’assurance maladie
  document.getElementById("assurancePatient")?.addEventListener("input", rechercherPatientParAssurance);

  // ✅ Fermer la liste déroulante si clic à l’extérieur
  document.addEventListener("click", (e) => {
    const champ = document.getElementById("nomPatient");
    const liste = document.getElementById("listeDeroulantePatients");
    if (!champ.contains(e.target) && !liste.contains(e.target)) {
      liste.classList.add("hidden");
    }
  });

  // ✅ Mettre à jour les heures disponibles quand le service, le pro ou la date change (popup modification)
  ["popupService", "popupProfessionnel", "popupDate"].forEach(id => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("change", mettreAJourHeuresDisponibles);
  });

  async function chargerServicesPourCreation() {
    const selectService = document.getElementById("service");
    selectService.innerHTML = `<option value="">-- Sélectionnez un service --</option>`; // Remet l'option par défaut

    try {
      const response = await fetch(`${API_URL}services`);
      if (!response.ok) throw new Error("Erreur lors du chargement des services");
      const services = await response.json();

      services.forEach(service => {
        const option = document.createElement("option");
        option.value = service.NOM;
        option.textContent = service.NOM;
        selectService.appendChild(option);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des services :", error);
    }
  }

  async function mettreAJourProfessionnelsSuivi() {
    const serviceNom = document.getElementById("service").value;
    const selectPro = document.getElementById("professionnel");
    selectPro.innerHTML = `<option value="">-- Sélectionnez un professionnel --</option>`;

    if (!serviceNom) {
      selectPro.disabled = true;
      return;
    }

    try {
      const response = await fetch(`${API_URL}professionnels?service=${encodeURIComponent(serviceNom)}`);
      if (!response.ok) throw new Error("Erreur lors du chargement des professionnels");
      const professionnels = await response.json();
      console.log(professionnels)

      professionnels.forEach(pro => {
        const option = document.createElement("option");
        option.value = pro.CODE_EMPLOYE;
        option.textContent = pro.POSTE === "Médecin"
          ? `Dr. ${pro.PRENOM_EMPLOYE} ${pro.NOM_EMPLOYE}`
          : `${pro.PRENOM_EMPLOYE} ${pro.NOM_EMPLOYE}`;
        selectPro.appendChild(option);
      });

      selectPro.disabled = false;
    } catch (error) {
      console.error("Erreur lors du chargement des professionnels :", error);
      selectPro.disabled = true;
    }
  }
});


function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

let professionnelsParService = {}; // Déclaration globale (à mettre en haut du fichier JS)

async function chargerRendezVous() {
  try {
    const response = await fetch(`${API_URL}rendezvous`);
    if (!response.ok) throw new Error("Échec du chargement des rendez-vous");

    const rendezvous = await response.json();
    rendezVousGlobaux = rendezvous;
    

    const tbody = document.querySelector("#rdv tbody");
    tbody.innerHTML = "";

    if (rendezvous.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Aucun rendez-vous</td></tr>`;
      return;
    }

    rendezvous.forEach(rdv => {
      const row = document.createElement("tr");

      // ✅ Afficher le nom complet du patient au lieu du courriel
      const patient = tousLesPatients.find(p => p.COURRIEL === rdv.COURRIEL);
      const nomPatient = patient
        ? `${patient.PRENOM_PATIENT} ${patient.NOM_PATIENT}`
        : rdv.COURRIEL; // fallback

      // ✅ Affichage du nom complet du professionnel
      const nomAffiche = rdv.POSTE === "Médecin" 
        ? `Dr. ${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}` // Prénom + Nom pour un médecin
        : `${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}`; // Prénom + Nom pour un autre professionnel

      row.innerHTML = `
        <td class="col-date">${rdv.JOUR}</td>
        <td class="col-heure">${rdv.HEURE}</td>
        <td class="col-patient">${nomPatient}</td>
        <td class="col-pro">${nomAffiche}</td>
        <td class="col-service">${rdv.NOM_SERVICE}</td>
        <td>
          <button onclick="modifierRdv(${rdv.NUM_RDV})">Modifier</button>
          <button class="danger" onclick="annulerRdv(${rdv.NUM_RDV})">Annuler</button>
        </td>
      `;
      tbody.appendChild(row);

      // 🧠 Mise à jour du dictionnaire des professionnels par service
      const nomService = rdv.NOM_SERVICE;
      if (!professionnelsParService[nomService]) {
        professionnelsParService[nomService] = new Set();
      }
      professionnelsParService[nomService].add(nomAffiche);
    });

    filtrerRendezVous(); // 🟢 Appliquer le filtre actif après chargement
  } catch (err) {
    console.error("Erreur lors du chargement des RDV :", err);
  }
}

async function modifierRdv(numRdv) {
  const rdv = rendezVousGlobaux.find(r => r.NUM_RDV === numRdv);
  if (!rdv) return;

  const patient = tousLesPatients.find(p => p.COURRIEL === rdv.COURRIEL);
  if (!patient) {
    alert("Patient introuvable.");
    return;
  }

  // Remplir les champs avec les informations du rendez-vous
  document.getElementById("popupNumRdv").value = rdv.NUM_RDV;
  document.getElementById("popupNomPatient").value = `${patient.PRENOM_PATIENT} ${patient.NOM_PATIENT}`;
  document.getElementById("popupAssurancePatient").value = patient.NO_ASSURANCE_MALADIE;
  document.getElementById("popupDate").value = rdv.JOUR;
  document.getElementById("popupHour").value = rdv.HEURE;
  document.getElementById("popupDure").value = rdv.DUREE;
  console.log('valeur test:' + document.getElementById("popupDure").value);
  console.log('valeur init test:' + rdv.DUREE);

  rdvAvantChangement = rdv;

  console.log('test 332');
  console.log(rdvAvantChangement);

  console.log("type:" + typeof(rdv.HEURE));
  console.log("type:" + typeof(document.getElementById("popupHour")));
  console.log('valeur de rdv.HEURE:' + rdv.HEURE);
  console.log('valeur de popupHour.value:' + document.getElementById("popupHour").value);

  // Charger les services possibles
  const serviceSelect = document.getElementById("popupService");
  serviceSelect.innerHTML = ""; // Vider avant de remplir*/

  try {
    const response = await fetch(`${API_URL}services`);
    if (!response.ok) throw new Error("Erreur lors du chargement des services");
    const servicesPossibles = await response.json();

    servicesPossibles.forEach(service => {
      const option = document.createElement("option");
      option.value = service.NOM;
      option.textContent = service.NOM;
      if (service.NOM === rdv.NOM_SERVICE) option.selected = true;
      serviceSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des services :", error);
  }

  // Sélectionner le professionnel actuel
  const proSelect = document.getElementById("popupProfessionnel");
  proSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = rdv.CODE_EMPLOYE;
  option.textContent = rdv.POSTE === "Médecin"
    ? `Dr. ${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}`
    : `${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}`;
  proSelect.appendChild(option);
  proSelect.value = rdv.CODE_EMPLOYE;

  // ⏱️ Remplir le menu déroulant des heures à partir du tableau global optionHeure
  heureSelect = document.getElementById("popupHour");
  heureSelect.innerHTML = ""; // Vider les anciennes options



  // Appeler mettreAJourHeuresDisponibles pour regénérer optionHeure selon les filtres
  mettreAJourHeuresDisponibles();

  // Ajouter écouteurs pour mettre à jour les heures quand on change date/service/professionnel
  document.getElementById("popupDate").addEventListener("change", mettreAJourHeuresDisponibles);
  document.getElementById("popupService").addEventListener("change", mettreAJourHeuresDisponibles);
  document.getElementById("popupProfessionnel").addEventListener("change", mettreAJourHeuresDisponibles);

  // Afficher le pop-up
  document.getElementById("popupModification").classList.remove("hidden");
}


function fermerPopup() {
  document.getElementById("popupModification").classList.add("hidden");
}

function annulerRdv(numRdv) {
  if (confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
    const action = 'annuler';

    fetch(`${API_URL}rendezvous`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        numRdv,

      })
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok || data.error) {
        throw new Error(data.error || "Échec de l'annulation");
      }

      alert(data.message || "Rendez-vous annulé avec succès.");
      console.log(`RDV ${numRdv} annulé.`);
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

window.toggleUserMenu = function () {
  const menu = document.getElementById("userDropdown");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
};

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

function filtrerRendezVous() {
  const dateFiltre = document.getElementById("filtreDateRdv").value.trim();
  const nomPatientFiltre = document.getElementById("filtreNomPatientRdv").value.toLowerCase().trim();
  const nomProFiltre = document.getElementById("filtreNomProRdv").value.toLowerCase().trim();
  const serviceFiltre = document.getElementById("filtreServiceRdv").value.toLowerCase().trim();

  const lignes = document.querySelectorAll("#rdv tbody tr");

  lignes.forEach(ligne => {
    const dateCell = ligne.querySelector(".col-date")?.textContent.trim().toLowerCase() || "";
    const patientCell = ligne.querySelector(".col-patient")?.textContent.toLowerCase().trim() || "";
    const proCell = ligne.querySelector(".col-pro")?.textContent.toLowerCase().trim() || "";
    const serviceCell = ligne.querySelector(".col-service")?.textContent.toLowerCase().trim() || "";

    const [prenom = "", nom = ""] = patientCell.split(" ");

    const correspond =
      (!dateFiltre || dateCell.includes(dateFiltre)) &&
      (!nomPatientFiltre || prenom.startsWith(nomPatientFiltre) || nom.startsWith(nomPatientFiltre)) &&
      (!nomProFiltre || proCell.startsWith(nomProFiltre)) &&
      (!serviceFiltre || serviceCell.startsWith(serviceFiltre));

    ligne.style.display = correspond ? '' : 'none';
  });
}



function reinitialiserFiltreRdv() {
  document.getElementById("filtreDateRdv").value = '';
  document.getElementById("filtreNomPatientRdv").value = '';
  document.getElementById("filtreNomProRdv").value = '';
  document.getElementById("filtreServiceRdv").value = '';
  filtrerRendezVous();
}

async function validerModification() {
  const numRdv = document.getElementById("popupNumRdv").value;
  const jour = document.getElementById("popupDate").value;
  const heure = document.getElementById("popupHour").value;
  const dure = document.getElementById("popupDure").value;
  console.log(document.getElementById("popupDure").value);
  const action = "modifier";

  const popupNom = document.getElementById("popupProfessionnel").options[
    document.getElementById("popupProfessionnel").selectedIndex
  ].text.trim();

  let rdv; // Déclare la variable

  rendezVousGlobaux.forEach(r => {
    const nomAffiche = r.POSTE === "Médecin"
      ? `Dr. ${r.PRENOM_EMPLOYE} ${r.NOM_EMPLOYE}`
      : `${r.PRENOM_EMPLOYE} ${r.NOM_EMPLOYE}`;

    if (nomAffiche.trim() === popupNom) {
      rdv = r; // ✅ Stocke le bon rendez-vous
    }
  });
  console.log('rdv trouver test 2');
  console.log({
  CODE_EMPLOYE: rdv.CODE_EMPLOYE,
  JOUR: rdv.JOUR,
  HEURE: rdv.HEURE,
  STATUT: rdv.STATUT,
  NUM_RDV: rdv.NUM_RDV,
  DUREE: rdv.DUREE,
  COURRIEL: rdv.COURRIEL
});
console.log(rdv);

  console.log('rdv trouver test ancier');
  console.log({
  CODE_EMPLOYE: rdvAvantChangement.CODE_EMPLOYE,
  JOUR: rdvAvantChangement.JOUR,
  HEURE: rdvAvantChangement.HEURE,
  STATUT: rdvAvantChangement.STATUT,
  NUM_RDV: rdvAvantChangement.NUM_RDV,
  DUREE: rdvAvantChangement.DUREE
});


  // Récupérer l'heure actuelle du rendez-vous
  const heureActuelle = document.getElementById("popupHour").value;  // Par exemple : Heure actuelle sélectionnée dans le formulaire

    // 3️⃣ Envoyer la mise à jour avec la bonne durée, en incluant l'heure actuelle du RDV
  const res = await fetch(`${API_URL}rendezvous`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action,
      numRdv,
      JOUR: jour,
      HEURE: heureActuelle,  // Heure mise à jour
      DUREE: dure
    })
  });

    if (!res.ok) throw new Error("Échec de la modification du rendez-vous");

    let miseajour_json = await res.json();



    if(miseajour_json.status == 'OK'){
      alert(miseajour_json.message);
    } else if (miseajour_json.error){
      alert(miseajour_json.error);
    }

    //changerStatutDisponibilite(rdvAvantChangement.CODE_EMPLOYE, rdvAvantChangement.JOUR, rdvAvantChangement.HEURE, rdvAvantChangement.DUREE,'DISPONIBLE');
    //changerDisponibilite(rdv.CODE_EMPLOYE, rdv.JOUR, rdv.HEURE, rdv.COURRIEL, rdv.DUREE,'DISPONIBLE');

    fermerPopup();
    chargerRendezVous();
}


async function mettreAJourHeuresDisponibles() {
  try {
    // Récupérer le numéro du rendez-vous (numRdv)
    const numRdv = document.getElementById("popupNumRdv").value;

    // Convertir numRdv en entier si ce n'est pas déjà un entier
    const numRdvInt = parseInt(numRdv, 10);

    // Trouver le rendez-vous correspondant dans la liste des rendez-vous
    const rdv = rendezVousGlobaux.find(r => r.NUM_RDV === numRdvInt);
    if (!rdv) {
      console.error("Rendez-vous introuvable");
      return;
    }

    // Récupérer la date, le service, le code employé et l'heure depuis le rendez-vous
    const date = document.getElementById("popupDate").value; // La date du rendez-vous
    const serviceNom = document.getElementById("popupService").value; // Le service choisi
    const codeEmploye = rdv.CODE_EMPLOYE; // Le code de l'employé (professionnel) depuis le rendez-vous
    const heureActuelle = rdv.HEURE; // L'heure actuelle du rendez-vous depuis le RDV

    // Vérifie que la date, le service et le professionnel ont bien été sélectionnés
    if (!date || !serviceNom || !codeEmploye || !heureActuelle) {
      console.error("Paramètres manquants. Date, service, employé ou heure.");
      return;
    }

    // Debug : Vérification des paramètres avant de faire la requête
    console.log(`Date: ${date}, Code Employe: ${codeEmploye}, Service: ${serviceNom}, Heure: ${heureActuelle}`);

    // 🔹 1. Récupérer la durée du service sélectionné
    const resServices = await fetch(`${API_URL}services`);
    if (!resServices.ok) throw new Error("Erreur chargement services");
    const services = await resServices.json();

    // Debug : Vérification des services reçus
    console.log("Services reçus :", services);

    const service = services.find(s => s.NOM === serviceNom); // Trouve le service sélectionné
    if (!service) throw new Error("Service introuvable");
    const duree = service.DUREE || 20; // La durée du service (par défaut 20 minutes)

    // 🔹 2. Récupérer les disponibilités du professionnel à cette date et heure
    const resDispo = await fetch(`${API_URL}disponibilites/${codeEmploye}/${heureActuelle}/${date}`);
    if (!resDispo.ok) throw new Error("Erreur chargement disponibilités");
    const plages = await resDispo.json();

    // Debug : Vérification des disponibilités reçues
    console.log("Disponibilités reçues :", plages);

    const blocRequis = duree / 20; // Calcule le nombre de plages nécessaires en fonction de la durée du service
    
    console.log(typeof(heureActuelle));

    // 🔹 4. Remplir les options du menu déroulant avec les heures valides
    optionHeure = []; // Réinitialiser le tableau avant de le remplir

    for (let i = 0; i < plages.length; i++) {
      if (plages[i].STATUT === 'INDISPONIBLE' && plages[i].HEURE === heureActuelle +":00") {
        console.log("je suis entrer");
        const defaultOption = document.createElement('option');
            defaultOption.value = plages[i].HEURE;
            defaultOption.textContent = plages[i].HEURE + " (Heure actuelle)";
            defaultOption.disabled = false;
            defaultOption.selected = true;
            heureSelect.appendChild(defaultOption);
      }
    }

    for (let i = 0; i <= plages.length - blocRequis; i++) {
      const bloc = plages.slice(i, i + blocRequis); // Sélectionne un bloc de plages horaires
      const toutesDisponibles = bloc.length === blocRequis && bloc.every(p => p.STATUT === "DISPONIBLE"); // Vérifie si toutes les plages du bloc sont disponibles

      if (toutesDisponibles) {
        optionHeure.push(plages[i].HEURE); // ✅ Ajouter au tableau global
        console.log(`✅ Option ajoutée :` + plages[i].HEURE);
      }
    }

    // 🔍 Debug : Affiche tout le tableau des heures valides
    console.log("🟦 optionHeure contient :", optionHeure);


    // Si aucune heure valide n'a été trouvée, affiche une option indiquant qu'il n'y a pas de disponibilité
    if (optionHeure.length === 0) {
      optionHeure.push(heureActuelle);
    }

    optionHeure.forEach(h => {
      const option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      if (h === rdv.HEURE) option.selected = true; // Marquer l'heure actuelle
      heureSelect.append(option);
    });

  } catch (err) {
    alert("Erreur : " + err.message); // Affiche l'erreur en cas de problème
    console.error("Erreur lors de la mise à jour des heures disponibles :", err);
  }
}

async function mettreAJourHeuresDisponiblesNewRdv() {
  try {
    const date = document.getElementById("date").value;
    const serviceNom = document.getElementById("service").value;
    const heureSelect = document.getElementById("heure");

    if (!date || !serviceNom || !heureSelect) {
      console.warn("⏳ Champs requis manquants.");
      return;
    }

    // Récupérer la liste des services
    const resServices = await fetch(`${API_URL}services`);
    if (!resServices.ok) throw new Error("Erreur chargement services");
    const services = await resServices.json();

    // Récupérer la liste des professionnels
    const response = await fetch(`${API_URL}professionnels`);
    if (!response.ok) throw new Error("Erreur chargement professionnels");
    const professionnels = await response.json();

    // Trouver le professionnel sélectionné dans le menu
    const select = document.getElementById("professionnel");
    if (!select) throw new Error("Champ professionnel introuvable");
    const nomSelectionne = select.options[select.selectedIndex].text.trim();
    console.log('nomSelectionne:' + nomSelectionne);

    const correspondant = professionnels.find(p => {
      const nomComplet = `${p.POSTE === 'Médecin' ? 'Dr. ' : ''}${p.PRENOM_EMPLOYE} ${p.NOM_EMPLOYE}`;
      console.log('nomComplet:' + nomComplet);
      return nomComplet === nomSelectionne;
    });

    if (!correspondant) {
      console.warn("❌ Aucun professionnel ne correspond à :", nomSelectionne);
      return;
    }

    codeEmploye = correspondant.CODE_EMPLOYE;

    const service = services.find(s => s.NOM === serviceNom);
    if (!service) throw new Error("Service introuvable");
    const duree = service.DUREE || 20;
    const blocRequis = duree / 20;

    console.log(blocRequis);

    // Récupérer les disponibilités
    const resDispo = await fetch(`${API_URL}disponibilites/${codeEmploye}/${date}`);
    if (!resDispo.ok) throw new Error("Erreur chargement disponibilités");

    const plages = await resDispo.json(); // ✔️ ne pas utiliser .text() avant
    if (!plages || plages.length === 0) throw new Error("Aucune disponibilité reçue");

    console.log("Disponibilités reçues :", plages);


    console.log("Disponibilités reçues :", plages);

    // Réinitialiser le menu des heures
    optionHeure = [];
    heureSelect.innerHTML = "";

    const defaultOption = document.createElement('option');
    defaultOption.value = 'NULL';
    defaultOption.textContent = 'Heure du Rendez-Vous';
    defaultOption.disabled = false;
    defaultOption.selected = true;
    heureSelect.appendChild(defaultOption);

    for (let i = 0; i <= plages.length - blocRequis; i++) {
      const bloc = plages.slice(i, i + blocRequis);
      const toutesDisponibles = bloc.length === blocRequis && bloc.every(p => p.STATUT === "DISPONIBLE");

      if (toutesDisponibles) {
        optionHeure.push(plages[i].HEURE);
        console.log(`✅ Option ajoutée : ${plages[i].HEURE}`);
      }
    }

    if (optionHeure.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Aucune plage disponible";
      option.disabled = true;
      option.selected = true;
      heureSelect.append(option);
      return;
    }

    optionHeure.forEach(h => {
      const option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      option.selected = optionHeure.length === 1;
      heureSelect.append(option);
    });

  } catch (err) {
    alert("Erreur : " + err.message);
    console.error("Erreur lors de la mise à jour des heures disponibles :", err);
  }
}


async function attendreEtEnvoyer() {
  // ⏳ Attendre que les champs existent dans le DOM
  while (
    !document.getElementById("date") ||
    !document.getElementById("service") ||
    !document.getElementById("professionnel") ||
    !document.getElementById("heure")
  ) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // ✅ Ajouter des écouteurs pour relancer dynamiquement la mise à jour
  document.getElementById("date").addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);
  document.getElementById("service").addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);
  document.getElementById("professionnel").addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);

  // 🟡 Premier appel si tous les champs sont déjà remplis
  const date = document.getElementById("date").value;
  const serviceNom = document.getElementById("service").value;
  const codeEmploye = document.getElementById("professionnel").value;

  if (date && serviceNom && codeEmploye) {
    await mettreAJourHeuresDisponiblesNewRdv();
  }
}

async function creerRendezVous() {
  try {
    const nomPatient = document.getElementById("nomPatient").value.trim();
    const nomService = document.getElementById("service").value;
    const professionnelNom = document.getElementById("professionnel").value;
    const jour = document.getElementById("date").value;
    const heure = document.getElementById("heure").value;

    if (!nomPatient || !nomService || !professionnelNom || !jour || !heure) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // 🔹 Chargement et recherche du professionnel
    const professionnels = await (await fetch(`${API_URL}professionnels`)).json();
    const professionnel = professionnels.find(p => {
      const nom = `${p.POSTE === 'Médecin' ? 'Dr. ' : ''}${p.PRENOM_EMPLOYE} ${p.NOM_EMPLOYE}`.trim();
      return nom === professionnelNom;
    });
    if (!professionnel) throw new Error("Professionnel introuvable.");
    const codeEmploye = professionnel.CODE_EMPLOYE;

    // 🔹 Chargement et recherche du service
    const services = await (await fetch(`${API_URL}services`)).json();
    const service = services.find(s => s.NOM === nomService);
    if (!service) throw new Error("Service introuvable.");
    const duree = service.DUREE || 20;
    console.log(nomService);
    //console.log(service.NOM);
    console.log(duree);
    console.log(service.DUREE);

    // 🔹 Chargement et recherche du patient
    const patients = await (await fetch(`${API_URL}patients`)).json();
    const patient = patients.find(p => `${p.PRENOM_PATIENT} ${p.NOM_PATIENT}`.trim() === nomPatient);
    if (!patient) throw new Error("Patient introuvable.");
    const courrielPatient = patient.COURRIEL;

    // ✅ Création du rendez-vous
    const body = {
      CODE_EMPLOYE: codeEmploye,
      COURRIEL: courrielPatient,
      JOUR: jour,
      HEURE: heure,
      DUREE: duree,
      NOM_SERVICE: nomService
    };

    const resPost = await fetch(`${API_URL}rendezvous/secretaire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await resPost.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error("Réponse du serveur invalide : " + text);
    }

    if (!resPost.ok) {
      throw new Error(json?.error || "Erreur serveur");
    }

    console.log("✅ POST réussi :", json);
    console.log('testdure:' + duree);

    // ✅ Mise à jour directe de la disponibilité
    await changerDisponibilite(codeEmploye, jour, heure,courrielPatient, duree, "OCCUPÉ");

  } catch (err) {
    console.error("❌ Erreur :", err);
    alert("Erreur : " + err.message);
  }
}



/*async function changerDisponibilite(codeEmploye, jour, heure, courrielPatient, duree, statut) {
  const resultat = await fetch(`${API_URL}rendezvous`);
  if (!resultat.ok) throw new Error("Erreur lors du chargement des rendez-vous");
  const rdvs = await resultat.json();

  rdvs.forEach(r => {
    console.log(`📌 RDV : courriel=${r.COURRIEL}, jour=${r.JOUR}, heure=${r.HEURE}`);
  });

  console.log(`🔍 Recherché : courriel=${courrielPatient}, jour=${jour}, heure=${heure}`);

  const rdv = rdvs.find(r =>
    r.COURRIEL === courrielPatient &&
    r.JOUR === jour &&
    r.HEURE === heure
  );

  console.log('✅ rdv trouvé :', rdv);

  if (!rdv) {
    console.warn("Aucun rendez-vous trouvé pour :", courrielPatient, jour, heure);
    return;
  }

  const numRdv = rdv.NUM_RDV;

  try {
    const response = await fetch(`${API_URL}disponibilites`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CODE_EMPLOYE: codeEmploye,
        JOUR: jour,
        HEURE: heure,
        STATUT: statut,
        NUM_RDV: numRdv,
        DUREE: duree
      })
    });

    if (!response.ok) {
      const erreur = await response.text();
      throw new Error(`Erreur API: ${erreur}`);
    }

    console.log(`✅ Disponibilité changée à ${statut} pour ${codeEmploye} le ${jour} à ${heure}`);
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour de la disponibilité :", err.message);
    alert("Erreur changement disponibilité : " + err.message);
  }
}

async function changerStatutDisponibilite(codeEmploye, jour, heure, duree, statut) {

  console.log('test 555');
  console.log({
  CODE_EMPLOYE: codeEmploye,
  JOUR: jour,
  HEURE: heure,
  STATUT: statut,
  DUREE: duree
});

  try {
    const response = await fetch(`${API_URL}disponibilites/annulation`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CODE_EMPLOYE: codeEmploye,
        JOUR: jour,
        HEURE: heure,
        STATUT: statut,
        DUREE: duree
      })
    });

    if (!response.ok) {
      const erreur = await response.text();
      throw new Error(`Erreur API: ${erreur}`);
    }

    console.log(`✅ Disponibilité changée à ${statut} pour ${codeEmploye} le ${jour} à ${heure}`);
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour de la disponibilité :", err.message);
    alert("Erreur changement disponibilité : " + err.message);
  }
}*/