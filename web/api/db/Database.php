<?php
require_once __DIR__ . '/config.php';

class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getInstance(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        // Récup des constantes (interface Config OU defines)
        $host = defined('DB_HOST') ? DB_HOST : Config::DB_HOST;
        $port = defined('DB_PORT') ? DB_PORT : (defined('Config::DB_PORT') ? Config::DB_PORT : 3306);
        $name = defined('DB_NAME') ? DB_NAME : Config::DB_NAME;
        $user = defined('DB_USER') ? DB_USER : Config::DB_USER;
        $pass = defined('DB_PWD')  ? DB_PWD  : Config::DB_PWD;

        // Si quelqu’un a mis "host:port" dans DB_HOST, on l’extrait proprement
        if (strpos($host, ':') !== false) {
            [$hostOnly, $maybePort] = explode(':', $host, 2);
            if (is_numeric($maybePort)) {
                $port = (int) $maybePort;
            }
            $host = $hostOnly;
        }

        // Détection local/prod
        $httpHost = $_SERVER['HTTP_HOST'] ?? '';
        $isLocal = in_array($httpHost, ['localhost', '127.0.0.1', '::1'], true)
                   || in_array($host, ['localhost', '127.0.0.1', 'database'], true);

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

        // Options PDO communes
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        ];

        // En PROD (Azure), forcer TLS/SSL
        if (!$isLocal) {
            // Bundle de certifs système courant sur App Service Linux :
            $ca = '/etc/ssl/certs/ca-certificates.crt';
            if (file_exists($ca)) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
            }
            // Si besoin, on peut désactiver la vérif stricte du nom :
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }

        // Création PDO
        self::$instance = new PDO($dsn, $user, $pass, $options);
        return self::$instance;
    }
}
