<?php
require_once(__DIR__ . '/../../db/Database.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['COURRIEL'], $data['ANCIEN_MDP'], $data['NOUVEAU_MDP'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs manquants']);
    exit();
}

$courriel = $data['COURRIEL'];
$ancienMdp = $data['ANCIEN_MDP'];
$nouveauMdp = $data['NOUVEAU_MDP'];

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $cnx->prepare("SELECT MOT_DE_PASSE FROM Patient WHERE COURRIEL = :courriel");
    $stmt->bindParam(':courriel', $courriel);
    $stmt->execute();

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($row['MOT_DE_PASSE'] !== $ancienMdp) {
            http_response_code(401);
            echo json_encode(['error' => 'Ancien mot de passe incorrect']);
            exit();
        }

        $stmt = $cnx->prepare("UPDATE Patient SET MOT_DE_PASSE = :nouveau WHERE COURRIEL = :courriel");
        $stmt->bindParam(':nouveau', $nouveauMdp);
        $stmt->bindParam(':courriel', $courriel);
        $stmt->execute();

        echo json_encode(['message' => 'Mot de passe mis à jour avec succès']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Patient introuvable']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur serveur',
        'details' => $e->getMessage()
    ]);
}
