<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');


$data = json_decode(file_get_contents('php://input'), true);
$courriel = $data['COURRIEL'];
if (!$data || !isset($data['NUM_TEL'], $data['NUM_CIVIQUE'], $data['RUE'], $data['VILLE'], $data['CODE_POSTAL'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs manquants']);
    exit();
}

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $cnx->prepare("
        UPDATE Patient
        SET NUM_TEL = :tel,
            NUM_CIVIQUE = :civique,
            RUE = :rue,
            VILLE = :ville,
            CODE_POSTAL = :cp
        WHERE COURRIEL = :courriel
    ");

    $stmt->bindParam(':tel', $data['NUM_TEL']);
    $stmt->bindParam(':civique', $data['NUM_CIVIQUE']);
    $stmt->bindParam(':rue', $data['RUE']);
    $stmt->bindParam(':ville', $data['VILLE']);
    $stmt->bindParam(':cp', $data['CODE_POSTAL']);
    $stmt->bindParam(':courriel', $courriel);

    $stmt->execute();

    echo json_encode(['message' => 'Profil mis à jour avec succès']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur']);
}
