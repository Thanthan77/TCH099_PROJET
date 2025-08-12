<?php
require __DIR__ . '/../config.php';

$host = defined('DB_HOST') ? DB_HOST : Config::DB_HOST;
$port = defined('DB_PORT') ? DB_PORT : Config::DB_PORT;
$name = defined('DB_NAME') ? DB_NAME : Config::DB_NAME;
$user = defined('DB_USER') ? DB_USER : Config::DB_USER;
$pass = defined('DB_PWD')  ? DB_PWD  : Config::DB_PWD;

$dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

// options communes
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
];

// en PROD (Azure), activer TLS
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost','127.0.0.1','::1']);
if (!$isLocal) {
    // App Service Linux a un bundle CA système utilisable ici :
    $options[PDO::MYSQL_ATTR_SSL_CA] = '/etc/ssl/certs/ca-certificates.crt';
    // et on désactive la vérification stricte du nom si besoin :
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error'  => 'DB connection failed',
        'detail' => $e->getMessage(),   // TEMP pour debug
    ]);
    exit;
}
