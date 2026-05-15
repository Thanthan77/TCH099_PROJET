<?php

require_once(__DIR__.'/../../db/Database.php');


header('Content-Type: application/json');
header('Cache-Control: no-cache');

error_reporting(E_ALL);
ini_set('display_errors', 1);


try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Employe");
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
