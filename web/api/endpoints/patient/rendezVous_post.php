<?php

require_once(__DIR__.'/../../db/Database.php');


header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$data = json_decode(file_get_contents('php://input'), true);

try {
    $cnx = Database::getInstance();
    if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON invalide']);
        exit;
    }


    // Recherche du Nom Employe via le codeEmploye
    $sql = "SELECT CODE_EMPLOYE FROM Employe WHERE NOM_EMPLOYE = :nom LIMIT 1";
    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':nom', $data['NOM_EMPLOYE']);
    $pstmt->execute();
    $employe = $pstmt->fetch(PDO::FETCH_ASSOC);

    if (!$employe) {
        http_response_code(404);
        echo json_encode(['error' => 'Employé non trouvé avec ce nom']);
        exit;
    }

    $codeEmploye = $employe['CODE_EMPLOYE']?? null;


    // Recherche du ID_SERVICE via NOM_SERVICE
    $sqlService = "SELECT ID_SERVICE FROM Service WHERE NOM = :nom_service LIMIT 1";
    $stmtService = $cnx->prepare($sqlService);
    $stmtService->bindValue(':nom_service', $data['NOM_SERVICE']);
    $stmtService->execute();
    $service = $stmtService->fetch(PDO::FETCH_ASSOC);

    if (!$service) {
        http_response_code(404);
        echo json_encode(['error' => 'Service non trouvé avec ce nom']);
        exit;
    }


    $idService = $service['ID_SERVICE']??null;
    $courriel = $data['COURRIEL'] ?? null;
    $jour = $data['JOUR'] ?? null;
    $heure = $data['HEURE'] ?? null;
    
    

    if (!$courriel || !$jour || !$heure || !$idService || !$codeEmploye) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs manquants ou invalides']);
        exit;
    }

    if (!filter_var($courriel, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Format d\'email invalide']);
        exit;
    }

    
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "INSERT INTO Rendezvous 
            (COURRIEL, JOUR, HEURE, DUREE, ID_SERVICE, CODE_EMPLOYE, STATUT, NOTE_CONSULT) 
            VALUES 
            (:courriel, :jour, :heure, :duree, :id_service, :code_employe, :statut, :note)";
    
    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':courriel', $courriel, PDO::PARAM_STR);
    $pstmt->bindValue(':jour', $jour, PDO::PARAM_STR);
    $pstmt->bindValue(':heure', $heure, PDO::PARAM_STR);
    $pstmt->bindValue(':duree', 30, PDO::PARAM_INT);
    $pstmt->bindValue(':id_service', (int)$idService, PDO::PARAM_INT);
    $pstmt->bindValue(':code_employe', (int)$codeEmploye, PDO::PARAM_INT);
    $pstmt->bindValue(':statut', "CONFIRMÉ", PDO::PARAM_STR);
    $pstmt->bindValue(':note', " ");


    $pstmt->execute();

    if ($pstmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode([
            'status' => 'OK',
            'message' => 'Rendez-vous créé',
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
}
