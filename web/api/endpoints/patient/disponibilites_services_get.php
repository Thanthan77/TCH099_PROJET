<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../../db/Database.php');

try {
    if (!isset($id_service) || !is_numeric($id_service)) {
        http_response_code(400);
        echo json_encode(["error" => "Paramètre id_service invalide"]);
        exit;
    }

    $cnx = Database::getInstance();

    $query = "
        SELECT s.NOM AS NOM_SERVICE,
               d.JOUR,
               d.HEURE,
               e.NOM_EMPLOYE,
               e.PRENOM_EMPLOYE
        FROM Service s
        JOIN ServiceEmploye se ON s.ID_SERVICE = se.ID_SERVICE
        JOIN Disponibilite d ON se.CODE_EMPLOYE = d.CODE_EMPLOYE
        JOIN Employe e ON d.CODE_EMPLOYE = e.CODE_EMPLOYE
        WHERE d.STATUT = 'DISPONIBLE' AND s.ID_SERVICE = :id_service
        ORDER BY d.JOUR, d.HEURE
    ";

    $stmt = $cnx->prepare($query);
    $stmt->bindValue(':id_service', $id_service, PDO::PARAM_INT);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur lors de l'exécution SQL"]);
        exit;
    }

    $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($resultats)) {
        http_response_code(404);
        echo json_encode(["error" => "Aucune disponibilité trouvée pour ce service"]);
        exit;
    }

    http_response_code(200);
    echo json_encode($resultats);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
