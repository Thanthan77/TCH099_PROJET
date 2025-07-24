<?php

require_once(__DIR__.'/../../db/Database.php');


ob_start();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

try {

    $codeEmploye = $data['codeEmploye'] ?? null;
    $dateException = $data['dateException'] ?? null;
    $heureDebut = $data['heureDebut'] ?? null;
    $heureFin = $data['heureFin'] ?? null;

    // Verification qu'il y a des données dans tous les champs du body
    if (!$codeEmploye || !$dateException || !$heureDebut || !$heureFin) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes ou invalides']);
        exit;
    }

    // Verification du format de la date (annee-mois-jour)
    $date = DateTime::createFromFormat('Y-m-d', $dateException);
    if (!$date || $date->format('Y-m-d') !== $dateException) {
        http_response_code(400);
        echo json_encode(['error' => 'Format de date invalide']);
        exit;
    }

    // Verification de l'heure de debut et fin s'ils sont dans le bon format
    $debut = DateTime::createFromFormat('H:i', $heureDebut);
    $fin = DateTime::createFromFormat('H:i', $heureFin);

    if (!$debut || $debut->format('H:i') !== $heureDebut ||!$fin || $fin->format('H:i') !== $heureFin) {
        http_response_code(400);
        echo json_encode(['error' => 'Format d\'heure invalide']);
        exit;
    }

    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    $sql = "INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_EXCEPTION, HEURE_DEBUT, HEURE_FIN, TYPE_EXCEPTION)
            VALUES (:code, :date, :debut, :fin, :type)";

    $stmt = $cnx->prepare($sql);

    $stmt->bindValue(':code', $codeEmploye);
    $stmt->bindValue(':date', $data['dateException']);
    $stmt->bindValue(':debut', $data['heureDebut']);
    $stmt->bindValue(':fin', $data['heureFin']);
    $stmt->bindValue(':type', 'ATTENTE'); 

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
