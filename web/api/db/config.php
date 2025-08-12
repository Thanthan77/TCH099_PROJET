<?php
// config.php

// Détection "local" (adapte si besoin)
$isLocal = (
    getenv('APP_ENV') === 'local' ||                    // tu peux définir APP_ENV=local en dev
    php_sapi_name() === 'cli' ||                        // exécution CLI
    in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1']) ||
    str_starts_with($_SERVER['HTTP_HOST'] ?? '', 'localhost')
);

if ($isLocal) {
    // ===== DEV/LOCAL (docker-compose) =====
    define('DB_HOST', 'database');   // pas besoin de :3306 ici
    define('DB_PORT', 3306);
    define('DB_NAME', 'docker');
    define('DB_USER', 'root');
    define('DB_PASS', 'tiger');
} else {
    // ===== PROD (Azure MySQL) =====
    // idéalement: prends d'abord depuis les variables d’environnement Azure
    define('DB_HOST', getenv('DB_HOST') ?: 'vitalis-sql.mysql.database.azure.com');
    define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
    define('DB_NAME', getenv('DB_NAME') ?: 'clinique_db');
    define('DB_USER', getenv('DB_USER') ?: 'app_vitalis@vitalis-sql');
    define('DB_PASS', getenv('DB_PASS') ?: 'Banane&01'); 
}
