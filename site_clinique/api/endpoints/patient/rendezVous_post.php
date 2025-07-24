<?php

require_once(__DIR__.'/../../db/Database.php');

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$data = json_decode(file_get_contents('php://input'), true);

try {
    if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON invalide']);
        exit;
    }

    $courriel = $data['COURRIEL'] ?? null;
    $jour = $data['JOUR'] ?? null;
    $heure = $data['HEURE'] ?? null;
    $duree = $data['DUREE'] ?? null;
    $idService = $data['ID_SERVICE'] ?? null;
    $codeEmploye = $data['CODE_EMPLOYE'] ?? null;

    if (!$courriel || !$jour || !$heure || !$duree || !$idService || !$codeEmploye) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs manquants ou invalides']);
        exit;
    }

    if (!filter_var($courriel, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Format d\'email invalide']);
        exit;
    }

    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "INSERT INTO Rendezvous 
            (COURRIEL, JOUR, HEURE, DUREE, ID_SERVICE, CODE_EMPLOYE, STATUT, NOTE_CONSULT) 
            VALUES 
            (:courriel, :jour, :heure, :duree, :id_service, :code_employe, :statut, :note)";
    
    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':courriel', $courriel, PDO::PARAM_STR);
    $pstmt->bindValue(':jour', $jour, PDO::PARAM_STR);
    $pstmt->bindValue(':heure', $heure, PDO::PARAM_STR);
    $pstmt->bindValue(':duree', (int)$duree, PDO::PARAM_INT);
    $pstmt->bindValue(':id_service', (int)$idService, PDO::PARAM_INT);
    $pstmt->bindValue(':code_employe', (int)$codeEmploye, PDO::PARAM_INT);
    $pstmt->bindValue(':statut', "ATTENTE", PDO::PARAM_STR);
    $pstmt->bindValue(':note', " ");


    $pstmt->execute();

    if ($pstmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode([
            'status' => 'OK',
            'message' => 'Rendez-vous en attente de confirmation',
            'data' => $data
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Échec de la création du rendez-vous']);
    }


} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $cnx = null;
    ob_end_flush();
}
