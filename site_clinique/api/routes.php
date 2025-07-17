<?php

require_once __DIR__.'/router.php';

$URL = '/api';

header("Access-Control-Allow-Origin: *");

// Page d'accueil de l'API
get($URL, 'views/index.php');





// POST pour le login (génération du token JWT)
post($URL.'/login', 'endpoints/login.php'); 

// GET pour avoir la listes de tous les rendezVous
get($URL.'/rendezvous','endpoints/rendezVous_get.php');

// GET pour avoir la listes de tous les rendezVous d'un employe
get($URL.'/rendezvous/$codeEmploye', 'endpoints/rendezVousEmploye_get.php');

// GET pour avoir la listes de tous les patients
get($URL.'/patients','endpoints/patients_get.php');


// GET pour avoir la listes de tous les services
get($URL.'/services','endpoints/services_get.php');







// Route de secours pour les pages non trouvées
any($URL.'/404', 'views/404.php');

