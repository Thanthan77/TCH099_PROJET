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

    $action = strtolower(trim($data['action'] ?? ''));
    $numRdv = $data['numRdv'] ?? null;

    if (!in_array($action, ['modifier', 'annuler']) || !$numRdv || !ctype_digit((string)$numRdv)) {
        http_response_code(400);
        echo json_encode(["error" => "Action ou identifiant invalide"]);
        exit;
    }

    $cnx = Database::getInstance();

    if ($action === 'modifier') {
        $jour = $data['JOUR'] ?? null;
        $heure = $data['HEURE'] ?? null;
        $duree = $data['DUREE'] ?? null;

        if (!$jour || !$heure || !$duree) {
            http_response_code(400);
            echo json_encode(['error' => 'Champs manquants ou invalides']);
            exit;
        }

        $dateObj = DateTime::createFromFormat('Y-m-d', $jour);
        $heureObj = DateTime::createFromFormat('H:i:s', $heure);

        if (!$dateObj || $dateObj->format('Y-m-d') !== $jour ||
            !$heureObj || $heureObj->format('H:i:s') !== $heure) {
            http_response_code(400);
            echo json_encode(['error' => 'Format de date ou d\'heure invalide']);
            exit;
        }

        $sql = "UPDATE Rendezvous
                SET JOUR = :jour,
                    HEURE = :heure,
                    DUREE = :duree
                WHERE NUM_RDV = :num_rdv";

        $stmt = $cnx->prepare($sql);
        $stmt->bindValue(':jour', $jour, PDO::PARAM_STR);
        $stmt->bindValue(':heure', $heure, PDO::PARAM_STR);
        $stmt->bindValue(':duree', (int)$duree, PDO::PARAM_INT);
        $stmt->bindValue(':num_rdv', $numRdv, PDO::PARAM_INT);
        $stmt->execute();

        $response = ($stmt->rowCount() > 0)
            ? ['status' => 'OK', 'message' => 'Rendez-vous modifié avec succès', 'numRdv' => $numRdv]
            : ['error' => 'Aucune mise à jour effectuée'];

        http_response_code($stmt->rowCount() > 0 ? 200 : 404);
        echo json_encode($response);

    } elseif ($action === 'annuler') {
        $sql = "UPDATE Rendezvous
                SET STATUT = 'ANNULÉ'
                WHERE NUM_RDV = :num_rdv";

        $stmt = $cnx->prepare($sql);
        $stmt->bindValue(':num_rdv', $numRdv, PDO::PARAM_INT);
        $stmt->execute();

        $response = ($stmt->rowCount() > 0)
            ? ['status' => 'OK', 'message' => 'Rendez-vous annulé avec succès', 'numRdv' => $numRdv]
            : ['error' => 'Aucune mise à jour effectuée (rendez-vous introuvable ou déjà annulé)'];

        http_response_code($stmt->rowCount() > 0 ? 200 : 404);
        echo json_encode($response);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données', 'details' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
