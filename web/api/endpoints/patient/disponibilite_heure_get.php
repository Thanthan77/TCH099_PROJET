<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/../../db/Database.php');

try {
    
    

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
WHERE d.STATUT = 'DISPONIBLE'
  AND d.CODE_EMPLOYE = :code_employe
  AND d.JOUR = :jour
ORDER BY d.HEURE;
    ";

    $stmt = $cnx->prepare($query);
    $stmt->bindValue(':code_employe', $code_employe, PDO::PARAM_INT);
    $stmt->bindValue(':jour',$jour);
    $stmt->execute();

    $resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($resultats)) {
        http_response_code(404);
        echo json_encode(["error" => "Aucune disponibilité trouvée pour cet employé"]);
        exit;
    }

    echo json_encode($resultats);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de base de données", "message" => $e->getMessage()]);
}