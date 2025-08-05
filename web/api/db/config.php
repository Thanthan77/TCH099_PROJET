<?php
if (getenv('DOCKER_ENV') || $_SERVER['HTTP_HOST'] !== 'localhost') {
    // ---- Config pour Azure/Docker ----
    define('DB_HOST', 'mysql'); // nom du service dans docker-compose.yml
    define('DB_NAME', 'clinique_db');
    define('DB_USER', 'clinique_user');
    define('DB_PASS', 'motdepassefort');
} else {
    // ---- Config actuelle pour localhost ----
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'clinique_db');
    define('DB_USER', 'root');
    define('DB_PASS', ''); // mot de passe local
}

try {
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
