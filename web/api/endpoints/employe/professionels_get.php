<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache');

try {

    if (!$nom_service) {
    http_response_code(400);
    error_log("Paramètre manquant. Nom Service: $nom_service");
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}



    $cnx = Database::getInstance();
    
    $sql = "SELECT e.NOM_EMPLOYE, e.PRENOM_EMPLOYE, e.CODE_EMPLOYE, e.POSTE
        FROM Employe e
        JOIN ServiceEmploye se ON e.CODE_EMPLOYE = se.CODE_EMPLOYE
        JOIN Service s ON se.ID_SERVICE = s.ID_SERVICE
        WHERE s.NOM = :nom_service ";

    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':nom_service', $nom_service, PDO::PARAM_STR);
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
