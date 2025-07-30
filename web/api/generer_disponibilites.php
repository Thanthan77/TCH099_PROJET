<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../api/db/Database.php');

try {
    $cnx = Database::getInstance();

    // Supprimer les disponibilités sans rendez-vous
    $cnx->exec("DELETE FROM Disponibilite WHERE NUM_RDV IS NULL");
    $cnx->exec("ALTER TABLE Disponibilite AUTO_INCREMENT = 1");

    // Définir la période complète
    $dateDebut = new DateTime('2025-08-01');
    $dateFin = new DateTime('2026-01-01'); // exclusif

    // Charger les horaires et jours de travail
    $pstmt = $cnx->prepare("
        SELECT h.CODE_EMPLOYE, h.HEURE_DEBUT, h.HEURE_FIN, jt.JOUR_SEMAINE
        FROM Horaire h
        JOIN JourTravail jt ON h.CODE_EMPLOYE = jt.CODE_EMPLOYE
    ");
    $pstmt->execute();
    $horaires = $pstmt->fetchAll(PDO::FETCH_ASSOC);

    // Charger les périodes de vacances
    $vacancesStmt = $cnx->prepare("
        SELECT CODE_EMPLOYE, DATE_DEBUT, DATE_FIN
        FROM Exception_horaire
        WHERE TYPE_EXCEPTION = 'VACANCES'
    ");
    $vacancesStmt->execute();
    $vacances = $vacancesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Préparer l'insertion
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

        // Pauses
        $pauses = [];
        if ($shiftDuration >= 9) {
            $pauses[] = ['12:00:00', '13:00:00'];
        } elseif ($shiftDuration >= 7) {
            $pauses[] = ['11:40:00', '12:00:00'];
            $pauses[] = ['14:40:00', '15:00:00'];
        }

        foreach ($period as $date) {
            if ((int)$date->format('N') !== $jourCible) continue;

            // Vérification des vacances
            $enVacances = false;
            foreach ($vacances as $v) {
                if (
                    $v['CODE_EMPLOYE'] == $code &&
                    $date >= new DateTime($v['DATE_DEBUT']) &&
                    $date <= new DateTime($v['DATE_FIN'])
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
