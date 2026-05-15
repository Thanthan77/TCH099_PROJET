<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/api/db/config.php';

$con = mysqli_init();

// SSL obligatoire sur Azure
mysqli_ssl_set($con, NULL, NULL, "/etc/ssl/certs/ca-certificates.crt", NULL, NULL);

if (!mysqli_real_connect(
    $con,
    DB_HOST,
    DB_USER,
    DB_PWD,
    DB_NAME,
    DB_PORT,
    NULL, // tu peux mettre NULL si MYSQLI_CLIENT_SSL nexiste pas
)) {
    die("Erreur MySQLi : " . mysqli_connect_error());
}

echo "Connexion MySQLi OK";
