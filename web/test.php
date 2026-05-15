<?php
require_once __DIR__ . '/api/db/config.php'; // ton fichier config.php

$con = mysqli_init();

// SSL obligatoire sur Azure
mysqli_ssl_set($con, NULL, NULL, "/etc/ssl/certs/ca-certificates.crt", NULL, NULL);

if (!mysqli_real_connect(
    $con,
    Config::DB_HOST,   // Host depuis config.php
    Config::DB_USER,   // User depuis config.php
    Config::DB_PWD,    // Password depuis config.php
    Config::DB_NAME,   // Database depuis config.php
    Config::DB_PORT,   // Port depuis config.php
    NULL,
    MYSQLI_CLIENT_SSL
)) {
    die("Erreur MySQLi : " . mysqli_connect_error());
}

echo "Connexion MySQLi OK";
