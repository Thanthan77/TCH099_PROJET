<?php
// update_rendezvous_note.php

require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json; charset=UTF-8');

// 1) On n’accepte que la méthode PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    header('Allow: PUT');
    echo json_encode([
        'error' => 'Méthode non autorisée, utilisez PUT'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 2) Récupérer et décoder le JSON envoyé
$input = json_decode(file_get_contents('php://input'), true);
if (
    !isset($input['numRdv']) ||
    !isset($input['noteConsult'])
) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Les paramètres numRdv et noteConsult sont requis'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 3) Valider les paramètres
$numRdv = filter_var($input['numRdv'], FILTER_VALIDATE_INT);
$note   = trim($input['noteConsult']);

if ($numRdv === false || $note === '') {
    http_response_code(400);
    echo json_encode([
        'error' => 'numRdv doit être un entier valide et noteConsult ne peut pas être vide'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // 4) Connexion et vérification de l'existence du rendez‑vous
    $cnx = Database::getInstance();
    $check = $cnx->prepare('SELECT COUNT(*) FROM Rendezvous WHERE NUM_RDV = :numRdv');
    $check->bindValue(':numRdv', $numRdv, PDO::PARAM_INT);
    $check->execute();

    if ($check->fetchColumn() == 0) {
        http_response_code(404);
        echo json_encode([
            'error' => "Rendez‑vous #$numRdv introuvable"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 5) Mise à jour de la note
    $upd = $cnx->prepare('
        UPDATE Rendezvous
           SET NOTE_CONSULT = :note
         WHERE NUM_RDV      = :numRdv
    ');
    $upd->bindValue(':note',   $note,   PDO::PARAM_STR);
    $upd->bindValue(':numRdv', $numRdv, PDO::PARAM_INT);
    $upd->execute();

    // 6) Réponse de succès
    http_response_code(200);
    echo json_encode([
        'status'      => 'success',
        'message'     => "Note de consultation mise à jour pour le RDV #$numRdv",
        'numRdv'      => $numRdv,
        'noteConsult' => $note
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error'   => 'Erreur de base de données',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
