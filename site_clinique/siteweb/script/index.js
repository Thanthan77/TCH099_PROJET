const API_URL = 'http://localhost/api/';

document.getElementById("connexion").addEventListener("submit", function (e) {
    e.preventDefault();
    const errDiv = document.getElementById("erreur-login");
    errDiv.innerText = "";

    const codeEmploye = document.getElementById("codeEmploye").value;
    const motdepasse = document.getElementById("motDePasse").value;

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
            // ✅ Stocker les infos dans le localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('codeEmploye', data.CODE_EMPLOYE);

            // ✅ Stocker l'état connecté dans sessionStorage
            sessionStorage.setItem('isConnected', '1');

            // ✅ Déterminer le rôle selon le premier chiffre
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

            // ➕ Ajouter le code employé dans l'URL
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
});
