<?php
require_once __DIR__ . '/api/db/Database.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo = Database::getInstance();
    echo "Connexion OK";
} catch (PDOException $e) {
    echo "Erreur PDO : " . $e->getMessage();
}
