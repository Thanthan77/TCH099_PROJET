<?php

require_once(__DIR__.'/../db/Database.php');

header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Patient");
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


