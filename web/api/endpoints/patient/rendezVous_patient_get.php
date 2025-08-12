<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    // Vérification du paramètre courriel
    if (!isset($courriel)) {
        http_response_code(400);
        echo json_encode(["error" => "Le paramètre courriel est requis"]);
        exit();
    }


    $queryPatient = "
        SELECT PRENOM_PATIENT, NOM_PATIENT, NUM_TEL, VILLE, DATE_NAISSANCE
        FROM Patient
        WHERE COURRIEL = :courriel
    ";
    $stmtPatient = $cnx->prepare($queryPatient);
    $stmtPatient->bindValue(':courriel', $courriel);
    $stmtPatient->execute();
    $patient = $stmtPatient->fetch(PDO::FETCH_ASSOC);

    if (!$patient) {
        http_response_code(404);
        echo json_encode(["error" => "Patient introuvable"]);
        exit();
    }

    $queryRDV = "
        SELECT 
            r.NUM_RDV,
            DATE_FORMAT(r.JOUR, '%Y-%m-%d') AS DATE_RDV,
            TIME_FORMAT(r.HEURE, '%H:%i')   AS HEURE,
            r.DUREE,
            r.ID_SERVICE,
            s.NOM AS NOM_SERVICE,
            s.DESCRIPTION AS DESCRIPTION_SERVICE,
            r.NOTE_CONSULT,
            r.STATUT
        FROM Rendezvous AS r
        JOIN Service AS s ON r.ID_SERVICE = s.ID_SERVICE
        WHERE r.COURRIEL = :courriel
        ORDER BY r.JOUR, r.HEURE
    ";
    $stmtRDV = $cnx->prepare($queryRDV);
    $stmtRDV->bindValue(':courriel', $courriel);
    $stmtRDV->execute();
    $rendezvous = $stmtRDV->fetchAll(PDO::FETCH_ASSOC);


    $response = [
        'patient' => $patient,
        'rendezvous' => $rendezvous
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "details" => $e->getMessage()
    ]);
} finally {
    $cnx = null;
}
