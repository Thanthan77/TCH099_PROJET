<?php

require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache');

if (!$codeEmploye) {
        http_response_code(400);
        echo json_encode(["error" => "Le paramètre codeEmploye est requis"]);
        exit();
    }

try {
    $cnx = Database::getInstance();

    $query = "
        SELECT e.PRENOM_EMPLOYE, e.NOM_EMPLOYE, ex.DATE_DEBUT, ex.DATE_FIN,ex.STATUS
        FROM Exception_horaire ex
        JOIN Employe e ON ex.CODE_EMPLOYE = e.CODE_EMPLOYE
        WHERE ex.CODE_EMPLOYE = :codeEmploye
          AND ex.TYPE_CONGE = 'CONGÉ'
    ";

    $pstmt = $cnx->prepare($query);
    $pstmt->bindValue(':codeEmploye', $codeEmploye);
    $pstmt->execute();

    $resultats = $pstmt->fetchAll(PDO::FETCH_ASSOC);

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
