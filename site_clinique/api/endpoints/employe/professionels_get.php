<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache');

try {
    $cnx = Database::getInstance();
    
    $sql = "
    SELECT NOM_EMPLOYE 
    FROM Employe 
    WHERE CODE_EMPLOYE LIKE '1%' OR CODE_EMPLOYE LIKE '2%'
";

    $pstmt = $cnx->prepare($sql);
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
