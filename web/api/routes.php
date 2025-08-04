<?php

require_once __DIR__.'/router.php';

$URL = '/api';

header("Access-Control-Allow-Origin: *");

// Page d'accueil de l'API
get($URL, 'views/index.php');

// Section Employes

// GET --

// GET pour avoir la listes de tous les rendezVous
get($URL.'/rendezvous','endpoints/employe/rendezVous_get.php');

// GET pour avoir la listes de tous les rendezVous d'un employe
get($URL.'/rendezvous/$codeEmploye', 'endpoints/employe/rendezVousEmploye_get.php');

// GET pour avoir la listes de tous les patients
get($URL.'/patients','endpoints/employe/patients_get.php');

// GET pour avoir la liste des noms de services
get($URL.'/services','endpoints/employe/services_get.php');

// GET pour avoir la liste de tous les employées
get($URL.'/employes', 'endpoints/employe/employees_get.php');

// GET pour avoir les horaires des employes
get($URL.'/horaires','endpoints/employe/horaire_get.php');

// GET pour avoir la liste des demandes de vacances
get($URL.'/conge','endpoints/employe/conge_get.php');

//GET pour avoir tous les professionels
get($URL.'/professionnels','endpoints/employe/professionels_get.php');

// GET pour récupérer les services d’un employé
get($URL.'/service_employe', 'endpoints/employe/service_employe_get.php');

// GET pour récupérer horaires + jours travaillés + vacances (nécessaires à la génération)
get($URL.'/disponibilites/generation', 'endpoints/employe/generer_disponibilites_get.php');

// GET pour récupérer les disponibilités d’un employé à une date précise
get($URL.'/disponibilites/$codeEmploye/$heureActuelle/$date', 'endpoints/employe/disponibilite_employe_get.php');

// GET pour récupérer les disponibilités d’un employé à une date précise
get($URL.'/disponibilites/$codeEmploye/$date', 'endpoints/employe/disponibilite_jour_get.php');

// GET pour récupérer les vacances d'un certain employe
get($URL.'/conge/$codeEmploye','endpoints/employe/conge_employe_get.php');

//POST--

// POST pour le login des employe (génération du token JWT)
post($URL.'/login', 'endpoints/employe/login.php'); 


//POST pour une demande de vacance d'un medecin ou infirmier
post($URL.'/conge/employe/$codeEmploye','endpoints/employe/conge_post.php');

//POST pour un suivi de rendez vous
post($URL.'/rendezvous/secretaire','endpoints/employe/rendezVous_post.php');

//POST pour créer un nouvel employe
post($URL.'/employe','endpoints/employe/employe_post.php');

// POST pour ajouter une assignation (ou plusieurs) pour un employé
post($URL.'/service_employe', 'endpoints/employe/service_employe_post.php');

// POST pour générer et insérer les disponibilités en base
post($URL.'/disponibilites/generation', 'endpoints/employe/generer_disponibilites_post.php');


//PUT--

// PUT pour accepter ou refuser une demande de vacance
put($URL.'/conge/$idException','endpoints/employe/conge_put.php');

//PUT pour mettre a jour les profiles des employés
put($URL.'/employe/user/$codeEmploye','endpoints/employe/employe_put.php');

//PUT pour deplacer un rendez vous
put($URL.'/rendezvous','endpoints/employe/rendezvous_put.php');

// PUT pour avoir ajouter une note de consultation à un dossier
put($URL. '/note/$numRdv', 'endpoints/employe/note_put.php');

// PUT pour mettre à jour complètement les services d’un employé (écrasement + ajout)
put($URL.'/service_employe', 'endpoints/employe/service_employe_put.php');

// PUT pour mettre à jour une disponibilité (changer STATUT et lier à un rendez-vous)
put($URL.'/disponibilites', 'endpoints/employe/disponibilite_put.php');

// PUT pour remettre à NULL le NUM_RDV d’une disponibilité (libération de plages après annulation)
//put($URL.'/disponibilites/annulation', 'endpoints/employe/disponibilite_annulation_put.php');

// PUT pour Réinitialisation du mot de passe d’un employé (avec hachage sécurisé)
put($URL.'/motdepasse', 'endpoints/employe/changermotdepasse_put.php');


// Section Patients

// POST

// POST pour le login de patient (génération du token JWT)
post($URL.'/login_patient', 'endpoints/patient/login_patient.php'); 

// POST pour l'inscription du patient 
post($URL.'/inscription_patient', 'endpoints/patient/inscription_patient.php'); 

// POST pour prendre un rendezvous en tant que pâtient
post($URL.'/rendezvous/patient', 'endpoints/patient/rendezVous_post.php'); 

// PUT

// PUT modifie les informations des patients 
put($URL. '/modifier_patient', 'endpoints/patient/patient_put.php');

// PUT annulation de rendezVous
put($URL.'/rendezVous/id/patient/$numRdv','endpoints/patient/rendezVous_put.php');

// GET

// GET pour avoir les rendezvous d'un patient
get($URL.'/rendezvous/patient/$courriel','endpoints/patient/rendezVous_patient_get.php');

// GET pour avoir toutes les informations d'un patient 
get($URL.'/patient/$courriel','endpoints/patient/patient_get');

// GET pour avoir toutes les disponibilites en fonction d'un service
get($URL. '/disponibilitees/services/id/$id_service', 'endpoints/patient/disponibilite_get.php');

// PUT pour changer le mot de passe
put($URL . '/mdp_put', 'endpoints/patient/mdp_put.php');






// Route de secours pour les pages non trouvées
any($URL.'/404', 'views/404.php');

