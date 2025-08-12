// ================== Config & session ==================
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost/api/"
    : "http://20.116.216.218/api/";

const codeEmploye = new URLSearchParams(window.location.search).get("codeEmploye");
const codeInUrl   = new URLSearchParams(window.location.search).get("codeEmploye");
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

// ================== État global + Utils ==================
let tousLesPatients = [];
let rendezVousGlobaux = [];
let optionHeure = [];
let heureSelect;
let rdvAvantChangement = [];
let professionnelsParService = {}; // pour la popup "modifier"
let demandeEnvoyee = false;

// utilitaire heure "HH:MM"
const toHHMM = (h) => (h ?? "").slice(0, 5);

// ===================================================================
// ============== 1) RENDEZ-VOUS — LISTE & FILTRES ===================
// ===================================================================
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
}

async function chargerAfficherRendezVous() {
  try {
    const response = await fetch(`${API_URL}rendezvous`);
    if (!response.ok) throw new Error("Échec du chargement des rendez-vous");

    const rendezvous = await response.json();
    rendezVousGlobaux = rendezvous;

    const tbody = document.querySelector("#rdv tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(rendezvous) || rendezvous.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Aucun rendez-vous</td></tr>`;
      return;
    }

    rendezvous.forEach((rdv) => {
      const row = document.createElement("tr");

      const patient = tousLesPatients.find((p) => p.COURRIEL === rdv.COURRIEL);
      const nomPatient = patient ? `${patient.PRENOM_PATIENT} ${patient.NOM_PATIENT}` : rdv.COURRIEL;

      const nomAffiche =
        rdv.POSTE === "Médecin"
          ? `Dr. ${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}`
          : `${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}`;

      row.innerHTML = `
        <td class="col-date">${rdv.JOUR}</td>
        <td class="col-heure">${toHHMM(rdv.HEURE)}</td>
        <td class="col-patient">${nomPatient}</td>
        <td class="col-pro">${nomAffiche}</td>
        <td class="col-service">${rdv.NOM_SERVICE}</td>
        <td>
          <button onclick="modifierRdv(${rdv.NUM_RDV})">Modifier</button>
          <button class="danger" onclick="annulerRdv(${rdv.NUM_RDV})">Annuler</button>
        </td>
      `;
      tbody.appendChild(row);

      const nomService = rdv.NOM_SERVICE;
      if (!professionnelsParService[nomService]) professionnelsParService[nomService] = new Set();
      professionnelsParService[nomService].add(nomAffiche);
    });

    filtrerRendezVous();
  } catch (err) {
    console.error("Erreur chargement RDV :", err);
  }
}

function filtrerRendezVous() {
  const dateFiltre = document.getElementById("filtreDateRdv").value.trim();
  const nomPatientFiltre = document.getElementById("filtreNomPatientRdv").value.toLowerCase().trim();
  const nomProFiltre = document.getElementById("filtreNomProRdv").value.toLowerCase().trim();
  const serviceFiltre = document.getElementById("filtreServiceRdv").value.toLowerCase().trim();

  const lignes = document.querySelectorAll("#rdv tbody tr");

  lignes.forEach((ligne) => {
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

    ligne.style.display = correspond ? "" : "none";
  });
}

function reinitialiserFiltreRdv() {
  document.getElementById("filtreDateRdv").value = "";
  document.getElementById("filtreNomPatientRdv").value = "";
  document.getElementById("filtreNomProRdv").value = "";
  document.getElementById("filtreServiceRdv").value = "";
  filtrerRendezVous();
}

// ===================================================================
// ============== 2) RENDEZ-VOUS — ACTIONS / MODIFICATION ============
// ===================================================================
async function modifierRdv(numRdv) {
  const rdv = rendezVousGlobaux.find((r) => r.NUM_RDV === numRdv);
  if (!rdv) return;

  const patient = tousLesPatients.find((p) => p.COURRIEL === rdv.COURRIEL);
  if (!patient) return alert("Patient introuvable.");

  document.getElementById("popupNumRdv").value = rdv.NUM_RDV;
  document.getElementById("popupNomPatient").value = `${patient.PRENOM_PATIENT} ${patient.NOM_PATIENT}`;
  document.getElementById("popupAssurancePatient").value = patient.NO_ASSURANCE_MALADIE;
  document.getElementById("popupDate").value = rdv.JOUR;
  document.getElementById("popupHour").value = toHHMM(rdv.HEURE);
  document.getElementById("popupDure").value = rdv.DUREE;

  rdvAvantChangement = rdv;

  // Services pour la popup
  const serviceSelect = document.getElementById("popupService");
  serviceSelect.innerHTML = "";
  try {
    const response = await fetch(`${API_URL}services`);
    if (!response.ok) throw new Error("Erreur lors du chargement des services");
    const servicesPossibles = await response.json();
    servicesPossibles.forEach((service) => {
      const option = document.createElement("option");
      option.value = service.NOM;
      option.textContent = service.NOM;
      if (service.NOM === rdv.NOM_SERVICE) option.selected = true;
      serviceSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur chargement services (popup) :", error);
  }

  // Pro courant
  const proSelect = document.getElementById("popupProfessionnel");
  proSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = rdv.CODE_EMPLOYE;
  option.textContent =
    rdv.POSTE === "Médecin" ? `Dr. ${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}` : `${rdv.PRENOM_EMPLOYE} ${rdv.NOM_EMPLOYE}`;
  proSelect.appendChild(option);
  proSelect.value = rdv.CODE_EMPLOYE;

  // Heures
  heureSelect = document.getElementById("popupHour");
  heureSelect.innerHTML = "";
  await mettreAJourHeuresDisponibles();

  document.getElementById("popupModification").classList.remove("hidden");
}

function fermerPopup() {
  document.getElementById("popupModification").classList.add("hidden");
}

function annulerRdv(numRdv) {
  if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;

  fetch(`${API_URL}rendezvous`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "annuler", numRdv }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok || data.error) throw new Error(data.error || "Échec de l'annulation");
      alert(data.message || "Rendez-vous annulé avec succès.");
      chargerAfficherRendezVous();
    })
    .catch((err) => alert("Erreur : " + err.message));
}

async function validerModification() {
  const numRdv = document.getElementById("popupNumRdv").value;
  const jour = document.getElementById("popupDate").value;
  const heure = document.getElementById("popupHour").value;
  const dure = document.getElementById("popupDure").value;

  try {
    const res = await fetch(`${API_URL}rendezvous`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "modifier", numRdv, JOUR: jour, HEURE: heure, DUREE: dure }),
    });
    if (!res.ok) throw new Error("Échec de la modification du rendez-vous");

    const json = await res.json();
    if (json.status === "OK") alert(json.message);
    else if (json.error) alert(json.error);

    fermerPopup();
    chargerAfficherRendezVous();
  } catch (e) {
    alert("Erreur : " + (e?.message || e));
  }
}

// ===================================================================
// ============== 3) RENDEZ-VOUS — HEURES (POPUP MODIF) ==============
// ===================================================================
async function mettreAJourHeuresDisponibles() {
  try {
    const numRdv = parseInt(document.getElementById("popupNumRdv").value, 10);
    const rdv = rendezVousGlobaux.find((r) => r.NUM_RDV === numRdv);
    if (!rdv) return console.error("Rendez-vous introuvable");

    const date = document.getElementById("popupDate").value;
    const serviceNom = document.getElementById("popupService").value;
    const codeEmp = rdv.CODE_EMPLOYE;
    const heureActuelle = toHHMM(rdv.HEURE);
    if (!date || !serviceNom || !codeEmp || !heureActuelle) return;

    const resServices = await fetch(`${API_URL}services`);
    if (!resServices.ok) throw new Error("Erreur chargement services");
    const services = await resServices.json();

    const service = services.find((s) => s.NOM === serviceNom);
    if (!service) throw new Error("Service introuvable");
    const duree = service.DUREE || 20;
    const blocRequis = duree / 20;

    const resDispo = await fetch(`${API_URL}disponibilites/${codeEmp}/${heureActuelle}/${date}`);
    if (!resDispo.ok) throw new Error("Erreur chargement disponibilités");
    const plages = await resDispo.json();

    optionHeure = [];
    // Conserver l'heure actuelle si marquée indisponible (car occupée par ce RDV)
    for (let i = 0; i < plages.length; i++) {
      if (plages[i].STATUT === "INDISPONIBLE" && toHHMM(plages[i].HEURE) === heureActuelle) {
        const def = document.createElement("option");
        def.value = toHHMM(plages[i].HEURE);
        def.textContent = `${toHHMM(plages[i].HEURE)} (Heure actuelle)`;
        def.selected = true;
        document.getElementById("popupHour").appendChild(def);
      }
    }

    for (let i = 0; i <= plages.length - blocRequis; i++) {
      const bloc = plages.slice(i, i + blocRequis);
      const ok = bloc.length === blocRequis && bloc.every((p) => p.STATUT === "DISPONIBLE");
      if (ok) optionHeure.push(toHHMM(plages[i].HEURE));
    }
    if (optionHeure.length === 0) optionHeure.push(heureActuelle);

    const now = new Date();
    const selectedDate = new Date(date);
    const sel = document.getElementById("popupHour");
    sel.innerHTML = "";

    optionHeure.forEach((h) => {
      const opt = document.createElement("option");
      opt.value = h;
      opt.textContent = h;

      if (selectedDate.toDateString() === now.toDateString()) {
        const [H, M] = h.split(":").map(Number);
        const candidate = new Date(selectedDate);
        candidate.setHours(H, M, 0, 0);
        if (candidate <= now) opt.disabled = true;
      }

      if (h === heureActuelle) opt.selected = true;
      sel.append(opt);
    });
  } catch (err) {
    alert("Erreur : " + err.message);
    console.error("Erreur MAJ heures (popup) :", err);
  }
}

// ===================================================================
// ============== 4) NOUVEAU RENDEZ-VOUS — SERVICES/PROS =============
// ===================================================================
async function chargerServicesPourCreation() {
  const selectService = document.getElementById("service");
  if (!selectService) return;

  const previousValue = selectService.value;
  selectService.disabled = true;
  selectService.innerHTML = `<option value="">Chargement des services…</option>`;

  try {
    const res = await fetch(`${API_URL}services`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const services = await res.json();

    const uniques = [
      ...new Map(
        (Array.isArray(services) ? services : [])
          .filter((s) => s && typeof s.NOM === "string" && s.NOM.trim() !== "")
          .map((s) => [s.NOM.trim(), s])
      ).values(),
    ].sort((a, b) => a.NOM.localeCompare(b.NOM));

    selectService.innerHTML = `<option value="">-- Sélectionnez un service --</option>`;
    uniques.forEach(({ NOM }) => {
      const opt = document.createElement("option");
      opt.value = NOM;
      opt.textContent = NOM;
      selectService.appendChild(opt);
    });

    let valueChanged = false;
    if (previousValue && uniques.some((s) => s.NOM === previousValue)) {
      selectService.value = previousValue;
    } else {
      const preset = selectService.dataset.selected?.trim();
      if (preset && uniques.some((s) => s.NOM === preset)) {
        selectService.value = preset;
        valueChanged = true;
      }
    }

    selectService.disabled = false;
    if (selectService.value && valueChanged) {
      selectService.dispatchEvent(new Event("change"));
    }
  } catch (error) {
    console.error("Erreur chargement services :", error);
    selectService.innerHTML = `<option value="">Impossible de charger les services</option>`;
    selectService.disabled = false;
  }
}

async function mettreAJourProfessionnelsSuivi() {
  const serviceNom = document.getElementById("service")?.value || "";
  const selectPro = document.getElementById("professionnel");
  if (!selectPro) return;

  selectPro.disabled = true;
  selectPro.innerHTML = `<option value="">-- Sélectionnez un professionnel --</option>`;
  if (!serviceNom) return;

  try {
    // Si ton backend attend /professionnels/{service}, garde cette ligne :
    const res = await fetch(`${API_URL}professionnels/${serviceNom}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const professionnels = await res.json();

    console.log(professionnels); // 👈 garder pour debug ciblé si besoin

    (Array.isArray(professionnels) ? professionnels : []).forEach((pro) => {
      if (!pro || !pro.CODE_EMPLOYE) return;
      const opt = document.createElement("option");
      opt.value = pro.CODE_EMPLOYE; // value = ID
      opt.textContent =
        pro.POSTE === "Médecin"
          ? `Dr. ${pro.PRENOM_EMPLOYE} ${pro.NOM_EMPLOYE}`
          : `${pro.PRENOM_EMPLOYE} ${pro.NOM_EMPLOYE}`;
      selectPro.appendChild(opt);
    });

    selectPro.disabled = false;

  } catch (error) {
    console.error("Erreur chargement professionnels :", error);
    selectPro.disabled = true;
  }
}

// ===================================================================
// ============== 5) NOUVEAU RENDEZ-VOUS — HEURES & CRÉATION =========
// ===================================================================
async function mettreAJourHeuresDisponiblesNewRdv() {
  try {
    const date = document.getElementById("date").value;
    const serviceNom = document.getElementById("service").value;
    const heureSelect = document.getElementById("heure");
    const select = document.getElementById("professionnel");
    const codeEmp = select?.value;

    if (!date || !serviceNom || !codeEmp || !heureSelect) return;

    const resServices = await fetch(`${API_URL}services`);
    if (!resServices.ok) throw new Error("Erreur chargement services");
    const services = await resServices.json();
    const service = services.find((s) => s.NOM === serviceNom);
    if (!service) throw new Error("Service introuvable");
    const duree = service.DUREE || 20;
    const blocRequis = duree / 20;

    const resDispo = await fetch(`${API_URL}disponibilites/${codeEmp}/${date}`);
    if (!resDispo.ok) throw new Error("Erreur chargement disponibilités");
    const plages = await resDispo.json();

    const now = new Date();
    const selectedDate = new Date(date);
    const optionsValides = [];

    for (let i = 0; i <= plages.length - blocRequis; i++) {
      const bloc = plages.slice(i, i + blocRequis);
      const ok = bloc.length === blocRequis && bloc.every((p) => p.STATUT === "DISPONIBLE");
      if (ok) optionsValides.push(toHHMM(plages[i].HEURE));
    }

    heureSelect.innerHTML = "";
    if (optionsValides.length === 0) {
      heureSelect.innerHTML = `<option value="">Aucune plage disponible</option>`;
      return;
    }

    const isToday = selectedDate.toDateString() === now.toDateString();
    for (const h of optionsValides) {
      const opt = document.createElement("option");
      opt.value = h;
      opt.textContent = h;

      if (isToday) {
        const [H, M] = h.split(":").map(Number);
        const candidate = new Date(selectedDate);
        candidate.setHours(H, M, 0, 0);
        if (candidate <= now) opt.disabled = true;
      }

      heureSelect.append(opt);
    }
  } catch (err) {
    alert("Erreur : " + err.message);
    console.error("Erreur MAJ heures (création) :", err);
  }
}

async function attendreEtEnvoyer() {
  while (!document.getElementById("date") || !document.getElementById("service") || !document.getElementById("professionnel") || !document.getElementById("heure")) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  document.getElementById("date").addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);
  document.getElementById("service").addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);
  document.getElementById("professionnel").addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);

  const date = document.getElementById("date").value;
  const serviceNom = document.getElementById("service").value;
  const codeEmp = document.getElementById("professionnel").value;
  if (date && serviceNom && codeEmp) await mettreAJourHeuresDisponiblesNewRdv();
}

async function creerRendezVous() {
  try {
    const nomPatient = document.getElementById("nomPatient")?.value.trim();
    const nomService = document.getElementById("service")?.value;
    const selectPro = document.getElementById("professionnel");
    const codeEmp = selectPro ? selectPro.value : "";
    const jour = document.getElementById("date")?.value;
    const heure = document.getElementById("heure")?.value;

    if (!nomPatient || !nomService || !codeEmp || !jour || !heure) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const services = await (await fetch(`${API_URL}services`)).json();
    const service = services.find((s) => s.NOM === nomService);
    if (!service) throw new Error("Service introuvable.");
    const duree = service.DUREE || 20;

    const patients =
      Array.isArray(window.tousLesPatients) && window.tousLesPatients.length
        ? window.tousLesPatients
        : await (await fetch(`${API_URL}patients`)).json();

    const patient = patients.find(
      (p) => `${p.PRENOM_PATIENT} ${p.NOM_PATIENT}`.trim().toLowerCase() === nomPatient.toLowerCase()
    );
    if (!patient) throw new Error("Patient introuvable.");
    const courrielPatient = patient.COURRIEL;

    const resPost = await fetch(`${API_URL}rendezvous/secretaire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CODE_EMPLOYE: codeEmp,
        COURRIEL: courrielPatient,
        JOUR: jour,
        HEURE: heure,
        DUREE: duree,
        NOM_SERVICE: nomService,
      }),
    });

    const text = await resPost.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Réponse du serveur invalide : " + text);
    }
    if (!resPost.ok) throw new Error(json?.error || "Erreur serveur");

    alert(json?.message || "Le rendez-vous a été ajouté avec succès.");
    reinitialiserFormulaireRdv();
    await chargerAfficherRendezVous();
  } catch (err) {
    console.error("Erreur :", err);
    alert("Erreur : " + (err?.message || err));
  }
}

function reinitialiserFormulaireRdv() {
  document.getElementById("nomPatient").value = "";
  document.getElementById("assurancePatient").value = "";
  document.getElementById("service").value = "";
  document.getElementById("professionnel").innerHTML = `<option value="">-- Sélectionnez un professionnel --</option>`;
  document.getElementById("professionnel").disabled = true;
  document.getElementById("date").value = "";
  document.getElementById("heure").innerHTML = `<option value="">Heure du Rendez-Vous</option>`;
}

// ===================================================================
// ============== 6) INFORMATIONS PATIENTS ===========================
// ===================================================================
async function chargerPatients() {
  try {
    const response = await fetch(`${API_URL}patients`);
    if (!response.ok) throw new Error("Échec du chargement des patients");

    const patients = await response.json();
    tousLesPatients = patients;

    const tbody = document.querySelector("#table-patients");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!Array.isArray(patients) || patients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Aucun patient trouvé</td></tr>`;
      return;
    }

    patients.forEach((p) => {
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
    console.error("Erreur chargement patients :", err);
  }
}

async function chargerPatientsPourListe() {
  try {
    const res = await fetch(`${API_URL}patients`);
    tousLesPatients = await res.json();
  } catch (e) {
    console.error("Erreur chargement patients (cache) :", e);
  }
}

function afficherPatientsFiltres(nomTape) {
  const liste = document.getElementById("listeDeroulantePatients");
  if (!liste) return;
  liste.innerHTML = "";

  const filtres = tousLesPatients.filter((p) => {
    const nomComplet = `${p.PRENOM_PATIENT} ${p.NOM_PATIENT}`.toLowerCase();
    return nomComplet.includes(nomTape.toLowerCase());
  });

  if (filtres.length === 0) {
    liste.classList.add("hidden");
    return;
  }

  filtres.forEach((p) => {
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
  const match = tousLesPatients.find((p) => p.NO_ASSURANCE_MALADIE === numero);
  if (match) document.getElementById("nomPatient").value = `${match.PRENOM_PATIENT} ${match.NOM_PATIENT}`;
}

function filtrerPatients() {
  const prenom = document.getElementById("filtrePrenom").value.toLowerCase().trim();
  const nom = document.getElementById("filtreNom").value.toLowerCase().trim();
  const dateNaissance = document.getElementById("filtreDateNaissance").value.trim();
  const assurance = document.getElementById("filtreAssurance").value.toLowerCase().trim();

  document.querySelectorAll(".ligne-patient").forEach((ligne) => {
    const prenomCell = ligne.querySelector(".col-prenom")?.textContent.toLowerCase().trim() || "";
    const nomCell = ligne.querySelector(".col-nom")?.textContent.toLowerCase().trim() || "";
    const dateCell = ligne.querySelector(".col-date")?.textContent.trim() || "";
    const assuranceCell = ligne.querySelector(".col-assurance")?.textContent.toLowerCase().trim() || "";

    const correspond =
      (!prenom || prenomCell.startsWith(prenom)) &&
      (!nom || nomCell.startsWith(nom)) &&
      (!dateNaissance || dateCell.includes(dateNaissance)) &&
      (!assurance || assuranceCell.startsWith(assurance));

    ligne.style.display = correspond ? "" : "none";
  });
}

// ===================================================================
// ============== 7) CONGÉ ===========================================
// ===================================================================
async function chargerDemandesVacances() {
  try {
    const res = await fetch(`${API_URL}conge/${codeEmploye}`);
    const data = await res.json();

    const tbody = document.querySelector("#table-vacances tbody");
    if (!tbody) return;

    if (!Array.isArray(data) || !data.length) {
      tbody.innerHTML = "<tr><td colspan=\"4\">Aucune demande de vacances</td></tr>";
      return;
    }

    tbody.innerHTML = data
      .map(
        (item) => `
        <tr>
          <td>${item.PRENOM_EMPLOYE || ""} ${item.NOM_EMPLOYE || ""}</td>
          <td>${item.DATE_DEBUT}</td>
          <td>${item.DATE_FIN}</td>
          <td>${item.STATUS}</td>
        </tr>`
      )
      .join("");
  } catch (error) {
    console.error("Erreur chargement vacances :", error);
    const tbody = document.querySelector("#table-vacances tbody");
    if (tbody) tbody.innerHTML = "<tr><td colspan=\"4\">Erreur de chargement</td></tr>";
  }
}

// ===================================================================
// ============== 8) HORAIRE =========================================
// ===================================================================
async function chargerAfficherHoraires() {
  try {
    const res = await fetch(`${API_URL}horaires`);
    const data = await res.json();

    const tbody = document.querySelector("#horaire table tbody");
    if (!tbody) return;

    if (!Array.isArray(data) || !data.length) {
      tbody.innerHTML = '<tr><td colspan="3">Aucun horaire disponible</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map((h) => {
        const isCurrentUser = parseInt(h.CODE_EMPLOYE) === parseInt(codeEmploye);
        return `
          <tr ${isCurrentUser ? 'class="surbrillance-row"' : ""}>
            <td>${escapeHtml(h.NOM_EMPLOYE)}</td>
            <td>${escapeHtml(h.JOURS)}</td>
            <td>${escapeHtml(h.HEURE)}</td>
          </tr>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Erreur chargement horaires :", error);
  }
}

// ===================================================================
// ============== 9) UI DIVERS =======================================
// ===================================================================
window.toggleUserMenu = function () {
  const menu = document.getElementById("userDropdown");
  if (!menu) return;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

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

  [...professionnels].forEach((nom) => {
    const option = document.createElement("option");
    option.value = nom;
    option.textContent = nom;
    select.appendChild(option);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===================================================================
// ============== 10) DOM READY (branchements & init) =================
// ===================================================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await chargerPatients();
    await chargerAfficherRendezVous();
  } catch (e) {
    console.error(e);
  }

  chargerAfficherHoraires();
  chargerDemandesVacances();
  chargerPatientsPourListe();
  await chargerServicesPourCreation();

  // Références champs "Nouveau RDV"
  const serviceEl = document.getElementById("service");
  const proEl     = document.getElementById("professionnel");
  const dateEl    = document.getElementById("date");

  // Contraintes de dates : pas de dates passées, pas de week-ends
  // (nécessite les utilitaires appliquerContraintesDates / toYMD / isWeekend / nextWeekday)
  appliquerContraintesDates(["date", "popupDate"]);

  // Branchements "Nouveau RDV"
  serviceEl?.addEventListener("change", async () => {
    await mettreAJourProfessionnelsSuivi();
    await mettreAJourHeuresDisponiblesNewRdv();
  });
  proEl?.addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);
  dateEl?.addEventListener("change", mettreAJourHeuresDisponiblesNewRdv);

  // Si un service est déjà présent, initialise pros + heures
  if (serviceEl?.value) {
    await mettreAJourProfessionnelsSuivi();
    await mettreAJourHeuresDisponiblesNewRdv();
  }

  showTab("rdv");

  // logout (header)
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => (window.location.href = "login.html"));

  // Demandes de vacances
  const btnVacances = document.getElementById("btn-demande-vacances");
  if (btnVacances) {
    btnVacances.addEventListener("click", async (e) => {
      e.preventDefault();
      const errDiv = document.getElementById("erreur-vacances");
      errDiv.innerText = "";

      const dateDebut = document.getElementById("date-debut").value;
      const dateFin = document.getElementById("date-fin").value;

      if (!codeEmploye || !dateDebut || !dateFin) {
        errDiv.style.color = "red";
        errDiv.innerText = "Veuillez remplir toutes les informations.";
        return;
      }

      try {
        const response = await fetch(`${API_URL}conge/employe/${codeEmploye}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dateDebut, dateFin }),
        });
        const json = await response.json();

        if (!response.ok || json.status !== "OK") throw new Error(json.error || "Erreur inconnue");

        errDiv.style.color = "green";
        errDiv.innerText = json.message || "Demande envoyée avec succès.";
        chargerDemandesVacances();
        document.getElementById("date-debut").value = "";
        document.getElementById("date-fin").value = "";
      } catch (error) {
        console.error("Erreur demande vacances :", error);
        errDiv.style.color = "red";
        errDiv.innerText = error.message || "Réponse du serveur invalide.";
      }
    });
  }

  // Filtres dynamiques patients
  ["filtrePrenom", "filtreNom", "filtreDateNaissance", "filtreAssurance"].forEach((id) => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("input", filtrerPatients);
  });

  // Filtres dynamiques RDV
  ["filtreDateRdv", "filtreNomPatientRdv", "filtreNomProRdv", "filtreServiceRdv"].forEach((id) => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("input", filtrerRendezVous);
  });

  // Toggle filtres
  document.querySelector("#patients .filtre-icon")?.addEventListener("click", () => {
    document.getElementById("filtreSection")?.classList.toggle("hidden");
  });
  document.querySelector("#rdv .filtre-icon")?.addEventListener("click", () => {
    document.getElementById("filtreSectionRdv")?.classList.toggle("hidden");
  });

  // Déconnexion (footer/bouton secondaire)
  document.getElementById("btn-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Liste déroulante recherche patient (création RDV)
  const champNomPatient = document.getElementById("nomPatient");
  champNomPatient?.addEventListener("input", () => afficherPatientsFiltres(champNomPatient.value.trim()));
  champNomPatient?.addEventListener("focus", () => afficherPatientsFiltres(champNomPatient.value.trim()));

  document.getElementById("assurancePatient")?.addEventListener("input", rechercherPatientParAssurance);

  // Fermer la liste si clic à l’extérieur
  document.addEventListener("click", (e) => {
    const champ = document.getElementById("nomPatient");
    const liste = document.getElementById("listeDeroulantePatients");
    if (champ && liste && !champ.contains(e.target) && !liste.contains(e.target)) {
      liste.classList.add("hidden");
    }
  });

  // Popup modification : MAJ heures quand service/pro/date changent
  ["popupService", "popupProfessionnel", "popupDate"].forEach((id) => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("change", mettreAJourHeuresDisponibles);
  });
});
