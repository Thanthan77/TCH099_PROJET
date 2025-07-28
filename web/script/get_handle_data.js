/** 
 * Cette fonction charge des données à partir d'une URL d'API, la convertit en objet ou tableau d'objets puis transmet le resultat à une fonction de rappel.
 * La fonction suppose que l'API envoie des données en JSON.
 * @param {string} url - L'URL de l'API à interroger'.
 * @param {string} callback - La fonction de rappel qui va traiter les données.
 * @author Abdelmoumene Toudeft (Abdelmoumene.Toudeft@etsmtl.ca)
 * @since 2025
 * @version 1.0
 * */
function charger_traiter_data(url, callback) {
    fetch(url)
        .then(reponse => reponse.json())
        .then(donnees => callback(donnees))
        .catch(erreur => console.log("Erreur : " + erreur));
}



