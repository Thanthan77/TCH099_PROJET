# Projet Intégrateur : Préparation du projet (Date limite : vendredi 20 juin 2025)

### Gestion de réservation - Clinique privée
### Auteurs : Mathis Clermont (Mathou-Clermont), Ethan Chea (Thanthan77), Vanisone Rasavady (Vanisone), Lotfi Fradj (Fradj-1), Koffi Akakpo (koffi2317), Wassim Ouali(WassimOuali)

##  Description du projet : 
Ce projet a pour but de développer un système complet de gestion de réservation pour une clinique privée.
Le système permettra aux patients de réserver, via diserves plateformes, des rendez-vous pour différents services de soins (consultation médicale, soins infirmiers, vaccination, etc.).

Le projet sera composé d'un **site Web**, d'un **API REST** ainsi que d'une **application mobile**.


## Choix de technologie pour l'API REST du backend

- *PHP*
- *Authentification : JWT (JSON Web Token)*
- *Serveur Apache (XAMPP en local)*

## Choix des deux interfaces et stack technologiques

### Interface Web

- *HTML* 
- *CSS*
- *JavaScript* 
- *PHP*

### Application mobile

- *Android Studio*
- *Java (langage utilisé)*

## Choix de la base de données et des tables

- *MySQL*
- *Oracle* 
- *Visual Paradigm*

### Tables prévues

- utilisateurs
- roles
- rendez_vous
- disponibilites
- services

## Informations multi-usager

| Type d'utilisateur | Actions possibles |
|--------------------|-------------------|
| Patient            | Prendre, voir, annuler ses rendez-vous |
| Secrétaire         | Prendre, voir, déplacer, annuler des rendez-vous |
| Médecin            | Gérer ses disponibilités, voir ses rendez-vous |
| Infirmière         | Gérer ses disponibilités, voir ses rendez-vous |
| Administrateur     | Gérer les utilisateurs, services, horaires et ressources |
