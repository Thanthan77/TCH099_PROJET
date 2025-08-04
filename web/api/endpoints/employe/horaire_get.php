<?php
header('Content-Type: application/json');
require_once(__DIR__.'/../../db/Database.php');

try {
    $cnx = Database::getInstance();

    $query = "
    SELECT h.CODE_EMPLOYE,
           h.JOURS, 
           CONCAT(h.HEURE_DEBUT, ' - ', h.HEURE_FIN) AS HEURE,
           e.NOM_EMPLOYE
    FROM Horaire h
    JOIN Employe e ON h.CODE_EMPLOYE = e.CODE_EMPLOYE
    ";


    $stmt = $cnx->prepare($query);
    $stmt->execute();
    $horaires = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($horaires);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur base de données',
        'message' => $e->getMessage()
    ]);
}
