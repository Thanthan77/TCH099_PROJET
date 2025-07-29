<?php


require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');

$cnx = $pstmt = null;

$json = file_get_contents('php://input');

$data = json_decode($json, true);

try {

    $action = strtolower(trim($data['action']));

    if (!in_array($action, ['accept', 'reject'])) {
        http_response_code(400);
        echo json_encode(["error" => "Action invalide. Doit être 'accept' ou 'reject'"]);
        exit;
    }

    $cnx = Database::getInstance();

    $checkQuery = "SELECT * FROM Exception_horaire WHERE ID_EXC = :id AND TYPE_EXCEPTION = 'ATTENTE'";
    $stmt = $cnx->prepare($checkQuery);
    $stmt->bindValue(':id', $idException);
    $stmt->execute();
    $exception = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$exception) {
        http_response_code(404);
        echo json_encode(["error" => "Exception introuvable ou non en attente"]);
        exit;
    }

    if ($action === 'accept') {

        $updateQuery = "UPDATE Exception_horaire SET TYPE_EXCEPTION = 'VACANCES' WHERE ID_EXC = :id";
        $stmt = $cnx->prepare($updateQuery);
        $stmt->bindValue(':id', $idException);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Exception acceptée"]);
    } else {

        $deleteQuery = "DELETE FROM Exception_horaire WHERE ID_EXC = :id AND TYPE_EXCEPTION = 'ATTENTE'";
        $stmt = $cnx->prepare($deleteQuery);
        $stmt->bindValue(':id', $idException);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Exception refusée et supprimée"]);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de base de données", "details" => $e->getMessage()]);
} finally {
    if ($cnx) {
        $cnx = null;
    }
}


