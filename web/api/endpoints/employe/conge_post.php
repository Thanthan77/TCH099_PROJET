<?php
require_once(__DIR__ . '/../../db/Database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

try {
    $dateDebut = $data['dateDebut'] ?? null;
    $dateFin = $data['dateFin'] ?? null;

    if (!isset($codeEmploye) || !$dateDebut || !$dateFin) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes ou invalides']);
        exit;
    }

    if (strtotime($dateFin) < strtotime($dateDebut)) {
        http_response_code(400);
        echo json_encode(['error' => 'La date de fin doit être après la date de début']);
        exit;
    }

    $cnx = Database::getInstance();

    $sql = "INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_DEBUT, DATE_FIN, TYPE_CONGE, STATUS)
            VALUES (:code, :debut, :fin, 'CONGÉ', 'EN ATTENTE')";

    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':code', $codeEmploye, PDO::PARAM_INT);
    $stmt->bindValue(':debut', $dateDebut);
    $stmt->bindValue(':fin', $dateFin);
    $stmt->execute();

    http_response_code(200);
    echo json_encode([
        "status" => "OK",
        "message" => "Demande de vacances enregistrée et en attente de validation"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
