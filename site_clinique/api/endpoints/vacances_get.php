<?php

require_once(__DIR__ . '/../db/Database.php');

// Réponse JSON
header('Content-Type: application/json');

try {
    // Connexion à la base
    $cnx = Database::getInstance();

    // Préparer la requête
    $pstmt = $cnx->prepare("SELECT * FROM Exception_horaire WHERE TYPE_EXCEPTION = :type");

    // Définir la valeur du paramètre
    $pstmt->bindValue(':type', 'ATTENTE', PDO::PARAM_STR);

    // Définir le mode de récupération avant d'exécuter
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);

    // Exécuter
    $pstmt->execute();

    // Récupérer les résultats
    $resultats = $pstmt->fetchAll();

    // Retourner les résultats
    echo json_encode($resultats);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    // Fermer la connexion si elle existe
    if (isset($cnx)) {
        $cnx = null;
    }
}
