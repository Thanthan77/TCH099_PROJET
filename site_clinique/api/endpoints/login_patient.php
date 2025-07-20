<?php
require_once('./jwt/utils.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

//On vérifie les infos de connexion :
$username = $data['COURRIEL'];
$mdp = $data['MOT_DE_PASSE'];

if ($username=='' || $mdp=='') { //formulaire mal rempli
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
    exit();
}

require_once('./db/Database.php');
$cnx = $pstmt = null;
try {
    $cnx = Database::getInstance();
    $pstmt = $cnx->prepare("SELECT * FROM Patient WHERE COURRIEL=:courriel");
    $pstmt->bindParam(':courriel',$username);
    $pstmt->execute();
    
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    if ($result = $pstmt->fetch()) { //Utilisateur trouvé
        if ($mdp == $result['MOT_DE_PASSE']) {
            // Générer le token
            $token = generate_jwt([
                'COURRIEL' => $username,
                'exp' => time() + 3600
            ]);

            echo json_encode([
                'token' => $token,
                'COURRIEL' => $username 
            ]);
            exit();
        } 
    }
    //Infos de connexion incorrectes :
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
} catch (PDOException $e) {
    http_response_code(500); //Internal Server Error
    echo '{"error":"Error", "message":"Probleme d\'acces à la BD"}';
} finally {
    $cnx = null;
}