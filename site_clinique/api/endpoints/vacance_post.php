<?php

require_once(__DIR__ . '/../db/Database.php');

// Pour éviter les erreurs de "headers already sent"
ob_start();

header('Content-Type: application/json');

// Lecture des données JSON envoyées dans le body
$data = json_decode(file_get_contents('php://input'), true);

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Vérifier les champs requis
    if (!isset($data['codeEmploye'], $data['dateException'], $data['heureDebut'], $data['heureFin'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs requis manquants.']);
        exit;
    }

    $sql = "INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_EXCEPTION, HEURE_DEBUT, HEURE_FIN, TYPE_EXCEPTION)
            VALUES (:code, :date, :debut, :fin, :type)";

    $stmt = $cnx->prepare($sql);

    $stmt->bindValue(':code', $data['codeEmploye'], PDO::PARAM_INT);
    $stmt->bindValue(':date', $data['dateException']);
    $stmt->bindValue(':debut', $data['heureDebut']);
    $stmt->bindValue(':fin', $data['heureFin']);
    $stmt->bindValue(':type', 'ATTENTE'); // Valeur fixée ici

    $stmt->execute();

    if ($stmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode(['status' => 'OK', 'message' => 'Exception insérée avec le statut ATTENTE']);
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
