<?php

require_once(__DIR__.'/../../db/Database.php');

ob_start();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

try {
    $dateDebut = $data['dateDebut'] ?? null;
    $dateFin = $data['dateFin'] ?? null;

    // Vérification des champs requis
    if (!$dateDebut || !$dateFin) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes ou invalides']);
        exit;
    }

    // Validation des dates 
    if (strtotime($dateFin) < strtotime($dateDebut)) {
        http_response_code(400);
        echo json_encode(['error' => 'La date de fin doit être postérieure ou égale à la date de début']);
        exit;
    }

    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_DEBUT, DATE_FIN, TYPE_EXCEPTION)
            VALUES (:code, :debut, :fin, :type)";

    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':code', $codeEmploye); 
    $stmt->bindValue(':debut', $dateDebut);
    $stmt->bindValue(':fin', $dateFin);
    $stmt->bindValue(':type', 'ATTENTE');

    $stmt->execute();

    if ($stmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode(['status' => 'OK', 'message' => 'Demande de vacance en ATTENTE']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Échec de l\'insertion']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $cnx = null;
    ob_end_flush();
}
