<?php

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

        // Charger config
        $config = $isLocal
            ? require __DIR__ . '/config.local.php'
            : require __DIR__ . '/config.php';

        $host = $config['host'];
        $port = $config['port'];
        $db   = $config['database'];
        $user = $config['user'];
        $pass = $config['password'];

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

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

        self::$instance = new PDO($dsn, $user, $pass, $options);
        return self::$instance;
    }
}
