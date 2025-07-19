<?php
// employee_endpoint.php
require_once(__DIR__.'/../db/Database.php');

header('Content-Type: application/json');
header('Cache-Control: no-cache');

try {
    // 1. Connexion à la base de données
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Requête SQL pour récupérer tous les employés
    $query = "SELECT 
                  CODE_EMPLOYE AS id,
                  PRENOM_EMPLOYE AS prenom, 
                  NOM_EMPLOYE AS nom,
                  POSTE AS role
               FROM Employe";
    
    $stmt = $cnx->prepare($query);
    $stmt->execute();

    // 3. Formatage des résultats
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Réponse JSON
    if (empty($employees)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Aucun employé trouvé',
            'data' => []
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'count' => count($employees),
            'data' => $employees
        ]);
    }

} catch(PDOException $e) {
    // Gestion des erreurs
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur de base de données',
        'details' => $e->getMessage()
    ]);
}