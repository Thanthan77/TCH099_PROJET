<?php

header('Content-Type: application/json');
require_once(__DIR__ . '/../../db/Database.php');


if (!$id_service) {
    http_response_code(400);
    error_log("Paramètre manquant. Id_service: $id_service");
    echo json_encode(['error' => 'Paramètre manquant']);
    exit;
}

try{


    $cnx = Database::getInstance();

    $query="SELECT e.NOM_EMPLOYE,e.CODE_EMPLOYE
            FROM ServiceEmploye se
            JOIN Employe e ON se.CODE_EMPLOYE = e.CODE_EMPLOYE
            WHERE se.ID_SERVICE = :id_service";

    $stmt = $cnx->prepare($query);
    $stmt->bindValue(':id_service', $id_service);
    $stmt->execute();

    $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);


    if (empty($resultats)) {
        http_response_code(404);
        echo json_encode(["error" => "Aucun Employés trouvé"]);
        exit;
    }

    echo json_encode($resultats);


}catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "message" => $e->getMessage()
    ]);
} finally {
    $cnx = null;
}



