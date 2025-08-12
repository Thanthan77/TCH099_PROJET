<?php
require_once(__DIR__ . '/../../db/Database.php');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');



// Lecture du JSON brut
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);



// Vérification que le JSON est bien formé
if (is_null($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format JSON invalide ou vide']);
    exit;
}

// Vérification des champs requis
if (
    !isset($data['code_employe']) ||
    !isset($data['mot_de_passe']) ||
    empty($data['code_employe']) ||
    empty($data['mot_de_passe'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs requis manquants']);
    exit;
}

$code = $data['code_employe'];
$motDePasse = $data['mot_de_passe'];
$hash = password_hash($motDePasse, PASSWORD_DEFAULT);

try {
    $cnx = Database::getInstance();
    $stmt = $cnx->prepare("UPDATE Employe SET MOT_DE_PASSE = :hash WHERE CODE_EMPLOYE = :code");
    $stmt->execute([
        ':hash' => $hash,
        ':code' => $code
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Mot de passe mis à jour avec succès']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Aucun employé trouvé avec ce code']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
}
