const API_URL =
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    ? "http://localhost/api/"
    : "https://vitalis-bbe7aybcc3ata2gm.canadacentral-01.azurewebsites.net/api/";


// ================== VÉRIFICATION SESSION ==================
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

// ================== AU CHARGEMENT ==================
document.addEventListener("DOMContentLoaded", () => {
  // Onglet par défaut
  showTab("comptes");

  // Chargements initiaux
  safeCall(chargerEmployes);
  safeCall(chargerAfficherHoraires);
  safeCall(chargerDemandesVacances);
  safeCall(chargerAssignationsServices);

  // Déconnexion
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // Filtres dynamiques
  const filtreIcone = document.querySelector(".filtre-icon");
  if (filtreIcone) filtreIcone.addEventListener("click", toggleFiltres);

  const filtreBtn = document.querySelector("#filtreSection button");
  if (filtreBtn) filtreBtn.addEventListener("click", filtrerEmployes);

  ["filtrePrenom", "filtreNom", "filtreCode", "filtrePoste"].forEach(id => {
    const champ = document.getElementById(id);
    if (champ) champ.addEventListener("input", filtrerEmployes);
  });

  // Modal création de compte
  const btnOuvrir = document.getElementById("btn-creer-compte");
  const modal = document.getElementById("modal-creer-compte");
  const modalContent = document.querySelector(".modal-content");
  const btnFermer = document.getElementById("fermer-modal");
  const btnAnnuler = document.getElementById("annuler-modal");
  const form = document.getElementById("form-nouveau-compte");

  if (btnOuvrir && modal) btnOuvrir.addEventListener("click", () => modal.classList.remove("hidden"));
  if (btnFermer && modal) btnFermer.addEventListener("click", () => modal.classList.add("hidden"));
  if (btnAnnuler && modal) btnAnnuler.addEventListener("click", () => modal.classList.add("hidden"));
  if (modalContent) modalContent.addEventListener("click", (e) => e.stopPropagation());
  if (modal) {
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });
  }

  if (form && modal) {
    form.addEventListener("submit", async (e) => {
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
          // récupère un identifiant d'employé quelle que soit la clé renvoyée
          const newCode = result.codeEmploye || result.CODE_EMPLOYE || result.code || result.id || null;

          alert(`Compte créé avec succès !\nMot de passe généré : ${motDePasse}`);
          form.reset();
          modal.classList.add("hidden");
          safeCall(chargerEmployes);

          // ouvre le popup Horaire si on a le code
          if (newCode) {
            ouvrirPopupHoraire({
              codeEmploye: newCode,
              prenom: data.prenom,
              nom: data.nom
            });
          }
        } else {
          alert("Erreur : " + (result?.error || "Inconnue"));
        }
      } catch (err) {
        alert("Erreur réseau : " + err.message);
      }
    });
  }

  // Popup disponibilités
  const btnCharger = document.getElementById("btn-charger-disponibilites");
  const popupDispo = document.getElementById("popup-disponibilites");
  const formDispo = document.getElementById("form-disponibilites");

  if (btnCharger && popupDispo) {
    btnCharger.addEventListener("click", () => popupDispo.classList.remove("hidden"));
  }

  if (formDispo) {
    formDispo.addEventListener("submit", async (e) => {
      e.preventDefault();
      const debut = document.getElementById("dateDebutDispo")?.value;
      const fin = document.getElementById("dateFinDispo")?.value;

      if (!debut || !fin || debut >= fin) {
        alert("Veuillez entrer une période valide.");
        return;
      }

      try {
        const resInfos = await fetch(`${API_URL}disponibilites/generation`);
        const infos = await resInfos.json();
        if (!resInfos.ok) throw new Error(infos?.error || "Erreur lors du chargement des données");

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
          alert(`${result.message}\nTotal créés : ${result.total_insertions}`);
          fermerPopupDisponibilites();
        } else {
          throw new Error(result?.error || "Erreur inconnue");
        }
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    });
  }

  // Form assignations (soumission)
  const formAssign = document.getElementById("form-modifier-assignation");
  if (formAssign) {
    formAssign.addEventListener("submit", async (e) => {
      e.preventDefault();
      const codeEmploye = document.getElementById("popup-code-employe")?.value || "";
      const checkboxes = document.querySelectorAll("#liste-services-checkboxes input[type='checkbox']");
      const services = [];
      checkboxes.forEach(cb => { if (cb.checked) services.push(cb.value); });

      try {
        const res = await fetch(`${API_URL}service_employe`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codeEmploye, services })
        });
        const result = await res.json();

        if (res.ok) {
          alert("Assignations mises à jour avec succès !");
          fermerPopup();
          safeCall(chargerAssignationsServices);
        } else {
          alert("Erreur : " + (result?.error || "Inconnue"));
        }
      } catch (err) {
        console.error("Erreur lors de l'enregistrement des assignations :", err);
        alert("Erreur réseau.");
      }
    });
  }

  // ================== POPUP HORAIRE (initialisation listeners) ==================
  const popupHoraire = document.getElementById("popup-horaire");
  const formHoraire = document.getElementById("form-horaire");
  const btnHoraireFermer = document.getElementById("horaire-btn-fermer");
  const btnHoraireAnnuler = document.getElementById("horaire-btn-annuler");
  const selHeureDebut = document.getElementById("heureDebut");
  const selHeureFin = document.getElementById("heureFin");

  if (btnHoraireFermer && popupHoraire) {
    btnHoraireFermer.addEventListener("click", () => popupHoraire.classList.add("hidden"));
  }
  if (btnHoraireAnnuler && popupHoraire) {
    btnHoraireAnnuler.addEventListener("click", () => popupHoraire.classList.add("hidden"));
  }
  if (popupHoraire) {
    popupHoraire.addEventListener("click", (e) => { if (e.target === popupHoraire) popupHoraire.classList.add("hidden"); });
  }

  if (selHeureDebut && selHeureFin) {
    selHeureDebut.addEventListener("change", () => {
      const d = selHeureDebut.value;
      if (d && selHeureFin.value && selHeureFin.value <= d) {
        const options = Array.from(selHeureFin.options);
        const next = options.find(o => o.value > d);
        if (next) selHeureFin.value = next.value;
      }
    });
  }

  if (formHoraire) {
    formHoraire.addEventListener("submit", async (e) => {
      e.preventDefault();

      const codeEmploye = document.getElementById("horaire-code-employe")?.value || "";
      const jours = Array.from(document.querySelectorAll('#form-horaire input[name="jours"]:checked')).map(x => x.value);
      const heureDebut = document.getElementById("heureDebut")?.value || "";
      const heureFin = document.getElementById("heureFin")?.value || "";

      if (!codeEmploye) { alert("Code employé introuvable."); return; }
      if (!jours.length) { alert("Sélectionnez au moins un jour."); return; }
      if (!heureDebut || !heureFin || heureDebut >= heureFin) { alert("Sélectionnez une plage horaire valide."); return; }

      try {
        const toHHMMSS = (hhmm) => (hhmm && hhmm.length === 5 ? `${hhmm}:00` : hhmm);
        const payload = {
          CODE_EMPLOYE: codeEmploye,
          JOURS: jours.join(", "),
          HEURE_DEBUT: toHHMMSS(heureDebut),
          HEURE_FIN: toHHMMSS(heureFin)
        };

        const res = await fetch(`${API_URL}horaires`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Erreur lors de l'enregistrement de l'horaire.");

        alert(data?.message || "Horaire enregistré avec succès.");
        popupHoraire.classList.add("hidden");
        safeCall(chargerAfficherHoraires);
      } catch (err) {
        console.error(err);
        alert("Erreur : " + err.message);
      }
    });
  }
});

// ================== OUTILS SÛRS ==================
function safeCall(fn) {
  try { fn?.(); } catch (e) { console.error(e); }
}

// ================== FONCTIONS UI ==================
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(sec => sec.classList.add("hidden"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
}

function toggleFiltres() {
  const section = document.getElementById("filtreSection");
  if (section) section.classList.toggle("hidden");
}

function fermerPopupDisponibilites() {
  const popup = document.getElementById("popup-disponibilites");
  if (popup) popup.classList.add("hidden");
}

function fermerPopup() {
  const p = document.getElementById('popupModifierAssignation');
  if (p) p.classList.add('hidden');
}

// Menu utilisateur (si présent)
window.toggleUserMenu = function () {
  const menu = document.getElementById("userDropdown");
  if (menu) menu.style.display = (menu.style.display === "block") ? "none" : "block";
};

window.addEventListener("click", (event) => {
  const icon = document.querySelector(".user-menu-icon");
  const menu = document.getElementById("userDropdown");
  if (menu && !menu.contains(event.target) && event.target !== icon) {
    menu.style.display = "none";
  }
});

// ================== UTILITAIRES ==================
function escapeHtml(str) {
  return (str ?? '').toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  while (motDePasse.length < 10) motDePasse.push(getRandomChar(all));
  return shuffleArray(motDePasse).join('');
}

// ================== EMPLOYÉS ==================
async function chargerEmployes() {
  try {
    const response = await fetch(`${API_URL}employes`);
    if (!response.ok) throw new Error("Réponse invalide");
    const employes = await response.json();

    const tbody = document.querySelector("#employe-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Array.isArray(employes) || employes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">Aucun employé trouvé</td></tr>`;
      return;
    }

    employes.forEach(emp => {
      const row = document.createElement("tr");
      row.classList.add("ligne-employe");
      row.innerHTML = `
        <td class="col-nom">${escapeHtml(emp.PRENOM_EMPLOYE)} ${escapeHtml(emp.NOM_EMPLOYE)}</td>
        <td class="col-code">${escapeHtml(emp.CODE_EMPLOYE)}</td>
        <td class="col-poste">${escapeHtml(emp.POSTE)}</td>
        <td>
          <button onclick="ouvrirProfil('${escapeHtml(emp.CODE_EMPLOYE)}')">Profil</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur lors du chargement des employés :", err);
    const tbody = document.querySelector("#employe-table-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="4">Erreur de chargement</td></tr>`;
  }
}

// Boutons inline (HTML)
window.ouvrirProfil = function (code) {
  window.location.href = `profile.html?codeEmploye=${code}`;
};

window.supprimerEmploye = async function (code) {
  if (!confirm("Confirmer la suppression de l'employé ?")) return;

  try {
    const res = await fetch(`${API_URL}employe/user/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", CODE_EMPLOYE: code })
    });
    const data = await res.json();

    if (res.ok && data?.status === "OK") {
      alert(`Employé ${data.codeEmploye} supprimé avec succès`);
      safeCall(chargerEmployes);
    } else {
      alert(`Erreur : ${data?.error || "Inconnue"}`);
    }
  } catch (err) {
    alert("Erreur réseau : " + err.message);
  }
};

// ================== VACANCES ==================
async function chargerDemandesVacances() {
  try {
    const response = await fetch(`${API_URL}conge`);
    if (!response.ok) throw new Error("Réponse invalide");
    const demandes = await response.json();

    const tbody = document.querySelector('#vacances table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(demandes) || demandes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Aucune demande</td></tr>`;
      return;
    }

    demandes.forEach((demande) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml((demande.PRENOM || '') + ' ' + (demande.NOM || ''))}</td>
        <td>${escapeHtml(demande.ROLE || 'N/A')}</td>
        <td>${escapeHtml(demande.DATE_DEBUT)}</td>
        <td>${escapeHtml(demande.DATE_FIN)}</td>
        <td>En Attente</td>
        <td>
          <div class="action-buttons">
            <button onclick="traiterExceptionVacances(${Number(demande.ID_EXC)})">Accepter</button>
            <button class="danger" onclick="traiterExceptionVacances(${Number(demande.ID_EXC)}, 'refuser')">Refuser</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    alert("Erreur lors du chargement des vacances");
    const tbody = document.querySelector('#vacances table tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6">Erreur de chargement</td></tr>`;
  }
}

window.traiterExceptionVacances = async function (idException, action = 'accepter') {
  try {
    const res = await fetch(`${API_URL}conge/${idException}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id_exc: idException })
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Mis à jour.");
      safeCall(chargerDemandesVacances);
    } else {
      alert("Erreur : " + (data?.error || "Inconnue"));
    }
  } catch (e) {
    console.error(e);
    alert("Erreur réseau");
  }
};

// ================== FILTRES EMPLOYÉS ==================
function filtrerEmployes() {
  const prenom = (document.getElementById("filtrePrenom")?.value || "").toLowerCase();
  const nom = (document.getElementById("filtreNom")?.value || "").toLowerCase();
  const code = (document.getElementById("filtreCode")?.value || "").toLowerCase();
  const poste = (document.getElementById("filtrePoste")?.value || "").toLowerCase();
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
  const ids = ["filtrePrenom","filtreNom","filtreCode","filtrePoste"];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  filtrerEmployes();
}
window.reinitialiserFiltres = reinitialiserFiltres;

// ================== ASSIGNATION DES SERVICES ==================
async function chargerAssignationsServices() {
  try {
    const response = await fetch(`${API_URL}service_employe`);
    if (!response.ok) throw new Error("Réponse réseau invalide");
    const assignations = await response.json();

    const tbody = document.getElementById("service-assignation-body");
    if (!tbody) return;
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
      tdPoste.textContent = (emp.POSTE?.toLowerCase() === "infirmier" && emp.SEXE === "Femme")
        ? "Infirmière"
        : emp.POSTE;

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
    if (tbody) tbody.innerHTML = `<tr><td colspan="4">Erreur de chargement</td></tr>`;
  }
}

async function modifierAssignation(codeEmploye) {
  try {
    // Récup employé + assignations
    const response = await fetch(`${API_URL}service_employe`);
    const assignations = await response.json();
    const employe = assignations.find(e => e.CODE_EMPLOYE === codeEmploye);
    if (!employe) return alert("Employé non trouvé.");

    const nomEl = document.getElementById("popup-nom-employe");
    const posteEl = document.getElementById("popup-poste-employe");
    const codeEl = document.getElementById("popup-code-employe");
    const listEl = document.getElementById("liste-services-checkboxes");
    const popup = document.getElementById("popupModifierAssignation");

    if (!nomEl || !posteEl || !codeEl || !listEl || !popup) return;

    nomEl.textContent = `${employe.PRENOM_EMPLOYE} ${employe.NOM_EMPLOYE}`;
    posteEl.textContent = (employe.SEXE === "Femme" && employe.POSTE === "Infirmier") ? "Infirmière" : employe.POSTE;
    codeEl.value = codeEmploye;

    listEl.innerHTML = "";

    // Tous les services
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
      checkbox.checked = Array.isArray(employe.SERVICES) && employe.SERVICES.includes(service.NOM);

      const span = document.createElement("span");
      span.textContent = service.NOM;

      card.appendChild(checkbox);
      card.appendChild(span);
      listEl.appendChild(card);
    });

    popup.classList.remove("hidden");
  } catch (e) {
    console.error("Erreur lors de la modification d’assignation :", e);
    alert("Impossible de charger les données.");
  }
}
window.modifierAssignation = modifierAssignation;
window.fermerPopup = fermerPopup;

// ================== HORAIRES ==================
async function chargerAfficherHoraires() {
  try {
    const res = await fetch(`${API_URL}horaires`);
    if (!res.ok) throw new Error("Réponse invalide");
    const data = await res.json();

    const tbody = document.querySelector('#horaire table tbody');
    if (!tbody) return;

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
    if (tbody) tbody.innerHTML = '<tr><td colspan="3">Erreur de chargement des horaires</td></tr>';
  }
}

// ================== POPUP HORAIRE (ouverture) ==================
function ouvrirPopupHoraire({ codeEmploye, prenom, nom }) {
  const popup = document.getElementById("popup-horaire");
  if (!popup) return;

  const codeInput = document.getElementById("horaire-code-employe");
  const leg = document.getElementById("horaire-emp-legende");
  if (codeInput) codeInput.value = codeEmploye || "";
  if (leg) leg.textContent = `Employé : ${prenom ?? ""} ${nom ?? ""} (code : ${codeEmploye ?? "?"})`;

  const selHeureDebut = document.getElementById("heureDebut");
  const selHeureFin = document.getElementById("heureFin");
  if (selHeureDebut) selHeureDebut.value = "09:00";
  if (selHeureFin) selHeureFin.value = "17:00";

  document.querySelectorAll('#form-horaire input[name="jours"]').forEach(c => { c.checked = false; });

  popup.classList.remove("hidden");
}
