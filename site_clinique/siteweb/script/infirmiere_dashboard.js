const API_URL = 'http://localhost/api/';
const codeEmploye = new URLSearchParams(window.location.search).get("codeEmploye");

function verifierConnexion() {
  if (localStorage.getItem("isConnected") !== '1' && sessionStorage.getItem("isConnected") !== '1') {
    window.location.replace("../html/index.html");
  }
}

document.addEventListener("DOMContentLoaded", verifierConnexion);
window.addEventListener("pageshow", verifierConnexion);

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
              '${escapeHtml(rdv.note || '')}'
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
        const response = await fetch(`${API_URL}vacance/employe/${codeEmploye}`, {
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
          throw new Error(json.error || "Échec de l'envoi.");
        }

      } catch (error) {
        console.error("Erreur lors de la demande :", error);
        errDiv.style.color = "red";
        errDiv.innerText = error.message || "Réponse du serveur invalide.";
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
