<?php

require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

$cnx = null;
$data = json_decode(file_get_contents('php://input'), true);


$action = strtolower(trim($data['action'] ?? ''));

if (!$action || !in_array($action, ['update', 'delete']) || !$codeEmploye || !ctype_digit((string)$codeEmploye)) {
    http_response_code(400);
    echo json_encode(['error' => 'Action invalide ou identifiant manquant']);
    exit;
}

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($action === 'update') {
        $fields = [
            'PRENOM_EMPLOYE', 'NOM_EMPLOYE', 'ETAT_CIVIL', 'MOT_DE_PASSE',
            'COURRIEL', 'TELEPHONE', 'ADRESSE', 'DATE_NAISSANCE',
            'SEXE', 'POSTE'
        ];

        // Vérifier que tous les champs sont présents
        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Champ manquant : $field"]);
                exit;
            }
        }

        $sql = "UPDATE Employe SET 
            PRENOM_EMPLOYE = :prenom,
            NOM_EMPLOYE = :nom,
            ETAT_CIVIL = :etatCivil,
            MOT_DE_PASSE = :mdp,
            COURRIEL = :courriel,
            TELEPHONE = :telephone,
            ADRESSE = :adresse,
            DATE_NAISSANCE = :dateNaissance,
            SEXE = :sexe,
            POSTE = :poste
            WHERE CODE_EMPLOYE = :code";

        $stmt = $cnx->prepare($sql);
        $stmt->bindValue(':prenom', $data['PRENOM_EMPLOYE']);
        $stmt->bindValue(':nom', $data['NOM_EMPLOYE']);
        $stmt->bindValue(':etatCivil', $data['ETAT_CIVIL']);
        $stmt->bindValue(':mdp', $data['MOT_DE_PASSE']);
        $stmt->bindValue(':courriel', $data['COURRIEL']);
        $stmt->bindValue(':telephone', $data['TELEPHONE'], PDO::PARAM_INT);
        $stmt->bindValue(':adresse', $data['ADRESSE']);
        $stmt->bindValue(':dateNaissance', $data['DATE_NAISSANCE']);
        $stmt->bindValue(':sexe', $data['SEXE']);
        $stmt->bindValue(':poste', $data['POSTE']);
        $stmt->bindValue(':code', $codeEmploye);
        $stmt->execute();

        if ($stmt->rowCount()) {
            http_response_code(200);
            echo json_encode([
                'status' => 'OK',
                'message' => 'Employé mis à jour',
                'codeEmploye' => $codeEmploye
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Aucune modification effectuée']);
        }

    } elseif ($action === 'delete') {
        $sql = "DELETE FROM Employe WHERE CODE_EMPLOYE = :code";
        $stmt = $cnx->prepare($sql);
        $stmt->bindValue(':code', $codeEmploye, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount()) {
            http_response_code(200);
            echo json_encode([
                'status' => 'OK',
                'message' => 'Employé supprimé',
                'codeEmploye' => $codeEmploye
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Employé introuvable']);
        }
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur DB", "details" => $e->getMessage()]);
} finally {
    $cnx = null;
}
