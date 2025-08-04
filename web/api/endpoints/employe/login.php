<?php
require_once('./jwt/utils.php');
require_once(__DIR__ . '/../../db/Database.php');

header('Content-Type: application/json');

// Lecture du JSON envoyé
$data = json_decode(file_get_contents('php://input'), true);
$code_employe = $data['CODE_EMPLOYE'] ?? '';
$mdp = $data['MOT_DE_PASSE'] ?? '';

// Vérification des champs requis
if (empty($code_employe) || empty($mdp)) {
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
    exit();
}

try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Employe WHERE CODE_EMPLOYE = :codeEmploye");
    $pstmt->bindParam(':codeEmploye', $code_employe);
    $pstmt->execute();

    $employe = $pstmt->fetch(PDO::FETCH_ASSOC);

    if ($employe && password_verify($mdp, $employe['MOT_DE_PASSE'])) {
        // Mot de passe correct, on génère le token
        $token = generate_jwt([
            'CODE_EMPLOYE' => $employe['CODE_EMPLOYE'],
            'poste' => $employe['POSTE'],
            'exp' => time() + 3600 // 1h d'expiration
        ]);

        echo json_encode([
            'token' => $token,
            'CODE_EMPLOYE' => $employe['CODE_EMPLOYE']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Identifiants invalides']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur', 'message' => $e->getMessage()]);
} finally {
    $cnx = null;
}
