<?php

require_once(__DIR__.'/../db/Database.php');

header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    //  Requête avec JOIN pour récupérer le nom du service
    $pstmt = $cnx->prepare("
        SELECT r.NUM_RDV, r.HEURE, r.DUREE, r.DATE_RDV, r.COURRIEL, r.CODE_EMPLOYE, r.ID_SERVICE,
        s.NOM AS service
        FROM Rendezvous r
        JOIN Service s ON r.ID_SERVICE = s.ID_SERVICE
    ");

    $pstmt->execute();
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    $resultats = $pstmt->fetchAll();

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


