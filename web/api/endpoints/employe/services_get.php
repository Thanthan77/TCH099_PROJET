<?php
require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();
    // Modifier la requête SQL pour inclure la durée
    $pstmt = $cnx->prepare("SELECT NOM, DUREE FROM Service");
    $pstmt->execute();

    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    $resultats = $pstmt->fetchAll();

    // Ajouter un log pour débogage afin de vérifier les résultats récupérés
    error_log("Services récupérés : " . json_encode($resultats));

    echo json_encode($resultats);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    $cnx = null;
}
?>
