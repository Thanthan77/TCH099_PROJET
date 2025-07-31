<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../../db/Database.php'); // ✅ Chemin corrigé vers Database.php

try {
    $cnx = Database::getInstance();

    // 🔄 Récupérer les horaires + jours travaillés
    $stmtHoraires = $cnx->prepare("
        SELECT h.CODE_EMPLOYE, h.HEURE_DEBUT, h.HEURE_FIN, jt.JOUR_SEMAINE
        FROM Horaire h
        JOIN JourTravail jt ON h.CODE_EMPLOYE = jt.CODE_EMPLOYE
    ");
    $stmtHoraires->execute();
    $horaires = $stmtHoraires->fetchAll(PDO::FETCH_ASSOC);

    // 📆 Récupérer les périodes de vacances
    $stmtVacances = $cnx->prepare("
        SELECT CODE_EMPLOYE, DATE_DEBUT, DATE_FIN, STATUS
        FROM Exception_horaire
        WHERE TYPE_CONGE = 'CONGÉ' AND STATUS = 'APPROUVÉ'
    ");
    $stmtVacances->execute();
    $vacances = $stmtVacances->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "horaires" => $horaires,
        "vacances" => $vacances
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "details" => $e->getMessage()
    ]);
}
