<?php
require_once(__DIR__ . '/../../db/Database.php');
require_once(__DIR__ . '/../jwt/utils.php');

header('Content-Type: application/json');

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Token manquant']);
    exit();
}

$jwt = str_replace('Bearer ', '', $headers['Authorization']);
$payload = verifier_jwt($jwt);

if (!$payload || !isset($payload['COURRIEL'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Token invalide']);
    exit();
}

$courriel = $payload['COURRIEL'];

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['ANCIEN_MDP'], $data['NOUVEAU_MDP'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs requis manquants']);
    exit();
}

$ancien = $data['ANCIEN_MDP'];
$nouveau = $data['NOUVEAU_MDP'];

try {
    $cnx = Database::getInstance();
    $stmt = $cnx->prepare("SELECT MOT_DE_PASSE FROM Patient WHERE COURRIEL = :courriel");
    $stmt->bindParam(':courriel', $courriel);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        http_response_code(404);
        echo json_encode(['error' => 'Patient non trouvé']);
        exit();
    }

      if (!password_verify($ancien, $result['MOT_DE_PASSE'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Ancien mot de passe incorrect']);
        exit();
    }

    $hash = password_hash($nouveau, PASSWORD_DEFAULT);

    $stmt = $cnx->prepare("UPDATE Patient SET MOT_DE_PASSE = :mdp WHERE COURRIEL = :courriel");
    $stmt->bindParam(':mdp', $hash);
    $stmt->bindParam(':courriel', $courriel);
    $stmt->execute();

    echo json_encode(['message' => 'Mot de passe mis à jour avec succès']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur']);
}
