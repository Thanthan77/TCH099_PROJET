<?php

require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $champsRequis = ['NOM_EMPLOYE', 'COURRIEL', 'JOUR', 'HEURE', 'DUREE', 'NOM_SERVICE'];
    foreach ($champsRequis as $champ) {
        if (!isset($data[$champ])) {
            http_response_code(400);
            echo json_encode(['error' => "Champ manquant : $champ"]);
            exit;
        }
    }

    // Vérification de l'existence du courriel dans Patient
    $sqlPatient = "SELECT COURRIEL FROM Patient WHERE COURRIEL = :courriel LIMIT 1";
    $stmtPatient = $cnx->prepare($sqlPatient);
    $stmtPatient->bindValue(':courriel', $data['COURRIEL']);
    $stmtPatient->execute();
    $patient = $stmtPatient->fetch(PDO::FETCH_ASSOC);

    if (!$patient) {
        http_response_code(404);
        echo json_encode(['error' => 'Courriel patient introuvable']);
        exit;
    }

    // Recherche du CODE_EMPLOYE via NOM_EMPLOYE
    $sqlEmploye = "SELECT CODE_EMPLOYE FROM Employe WHERE NOM_EMPLOYE = :nom LIMIT 1";
    $stmtEmploye = $cnx->prepare($sqlEmploye);
    $stmtEmploye->bindValue(':nom', $data['NOM_EMPLOYE']);
    $stmtEmploye->execute();
    $employe = $stmtEmploye->fetch(PDO::FETCH_ASSOC);

    if (!$employe) {
        http_response_code(404);
        echo json_encode(['error' => 'Employé non trouvé avec ce nom']);
        exit;
    }

    $codeEmploye = $employe['CODE_EMPLOYE'];

    // Recherche du ID_SERVICE via NOM_SERVICE
    $sqlService = "SELECT ID_SERVICE FROM Service WHERE NOM = :nom_service LIMIT 1";
    $stmtService = $cnx->prepare($sqlService);
    $stmtService->bindValue(':nom_service', $data['NOM_SERVICE']);
    $stmtService->execute();
    $service = $stmtService->fetch(PDO::FETCH_ASSOC);

    if (!$service) {
        http_response_code(404);
        echo json_encode(['error' => 'Service non trouvé avec ce nom']);
        exit;
    }

    $idService = $service['ID_SERVICE'];

    $sql = "INSERT INTO Rendezvous (
    CODE_EMPLOYE, COURRIEL, JOUR, HEURE, DUREE, ID_SERVICE, NOTE_CONSULT, STATUT
    ) VALUES (
        :code_employe, :courriel, :jour, :heure, :duree, :id_service, 'Suivi', 'CONFIRMÉ'
    )";

    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':code_employe', $codeEmploye);
    $stmt->bindValue(':courriel',     $data['COURRIEL']);
    $stmt->bindValue(':jour',         $data['JOUR']);
    $stmt->bindValue(':heure',        $data['HEURE']);
    $stmt->bindValue(':duree',        $data['DUREE']);
    $stmt->bindValue(':id_service',   $idService);

    $stmt->execute();

    http_response_code(200);
    echo json_encode([
        'status' => 'OK',
        'message' => "Suvi confirmé pour $data[NOM_EMPLOYE] ($data[COURRIEL]) - Service : $data[NOM_SERVICE]",
        'code_employe' => $codeEmploye,
        'id_service' => $idService
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
