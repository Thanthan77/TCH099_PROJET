<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');

$data = json_decode(file_get_contents('php://input'), true);

try {
    if ($data === null || json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON invalide']);
        exit;
    }

    $jour = $data['JOUR'] ?? null;
    $heure = $data['HEURE'] ?? null;
    $duree = $data['DUREE'] ?? null;

    if ( !$jour || !$heure || !$duree) {
        http_response_code(400);
        echo json_encode(['error' => 'Champs manquants ou invalides']);
        exit;
    }

    // Vérification des formats des heure et de la date
    $dateObj = DateTime::createFromFormat('Y-m-d', $jour);
    $heureObj = DateTime::createFromFormat('H:i:s', $heure);

    if (!$dateObj || $dateObj->format('Y-m-d') !== $jour ||
        !$heureObj || $heureObj->format('H:i:s') !== $heure) {
        http_response_code(400);
        echo json_encode(['error' => 'Format de date ou d\'heure invalide']);
        exit;
    }

    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "UPDATE Rendezvous
            SET JOUR = :jour,
                HEURE = :heure,
                DUREE = :duree
            WHERE NUM_RDV = :num_rdv";

    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':jour', $jour, PDO::PARAM_STR);
    $stmt->bindValue(':heure', $heure, PDO::PARAM_STR);
    $stmt->bindValue(':duree', (int)$duree, PDO::PARAM_INT);
    $stmt->bindValue(':num_rdv', $numRdv);

    $stmt->execute();

    if ($stmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode([
            'status' => 'OK',
            'message' => 'Rendez-vous mis à jour avec succès',
            'numRdv' => $numRdv
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Aucune mise à jour effectuée (rendez-vous introuvable ou données identiques)']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
