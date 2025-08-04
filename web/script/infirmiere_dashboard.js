const API_URL = 'http://localhost/api/';
const codeEmploye = new URLSearchParams(window.location.search).get("codeEmploye");

const codeInUrl = new URLSearchParams(window.location.search).get("codeEmploye");
const codeSession = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");

// Vérifie la session de connexion
if (!codeSession || (!sessionStorage.getItem("isConnected") && !localStorage.getItem("isConnected"))) {
  window.location.replace("index.html");
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

async function chargerAfficherRendezVous() {
  try {
    if (!codeEmploye) {
      throw new Error("Code employé manquant dans l'URL");
    }

    const response = await fetch(`${API_URL}rendezvous/${codeEmploye}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();

    const patientsRes = await fetch(`${API_URL}patients`);
    const listePatients = await patientsRes.json();

    const servicesMap = {};
    data.services.forEach(service => {
      servicesMap[service.id] = service.nom;
    });

    const tbody = document.querySelector('#rdv tbody');
    if (!tbody) throw new Error("Élément #rdv tbody introuvable");

    if (!data.rendezvous || data.rendezvous.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucun rendez-vous prévu</td></tr>';
      return;
    }

    tbody.innerHTML = data.rendezvous.map(rdv => {
      const patient = listePatients.find(p => p.COURRIEL === rdv.email) || {};
      const nomService = servicesMap[rdv.service_id] || "Service inconnu";

      return `
        <tr>
          <td>${rdv.date}</td>
          <td>${rdv.heure} (${rdv.duree} min)</td>
          <td>${patient.PRENOM_PATIENT || 'Inconnu'} ${patient.NOM_PATIENT || ''}</td>
          <td>${nomService}</td>
          <td>
            <button onclick="afficherDossier(
              '${escapeHtml(patient.PRENOM_PATIENT || '')}',
              '${escapeHtml(patient.NOM_PATIENT || '')}',
              '${escapeHtml(patient.DATE_NAISSANCE || '')}',
              '${escapeHtml(patient.NO_ASSURANCE_MALADIE || '')}',
              ${rdv.num_rdv},
              '${escapeHtml(rdv.note_consult || '')}'
            )">Voir dossier</button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Erreur:', error);
    const errorHtml = `
      <tr>
        <td colspan="5" class="error">
          Erreur de chargement: ${error.message}
          <button onclick="chargerAfficherRendezVous()">Réessayer</button>
        </td>
      </tr>
    `;
    const tbody = document.querySelector('#rdv tbody');
    if (tbody) tbody.innerHTML = errorHtml;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function afficherDossier(prenom, nom, dateNaissance, assurance, numrdv, note) {
  document.getElementById('patient-nom').textContent = `${prenom} ${nom}`;
  document.getElementById('patient-dob').textContent = dateNaissance || 'Date inconnue';
  document.getElementById('patient-assm').textContent = assurance || 'Indisponible';
  document.getElementById('patient-numrdv').textContent = numrdv || 'Numrdv inconnue';

  const sec = document.getElementById('dossier');
  sec.classList.remove('hidden');

  sec.querySelectorAll('textarea, button.js-save').forEach(el => el.remove());

  const ta = document.createElement('textarea');
  ta.placeholder = 'Écrire une note de soins…';
  ta.value = note;
  sec.appendChild(ta);

  const btn = document.createElement('button');
  btn.textContent = 'Enregistrer';
  btn.classList.add('js-save');
  btn.addEventListener('click', async () => {
    const newNote = ta.value.trim();
    const r = await fetch(`${API_URL}note/${numrdv}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numRdv: numrdv, noteConsult: newNote })
    });
    const j = await r.json();
    if (r.ok && j.status === 'success') {
      alert('Note mise à jour avec succès !');
      chargerAfficherRendezVous();
      showTab('rdv');
    } else {
      alert(`Erreur: ${j.error || r.statusText}`);
    }
  });
  sec.appendChild(btn);
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

    console.log("Code employé actuel :", codeEmploye);
    tbody.innerHTML = data.map(h => {
    const isCurrentUser = parseInt(h.CODE_EMPLOYE) === parseInt(codeEmploye);

    console.log("Employé JSON :", h.CODE_EMPLOYE, " Comparé avec :", codeEmploye);

    return `
    <tr ${isCurrentUser ? 'class="surbrillance-row"' : ''}>
      <td>${escapeHtml(h.NOM_EMPLOYE)}</td>
      <td>${escapeHtml(h.JOURS)}</td>
      <td>${escapeHtml(h.HEURE)}</td>
    </tr>
  `;
  }).join('');

  } catch (error) {
    console.error("Erreur lors du chargement des horaires :", error);
  }
}

function showTab(id) {
  document.querySelectorAll('.tab-content')
    .forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(id);
  if (target) target.classList.remove('hidden');
}

window.showTab = showTab;
window.afficherDossier = afficherDossier;

let demandeEnvoyee = false;

document.addEventListener('DOMContentLoaded', () => {
  chargerAfficherRendezVous();
  chargerAfficherHoraires();
  chargerDemandesVacances();

  const btnVacances = document.querySelector("#vacances button");

  if (btnVacances) {
    btnVacances.addEventListener("click", async function (e) {
      if (demandeEnvoyee) return; // protection double-clic
      
      e.preventDefault();
      demandeEnvoyee = true;
      btnVacances.disabled = true;

      const errDiv = document.getElementById("erreur-vacances");
      errDiv.innerText = "";

      const dateDebut = document.getElementById("date-debut").value;
      const dateFin = document.getElementById("date-fin").value;

      if (!codeEmploye || !dateDebut || !dateFin) {
        errDiv.style.color = "red";
        errDiv.innerText = "Veuillez remplir toutes les informations.";
        btnVacances.disabled = false;
        demandeEnvoyee = false;
        return;
      }

      const data = { dateDebut, dateFin };

      try {
        const response = await fetch(`${API_URL}conge/employe/${codeEmploye}`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const rawText = await response.text();
        const json = JSON.parse(rawText);

        if (!response.ok) {
          throw new Error(json.error || "Erreur inconnue");
        }

        if (json.status === "OK") {
          errDiv.style.color = "green";
          errDiv.innerText = json.message || "Demande envoyée avec succès.";
        } else {
          errDiv.style.color = "red";
          if (data.error && data.error.includes("SQLSTATE[23000]") && data.error.includes("Duplicate entry")) {
            errDiv.innerText = " Des vacances ont déjà été prises durant ces dates";
          } else {
            errDiv.innerText = data.error || "Une erreur s'est produite lors de la demande.";
          } 
        }

      } catch (error) {
        console.error("Erreur lors de la demande :", error);
        errDiv.style.color = "red";

        if (error.message.includes("SQLSTATE[23000]") && error.message.includes("Duplicate entry")) {
          errDiv.innerText = " Cette date a deja été prise";
        } else{
          errDiv.innerText = error.message || "Réponse du serveur invalide.";
        }

        
      } finally {
        btnVacances.disabled = false;
        demandeEnvoyee = false;
      }
    });
  }

});

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


async function chargerDemandesVacances() {
  try {
    const res = await fetch(`${API_URL}conge/${codeEmploye}`);
    const data = await res.json();

    const tbody = document.querySelector('#table-vacances tbody');

    if (!Array.isArray(data) || !data.length) {
      tbody.innerHTML = '<tr><td colspan="4">Aucune demande de vacances</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${escapeHtml(item.PRENOM_EMPLOYE || '')} ${escapeHtml(item.NOM_EMPLOYE || '')}</td>
        <td>${escapeHtml(item.DATE_DEBUT)}</td>
        <td>${escapeHtml(item.DATE_FIN)}</td>
        <td>${escapeHtml(item.STATUS)}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Erreur lors du chargement des vacances :", error);
    const tbody = document.querySelector('#table-vacances tbody');
    tbody.innerHTML = '<tr><td colspan="4">Erreur de chargement des vacances</td></tr>';
  }
}




document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});
