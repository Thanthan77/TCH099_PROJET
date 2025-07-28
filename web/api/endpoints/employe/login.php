<?php
require_once('./jwt/utils.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$code_employe = $data['CODE_EMPLOYE'];
$mdp = $data['MOT_DE_PASSE'];

if ($code_employe=='' || $mdp=='') { 
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
    exit();
}

require_once(__DIR__.'/../../db/Database.php');
$cnx = $pstmt = null;
try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Employe WHERE CODE_EMPLOYE=:codeEmploye");
    $pstmt->bindParam(':codeEmploye',$code_employe);
    $pstmt->execute();
    
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    if ($result = $pstmt->fetch()) { 
        if ($mdp == $result['MOT_DE_PASSE']) {
            $token = generate_jwt([
                'CODE_EMPLOYE' =>$code_employe,
                'poste' => $result['POSTE'],
                'exp' => time() + 3600
            ]);

            echo json_encode([
                'token' => $token,
                'CODE_EMPLOYE' =>$code_employe 
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