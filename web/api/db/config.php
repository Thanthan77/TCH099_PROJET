<?php
// config.php

$host = $_SERVER['HTTP_HOST'] ?? '';
$isLocal = in_array($host, ['localhost','127.0.0.1','::1']);

// ---- Choix des valeurs selon l'environnement ----
if ($isLocal) {
    $DB_HOST = 'database';   // pas besoin de :3306, le port se met dans le DSN
    $DB_PORT = 3306;
    $DB_NAME = 'docker';
    $DB_USER = 'root';
    $DB_PWD  = 'tiger';
} else {
    $DB_HOST = 'vitalis-sql.mysql.database.azure.com';
    $DB_PORT = 3306;
    $DB_NAME = 'clinique_db';
    $DB_USER = 'adminvitalis';
    $DB_PWD  = 'Banane&01';
}

define('DB_HOST', $DB_HOST);
define('DB_PORT', $DB_PORT);
define('DB_NAME', $DB_NAME);
define('DB_USER', $DB_USER);
define('DB_PWD',  $DB_PWD);

if (!interface_exists('Config')) {
    interface Config {
        public const DB_HOST = DB_HOST;
        public const DB_PORT = DB_PORT;
        public const DB_NAME = DB_NAME;
        public const DB_USER = DB_USER;
        public const DB_PWD  = DB_PWD;
    }
}
