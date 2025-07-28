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

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    messageErreur.textContent = ""; // reset message

    if (password !== confirmPassword) {
      messageErreur.textContent = "Les mots de passe ne correspondent pas.";
      return;
    }

    const erreurs = verifierMotDePasse(password);

    if (erreurs.length > 0) {
      messageErreur.textContent = "Erreur : " + erreurs.join(" ");
    } else {
      alert("Mot de passe réinitialisé avec succès !");
      // Code ici pour envoyer requete au servers
    }
  });
});
