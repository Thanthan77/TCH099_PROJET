<?php
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
