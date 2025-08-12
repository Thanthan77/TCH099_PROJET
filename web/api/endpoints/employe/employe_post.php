<?php

require_once(__DIR__.'/../../db/Database.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);


// Champs requis
    $champsRequis = ['prenom', 'nom', 'etat_civil', 'courriel', 'telephone', 'adresse', 'date_naissance', 'sexe', 'poste', 'mot_de_passe'];
    foreach ($champsRequis as $champ) {
        if (empty($data[$champ])) {
            http_response_code(400);
            echo json_encode(['error' => "Champ manquant : $champ"]);
            exit;
        }
    }

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    // Nettoyer et normaliser les champs sensibles
    $poste = trim($data['poste']);
    $sexe = ucfirst(strtolower(trim($data['sexe']))); // => "Homme" ou "Femme"

    if (!in_array($sexe, ['Homme', 'Femme'])) {
        http_response_code(400);
        echo json_encode(['error' => "Valeur de sexe invalide : $sexe"]);
        exit;
    }

    // Préfixes de code employé
    $prefixes = [
        'Médecin' => 100,
        'Infirmière' => 200,
        'Secrétaire' => 300,
        'Administrateur' => 400
    ];

    if (!isset($prefixes[$poste])) {
        http_response_code(400);
        echo json_encode(['error' => "Poste invalide : $poste"]);
        exit;
    }

    $borneDebut = $prefixes[$poste];
    $borneFin = $borneDebut + 99;

    // Obtenir le dernier code employé pour ce poste
    $stmtMax = $cnx->prepare("SELECT MAX(CODE_EMPLOYE) AS max_code FROM Employe WHERE CODE_EMPLOYE BETWEEN :min AND :max");
    $stmtMax->bindValue(':min', $borneDebut, PDO::PARAM_INT);
    $stmtMax->bindValue(':max', $borneFin, PDO::PARAM_INT);
    $stmtMax->execute();

    $result = $stmtMax->fetch(PDO::FETCH_ASSOC);
    $dernierCode = $result['max_code'] ?? ($borneDebut - 1);
    $nouveauCode = $dernierCode + 1;

    // Hacher le mot de passe
    $motDePasseHash = password_hash($data['mot_de_passe'], PASSWORD_DEFAULT);


    $stmt = $cnx->prepare("INSERT INTO Employe (
        CODE_EMPLOYE, PRENOM_EMPLOYE, NOM_EMPLOYE, ETAT_CIVIL, MOT_DE_PASSE,
        COURRIEL, TELEPHONE, ADRESSE, DATE_NAISSANCE, SEXE, POSTE
    ) VALUES (
        :code, :prenom, :nom, :etat_civil, :mdp,
        :courriel, :telephone, :adresse, :date_naissance, :sexe, :poste
    )");

    $stmt->bindValue(':code', $nouveauCode);
    $stmt->bindValue(':prenom', trim($data['prenom']));
    $stmt->bindValue(':nom', trim($data['nom']));
    $stmt->bindValue(':etat_civil', trim($data['etat_civil']));
    $stmt->bindValue(':mdp', $motDePasseHash);
    $stmt->bindValue(':courriel', trim($data['courriel']));
    $stmt->bindValue(':telephone', trim($data['telephone']));
    $stmt->bindValue(':adresse', trim($data['adresse']));
    $stmt->bindValue(':date_naissance', $data['date_naissance']);
    $stmt->bindValue(':sexe', $sexe);
    $stmt->bindValue(':poste', $poste);

    $stmt->execute();

    echo json_encode([
        'status' => 'OK',
        'message' => 'Employé ajouté avec succès',
        'code_employe' => $nouveauCode
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
