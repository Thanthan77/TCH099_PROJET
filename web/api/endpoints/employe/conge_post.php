<?php
require_once(__DIR__ . '/../../db/Database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$codeEmploye = null;
if (isset($_SERVER['REQUEST_URI'])) {
    $parts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    $dernier = end($parts);
    if (is_numeric($dernier)) {
        $codeEmploye = intval($dernier);
    }
}

try {
    $dateDebut = $data['dateDebut'] ?? null;
    $dateFin = $data['dateFin'] ?? null;

    if (!$codeEmploye || !$dateDebut || !$dateFin) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes ou invalides']);
        exit;
    }

    if (strtotime($dateFin) < strtotime($dateDebut)) {
        http_response_code(400);
        echo json_encode(['error' => 'La date de fin doit être après la date de début']);
        exit;
    }

    $cnx = Database::getInstance();

    // Vérifier s'il existe déjà un congé à la même date
    $checkSql = "SELECT COUNT(*) FROM Exception_horaire 
                 WHERE CODE_EMPLOYE = :code 
                 AND DATE_DEBUT = :debut";
    $checkStmt = $cnx->prepare($checkSql);
    $checkStmt->bindValue(':code', $codeEmploye, PDO::PARAM_INT);
    $checkStmt->bindValue(':debut', $dateDebut);
    $checkStmt->execute();

    if ($checkStmt->fetchColumn() > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Des vacances ont déjà été prises durant ces dates.']);
        exit;
    }

    // Insérer le congé
    $sql = "INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_DEBUT, DATE_FIN, TYPE_CONGE, STATUS)
            VALUES (:code, :debut, :fin, 'CONGÉ', 'EN ATTENTE')";
    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':code', $codeEmploye, PDO::PARAM_INT);
    $stmt->bindValue(':debut', $dateDebut);
    $stmt->bindValue(':fin', $dateFin);
    $stmt->execute();

    http_response_code(200);
    echo json_encode([
        "status" => "OK",
        "message" => "Demande de vacances enregistrée et en attente de validation"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}
