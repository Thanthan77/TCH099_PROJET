<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');

$cnx = null;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// 🛡️ Vérifie que les paramètres sont fournis
if (!isset($data['action'], $data['id_exc'])) {
    http_response_code(400);
    echo json_encode(["error" => "Paramètres manquants (action, id_exc)"]);
    exit;
}

$action = strtolower(trim($data['action']));
$idException = $data['id_exc'];

try {
    if (!in_array($action, ['accepter', 'refuser'])) {
        http_response_code(400);
        echo json_encode(["error" => "Action invalide. Doit être 'accepter' ou 'refuser'"]);
        exit;
    }

    $cnx = Database::getInstance();

    // 🔍 Vérifie que l'exception est bien en attente
    $checkQuery = "SELECT * FROM Exception_horaire WHERE ID_EXC = :id AND STATUS = 'EN ATTENTE'";
    $stmt = $cnx->prepare($checkQuery);
    $stmt->bindValue(':id', $idException, PDO::PARAM_INT);
    $stmt->execute();
    $exception = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$exception) {
        http_response_code(404);
        echo json_encode(["error" => "Exception introuvable ou déjà traitée"]);
        exit;
    }

    if ($action === 'accepter') {
        // ✅ Met à jour le statut à ACCEPTÉ
        $updateQuery = "UPDATE Exception_horaire SET STATUS = 'APPROUVÉ' WHERE ID_EXC = :id";
        $stmt = $cnx->prepare($updateQuery);
        $stmt->bindValue(':id', $idException, PDO::PARAM_INT);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Exception acceptée"]);
    } else {
        // ✅ Met à jour le statut à REJETÉ
        $updateQuery = "UPDATE Exception_horaire SET STATUS = 'REJETÉ' WHERE ID_EXC = :id";
        $stmt = $cnx->prepare($updateQuery);
        $stmt->bindValue(':id', $idException, PDO::PARAM_INT);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Exception refusée (rejetée)"]);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de base de données", "details" => $e->getMessage()]);
} finally {
    if ($cnx) {
        $cnx = null;
    }
}
