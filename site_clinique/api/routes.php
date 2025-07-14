<?php

require_once __DIR__.'/router.php';

$URL = '/api';

header("Access-Control-Allow-Origin: *");

// Page d'accueil de l'API
get($URL, 'views/index.php');





// POST pour le login (génération du token JWT)
post($URL.'/login', 'endpoints/login.php'); 

// GET pour avoir la listes des patients 
get($URL.'/patients','endpoints/rendezVous_get.php');





// Route de secours pour les pages non trouvées
any($URL.'/404', 'views/404.php');

