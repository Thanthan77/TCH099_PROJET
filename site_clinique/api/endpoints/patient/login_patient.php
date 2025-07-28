<?php
require_once('./jwt/utils.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$courriel = $data['COURRIEL'];
$mdp = $data['MOT_DE_PASSE'];

if ($courriel=='' || $mdp=='') { 
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
    exit();
}

require_once(__DIR__.'/../../db/Database.php');
$cnx = $pstmt = null;
try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Patient WHERE COURRIEL=:courriel");
    $pstmt->bindParam(':courriel',$courriel);
    $pstmt->execute();
    
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    if ($result = $pstmt->fetch()) { 
        if (trim($mdp) === trim($result['MOT_DE_PASSE'])) {
            $token = generate_jwt([
                'COURRIEL' => $courriel,
                'exp' => time() + 3600
            ]);

            echo json_encode([
                'token' => $token,
                'COURRIEL' => $courriel
            ]);
            exit();
        } 
    }
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
} catch (PDOException $e) {
    http_response_code(500); 
    echo '{"error":"Error", "message":"Probleme d\'acces à la BD"}';
} finally {
    $cnx = null;
}
