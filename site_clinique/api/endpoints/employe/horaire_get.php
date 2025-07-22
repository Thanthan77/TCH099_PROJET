<?php
header('Content-Type: application/json');

require_once(__DIR__.'/../../db/Database.php');

try {
    $pdo = Database::getInstance();

    $query = "
        SELECT h.JOURS, 
               CONCAT(h.HEURE_DEBUT, ' - ', h.HEURE_FIN) AS HEURE,
               e.NOM_EMPLOYE
        FROM Horaire h
        JOIN Employe e ON h.CODE_EMPLOYE = e.CODE_EMPLOYE
    ";

    $stmt = $pdo->query($query);
    $horaires = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($horaires);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
