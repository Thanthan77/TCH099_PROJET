<?php
require_once('./jwt/utils.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['courriel'];
$mdp = $data['motDePassePatient'];

if ($email == '' || $mdp == '') {
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
    exit();
}

require_once('./db/Database.php');
$cnx = $pstmt = null;
try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Patient WHERE courriel = :email");
    $pstmt->bindParam(':email', $email);
    $pstmt->execute();
    
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    if ($result = $pstmt->fetch()) {
        if ($mdp == $result['motDePassePatient']) {
            $token = generate_jwt([
                'courriel' => $email,
                'exp' => time() + 3600
            ]);
            echo json_encode([
                'token' => $token,
                'courriel' => $email
            ]);
            exit();
        }
    }
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
} catch (PDOException $e) {
    http_response_code(500);
    echo '{"error":"Erreur BD", "message":"Problème d\'accès à la base"}';
} finally {
    $cnx = null;
}
