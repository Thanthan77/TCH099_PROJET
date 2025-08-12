<?php
require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

if (!$date || !$codeEmploye) {
    http_response_code(400);
    error_log("Paramètres manquants. Date: $date, Code Employe: $codeEmploye");
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}

try {
    // Connexion à la base de données via Singleton
    $cnx = Database::getInstance();

    // Préparer la requête SQL pour récupérer les disponibilités et l'heure actuelle
    $stmt = $cnx->prepare("
        SELECT HEURE, STATUT
        FROM Disponibilite
        WHERE CODE_EMPLOYE = :code
        AND JOUR = :date
        AND (STATUT = 'DISPONIBLE')
        ORDER BY HEURE
    ");
    
    // Exécution de la requête avec les paramètres
    $stmt->execute([
        'code' => $codeEmploye,
        'date' => $date,
    ]);

    // Récupérer les résultats sous forme de tableau associatif
    $dispos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retourner les disponibilités sous forme de JSON
    echo json_encode($dispos);

} catch (PDOException $e) {
    // En cas d'erreur avec la base de données
    http_response_code(500);
    error_log("Erreur serveur : " . $e->getMessage()); 
    echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
}
?>
