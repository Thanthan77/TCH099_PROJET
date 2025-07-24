<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);
    
    if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Format JSON invalide");
    }

    if (!isset($data['COURRIEL']) || !isset($data['JOUR']) || 
        !isset($data['HEURE']) || !isset($data['DUREE']) || 
        !isset($data['ID_SERVICE'])||!isset($data['CODE_EMPLOYE'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs manquants']);
        exit();
    }

    if (!filter_var($data['COURRIEL'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Format d'email invalide");
    }

    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

 $sql = "INSERT INTO Rendezvous 
            (COURRIEL, JOUR, HEURE, DUREE, ID_SERVICE, CODE_EMPLOYE, STATUT, NOTE_CONSULT) 
            VALUES 
            (:courriel, :jour, :heure, :duree, :id_service, :code_employe, :statut, :note)";
    
    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':courriel', $data['COURRIEL'], PDO::PARAM_STR);
    $pstmt->bindValue(':jour', $data['JOUR'], PDO::PARAM_STR);
    $pstmt->bindValue(':heure', $data['HEURE'], PDO::PARAM_STR);
    $pstmt->bindValue(':duree', (int)$data['DUREE'], PDO::PARAM_INT);
    $pstmt->bindValue(':id_service', (int)$data['ID_SERVICE'], PDO::PARAM_INT);
    $pstmt->bindValue(':code_employe', (int)$data['CODE_EMPLOYE'], PDO::PARAM_INT);
    $pstmt->bindValue(':statut', "ATTENTE", PDO::PARAM_STR);
    $pstmt->bindValue(':note', " ");
    
    if ($pstmt->execute()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Rendez-vous en attente de confirmation'
        ]);
    } else {
        throw new Exception("Échec de la création du rendez-vous");
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données']);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
    
} finally {
    if (isset($cnx)) {
        $cnx = null;
    }
}