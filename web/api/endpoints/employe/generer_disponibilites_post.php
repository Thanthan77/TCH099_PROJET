<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../../db/Database.php');

try {
    $cnx = Database::getInstance();

    $raw = file_get_contents("php://input");
    $input = json_decode($raw, true);

    if (
        !isset($input['dateDebut'], $input['dateFin'], $input['horaires'], $input['vacances'])
        || !is_array($input['horaires']) || !is_array($input['vacances'])
    ) {
        http_response_code(400);
        echo json_encode(["error" => "Champs manquants ou format invalide"]);
        exit;
    }

    $dateDebut = new DateTime($input['dateDebut']);
    $dateFin = new DateTime($input['dateFin']);
    $horaires = $input['horaires'];
    $vacances = $input['vacances'];

    if ($dateDebut >= $dateFin) {
        http_response_code(400);
        echo json_encode(["error" => "La date de fin doit être postérieure à la date de début"]);
        exit;
    }

    // Nettoyage des anciennes disponibilités non attribuées
    $cnx->exec("DELETE FROM Disponibilite WHERE NUM_RDV IS NULL");
    $cnx->exec("ALTER TABLE Disponibilite AUTO_INCREMENT = 1");

    // Préparer l’insertion
    $insertStmt = $cnx->prepare("
        INSERT INTO Disponibilite (CODE_EMPLOYE, JOUR, HEURE, STATUT)
        VALUES (:code, :jour, :heure, :statut)
    ");

    $interval = new DateInterval('PT20M');
    $period = new DatePeriod($dateDebut, new DateInterval('P1D'), $dateFin);
    $total = 0;

    foreach ($horaires as $h) {
        $code = $h['CODE_EMPLOYE'];
        $heureDebut = new DateTime($h['HEURE_DEBUT']);
        $heureFin = new DateTime($h['HEURE_FIN']);
        $jourCible = (int)$h['JOUR_SEMAINE'];

        $shiftDuration = ($heureFin->getTimestamp() - $heureDebut->getTimestamp()) / 3600;
        $pauses = [];

        if ($shiftDuration >= 9) {
            $pauses[] = ['12:00:00', '13:00:00'];
        } elseif ($shiftDuration >= 7) {
            $pauses[] = ['11:40:00', '12:00:00'];
            $pauses[] = ['14:40:00', '15:00:00'];
        }

        foreach ($period as $date) {
            if ((int)$date->format('N') !== $jourCible) continue;

            $enVacances = false;
            foreach ($vacances as $v) {
                if (
                    $v['CODE_EMPLOYE'] == $code &&
                    $date >= new DateTime($v['DATE_DEBUT']) &&
                    $date <= new DateTime($v['DATE_FIN']) &&
                    isset($v['STATUS']) && $v['STATUS'] === 'APPROUVÉ'
                ) {
                    $enVacances = true;
                    break;
                }
            }

            $heureActuelle = clone $heureDebut;
            while ($heureActuelle < $heureFin) {
                $heureStr = $heureActuelle->format('H:i:s');
                $statut = 'DISPONIBLE';

                if ($enVacances) {
                    $statut = 'INDISPONIBLE';
                } else {
                    foreach ($pauses as $pause) {
                        if ($heureStr >= $pause[0] && $heureStr < $pause[1]) {
                            $statut = 'INDISPONIBLE';
                            break;
                        }
                    }
                }

                $insertStmt->execute([
                    ':code' => $code,
                    ':jour' => $date->format('Y-m-d'),
                    ':heure' => $heureStr,
                    ':statut' => $statut
                ]);
                $heureActuelle->add($interval);
                $total++;
            }
        }
    }

    echo json_encode([
        "message" => "Disponibilités générées avec succès.",
        "total_insertions" => $total
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur lors de la génération",
        "details" => $e->getMessage()
    ]);
}
