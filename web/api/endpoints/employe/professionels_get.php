<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');

<<<<<<< Updated upstream
<<<<<<< Updated upstream

if (!$nom_service) {
    http_response_code(400);
    error_log("Paramètre manquant. Nom Service: $nom_service");
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}

try {
=======
try {
    // 1) Récupérer le nom du service envoyé par le JS:
    //    fetch(`${API_URL}professionnels/${encodeURIComponent(serviceNom)}`)
    $nom_service = $_GET['service'] ?? null;

    // Essai via PATH_INFO (ex: /professionnels/Consultation%20g%C3%A9n%C3%A9rale)
    if (!$nom_service && !empty($_SERVER['PATH_INFO'])) {
        $parts = array_values(array_filter(explode('/', $_SERVER['PATH_INFO'])));
        if (!empty($parts[0])) $nom_service = urldecode($parts[0]);
    }

    // Fallback via REQUEST_URI si PATH_INFO indisponible selon conf Apache/PHP
    if (!$nom_service && !empty($_SERVER['REQUEST_URI'])) {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $chunks = array_values(array_filter(explode('/', $uri)));
        // dernier segment après /professionnels/
        if (count($chunks) >= 2 && strtolower($chunks[count($chunks)-2]) === 'professionnels') {
            $nom_service = urldecode($chunks[count($chunks)-1]);
        }
    }

    if (!$nom_service) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètre "service" manquant']);
        exit;
    }

    // Nettoyage des espaces (y compris insécables)
    $nom_service = preg_replace('/[\x{00A0}\s]+/u', ' ', trim($nom_service));
>>>>>>> Stashed changes
=======
try {
    // 1) Récupérer le nom du service envoyé par le JS:
    //    fetch(`${API_URL}professionnels/${encodeURIComponent(serviceNom)}`)
    $nom_service = $_GET['service'] ?? null;

    // Essai via PATH_INFO (ex: /professionnels/Consultation%20g%C3%A9n%C3%A9rale)
    if (!$nom_service && !empty($_SERVER['PATH_INFO'])) {
        $parts = array_values(array_filter(explode('/', $_SERVER['PATH_INFO'])));
        if (!empty($parts[0])) $nom_service = urldecode($parts[0]);
    }

    // Fallback via REQUEST_URI si PATH_INFO indisponible selon conf Apache/PHP
    if (!$nom_service && !empty($_SERVER['REQUEST_URI'])) {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $chunks = array_values(array_filter(explode('/', $uri)));
        // dernier segment après /professionnels/
        if (count($chunks) >= 2 && strtolower($chunks[count($chunks)-2]) === 'professionnels') {
            $nom_service = urldecode($chunks[count($chunks)-1]);
        }
    }

    if (!$nom_service) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètre "service" manquant']);
        exit;
    }

    // Nettoyage des espaces (y compris insécables)
    $nom_service = preg_replace('/[\x{00A0}\s]+/u', ' ', trim($nom_service));
>>>>>>> Stashed changes

    $cnx = Database::getInstance();

    // 2) Requête robuste (DISTINCT + TRIM + collation insensible à la casse)
    $sql = "
        SELECT DISTINCT
            e.CODE_EMPLOYE, e.NOM_EMPLOYE, e.PRENOM_EMPLOYE, e.POSTE
        FROM Employe e
        JOIN ServiceEmploye se ON e.CODE_EMPLOYE = se.CODE_EMPLOYE
        JOIN Service s        ON se.ID_SERVICE   = s.ID_SERVICE
        WHERE TRIM(s.NOM) COLLATE utf8mb4_general_ci = TRIM(:nom_service)
        ORDER BY e.POSTE, e.PRENOM_EMPLOYE, e.NOM_EMPLOYE
    ";

    $pstmt = $cnx->prepare($sql);
    $pstmt->bindValue(':nom_service', $nom_service, PDO::PARAM_STR);
    $pstmt->execute();

    $resultats = $pstmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($resultats, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données', 'message' => $e->getMessage()]);
}
