<?php

echo "<pre>";
echo "DB_HOST = [" . getenv('DB_HOST') . "]\n";
echo "DB_USER = [" . getenv('DB_USER') . "]\n";
echo "PWD=[" . getenv('DB_PWD') . "]\n";
echo "DB_PWD length = " . strlen(getenv('DB_PWD')) . "\n";
echo "DB_NAME = [" . getenv('DB_NAME') . "]\n";
echo "DB_PORT = [" . getenv('DB_PORT') . "]\n";
echo "</pre>";

echo "Checkpoint 1\n";

$con = mysqli_init();
echo "Checkpoint 2\n";

// SSL avec le bon certificat DigiCert Global Root G2
mysqli_ssl_set(
    $con,
    NULL,
    NULL,
    "/home/site/wwwroot/certs/DigiCertGlobalRootG2.crt.pem",
    NULL,
    NULL
);


echo "Checkpoint 3\n";

if (mysqli_real_connect(
    $con,
    getenv('DB_HOST'),
    getenv('DB_USER'),
    getenv('DB_PWD'),
    getenv('DB_NAME'),
    intval(getenv('DB_PORT')),
    NULL,
    MYSQLI_CLIENT_SSL
)) {
    echo "Connexion OK";
} else {
    echo "Erreur : " . mysqli_connect_error();
}
