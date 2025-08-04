const API_URL = "http://localhost/api/";

function verifierMotDePasse(motDePasse) {
  const erreurs = [];

  if (motDePasse.length < 8) {
    erreurs.push("Au moins 8 caractères.");
  }
  if (!/[a-z]/.test(motDePasse)) {
    erreurs.push("Au moins une lettre minuscule.");
  }
  if (!/[A-Z]/.test(motDePasse)) {
    erreurs.push("Au moins une lettre majuscule.");
  }
  if (!/[0-9]/.test(motDePasse)) {
    erreurs.push("Au moins un chiffre.");
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(motDePasse)) {
    erreurs.push("Au moins un caractère spécial.");
  }

  return erreurs;
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-reinitialisation");
  const messageErreur = document.getElementById("message-erreur");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const codeEmploye = sessionStorage.getItem("codeEmploye") || localStorage.getItem("codeEmploye");

    messageErreur.textContent = "";

    if (!codeEmploye) {
      messageErreur.textContent = "Erreur : identifiant employé manquant.";
      return;
    }

    if (password !== confirmPassword) {
      messageErreur.textContent = "Les mots de passe ne correspondent pas.";
      return;
    }

    const erreurs = verifierMotDePasse(password);

    if (erreurs.length > 0) {
      messageErreur.textContent = "Erreur : " + erreurs.join(" ");
      return;
    }

    try {
      const res = await fetch(`${API_URL}motdepasse`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code_employe: codeEmploye,
          mot_de_passe: password
        })
      });

      let data;
      try {
        data = await res.json(); // Peut échouer si la réponse est vide
      } catch (err) {
        throw new Error("La réponse du serveur est vide ou invalide.");
      }

      if (res.ok) {
        alert(data.message || "Mot de passe réinitialisé avec succès !");
        form.reset();

        // 🔐 Redirection après changement du mot de passe
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "index.html";
      } else {
        messageErreur.textContent = "Erreur : " + (data.error || "Réinitialisation échouée.");
      }
    } catch (err) {
      messageErreur.textContent = "Erreur réseau : " + err.message;
    }
  });

  // 🔐 Gestion du menu utilisateur
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  window.retourDashboard = function () {
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
  };

  window.toggleUserMenu = function () {
    const menu = document.getElementById("userDropdown");
    if (menu) {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    }
  };

  window.addEventListener("click", function (event) {
    if (!event.target.matches('.user-menu-icon')) {
      const dropdown = document.getElementById("userDropdown");
      if (dropdown && dropdown.style.display === "block") {
        dropdown.style.display = "none";
      }
    }
  });
});
