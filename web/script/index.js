const API_URL = ["localhost","127.0.0.1","::1"].includes(window.location.hostname)
  ? "http://localhost/api/"
  : "https://vitalis-bbe7aybcc3ata2gm.canadacentral-01.azurewebsites.net/api/";




const codeEmploye = localStorage.getItem("codeEmploye");
const isConnected = localStorage.getItem("isConnected");

// Redirection automatique si déjà connecté
if (isConnected === '1' && codeEmploye) {
  const premierChiffre = codeEmploye.toString().charAt(0);
  let redirectUrl = '';

  switch (premierChiffre) {
    case '1':
      redirectUrl = 'medecin_dashboard.html';
      break;
    case '2':
      redirectUrl = 'infirmiere_dashboard.html';
      break;
    case '3':
      redirectUrl = 'secretaire_dashboard.html';
      break;
    case '4':
      redirectUrl = 'admin_dashboard.html';
      break;
    default:
      redirectUrl = 'index.html';
  }

  redirectUrl += '?codeEmploye=' + encodeURIComponent(codeEmploye);
  window.location.href = redirectUrl;
}

// Gestion de la soumission du formulaire de connexion
document.getElementById("connexion").addEventListener("submit", function (e) {
  e.preventDefault();

  const errDiv = document.getElementById("erreur-login");
  errDiv.innerText = "";

  const codeEmploye = document.getElementById("codeEmploye").value;
  const motdepasse = document.getElementById("motDePasse").value;
  const memoriser = document.getElementById("memoriserCompte").checked;

  fetch(API_URL + "login", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      CODE_EMPLOYE: codeEmploye,
      MOT_DE_PASSE: motdepasse
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur réseau ou serveur');
      }
      return response.json();
    })
    .then(data => {
      if (data.token && data.CODE_EMPLOYE) {
        if (memoriser) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('codeEmploye', data.CODE_EMPLOYE);
          localStorage.setItem('isConnected', '1');
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('codeEmploye', data.CODE_EMPLOYE);
          sessionStorage.setItem('isConnected', '1');
        }

        const premierChiffre = data.CODE_EMPLOYE.toString().charAt(0);
        let redirectUrl = '';

        switch (premierChiffre) {
          case '1':
            redirectUrl = 'medecin_dashboard.html';
            break;
          case '2':
            redirectUrl = 'infirmiere_dashboard.html';
            break;
          case '3':
            redirectUrl = 'secretaire_dashboard.html';
            break;
          case '4':
            redirectUrl = 'admin_dashboard.html';
            break;
          default:
            throw new Error('Rôle non reconnu');
        }

        redirectUrl += '?codeEmploye=' + encodeURIComponent(data.CODE_EMPLOYE);
        errDiv.innerText = "Connecté avec succès.";
        window.location.href = redirectUrl;

      } else {
        throw new Error(data.error || "Identifiants invalides");
      }
    })
    .catch(error => {
      console.error("Erreur:", error);
      errDiv.innerText = error.message || "Erreur lors de la connexion";
    });

  // Protection contre retour arrière navigateur
  window.addEventListener("pageshow", () => {
    if (
      localStorage.getItem("isConnected") !== '1' &&
      sessionStorage.getItem("isConnected") !== '1'
    ) {
      window.location.reload();
    }
  });
});
