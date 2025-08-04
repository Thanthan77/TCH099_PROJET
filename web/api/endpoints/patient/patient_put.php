<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (
    !$data || 
    !isset(
        $data['COURRIEL'], 
        $data['PRENOM_PATIENT'], 
        $data['NOM_PATIENT'], 
        $data['MOT_DE_PASSE'], 
        $data['NUM_TEL'], 
        $data['NUM_CIVIQUE'], 
        $data['RUE'], 
        $data['VILLE'], 
        $data['CODE_POSTAL'], 
        $data['NO_ASSURANCE_MALADIE'], 
        $data['DATE_NAISSANCE']
    )
) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs requis manquants']);
    exit();
}

$courriel = $data['COURRIEL'];

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $cnx->prepare("
        UPDATE Patient
        SET 
            PRENOM_PATIENT = :prenom,
            NOM_PATIENT = :nom,
            MOT_DE_PASSE = :mdp,
            NUM_TEL = :tel,
            NUM_CIVIQUE = :civique,
            RUE = :rue,
            VILLE = :ville,
            CODE_POSTAL = :cp,
            NO_ASSURANCE_MALADIE = :nam,
            DATE_NAISSANCE = :naissance
        WHERE COURRIEL = :courriel
    ");

    $stmt->bindParam(':prenom', $data['PRENOM_PATIENT']);
    $stmt->bindParam(':nom', $data['NOM_PATIENT']);
    $stmt->bindParam(':mdp', $data['MOT_DE_PASSE']);
    $stmt->bindParam(':tel', $data['NUM_TEL']);
    $stmt->bindParam(':civique', $data['NUM_CIVIQUE']);
    $stmt->bindParam(':rue', $data['RUE']);
    $stmt->bindParam(':ville', $data['VILLE']);
    $stmt->bindParam(':cp', $data['CODE_POSTAL']);
    $stmt->bindParam(':nam', $data['NO_ASSURANCE_MALADIE']);
    $stmt->bindParam(':naissance', $data['DATE_NAISSANCE']);
    $stmt->bindParam(':courriel', $courriel);

    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Profil mis à jour avec succès']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Aucun patient trouvé avec ce courriel']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur', 'details' => $e->getMessage()]);
}
