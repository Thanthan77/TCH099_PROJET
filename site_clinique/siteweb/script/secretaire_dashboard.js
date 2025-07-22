const API_URL = "http://localhost/api/"; // adapte si nécessaire

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

            // Nom selon le poste
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
                <td>${rdv.service}</td>
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
    // Tu peux pré-remplir le formulaire de création ici si tu veux permettre l'édition.
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
            chargerRendezVous(); // Recharger après suppression
        })
        .catch(err => {
            alert("Erreur : " + err.message);
        });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
  chargerRendezVous();
  chargerPatients(); // On charge les infos des patients ici
});

async function chargerPatients() {
  try {
    const response = await fetch(`${API_URL}patients`); // adapte le chemin à ton endpoint exact
    if (!response.ok) throw new Error("Échec du chargement des patients");

    const patients = await response.json();
    const tbody = document.querySelector("#patients tbody");
    tbody.innerHTML = "";

    if (patients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">Aucun patient trouvé</td></tr>`;
      return;
    }

    patients.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.PRENOM_PATIENT} ${p.NOM_PATIENT}</td>
        <td>${p.DATE_NAISSANCE}</td>
        <td>${p.NO_ASSURANCE_MALADIE}</td>
        <td>${p.NUM_TEL} / ${p.COURRIEL}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Erreur lors du chargement des patients :", err);
  }
}