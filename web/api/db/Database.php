<?php

require_once __DIR__ . '/config.php';

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        // Détection local vs production
        $isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', [
            'localhost', '127.0.0.1', '::1'
        ]);

        // --- CONFIGURATION ---
        if ($isLocal) {
            // Utilise l’interface ConfigLocal
            $host = ConfigLocal::DB_HOST;
            $port = ConfigLocal::DB_PORT;
            $db   = ConfigLocal::DB_NAME;
            $user = ConfigLocal::DB_USER;
            $pass = ConfigLocal::DB_PWD;
        } else {
            // Utilise l’interface Config (Azure)
            $host = Config::DB_HOST;
            $port = Config::DB_PORT;
            $db   = Config::DB_NAME;
            $user = Config::DB_USER;
            $pass = Config::DB_PWD;
        }

        // --- DSN ---
        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

        // --- OPTIONS PDO ---
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];

        // Azure : SSL obligatoire
        if (!$isLocal) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = '/etc/ssl/certs/ca-certificates.crt';
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }

        // --- CONNEXION ---
        self::$instance = new PDO($dsn, $user, $pass, $options);
        return self::$instance;
    }
}
