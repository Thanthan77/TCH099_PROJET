<?php
$con = mysqli_init();
mysqli_ssl_set($con, NULL, NULL, "/etc/ssl/certs/ca-certificates.crt", NULL, NULL);

if (mysqli_real_connect(
    $con,
    getenv('DB_HOST'),
    getenv('DB_USER'),
    getenv('DB_PWD'),
    NULL, // pas de DB pour tester juste l'authentification
    getenv('DB_PORT')
)) {
    echo "Connexion OK";
} else {
    echo "Erreur : " . mysqli_connect_error();
}
