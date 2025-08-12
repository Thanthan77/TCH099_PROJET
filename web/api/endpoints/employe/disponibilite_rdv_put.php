<?php
require_once(__DIR__ . '/../../db/Database.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');




$data = json_decode(file_get_contents("php://input"), true);
error_log(" Données reçues : " . json_encode($data, JSON_PRETTY_PRINT));

if (
    !isset($data['CODE_EMPLOYE']) || 
    !isset($data['JOUR']) || 
    !isset($data['HEURE']) || 
    !isset($data['STATUT']) || 
    !isset($data['DUREE'])
) {
    http_response_code(400);
    error_log(" Paramètres manquants !");
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}

$codeEmploye = $data['CODE_EMPLOYE'];
$jour = $data['JOUR'];
$heureDebut = $data['HEURE'];
$statut = $data['STATUT'];
$duree = intval($data['DUREE']);

error_log(" Paramètres extraits : CODE_EMPLOYE=$codeEmploye, JOUR=$jour, HEURE=$heureDebut, STATUT=$statut, DUREE=$duree");

try {
    $db = Database::getInstance();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $nbPlages = ceil($duree / 20);
    error_log(" Nombre de plages à modifier : $nbPlages");

    $heureActuelle = new DateTime($heureDebut);
    $nbMisesAJour = 0;

    for ($i = 0; $i < $nbPlages; $i++) {
        $heureCourante = $heureActuelle->format('H:i:s');
        error_log(" Tentative MAJ plage $i à $heureCourante");

        // Vérification d'existence
        $verif = $db->prepare("SELECT * FROM Disponibilite WHERE CODE_EMPLOYE = :code AND JOUR = :jour AND HEURE = :heure");
        $verif->execute([
            ':code' => $codeEmploye,
            ':jour' => $jour,
            ':heure' => $heureCourante
        ]);
        $dispo = $verif->fetch(PDO::FETCH_ASSOC);

        if (!$dispo) {
            error_log(" Aucune disponibilité trouvée pour [$codeEmploye, $jour, $heureCourante]");
        } else {
            error_log(" Disponibilité trouvée pour [$codeEmploye, $jour, $heureCourante] => mise à jour...");

            $stmt = $db->prepare("UPDATE Disponibilite
                                  SET STATUT = :statut, NUM_RDV = NULL
                                  WHERE CODE_EMPLOYE = :codeEmploye AND JOUR = :jour AND HEURE = :heure");

            $stmt->execute([
                ':statut' => $statut,
                ':codeEmploye' => $codeEmploye,
                ':jour' => $jour,
                ':heure' => $heureCourante
            ]);

            $affected = $stmt->rowCount();
            $nbMisesAJour += $affected;

            error_log(" Plage $heureCourante mise à jour ($affected ligne(s)).");
        }

        $heureActuelle->modify('+20 minutes');
    }

    error_log(" Total de lignes modifiées : $nbMisesAJour");

    if ($nbMisesAJour === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Aucune disponibilité mise à jour.']);
        exit;
    }

    echo json_encode([
        'message' => "Disponibilités mises à jour ($nbMisesAJour plages) et NUM_RDV remis à NULL."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log(" Erreur PDO : " . $e->getMessage());
    echo json_encode(['error' => 'Erreur DB', 'details' => $e->getMessage()]);
}
