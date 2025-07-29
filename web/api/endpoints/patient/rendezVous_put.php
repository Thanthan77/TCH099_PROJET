<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');

$data = json_decode(file_get_contents('php://input'), true);

try {
    $action = strtolower(trim($data['action'] ?? ''));

    // Validation du JSON
    if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON invalide']);
        exit;
    }

    if ($action !== 'cancel' || !$numRdv || !ctype_digit((string)$numRdv)) {
        http_response_code(400);
        echo json_encode(["error" => "Action ou identifiant invalide"]);
        exit;
    }

    if ($action === 'cancel') {
        $cnx = Database::getInstance();
        $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $sql = "UPDATE Rendezvous SET STATUT = 'ANNULÉ' WHERE NUM_RDV = :num_rdv";
        $stmt = $cnx->prepare($sql);
        $stmt->bindValue(':num_rdv', $numRdv, PDO::PARAM_INT);
        $stmt->execute();

        $response = ($stmt->rowCount() > 0)
            ? ['status' => 'OK', 'message' => 'Rendez-vous annulé avec succès', 'numRdv' => $numRdv]
            : ['error' => 'Rendez-vous introuvable ou déjà annulé'];

        http_response_code($stmt->rowCount() > 0 ? 200 : 404);
        echo json_encode($response);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données', 'details' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
