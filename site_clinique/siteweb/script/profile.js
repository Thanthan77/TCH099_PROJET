const API_URL = 'http://localhost/api/';

const codeInUrl = new URLSearchParams(window.location.search).get("codeEmploye");
const codeSession = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");
const estAdmin = codeSession && codeSession.startsWith("4");

let codeEmploye = null;

function verifierConnexion() {
  if (!sessionStorage.getItem("isConnected") && !localStorage.getItem("isConnected")) {
    window.location.replace("../html/index.html");
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

function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

window.onclick = function (event) {
  if (!event.target.matches('.user-menu-icon')) {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown && dropdown.style.display === "block") {
      dropdown.style.display = "none";
    }
  }
};

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

    if (!employe) {
      throw new Error("Employé introuvable.");
    }

    document.getElementById("numero").value         = employe.CODE_EMPLOYE || "";
    document.getElementById("prenom").value         = employe.PRENOM_EMPLOYE || "";
    document.getElementById("nom").value            = employe.NOM_EMPLOYE || "";
    document.getElementById("date_naissance").value = employe.DATE_NAISSANCE || "";
    document.getElementById("sexe").value           = employe.SEXE || "";
    document.getElementById("etat_civil").value     = employe.ETAT_CIVIL || "";
    document.getElementById("poste").value          = employe.POSTE || "";
    document.getElementById("email").value          = employe.COURRIEL || "";
    document.getElementById("telephone").value      = employe.TELEPHONE || "";
    document.getElementById("adresse").value        = employe.ADRESSE || "";

  } catch (err) {
    console.error("Erreur lors du chargement du profil :", err);
    alert("Erreur lors du chargement du profil.");
  }
});

// 🖊️ Activation de l'édition
document.getElementById("editBtn").addEventListener("click", function () {
  modifiables.forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.removeAttribute("readonly");
      field.classList.add("editable");
    }
  });

  document.getElementById("editBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
});

document.getElementById("formProfil").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    action: "update",
    CODE_EMPLOYE: codeEmploye,
    PRENOM: document.getElementById("prenom").value,
    NOM: document.getElementById("nom").value,
    DATE_NAISSANCE: document.getElementById("date_naissance").value,
    SEXE: document.getElementById("sexe").value,
    ETAT_CIVIL: document.getElementById("etat_civil").value,
    POSTE: document.getElementById("poste").value,
    COURRIEL: document.getElementById("email").value,
    TELEPHONE: document.getElementById("telephone").value,
    ADRESSE: document.getElementById("adresse").value
  };

  try {
    const response = await fetch(`${API_URL}employe/user/${codeEmploye}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const rawText = await response.text();
    const json = rawText ? JSON.parse(rawText) : {};

    if (!response.ok || json.status !== "success") {
      throw new Error(json.error || "Échec de mise à jour.");
    }

    alert(" Profil mis à jour avec succès dans la base de données.");
  } catch (err) {
    console.error("Erreur lors de l'enregistrement :", err);
    alert("Erreur lors de la mise à jour : " + err.message);
  } finally {
    modifiables.forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.setAttribute("readonly", true);
        field.classList.remove("editable");
      }
    });

    document.getElementById("editBtn").style.display = "inline-block";
    document.getElementById("saveBtn").style.display = "none";
  }
});

// 🔓 Déconnexion
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
