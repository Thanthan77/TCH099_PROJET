const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost/api/"
    : "http://20.116.216.218/api/";


const codeInUrl = new URLSearchParams(window.location.search).get("codeEmploye");
const codeSession = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");
const estAdmin = codeSession && codeSession.startsWith("4");

let codeEmploye = null;

function verifierConnexion() {
  if (!sessionStorage.getItem("isConnected") && !localStorage.getItem("isConnected")) {
    window.location.replace("index.html");
  }
}

document.addEventListener("DOMContentLoaded", verifierConnexion);
window.addEventListener("pageshow", verifierConnexion);

// Contrôle d'accès
if (estAdmin) {
  codeEmploye = codeInUrl || codeSession;
} else {
  if (codeInUrl && codeInUrl !== codeSession) {
    alert("Accès interdit : vous ne pouvez consulter que votre propre profil.");
    codeEmploye = codeSession;
    const url = new URL(window.location.href);
    url.searchParams.set("codeEmploye", codeSession);
    window.history.replaceState({}, '', url);
  } else {
    codeEmploye = codeInUrl || codeSession;
  }
}

const modifiables = estAdmin
  ? ["prenom", "nom", "date_naissance", "sexe", "etat_civil", "poste", "email", "telephone", "adresse"]
  : ["email", "telephone", "adresse"];

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!codeEmploye) {
    alert("Impossible d'identifier l'utilisateur.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}employes`);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const employes = await res.json();
    const employe = employes.find(e => String(e.CODE_EMPLOYE) === String(codeEmploye));
    if (!employe) throw new Error("Employé introuvable.");

    document.getElementById("numero").value         = employe.CODE_EMPLOYE || "";
    document.getElementById("prenom").value         = employe.PRENOM_EMPLOYE || "";
    document.getElementById("nom").value            = employe.NOM_EMPLOYE || "";
    document.getElementById("date_naissance").value = employe.DATE_NAISSANCE || "";
    document.getElementById("sexe").value           = capitalize(employe.SEXE);
    document.getElementById("etat_civil").value     = capitalize(employe.ETAT_CIVIL);
    document.getElementById("poste").value          = capitalize(employe.POSTE);
    document.getElementById("email").value          = employe.COURRIEL || "";
    document.getElementById("telephone").value      = employe.TELEPHONE || "";
    document.getElementById("adresse").value        = employe.ADRESSE || "";
    document.getElementById("motDePasse").value     = employe.MOT_DE_PASSE || "";

  } catch (err) {
    console.error("Erreur lors du chargement du profil :", err);
    alert("Erreur lors du chargement du profil.");
  }

  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");

  if (editBtn && saveBtn) {
    editBtn.addEventListener("click", () => {
      modifiables.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
          if (field.tagName === "SELECT") {
            field.disabled = false;
          } else {
            field.removeAttribute("readonly");
          }
          field.classList.add("editable");
        }
      });
      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
    });

    document.getElementById("formProfil").addEventListener("submit", async function (e) {
      e.preventDefault();

      const data = {
        action: "update",
        CODE_EMPLOYE: codeEmploye,
        PRENOM_EMPLOYE: document.getElementById("prenom").value,
        NOM_EMPLOYE: document.getElementById("nom").value,
        DATE_NAISSANCE: document.getElementById("date_naissance").value,
        SEXE: document.getElementById("sexe").value,
        ETAT_CIVIL: document.getElementById("etat_civil").value,
        POSTE: document.getElementById("poste").value,
        COURRIEL: document.getElementById("email").value,
        TELEPHONE: document.getElementById("telephone").value,
        ADRESSE: document.getElementById("adresse").value,
        MOT_DE_PASSE: document.getElementById("motDePasse").value
      };

      try {
        const response = await fetch(`${API_URL}employe/user/${codeEmploye}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const rawText = await response.text();
        const json = rawText ? JSON.parse(rawText) : {};

        if (!response.ok || json.status !== "OK") {
          throw new Error(json.error || "Échec de mise à jour.");
        }

        alert("Profil mis à jour avec succès dans la base de données.");
      } catch (err) {
        console.error("Erreur lors de l'enregistrement :", err);
        alert("Erreur lors de la mise à jour : " + err.message);
      } finally {
        modifiables.forEach(id => {
          const field = document.getElementById(id);
          if (field) {
            if (field.tagName === "SELECT") {
              field.disabled = true;
            } else {
              field.setAttribute("readonly", true);
            }
            field.classList.remove("editable");
          }
        });

        editBtn.style.display = "inline-block";
        saveBtn.style.display = "none";
      }
    });
  }

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

const dashboardBtn = document.getElementById("btn-dashboard");
if (dashboardBtn) {
  dashboardBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const code = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");
    if (!code) {
      alert("Impossible de déterminer le tableau de bord.");
      return;
    }

    const role = code.charAt(0);
    let dashboardUrl = "";

    switch (role) {
      case '1': dashboardUrl = "medecin_dashboard.html"; break;
      case '2': dashboardUrl = "infirmiere_dashboard.html"; break;
      case '3': dashboardUrl = "secretaire_dashboard.html"; break;
      case '4': dashboardUrl = "admin_dashboard.html"; break;
      default: dashboardUrl = "index.html";
    }

    dashboardUrl += `?codeEmploye=${encodeURIComponent(code)}`;
    window.location.href = dashboardUrl;
  });
}

function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");
  if (menu) {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
}

window.onclick = function (event) {
  if (!event.target.matches('.user-menu-icon')) {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown && dropdown.style.display === "block") {
      dropdown.style.display = "none";
    }
  }
};
