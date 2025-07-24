<?php

require_once(__DIR__.'/../../db/Database.php');

// Réponse JSON
header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    $pstmt = $cnx->prepare("SELECT * FROM Exception_horaire WHERE TYPE_EXCEPTION = :type");
    $pstmt->bindValue(':type', 'ATTENTE', PDO::PARAM_STR);
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    $pstmt->execute();

    $resultats = $pstmt->fetchAll();
    echo json_encode($resultats);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    
    if (isset($cnx)) {
        $cnx = null;
    }
}
