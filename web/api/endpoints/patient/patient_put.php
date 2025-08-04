<?php
require_once(__DIR__ . '/../../db/Database.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (
    !$data ||
    !isset($data['COURRIEL'], $data['PRENOM'], $data['NOM'], $data['DATE_NAISSANCE'], $data['NO_ASSURANCE'],
            $data['NUM_TEL'], $data['NUM_CIVIQUE'], $data['RUE'], $data['VILLE'], $data['CODE_POSTAL'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs requis manquants']);
    exit();
}

$courriel     = $data['COURRIEL'];
$prenom       = $data['PRENOM'];
$nom          = $data['NOM'];
$dateNaiss    = $data['DATE_NAISSANCE'];
$nam          = $data['NO_ASSURANCE'];
$num_tel      = $data['NUM_TEL'];
$num_civique  = $data['NUM_CIVIQUE'];
$rue          = $data['RUE'];
$ville        = $data['VILLE'];
$code_postal  = $data['CODE_POSTAL'];

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $cnx->prepare("
        UPDATE Patient
        SET PRENOM = :prenom,
            NOM = :nom,
            DATE_NAISSANCE = :naiss,
            NO_ASSURANCE = :nam,
            NUM_TEL = :tel,
            NUM_CIVIQUE = :civique,
            RUE = :rue,
            VILLE = :ville,
            CODE_POSTAL = :cp
        WHERE COURRIEL = :courriel
    ");

    $stmt->bindParam(':prenom', $prenom);
    $stmt->bindParam(':nom', $nom);
    $stmt->bindParam(':naiss', $dateNaiss);
    $stmt->bindParam(':nam', $nam);
    $stmt->bindParam(':tel', $num_tel);
    $stmt->bindParam(':civique', $num_civique);
    $stmt->bindParam(':rue', $rue);
    $stmt->bindParam(':ville', $ville);
    $stmt->bindParam(':cp', $code_postal);
    $stmt->bindParam(':courriel', $courriel);

    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Profil mis à jour avec succès']);
    } else {
        echo json_encode(['message' => 'Aucune modification effectuée (courriel introuvable ou données identiques)']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur serveur',
        'details' => $e->getMessage()
    ]);
}
