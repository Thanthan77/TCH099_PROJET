    const API_URL     = 'http://localhost/api/';
    const codeEmploye = new URLSearchParams(window.location.search).get('codeEmploye');
    
    let currentRdvId  = null;

    function showTab(id) {
      document.querySelectorAll('.tab-content')
              .forEach(sec => sec.classList.add('hidden'));
      document.getElementById(id).classList.remove('hidden');
    }

    function escapeHtml(str) {
      return (str ?? '').toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    async function chargerAfficherRendezVous() {
      if (!codeEmploye) return;

      const res = await fetch(`${API_URL}rendezvous/${codeEmploye}`);
      const data = await res.json();

      const patientsRes = await fetch(`${API_URL}patients`);
      const listePatients = await patientsRes.json();

      const servicesMap = {};
      data.services.forEach(s => servicesMap[s.id] = s.nom);

      

      const tbody = document.querySelector('#rdv tbody');
      if (!data.rendezvous.length) {
        tbody.innerHTML = '<tr><td colspan="5">Aucun rendez-vous prévu</td></tr>';
        return;
      }

      tbody.innerHTML = data.rendezvous.map(rdv => {
        const pat = listePatients.find(p => p.COURRIEL === rdv.email) || {};
        const nomSvc = servicesMap[rdv.service_id] || 'Service inconnu';
        const numeroRdv = rdv.NUM_RDV;  
        return `
          <tr>
            <td>${rdv.date}</td>
            <td>${rdv.heure} (${rdv.duree} min)</td>
            <td>${pat.PRENOM_PATIENT||''} ${pat.NOM_PATIENT||''}</td>
            <td>${nomSvc}</td>
            <td>
              <button onclick="
                afficherDossier(
                  '${escapeHtml(pat.PRENOM_PATIENT)}',
                  '${escapeHtml(pat.NOM_PATIENT)}',
                  '${escapeHtml(pat.DATE_NAISSANCE)}',
                  
                  '${escapeHtml(pat.NO_ASSURANCE_MALADIE)}',
                  ${rdv.num_rdv},
                  '${escapeHtml(rdv.note||'')}'
                )">Voir dossier</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function afficherDossier(prenom, nom, dateNaissance, assurance,numrdv, note) {

      document.getElementById('patient-nom').textContent  = `${prenom} ${nom}`;
      document.getElementById('patient-dob').textContent  = dateNaissance || 'Date inconnue';
      document.getElementById('patient-assm').textContent = assurance    || 'Indisponible';
      document.getElementById('patient-numrdv').textContent = numrdv || 'Numrdv inconnue';

      const sec = document.getElementById('dossier');
      sec.classList.remove('hidden');

      sec.querySelectorAll('textarea, button.js-save').forEach(el => el.remove());

      // créer le textarea
      const ta = document.createElement('textarea');
      ta.placeholder = 'Écrire une note de consultation…';
      note="";
      ta.value = note;
      sec.appendChild(ta);

      // créer le bouton Enregistrer
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


    document.addEventListener('DOMContentLoaded', () => {
      chargerAfficherRendezVous();
      chargerAfficherHoraires();
      window.showTab        = showTab;
      window.afficherDossier = afficherDossier;

    });
