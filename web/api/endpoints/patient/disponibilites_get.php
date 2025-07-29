<?php
header('Content-Type: application/json');

require_once(__DIR__.'/../../db/Database.php');

try {
    $cnx = Database::getInstance();

    $query = "
        SELECT JOUR, HEURE
        FROM Disponibilite
        WHERE STATUT = 'DISPONIBLE'
    ";

    $pstmt = $cnx->prepare($query);
    $pstmt->execute();
    $disponibilites = $pstmt->fetchAll(PDO::FETCH_ASSOC);
    


    echo json_encode($disponibilites);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}