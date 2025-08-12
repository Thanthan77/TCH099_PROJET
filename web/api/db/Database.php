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

        // --- Read config constants (interface Config or plain defines) ---
        $host = defined('DB_HOST') ? DB_HOST : Config::DB_HOST;
        $name = defined('DB_NAME') ? DB_NAME : Config::DB_NAME;
        $user = defined('DB_USER') ? DB_USER : Config::DB_USER;
        $pass = defined('DB_PWD')  ? DB_PWD  : Config::DB_PWD;

        // Port from constant if you have one, else default 3306
        $port = 3306;
        if (defined('DB_PORT')) {
            $port = (int) DB_PORT;
        } elseif (defined('Config::DB_PORT')) {
            $port = (int) constant('Config::DB_PORT');
        }

        // If someone put "host:port" in DB_HOST, split it
        if (strpos($host, ':') !== false) {
            [$h, $maybePort] = explode(':', $host, 2);
            if (is_numeric($maybePort)) {
                $port = (int) $maybePort;
            }
            $host = $h;
        }

        // Local vs prod detection
        $httpHost = $_SERVER['HTTP_HOST'] ?? '';
        $isLocal = in_array($httpHost, ['localhost','127.0.0.1','::1'], true)
                   || in_array($host, ['localhost','127.0.0.1','database'], true);

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

        // Common PDO options
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        ];

        // On Azure, enable TLS (required)
        if (!$isLocal) {
            $ca = '/etc/ssl/certs/ca-certificates.crt'; // default CA bundle on App Service Linux
            if (file_exists($ca)) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
            }
            // Often not required by Azure; disable strict host verification if needed
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }

        // Connect + log
        try {
            self::$instance = new PDO($dsn, $user, $pass, $options);

            @file_put_contents(
                __DIR__ . '/../log_inscription.txt',
                date('Y-m-d H:i:s') . "  MySQL connected ({$host}:{$port} / {$name})\n",
                FILE_APPEND
            );
        } catch (PDOException $e) {
            @file_put_contents(
                __DIR__ . '/../log_inscription.txt',
                date('Y-m-d H:i:s') . "  MySQL error: " . $e->getMessage() . "\n",
                FILE_APPEND
            );
            throw $e;
        }

        return self::$instance;
    }

    // Optional helper if you ever want to force a reconnect
    public static function reset(): void
    {
        self::$instance = null;
    }
}
