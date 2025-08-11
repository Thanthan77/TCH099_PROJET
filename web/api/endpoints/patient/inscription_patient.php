<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (
    empty($data['COURRIEL']) || empty($data['MOT_DE_PASSE']) || empty($data['PRENOM_PATIENT']) ||
    empty($data['NOM_PATIENT']) || empty($data['NUM_TEL']) || empty($data['NUM_CIVIQUE']) ||
    empty($data['RUE']) || empty($data['VILLE']) || empty($data['CODE_POSTAL']) ||
    empty($data['NO_ASSURANCE_MALADIE']) || empty($data['DATE_NAISSANCE'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs manquants']);
    exit();
}

require_once(__DIR__.'/../../db/Database.php');

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $check = $cnx->prepare("SELECT COURRIEL FROM Patient WHERE COURRIEL = :courriel");
    $check->bindParam(':courriel', $data['COURRIEL']);
    $check->execute();
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Courriel déjà utilisé']);
        exit();
    }
    $hashedPassword = password_hash($data['MOT_DE_PASSE'], PASSWORD_DEFAULT);

    $stmt = $cnx->prepare("
        INSERT INTO Patient (COURRIEL, PRENOM_PATIENT, NOM_PATIENT, MOT_DE_PASSE, NUM_TEL,
                    NUM_CIVIQUE, RUE, VILLE, CODE_POSTAL, NO_ASSURANCE_MALADIE, DATE_NAISSANCE)
        VALUES (:courriel, :prenom, :nom, :mdp, :tel, :civique, :rue, :ville, :cp, :ramq, :naissance)
    ");

    $stmt->bindParam(':courriel', $data['COURRIEL']);
    $stmt->bindParam(':prenom', $data['PRENOM_PATIENT']);
    $stmt->bindParam(':nom', $data['NOM_PATIENT']);
    $stmt->bindParam(':mdp', $hashedPassword);
    $stmt->bindParam(':tel', $data['NUM_TEL']);
    $stmt->bindParam(':civique', $data['NUM_CIVIQUE']);
    $stmt->bindParam(':rue', $data['RUE']);
    $stmt->bindParam(':ville', $data['VILLE']);
    $stmt->bindParam(':cp', $data['CODE_POSTAL']);
    $stmt->bindParam(':ramq', $data['NO_ASSURANCE_MALADIE']);
    $stmt->bindParam(':naissance', $data['DATE_NAISSANCE']);

    $stmt->execute();

    echo json_encode(['message' => 'Inscription réussie']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur']);
} finally {
    $cnx = null;
}
