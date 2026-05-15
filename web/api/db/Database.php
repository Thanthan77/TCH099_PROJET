<?php
<?php
require_once __DIR__ . '/config.php';

if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}


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

        if ($isLocal) {
            // --- CONFIG LOCAL ---
            $host = ConfigLocal::DB_HOST;
            $port = ConfigLocal::DB_PORT;
            $db   = ConfigLocal::DB_NAME;
            $user = ConfigLocal::DB_USER;
            $pass = ConfigLocal::DB_PWD;

            // DSN
            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

            // Options PDO (pas besoin de SSL en local)
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
        } else {
            // --- CONFIG AZURE ---
            $host = DB_HOST;
            $port = DB_PORT ?: 3306;
            $db   = DB_NAME;
            $user = DB_USER;
            $pass = DB_PWD;

            // DSN
            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

            // Options PDO avec SSL obligatoire
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                PDO::MYSQL_ATTR_SSL_CA       => '/etc/ssl/certs/ca-certificates.crt',
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
            ];
        }

        // --- CONNEXION ---
        self::$instance = new PDO($dsn, $user, $pass, $options);
        return self::$instance;
    }
}
