<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache');

try {
    $cnx = Database::getInstance();
    
    $sql = "
    SELECT e.NOM_EMPLOYE, e.PRENOM_EMPLOYE, e.CODE_EMPLOYE, e.POSTE
FROM Employe e
JOIN ServiceEmploye se ON e.CODE_EMPLOYE = se.CODE_EMPLOYE
WHERE se.ID_SERVICE = :id_service;
";

    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':id_service', $id_service, PDO::PARAM_INT);
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
