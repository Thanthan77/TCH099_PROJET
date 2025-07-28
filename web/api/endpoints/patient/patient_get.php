<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache');

try {

   
    if (!$courriel) {
        http_response_code(400);
        echo json_encode(["error" => "Le paramètre codeEmploye est requis"]);
        exit();
    }

    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Patient WHERE COURRIEL = :courriel");
    $pstmt->bindValue(':courriel', $courriel);
    $pstmt->execute();

    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    $resultats = $pstmt->fetchAll();

if (empty($resultats)) {
        http_response_code(404);
        echo json_encode(["message" => "Aucun patient trouvé avec ce courriel"]);
    } else {
        echo json_encode($resultats);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    $cnx = null;
}
