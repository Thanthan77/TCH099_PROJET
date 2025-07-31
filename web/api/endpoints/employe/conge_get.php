<?php

require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    $sql = "
        SELECT 
            eh.ID_EXC,
            e.PRENOM_EMPLOYE AS PRENOM,
            e.NOM_EMPLOYE AS NOM,
            e.POSTE AS ROLE,
            eh.DATE_DEBUT,
            eh.DATE_FIN
        FROM Exception_horaire eh
        JOIN Employe e ON eh.CODE_EMPLOYE = e.CODE_EMPLOYE
        WHERE eh.TYPE_CONGE = 'CONGÉ' AND eh.`STATUS` = :status
        ORDER BY eh.DATE_DEBUT ASC
    ";

    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':status', 'EN ATTENTE', PDO::PARAM_STR);
    $pstmt->setFetchMode(PDO::FETCH_ASSOC);
    $pstmt->execute();

    $resultats = $pstmt->fetchAll();
    echo json_encode($resultats);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($cnx)) {
        $cnx = null;
    }
}
