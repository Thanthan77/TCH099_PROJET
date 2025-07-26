const API_URL = 'http://localhost/api/';

function verifierConnexion() {
  if (localStorage.getItem("isConnected") !== '1' && sessionStorage.getItem("isConnected") !== '1') {
    window.location.replace("../html/index.html");
  }
}

document.addEventListener("DOMContentLoaded", verifierConnexion);
window.addEventListener("pageshow", verifierConnexion);
    
    document.addEventListener('DOMContentLoaded', () => {
      showTab('comptes');
      chargerAfficherComptes();
    });

    function showTab(id) {
      document.querySelectorAll('.tab-content').forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== id);
      });
    }
    window.showTab = showTab;

    async function chargerAfficherComptes() {
      const tbody = document.getElementById('employe-table-body');
      if (!tbody) return console.error("Élément 'employe-table-body' introuvable");
      tbody.innerHTML = '';

      try {
        const res = await fetch(`${API_URL}employes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const employes = await res.json();

        if (!Array.isArray(employes) || employes.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4">Aucun employé trouvé</td></tr>';
          return;
        }

        tbody.innerHTML = employes.map(emp => `
          <tr>
            <td>${escapeHtml(emp.PRENOM_EMPLOYE)} ${escapeHtml(emp.NOM_EMPLOYE)}</td>
            <td>${escapeHtml(emp.CODE_EMPLOYE)}</td>
            <td>${escapeHtml(emp.POSTE)}</td>
            <td>
              <button onclick="ouvrirProfil('${emp.CODE_EMPLOYE}')">Profil</button>
              <button class="danger" onclick="supprimerEmploye('${emp.CODE_EMPLOYE}')">Supprimer</button>
            </td>
          </tr>
        `).join('');

      } catch (err) {
        console.error('Erreur chargement employés :', err);
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="error">
              Échec du chargement : ${escapeHtml(err.message)}
              <button onclick="chargerAfficherComptes()">Réessayer</button>
            </td>
          </tr>`;
      }
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, s => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
      }[s]));
    }

    function ouvrirProfil(code) {
      window.location.href = `../html/profile.html?codeEmploye=${code}`;
    }

    function supprimerEmploye(code) {
      if (!confirm("Confirmer la suppression de l'employé ?")) return;
      // TODO : appeler DELETE `${API_URL}employes/${code}`
      alert("Suppression non implémentée");
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
