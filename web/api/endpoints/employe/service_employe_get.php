<?php
require_once(__DIR__ . '/../../db/Database.php');
header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();

    $stmt = $cnx->prepare("
        SELECT 
            e.CODE_EMPLOYE,
            e.PRENOM_EMPLOYE,
            e.NOM_EMPLOYE,
            e.POSTE,
            e.SEXE,
            GROUP_CONCAT(s.NOM SEPARATOR '|') AS SERVICES
        FROM Employe e
        LEFT JOIN ServiceEmploye se ON e.CODE_EMPLOYE = se.CODE_EMPLOYE
        LEFT JOIN Service s ON se.ID_SERVICE = s.ID_SERVICE
        WHERE e.POSTE IN ('Médecin', 'Infirmier')
        GROUP BY e.CODE_EMPLOYE
    ");
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['SERVICES'] = $row['SERVICES'] ? explode('|', $row['SERVICES']) : [];
    }

    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur base de données", "message" => $e->getMessage()]);
}
