<?php
require_once(__DIR__ . '/../../db/Database.php');

header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['codeEmploye']) || !isset($data['services'])) {
        http_response_code(400);
        echo json_encode(["error" => "Champs requis manquants."]);
        exit;
    }

    $codeEmploye = $data['codeEmploye'];
    $services = $data['services']; // tableau de noms de services

    // 🔸 Supprimer les anciennes assignations
    $deleteStmt = $cnx->prepare("DELETE FROM ServiceEmploye WHERE CODE_EMPLOYE = :code");
    $deleteStmt->bindParam(":code", $codeEmploye);
    $deleteStmt->execute();

    // 🔸 Réinsérer les nouvelles assignations
    $insertStmt = $cnx->prepare("
        INSERT INTO ServiceEmploye (CODE_EMPLOYE, ID_SERVICE)
        SELECT :code, ID_SERVICE FROM Service WHERE NOM = :nomService
    ");

    foreach ($services as $nomService) {
        $insertStmt->bindParam(":code", $codeEmploye);
        $insertStmt->bindParam(":nomService", $nomService);
        $insertStmt->execute();
    }

    echo json_encode(["success" => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur base de données", "message" => $e->getMessage()]);
}
