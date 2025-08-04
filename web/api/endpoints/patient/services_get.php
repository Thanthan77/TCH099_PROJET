<?php

require_once(__DIR__ . '/../../../db/Database.php');
header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    $stmt = $cnx->prepare("SELECT ID_SERVICE, NOM AS NOM_SERVICE FROM Service");
    $stmt->execute();

    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($services);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur base de données",
        "message" => $e->getMessage()
    ]);
}
