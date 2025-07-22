<?php

require_once __DIR__.'/router.php';

$URL = '/api';

header("Access-Control-Allow-Origin: *");

// Page d'accueil de l'API
get($URL, 'views/index.php');

// Section Employes

// POST pour le login des employe (génération du token JWT)
post($URL.'/login', 'endpoints/login.php'); 

// GET pour avoir la listes de tous les rendezVous
get($URL.'/rendezvous','endpoints/rendezVous_get.php');

// GET pour avoir la listes de tous les rendezVous d'un employe
get($URL.'/rendezvous/$codeEmploye', 'endpoints/rendezVousEmploye_get.php');

// GET pour avoir la listes de tous les patients
get($URL.'/patients','endpoints/patients_get.php');

// GET pour avoir la liste de tous les services
get($URL.'/services','endpoints/services_get.php');

// GET pour avoir la liste de tous les employées
get($URL.'/employes', 'endpoints/employees_get.php');

get($URL.'/horaires','endpoints/horaire_get.php');

// PUT pour avoir ajouter une note de consultation à un dossier
put($URL. '/note/$numRdv', 'endpoints/note_put.php');

post($URL.'/vacance','endpoints/vacance_post.php');

// Section Patients

// POST pour le login de patient (génération du token JWT)
post($URL.'/login_patient', 'endpoints/login_patient.php'); 

// POST pour l'inscription du patient 
post($URL.'/inscription_patient', 'endpoints/inscription_patient.php'); 

// PUT modifie les informations des patients 
put($URL. '/modifier_patient', 'endpoints/modifier_patient.php');




// Route de secours pour les pages non trouvées
any($URL.'/404', 'views/404.php');

