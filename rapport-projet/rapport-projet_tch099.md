# Rapport de projet

## 1. Liste des membres de l'équipe
| Nom                  | Identifiant GitHub  | Identifiant Discord |
|----------------------|---------------------|---------------------|
| Vanisone Rasavady    | vanisone            | vaniixoxx           |
| Ethan Chea           | Thanthan77          | thanthane           |
| Mathis Clermont      | Mathou-Clermont     | petitpapier         |
| Lotfi Fradj          | Fradj-1             | artax7757           |
| Koffi Akakpo         | koffi2317           | koffi1348           |
| Wassim Ouali         | WassimOuali         | vitosissino         |

---

## 2. Objectif principal de l'application
Ce projet vise à développer un système complet de gestion de réservation pour une clinique privée.  
Le système permettra aux patients de réserver, via diverses plateformes, des rendez-vous pour différents services de soins (consultation médicale, soins infirmiers, vaccination, etc.).

Le projet sera composé :
- D’un **site Web**
- D’une **API REST**
- D’une **application mobile**

L’objectif n’a pas changé depuis le rapport d’analyse initial, car il correspondait déjà pleinement aux besoins définis. Nous avons conservé la même vision pour garantir la cohérence et l’efficacité du développement.

---

## 3. Comparaison des technologies
En ce qui concerne l’évolution des technologies utilisé pour la création du projet, il n’y a eu aucun changement par rapport aux technologies énoncé au début du projet. En effet, les interfaces web utilisées furent ceux énoncé initialement, de même pour l’Application mobile et les librairies pour l’API REST. Les seuls nouveaux logiciel utilisées pour la réalisation du projet furent Dockers et Azure, qui furent recommandés. 

| Composant             | Technologies prévues (rapport d'analyse) | Technologies réellement utilisées | Modifications |
|-----------------------|-------------------------------------------|------------------------------------|---------------|
| Site Web              | HTML, CSS, JavaScript, PHP                | HTML, CSS, JavaScript, PHP         | Aucune        |
| API REST              | PHP, MySQL                                | PHP, MySQL                         | Aucune        |
| Application mobile    | Java (Android)                            | Java (Android)                     | Aucune        |
| Hébergement           | —                                         | Docker, Azure                      | **Ajoutés**   |

---

## 4. Diagramme d’architecture du projet
*(Exemple à remplacer par votre vrai diagramme)*

![Diagramme d'architecture](images/c23cf1e8-83bf-4d6b-9ebd-db78aeecceb3.png)

**Légende :**
- **Clients :**  
  - Web : HTML, CSS, JavaScript  
  - Mobile : Android (Java)
- **Serveur :** API REST en PHP (hébergé sur Azure, conteneurisé avec Docker)
- **Base de données :** MySQL (hébergée sur Azure Database)
- **Connexions :**  
  - Les clients communiquent avec l’API via HTTP/HTTPS  
  - L’API interagit avec la base de données via MySQL

---

## 5. Revue des tâches des sprints

### Sprint 1
| Nom                  | XS | S | M | L | XL | Total complété | Total assigné |
|----------------------|----|---|---|---|----|----------------|---------------|
| Koffi Akakpo         |    |   | 1 |   |    | 1              |               |
| Ethan Chea           |    |   | 2 | 1 |    | 3 (2 partagées)|               |
| Mathis Clermont      |    | 1 | 1 | 1 |    | 3 (2 partagées)|               |
| Lotfi Fradj          |    | 3 |   |   |    | 3              |               |
| Vanisone Rasavady    | 1  | 2 | 1 |   |    | 4              |               |
| Wassim Ouali         |    | 1 | 2 |   |    | 3              |               |

**Total des tâches de l’équipe :** 15  

---

### Sprint 2
| Nom                  | XS | S | M | L | XL | Total complété | Total assigné |
|----------------------|----|---|---|---|----|----------------|---------------|
| Koffi Akakpo         | 1  | 1 | 1 |   |    | 3              |               |
| Ethan Chea           | 3  | 6 |   | 2 |    | 11             |               |
| Mathis Clermont      | 3  | 2 | 3 | 2 | 2  | 12             |               |
| Lotfi Fradj          |    | 3 | 5 | 1 |    | 9              |               |
| Vanisone Rasavady    | 6  | 8 |   |   |    | 14             |               |
| Wassim Ouali         | 1  | 6 | 1 |   |    | 8              |               |

**Total des tâches de l’équipe :** 55   

---

## 6. Rétrospective des procédés du projet
L’une des améliorations possibles aurait été de renforcer la cohésion d’équipe, notamment entre les développeurs du site web et de l’application mobile.  
Malgré une entente initiale sur les tâches et le fonctionnement global, des problèmes de coordination sont apparus concernant l’utilisation de la base de données et des endpoints.  
Une solution aurait été de mettre en place une réunion hebdomadaire entre un représentant de chaque sous-groupe afin de mieux synchroniser l’avancement.

---

## 7. Perspective future (Sprint 3)
La prochaine évolution prioritaire serait l’ajout d’une **fonctionnalité de récupération de mot de passe** pour les professionnels via le site web.  
Cela permettrait d’améliorer l’accessibilité et la sécurité, tout en offrant aux administrateurs et professionnels la possibilité d’ajouter de nouveaux types de services pour élargir l’offre de soins.  
Pour l’application mobile, il serait intéressant d’intégrer l’historique des transactions et l’envoi d’une confirmation de rendez-vous par courriel.

---
