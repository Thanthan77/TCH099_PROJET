<?php

require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);


$jours=$data["JOURS"];
$heure_debut=$data["HEURE_DEBUT"];
$heure_fin=$data["HEURE_FIN"];
$codeEmploye=$data["CODE_EMPLOYE"];

if (!$jours || !$codeEmploye|| !$heure_debut||!$heure_fin) {
    http_response_code(400);
    error_log("Paramètres manquants. Jours: $jours, Code Employe: $codeEmploye,Heure Debut: $heure_debut, Heure Fin: $heure_fin ");
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}


try{

    $cnx = Database::getInstance();

    $sql = "INSERT INTO horaires (id_horaire, heure_debut, heure_fin, jours, code_employe)
        VALUES (:id_horaire, :heure_debut, :heure_fin, :jours, :code_employe)";
    $stmt = $cnx->prepare($sql);
    $stmt->bindParam(':code_employe', $codeEmploye);
    $stmt->bindParam(':heure_debut', $heure_debut);
    $stmt->bindParam(':heure_fin', $heure_fin);
    $stmt->bindParam(':jours', $jours);
    $stmt->execute();
    

    http_response_code(200);
    echo json_encode([
        'status' => 'OK',
        'message' => "Horaire inséré pour CODE_EMPLOYE $codeEmploye ($data[COURRIEL]) - Jours : $data[JOURS]",
        'code_employe' => $codeEmploye,
        'jours' => $jours
    ]);

}catch(Exception e){

    http_response_code(500);
    echo json_encode(["error" => "Erreur", "Aucune horaire insérer" => $e->getMessage()]);

}finally {
    if (isset($cnx)) {
        $cnx = null;
    }
}

