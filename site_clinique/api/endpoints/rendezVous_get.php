<?php

require_once(__DIR__.'/../db/Database.php');

header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    // Requête avec JOIN pour récupérer le nom du service et les infos de l'employé
    $pstmt = $cnx->prepare("
        SELECT 
            r.NUM_RDV,
            DATE_FORMAT(r.JOUR, '%Y-%m-%d') AS DATE_RDV,
            TIME_FORMAT(r.HEURE, '%H:%i')   AS HEURE,
            r.DUREE,
            r.COURRIEL,
            e.CODE_EMPLOYE,
            e.PRENOM_EMPLOYE,
            e.NOM_EMPLOYE,
            e.POSTE,
            s.ID_SERVICE,
            s.NOM         AS NOM_SERVICE,
            s.DESCRIPTION AS DESCRIPTION_SERVICE,
            r.NOTE_CONSULT,
            r.STATUT
        FROM Rendezvous AS r
        JOIN Employe AS e ON r.CODE_EMPLOYE = e.CODE_EMPLOYE
        JOIN Service AS s ON r.ID_SERVICE   = s.ID_SERVICE
        WHERE r.CODE_EMPLOYE = :codeEmploye
        ORDER BY r.JOUR, r.HEURE
    ");

    $pstmt->execute();
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    $resultats = $pstmt->fetchAll();

    echo json_encode($resultats);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    $cnx = null;
}
