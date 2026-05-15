<?php

echo "<pre>";
echo "DB_HOST = [" . getenv('DB_HOST') . "]\n";
echo "DB_USER = [" . getenv('DB_USER') . "]\n";
echo "DB_PWD length = " . strlen(getenv('DB_PWD')) . "\n";
echo "DB_NAME = [" . getenv('DB_NAME') . "]\n";
echo "DB_PORT = [" . getenv('DB_PORT') . "]\n";
echo "</pre>";

$con = mysqli_init();
mysqli_ssl_set($con, NULL, NULL, "/etc/ssl/certs/ca-certificates.crt", NULL, NULL);

if (mysqli_real_connect(
    $con,
    getenv('DB_HOST'),
    getenv('DB_USER'),
    getenv('DB_PWD'),
    getenv('DB_NAME'),
    getenv('DB_PORT'),
    NULL,
    MYSQLI_CLIENT_SSL
)) {
    echo "Connexion OK";
} else {
    echo "Erreur : " . mysqli_connect_error();
}
