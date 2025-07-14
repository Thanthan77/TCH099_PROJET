<?php
require_once('./jwt/utils.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

//On vefie les infos de connexion :
$username = $data['CODE_EMPLOYE'];
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
    $pstmt = $cnx->prepare("SELECT * FROM Employe WHERE CODE_EMPLOYE=:codeEmploye");
    $pstmt->bindParam(':codeEmploye',$username);
    $pstmt->execute();
    
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    if ($result = $pstmt->fetch()) { //Utilisateur trouve
        if ($mdp==$result['MOT_DE_PASSE']) { //mot de passe correct
        //On génère le token et on l'envoie au client :
        $token = generate_jwt(['CODE_EMPLOYE' => $username, 'exp' => time() + 3600]);
        echo json_encode(['token' => $token]);
        //On arrete l'execution du script :
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