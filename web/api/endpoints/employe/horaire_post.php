<?php

require_once(__DIR__ . '/../../db/Database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Champs requis
$champsRequis = ['CODE_EMPLOYE', 'JOURS', 'HEURE_DEBUT', 'HEURE_FIN'];
foreach ($champsRequis as $champ) {
    if (empty($data[$champ])) {
        http_response_code(400);
        echo json_encode(['error' => "Champ manquant : $champ"]);
        exit;
    }
}

// Normalisation des heures (accepte HH:MM ou HH:MM:SS)
$fmtHeure = function ($t) {
    $t = trim((string)$t);
    if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $t)) return $t;
    if (preg_match('/^\d{2}:\d{2}$/', $t))    return $t . ':00';
    return null;
};

$codeEmploye = (int)$data['CODE_EMPLOYE'];
$jours       = trim($data['JOURS']);
$heureDebut  = $fmtHeure($data['HEURE_DEBUT']);
$heureFin    = $fmtHeure($data['HEURE_FIN']);

if (!$heureDebut || !$heureFin) {
    http_response_code(400);
    echo json_encode(['error' => "Format d'heure invalide (utilise HH:MM ou HH:MM:SS)"]);
    exit;
}
if ($heureDebut >= $heureFin) {
    http_response_code(400);
    echo json_encode(['error' => "HEURE_DEBUT doit être avant HEURE_FIN"]);
    exit;
}

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // (facultatif) Vérifier que l’employé existe
    $chk = $cnx->prepare("SELECT 1 FROM Employe WHERE CODE_EMPLOYE = :code");
    $chk->bindValue(':code', $codeEmploye, PDO::PARAM_INT);
    $chk->execute();
    if (!$chk->fetchColumn()) {
        http_response_code(404);
        echo json_encode(['error' => "Employé introuvable : $codeEmploye"]);
        exit;
    }

    // Insertion d'une NOUVELLE ligne dans Horaire (ID_HORAIRE est auto-incrémenté)
    $sql = "INSERT INTO Horaire (CODE_EMPLOYE, HEURE_DEBUT, HEURE_FIN, JOURS)
            VALUES (:code, :debut, :fin, :jours)";
    $stmt = $cnx->prepare($sql);
    $stmt->bindValue(':code',  $codeEmploye, PDO::PARAM_INT);
    $stmt->bindValue(':debut', $heureDebut);
    $stmt->bindValue(':fin',   $heureFin);
    $stmt->bindValue(':jours', $jours);
    $stmt->execute();

    $id = (int)$cnx->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'status'       => 'OK',
        'message'      => 'Horaire ajouté avec succès',
        'id_horaire'   => $id,
        'code_employe' => $codeEmploye,
        'jours'        => $jours,
        'heure_debut'  => $heureDebut,
        'heure_fin'    => $heureFin
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if (isset($cnx)) {
        $cnx = null;
    }
}
