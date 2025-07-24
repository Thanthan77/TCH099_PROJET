<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');

$cnx = $pstmt = null;

$data = json_decode(file_get_contents('php://input'), true);

try{

    $prenom = $data['PRENOM_EMPLOYE'] ?? null;
    $nom = $data['NOM_EMPLOYE'] ?? null;
    $mdp = $data['MOT_DE_PASSE'] ?? null;
    $poste = $data['POSTE'] ?? null;

    if ( !$prenom || !$nom || !$mdp || !$poste) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs manquants ou invalides']);
        exit;
    }

    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "UPDATE Employe 
        SET PRENOM_EMPLOYE = :prenom,
            NOM_EMPLOYE = :nom,
            MOT_DE_PASSE = :mdp,
            POSTE = :poste
        WHERE CODE_EMPLOYE = :code";

    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':prenom', $data['PRENOM_EMPLOYE'], PDO::PARAM_STR);
    $stmt->bindValue(':nom', $data['NOM_EMPLOYE'], PDO::PARAM_STR);
    $stmt->bindValue(':mdp', $data['MOT_DE_PASSE'], PDO::PARAM_STR);
    $stmt->bindValue(':poste', $data['POSTE'], PDO::PARAM_STR);
    $stmt->bindValue(':code', $codeEmploye);

    $stmt->execute();

    if ($stmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode([
            'status' => 'OK',
            'message' => 'Employé mis à jour avec succès',
            'codeEmploye' => $codeEmploye
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Aucune mise à jour effectuée (employé introuvable ou données identiques)']);
    }

}catch(PDOException $e){

    http_response_code(500);
    echo json_encode(["error" => "Erreur de base de données", "details" => $e->getMessage()]);

}catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}finally{
    $cnx = null;
}