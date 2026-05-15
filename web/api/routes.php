<?php

require_once __DIR__.'/router.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

$URL = '/api';

/* ============================
   PAGE D’ACCUEIL API
============================ */
get($URL, 'views/index.php');
get($URL.'/', 'views/index.php');


/* ============================
   SECTION EMPLOYÉS
============================ */

/* --- GET --- */

// Liste de tous les rendez-vous
get($URL.'/rendezvous', 'endpoints/employe/rendezVous_get.php');

// Rendez-vous d’un employé
get($URL.'/rendezvous/$codeEmploye', 'endpoints/employe/rendezVousEmploye_get.php');

// Liste des patients
get($URL.'/patients', 'endpoints/employe/patients_get.php');

// Liste des services
get($URL.'/services', 'endpoints/employe/services_get.php');

// Liste des employés
get($URL.'/employes', 'endpoints/employe/employees_get.php');

// Horaires des employés
get($URL.'/horaires', 'endpoints/employe/horaire_get.php');

// Liste des demandes de congé
get($URL.'/conge', 'endpoints/employe/conge_get.php');

// Professionnels d’un service
get($URL.'/professionnels/$nom_service', 'endpoints/employe/professionnels_get.php');

// Services d’un employé
get($URL.'/service_employe', 'endpoints/employe/service_employe_get.php');

// Données pour génération des disponibilités
get($URL.'/disponibilites/generation', 'endpoints/employe/generer_disponibilites_get.php');

// Disponibilités d’un employé (heure + date)
get($URL.'/disponibilites/$codeEmploye/$heureActuelle/$date', 'endpoints/employe/disponibilite_employe_get.php');

// Disponibilités d’un employé (jour)
get($URL.'/disponibilites/$codeEmploye/$date', 'endpoints/employe/disponibilite_jour_get.php');

// Congés d’un employé
get($URL.'/conge/$codeEmploye', 'endpoints/employe/conge_employe_get.php');


/* --- POST --- */

// Login employé
post($URL.'/login', 'endpoints/employe/login.php');

// Demande de congé
post($URL.'/conge/employe/$codeEmploye', 'endpoints/employe/conge_post.php');

// Suivi de rendez-vous
post($URL.'/rendezvous/secretaire', 'endpoints/employe/rendezVous_post.php');

// Création d’un employé
post($URL.'/employe', 'endpoints/employe/employe_post.php');

// Ajout de services à un employé
post($URL.'/service_employe', 'endpoints/employe/service_employe_post.php');

// Génération des disponibilités
post($URL.'/disponibilites/generation', 'endpoints/employe/generer_disponibilites_post.php');

// Ajout d’un horaire
post($URL.'/horaire', 'endpoints/employe/horaire_post.php');


/* --- PUT --- */

// Accepter/refuser une demande de congé
put($URL.'/conge/$idException', 'endpoints/employe/conge_put.php');

// Mise à jour profil employé
put($URL.'/employe/user/$codeEmploye', 'endpoints/employe/employe_put.php');

// Déplacer un rendez-vous
put($URL.'/rendezvous', 'endpoints/employe/rendezvous_put.php');

// Ajouter une note de consultation
put($URL.'/note/$numRdv', 'endpoints/employe/note_put.php');

// Mise à jour complète des services d’un employé
put($URL.'/service_employe', 'endpoints/employe/service_employe_put.php');

// Mise à jour d’une disponibilité
put($URL.'/disponibilites', 'endpoints/employe/disponibilite_put.php');

// Réinitialisation du mot de passe
put($URL.'/motdepasse', 'endpoints/employe/changermotdepasse_put.php');


/* ============================
   SECTION PATIENTS
============================ */

/* --- GET --- */

// Rendez-vous d’un patient
get($URL.'/rendezvous/patient/$courriel', 'endpoints/patient/rendezVous_patient_get.php');

// Informations d’un patient
get($URL.'/patient/$courriel', 'endpoints/patient/patient_get.php');

// Disponibilités d’un employé (patient)
get($URL.'/disponibilites/employe/id/$code_employe', 'endpoints/patient/disponibilite_get.php');

// Disponibilités d’un employé pour un jour
get($URL.'/disponibilite/employe/$code_employe/$jour', 'endpoints/patient/disponibilite_heure_get.php');

// Employés d’un service
get($URL.'/employes/service/$id_service', 'endpoints/patient/services_Employe_get.php');


/* --- POST --- */

// Login patient
post($URL.'/login_patient', 'endpoints/patient/login_patient.php');

// Inscription patient
post($URL.'/inscription_patient', 'endpoints/patient/inscription_patient.php');

// Prendre un rendez-vous
post($URL.'/rendezvous/patient', 'endpoints/patient/rendezVous_post.php');


/* --- PUT --- */

// Modifier un patient
put($URL.'/modifier_patient', 'endpoints/patient/patient_put.php');

// Annuler un rendez-vous
put($URL.'/rendezVous/id/patient/$numRdv', 'endpoints/patient/rendezVous_put.php');

// Changer mot de passe patient
put($URL.'/mdp_put', 'endpoints/patient/mdp_put.php');


/* ============================
   ROUTE 404
============================ */
any($URL.'/404', 'views/404.php');
