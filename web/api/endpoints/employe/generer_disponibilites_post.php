<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../../db/Database.php');

try {
    error_log("Connexion à la base de données...");
    $cnx = Database::getInstance();

    error_log("Lecture des données JSON...");
    $raw = file_get_contents("php://input");
    $input = json_decode($raw, true);

    if (
        !isset($input['dateDebut'], $input['dateFin'], $input['horaires'], $input['vacances']) ||
        !is_array($input['horaires']) || !is_array($input['vacances'])
    ) {
        error_log("Champs manquants ou format invalide");
        http_response_code(400);
        echo json_encode(["error" => "Champs manquants ou format invalide"]);
        exit;
    }

    error_log("Conversion des dates...");
    $dateDebut = new DateTime($input['dateDebut']);
    $dateFin = new DateTime($input['dateFin']);
    $horaires = $input['horaires'];
    $vacances = $input['vacances'];

    if ($dateDebut >= $dateFin) {
        error_log("La date de fin est antérieure à la date de début");
        http_response_code(400);
        echo json_encode(["error" => "La date de fin doit être postérieure à la date de début"]);
        exit;
    }

    error_log("Nettoyage des anciennes disponibilités...");
    $cnx->exec("DELETE FROM Disponibilite WHERE NUM_RDV IS NULL");
    $cnx->exec("ALTER TABLE Disponibilite AUTO_INCREMENT = 1");

    $insertStmt = $cnx->prepare("
        INSERT INTO Disponibilite (CODE_EMPLOYE, JOUR, HEURE, STATUT)
        VALUES (:code, :jour, :heure, :statut)
    ");

    $interval = new DateInterval('PT20M');
    $period = new DatePeriod($dateDebut, new DateInterval('P1D'), $dateFin);
    $total = 0;

    error_log("Début du traitement des horaires...");
    foreach ($horaires as $index => $h) {
        error_log("Traitement horaire index $index : " . json_encode($h));
        if (!isset($h['CODE_EMPLOYE'], $h['HEURE_DEBUT'], $h['HEURE_FIN'], $h['JOUR_SEMAINE'])) {
            error_log("Horaire incomplet à l’index $index");
            continue;
        }

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
                    isset($v['CODE_EMPLOYE'], $v['DATE_DEBUT'], $v['DATE_FIN'], $v['STATUS']) &&
                    $v['CODE_EMPLOYE'] == $code &&
                    $date >= new DateTime($v['DATE_DEBUT']) &&
                    $date <= new DateTime($v['DATE_FIN']) &&
                    $v['STATUS'] === 'APPROUVÉ'
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

                try {
                    $insertStmt->execute([
                        ':code' => $code,
                        ':jour' => $date->format('Y-m-d'),
                        ':heure' => $heureStr,
                        ':statut' => $statut
                    ]);
                    $total++;
                } catch (PDOException $e) {
                    error_log("Erreur d’insertion : " . $e->getMessage());
                    error_log("Données : " . json_encode([
                        'code' => $code,
                        'jour' => $date->format('Y-m-d'),
                        'heure' => $heureStr,
                        'statut' => $statut
                    ]));
                }

                $heureActuelle->add($interval);
            }
        }
    }

    error_log("Génération terminée avec $total disponibilités insérées.");

    echo json_encode([
        "message" => "Disponibilités générées avec succès.",
        "total_insertions" => $total
    ]);

} catch (PDOException $e) {
    error_log("Erreur PDO : " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur lors de la génération",
        "details" => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Erreur générale : " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur inattendue",
        "details" => $e->getMessage()
    ]);
}finally {
    if (isset($cnx)) {
        $cnx = null;
    }
}
