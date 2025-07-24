<?php

require_once(__DIR__.'/../../db/Database.php');

ob_start(); 
header('Content-Type: application/json');


$data = json_decode(file_get_contents('php://input'), true);

try {
    $cnx = Database::getInstance();
    $cnx->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Génération d'un mot de passe aléatoire
    function genererMotDePasse($longueur = 10) {
        $caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        return substr(str_shuffle(str_repeat($caracteres, ceil($longueur/strlen($caracteres)))), 0, $longueur);
    }

    $motDePasseClair = genererMotDePasse();
    $motDePasseHash = password_hash($motDePasseClair, PASSWORD_DEFAULT);

    $sql = "INSERT INTO Employe (CODE_EMPLOYE, PRENOM_EMPLOYE, NOM_EMPLOYE, MOT_DE_PASSE, POSTE)
            VALUES (:code, :prenom, :nom, :mdp, :poste)";

    $stmt = $cnx->prepare($sql);

    $stmt->bindValue(':code', $data['codeEmploye']);
    $stmt->bindValue(':prenom', $data['prenomEmploye']);
    $stmt->bindValue(':nom', $data['nomEmploye']);
    $stmt->bindValue(':mdp', $motDePasseHash);
    $stmt->bindValue(':poste', $data['poste']);

    $stmt->execute();

    if ($stmt->rowCount() >= 1) {
        http_response_code(200);
        echo json_encode([
            'status' => 'OK',
            'message' => 'Employé ajouté avec succès',
            'motDePasseTemporaire' => $motDePasseClair  // mot de passe temporaire
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Échec de l\'insertion']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $cnx = null;
    ob_end_flush();
}
