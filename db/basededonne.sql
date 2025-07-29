-- 1) EMPLOYE
CREATE TABLE Employe (
  CODE_EMPLOYE   INT           PRIMARY KEY,
  PRENOM_EMPLOYE VARCHAR(30),
  NOM_EMPLOYE    VARCHAR(30),
  ETAT_CIVIL     ENUM('Celibataire','Marier'),
  MOT_DE_PASSE   VARCHAR(30),
  COURRIEL       VARCHAR(30),
  TELEPHONE      BIGINT,
  ADRESSE        VARCHAR(100),
  DATE_NAISSANCE  DATE,
  SEXE           ENUM('M','F'),
  POSTE          VARCHAR(30)

);


-- 2) SERVICE
CREATE TABLE Service (
  ID_SERVICE   INT(20) PRIMARY KEY,
  NOM          VARCHAR(30),
  DESCRIPTION  VARCHAR(100),
  CODE_EMPLOYE INT,
  FOREIGN KEY (CODE_EMPLOYE) REFERENCES Employe(CODE_EMPLOYE)
);




-- 3) PATIENT
CREATE TABLE Patient (
  COURRIEL              VARCHAR(30)  PRIMARY KEY,
  PRENOM_PATIENT        VARCHAR(30),
  NOM_PATIENT           VARCHAR(30),
  MOT_DE_PASSE          VARCHAR(30),
  NUM_TEL               BIGINT,
  NUM_CIVIQUE           INT,
  RUE                   VARCHAR(30),
  VILLE                 VARCHAR(30),
  CODE_POSTAL           VARCHAR(15),
  NO_ASSURANCE_MALADIE  VARCHAR(20),
  DATE_NAISSANCE        DATE
);

-- 4) HORAIRE 
CREATE TABLE Horaire (
  ID_HORAIRE    INT AUTO_INCREMENT PRIMARY KEY,
  CODE_EMPLOYE  INT               NOT NULL,
  HEURE_DEBUT   TIME              NOT NULL,
  HEURE_FIN     TIME              NOT NULL,
  JOURS         VARCHAR(50)       NOT NULL,
  CONSTRAINT FK_HORAIRE_EMP FOREIGN KEY (CODE_EMPLOYE)
    REFERENCES Employe(CODE_EMPLOYE) ON DELETE CASCADE
);

-- 5) EXCEPTION_HORAIRE
CREATE TABLE Exception_horaire (
  ID_EXC         INT AUTO_INCREMENT PRIMARY KEY,
  CODE_EMPLOYE   INT                NOT NULL,
  DATE_DEBUT     DATE              NOT NULL,
  DATE_FIN       DATE              NOT NULL,
  TYPE_EXCEPTION ENUM('VACANCES', 'ATTENTE') NOT NULL,
  CONSTRAINT FK_EXC_EMP FOREIGN KEY (CODE_EMPLOYE)
    REFERENCES Employe(CODE_EMPLOYE) ON DELETE CASCADE,
  CONSTRAINT UQ_EXC_DATE_DEBUT UNIQUE (DATE_DEBUT),
  CONSTRAINT UQ_EXC_DATE_FIN UNIQUE (DATE_FIN)
);

-- 6) RENDEZVOUS
CREATE TABLE Rendezvous (
  NUM_RDV           INT AUTO_INCREMENT PRIMARY KEY,
  CODE_EMPLOYE      INT        NOT NULL,
  COURRIEL          VARCHAR(30)NOT NULL,
  JOUR              DATE       NOT NULL,
  HEURE             TIME       NOT NULL,
  DUREE             INT        NOT NULL,
  ID_SERVICE        INT        NOT NULL,
  NOTE_CONSULT      VARCHAR(255),
  STATUT            ENUM('CONFIRMÉ','ANNULÉ','TERMINÉ','ATTENTE') NOT NULL DEFAULT 'CONFIRMÉ',
  CONSTRAINT FK_RV_EMP FOREIGN KEY (CODE_EMPLOYE)
    REFERENCES Employe(CODE_EMPLOYE) ON DELETE CASCADE,
  CONSTRAINT FK_RV_PAT FOREIGN KEY (COURRIEL)
    REFERENCES Patient(COURRIEL)      ON DELETE CASCADE,
  CONSTRAINT FK_RV_SVC FOREIGN KEY (ID_SERVICE)
    REFERENCES Service(ID_SERVICE)    ON DELETE RESTRICT
);

-- 7) Disponibilite (pour l'application)
CREATE TABLE Disponibilite (
   ID_DISPONIBILITE INT AUTO_INCREMENT PRIMARY KEY,
   CODE_EMPLOYE INT NOT NULL,
   JOUR DATE NOT NULL,
   HEURE TIME NOT NULL,
   STATUT ENUM('DISPONIBLE','OCCUPÉ') NOT NULL DEFAULT 'DISPONIBLE',
   NUM_RDV INT NULL,
   FOREIGN KEY (CODE_EMPLOYE) REFERENCES Employe(CODE_EMPLOYE),
   FOREIGN KEY (NUM_RDV) REFERENCES Rendezvous(NUM_RDV)
);



-- 8) ServiceEmploye
CREATE TABLE ServiceEmploye(
    ID_SERVICE INT,
    CODE_EMPLOYE INT ,
    PRIMARY KEY (ID_SERVICE, CODE_EMPLOYE),
    FOREIGN KEY (ID_SERVICE) REFERENCES Service(ID_SERVICE),
    FOREIGN KEY (CODE_EMPLOYE) REFERENCES Employe(CODE_EMPLOYE)
);


-- 9) INSERTIONS


INSERT INTO Employe (
  CODE_EMPLOYE, PRENOM_EMPLOYE, NOM_EMPLOYE, ETAT_CIVIL, MOT_DE_PASSE,
  COURRIEL, TELEPHONE, ADRESSE, DATE_NAISSANCE, SEXE, POSTE
) VALUES
  (100, 'Alice',    'Durand',   'Celibataire', 'Au8$kLm3Tq',  'alice.durand@example.com',   5141234567, '123 rue des Lilas',         '1985-03-22', 'F', 'Médecin'),
  (101, 'Jean',     'Dupont',   'Marier',      'jD4#Rt9YpV',  'jean.dupont@example.com',    5141234568, '456 rue des Érables',       '1978-11-10', 'M', 'Médecin'),
  (102, 'Monique',  'Jodoin',   'Celibataire', 'Mr5!Nq2KbZ',  'monique.jodoin@example.com', 5141234569, '789 rue des Pins',          '1990-06-15', 'F', 'Médecin'),
  (200, 'Bruno',    'Martin',   'Marier',      'Bx7%Re1JmP',  'bruno.martin@example.com',   5141234570, '321 rue Ontario',           '1982-02-05', 'M', 'Infirmier'),
  (201, 'Isabelle', 'Langlois', 'Celibataire', 'Iu3&Ka8LdY',  'isabelle.langlois@example.com',5141234571, '654 rue Mont-Royal',     '1992-09-18', 'F', 'Infirmier'),
  (202, 'Dominic',  'Dublois',  'Celibataire', 'Dp6@Vz4XcQ',  'dominic.dublois@example.com',5141234572, '987 rue Sherbrooke',        '1988-12-03', 'M', 'Infirmier'),
  (300, 'Claire',   'Moreau',   'Marier',     'Cn9#Hj2MfW',  'claire.moreau@example.com',  5141234573, '135 rue Papineau',          '1980-07-25', 'F', 'Secrétaire'),
  (301, 'Xavier',   'Dubé',     'Celibataire' ,'Xb5$Qn3RpK',  'xavier.dube@example.com',    5141234574, '246 rue Sainte-Catherine',  '1995-04-12', 'M', 'Secrétaire'),
  (400, 'George',   'Smith',    'Marier'      ,'Gt8!Lz1WfR',  'george.smith@example.com',   5141234575, '369 rue Berri',             '1975-01-30', 'M', 'Administrateur');



INSERT INTO Service (ID_SERVICE, NOM, DESCRIPTION, CODE_EMPLOYE) VALUES
  (1, 'Consultation générale',            'Évaluation de santé pour tout problème courant',       100),
  (2, 'Suivi de grossesse',               'Suivi médical de grossesse',                          100),
  (3, 'Suivi de maladies chroniques',     'Contrôle régulier (diabète, hypertension, etc.)',     101),
  (4, 'Dépistage ITSS',                   'Tests pour infections transmissibles (ITSS)',         102),
  (5, 'Vaccination',                      'Vaccin de routine, voyage ou saisonnier',             201),
  (6, 'Prélèvement sanguin / test urine', 'Prise de sang ou test urinaire',                      200),
  (7, 'Urgence mineure',                  'Blessures légères, infections, douleurs modérées',    202);





INSERT INTO Patient (
  COURRIEL, PRENOM_PATIENT, NOM_PATIENT, MOT_DE_PASSE,
  NUM_TEL, NUM_CIVIQUE, RUE, VILLE, CODE_POSTAL,
  NO_ASSURANCE_MALADIE, DATE_NAISSANCE
) VALUES
  ('leo@example.com', 'Léo', 'Dubois', 'Ln8@Xf2RmS',   5141234567, 100, 'rue Ontario', 'Montréal', 'H2K3K4', 'RAMQ12345678', '1995-06-15'),
  ('ana@example.com', 'Ana', 'Lefebvre', 'Aq4#Mn5TjP',   4387654321,  55, 'rue Sainte-Catherine', 'Laval', 'H7N4A2', 'RAMQ98765432', '1988-11-30'),
  ('marc@example.com', 'Marc', 'Tremblay', 'Mv3!Kz7BhQ',  4509876543,  29, '1234 rue des Fleurs', 'Québec', 'G1X0A1', 'RAMQ23456789', '1996-03-22'),
  ('sophie@example.com', 'Sophie', 'Gagnon', 'Sp5$Ty6GdW', 5142345678,  34, '56 avenue du Parc', 'Montréal', 'H3A2J1', 'RAMQ34567890', '1991-08-15'),
  ('david@example.com', 'David', 'Roy', 'Dx9%Rc1LpN', 8193456789,  42, '789 boulevard Mercure', 'Saguenay', 'G7H4B2', 'RAMQ45678901', '1983-12-02'),
  ('claire@example.com', 'Claire', 'Bélanger', 'Cq2&Jm8ZrY',4384567890,  27, '321 chemin des Érables', 'Longueuil', 'J4N6B9', 'RAMQ56789012', '1998-05-30'),
  ('eric@example.com', 'Éric', 'Fortin', 'Er6@Vb3XkU',  4505678901,  50, '12 rue du Lac', 'Gatineau', 'J8Y3K4', 'RAMQ67890123', '1975-09-10'),
  ('marie@example.com', 'Marie', 'Tremblay', 'Mk7*Ga4QsT', 4186789012,  38, '85 rue de la Commune', 'Québec', 'G1K3M2', 'RAMQ78901234', '1987-11-05'),
  ('yannick@example.com', 'Yannick', 'Boucher', 'Yk3#Pl7SdN',5147890123, 31, '998 avenue Saint-Jean', 'Montréal', 'H4C2J7', 'RAMQ89012345', '1993-07-19'),
  ('isabelle@example.com', 'Isabelle','Martin', 'In4$Bm9RzY',4508901234,45,'56 rue Principale', 'Shawinigan', 'G9N5L8', 'RAMQ90123456','1980-10-28'),
  ('paul.gagnon@example.com', 'Paul', 'Gagnon', 'Pu8&Tx2ZdR',  5149876543, 120,'rue Saint-Denis', 'Montréal', 'H2X2L4', 'RAMQ11223344','1978-04-12'),
  ('julie.bernard@example.com', 'Julie', 'Bernard', 'Jb1!Qw6KlM', 4388765432, 250,'boulevard René-Lévesque', 'Québec', 'G1R5V2', 'RAMQ22334455','1992-09-05'),
  ('antoine.lavoie@example.com', 'Antoine','Lavoie', 'Al5%Rc2FnT',4507654321,15,'avenue Papineau', 'Laval', 'H7N2L1', 'RAMQ33445566','1985-01-20'),
  ('marie-claude.leblanc@example.com', 'Marie-Claude', 'Leblanc','Mc2&Zd7XpK',8196543210,300,'chemin Sainte-Foy','Gatineau','J8T4B5','RAMQ44556677','1970-07-30'),
  ('kevin.dumont@example.com','Kevin', 'Dumont', 'Kd3#Yl8WpN', 4183456789, 50,'rue des Forges', 'Trois-Rivières','G8Z1K3','RAMQ55667788','1988-12-10'),
  ('amanda.boudreau@example.com','Amanda','Boudreau', 'Ab7$Vn2PrT',8194567890, 88,'rue Wellington', 'Sherbrooke', 'J1H5R4','RAMQ66778899','1999-03-22'),
  ('lucie.morel@example.com','Lucie', 'Morel', 'Lm9@Qt4BhS', 5141122334,110,'rue Beaubien', 'Montréal', 'H2V3R4','RAMQ77889900','1982-02-14'),
  ('pierre.fortin@example.com','Pierre','Fortin', 'Pf4%Xc1JkV',4382233445,210,'avenue des Pins', 'Québec', 'G1P4K5','RAMQ88990011','1979-05-27'),
  ('sophie.girard@example.com','Sophie','Girard', 'Sg6!Zm3LpQ',4503344556, 33,'boulevard Talbot', 'Laval', 'H7L5M6','RAMQ99001122','1990-12-02'),
  ('alexandre.robert@example.com','Alexandre','Robert', 'Ar5#Yn9FkL',  8194455667, 76,'chemin des Érables', 'Gatineau', 'J8Y6N7','RAMQ00112233','1986-08-19'),
  ('karine.blais@example.com','Karine','Blais', 'Kb2$Wm8HpT',4185566778, 48,'rue du Marché', 'Trois-Rivières','G8Z2L8','RAMQ11220033','1993-11-11'),
  ('philippe.leblanc@example.com','Philippe','LeBlanc', 'Pl7&Qz3RmX',  5146677889,102,'avenue Laval', 'Montréal', 'H3A1T9','RAMQ22331144','1975-03-05'),
  ('celine.durand@example.com','Céline','Durand', 'Cd5*Kp1JnV',4387788990, 19,'boulevard René-Lévesque','Québec','G1R2V3','RAMQ33442255','1989-07-23'),
  ('olivier.perreault@example.com','Olivier','Perreault','Or8@Vt2ZlQ',4508899001,57,'rue Notre-Dame', 'Longueuil', 'J4K5B2','RAMQ44553366','1981-01-30');


INSERT INTO Rendezvous (CODE_EMPLOYE, COURRIEL, JOUR, HEURE, DUREE, ID_SERVICE, NOTE_CONSULT)
VALUES
(100, 'celine.durand@example.com', '2025-08-04', '08:00:00', 20, 1, ''),
(200, 'marc@example.com', '2025-08-05', '13:10:00', 20, 6, ''),
(101, 'yannick@example.com', '2025-08-06', '11:35:00', 20, 2, ''),
(101, 'sophie.girard@example.com', '2025-08-06', '14:30:00', 20, 1, ''),
(202, 'david@example.com', '2025-08-08', '13:40:00', 20, 7, ''),
(200, 'pierre.fortin@example.com', '2025-08-11', '09:40:00', 20, 7, ''),
(202, 'julie.bernard@example.com', '2025-08-12', '09:35:00', 20, 3, ''),
(201, 'olivier.perreault@example.com', '2025-08-13', '13:45:00', 20, 4, ''),
(102, 'claire@example.com', '2025-08-14', '12:25:00', 20, 3, ''),
(200, 'paul.gagnon@example.com', '2025-08-18', '12:00:00', 20, 6, ''),
(201, 'karine.blais@example.com', '2025-08-19', '09:40:00', 20, 5, ''),
(201, 'leo@example.com', '2025-08-19', '12:35:00', 20, 2, ''),
(200, 'eric@example.com', '2025-08-21', '10:15:00', 20, 6, ''),
(102, 'sophie@example.com', '2025-08-21', '11:15:00', 20, 4, ''),
(202, 'amanda.boudreau@example.com', '2025-08-27', '10:10:00', 20, 1, ''),
(101, 'ana@example.com', '2025-08-27', '12:10:00', 20, 3, ''),
(202, 'marie-claude.leblanc@example.com', '2025-08-27', '13:05:00', 20, 7, ''),
(101, 'isabelle@example.com', '2025-08-27', '13:55:00', 20, 4, ''),
(102, 'antoine.lavoie@example.com', '2025-08-28', '10:05:00', 20, 3, ''),
(102, 'lucie.morel@example.com', '2025-08-28', '12:25:00', 20, 6, ''),
(201, 'marie@example.com', '2025-08-29', '13:10:00', 20, 4, '');

INSERT INTO Horaire (CODE_EMPLOYE, HEURE_DEBUT, HEURE_FIN, JOURS) 
VALUES
  (100, '08:00:00', '16:00:00', 'Lundi'),
  (101, '11:00:00', '17:00:00', 'Mercredi'),
  (102, '09:30:00', '13:45:00', 'Jeudi'),
  (200, '08:30:00', '16:30:00', 'Lundi au Jeudi'),
  (201, '08:30:00', '16:30:00', 'Mardi au Vendredi'),
  (202, '09:00:00', '17:00:00', 'Mardi au Vendredi'),
  (300, '09:30:00', '17:30:00', 'Lundi au Jeudi'),
  (301, '10:00:00', '18:00:00', 'Mardi au Vendredi');

INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_DEBUT, DATE_FIN, TYPE_EXCEPTION) 
VALUES
  (100, '2025-09-01', '2025-09-15', 'ATTENTE'),
  (101, '2025-08-10', '2025-08-10', 'VACANCES'),
  (102, '2025-08-07', '2025-08-07', 'VACANCES'),
  (200, '2025-08-12', '2025-08-14', 'VACANCES'),
  (201, '2025-08-20', '2025-08-27', 'VACANCES'),
  (202, '2025-09-19', '2025-09-26', 'VACANCES'),
  (300, '2025-11-14', '2025-11-18', 'ATTENTE'),
  (301, '2025-10-02', '2025-10-07', 'ATTENTE');

  -- MEDECIN : Alice Durand (100)
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '08:00:00', 1, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '08:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '09:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '09:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '10:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '10:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '11:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '12:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '12:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '13:15:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '13:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '14:25:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '15:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-04', '15:35:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '08:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '08:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '09:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '09:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '10:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '10:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '11:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '12:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '12:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '13:15:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '13:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '14:25:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '15:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-11', '15:35:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '08:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '08:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '09:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '09:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '10:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '10:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '11:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '12:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '12:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '13:15:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '13:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '14:25:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '15:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-18', '15:35:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '08:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '08:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '09:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '09:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '10:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '10:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '11:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '12:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '12:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '13:15:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '13:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '14:25:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '15:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 100, '2025-08-25', '15:35:00', NULL, 'DISPONIBLE');



  -- Médecin : Jean Dupont (101)
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '11:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '11:35:00', 3, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '12:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '12:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '13:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '13:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '14:30:00', 4, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '15:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '15:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-06', '16:15:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '11:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '11:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '12:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '12:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '13:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '13:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '14:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '15:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '15:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-13', '16:15:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '11:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '11:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '12:10:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '12:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '13:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '13:55:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '14:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '15:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '15:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-20', '16:15:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '11:00:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '11:35:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '12:10:00', 16, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '12:45:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '13:20:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '13:55:00', 18, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '14:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '15:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '15:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 101, '2025-08-27', '16:15:00', NULL, 'DISPONIBLE');

  -- Médecin : Monique Jodoin (102)
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '09:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '10:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '10:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '11:15:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '11:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '12:25:00', 9, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-14', '13:00:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '09:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '10:05:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '10:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '11:15:00', 14, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '11:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '12:25:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-21', '13:00:00', NULL, 'DISPONIBLE');

  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '09:30:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '10:05:00', 19, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '10:40:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '11:15:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '11:50:00', NULL, 'DISPONIBLE');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '12:25:00', 20, 'OCCUPÉ');
  INSERT INTO Disponibilite VALUES (NULL, 102, '2025-08-28', '13:00:00', NULL, 'DISPONIBLE');

  -- Infirmier : Bruno Martin (200)
    -- Semaine 1
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-04', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '13:10:00', 2, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-05', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-06', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-07', '16:05:00', NULL, 'DISPONIBLE');

    -- Semaine 2 : (vacances du Mardi 12 août au Jeudi) --> Seulement le Lundi 11 août
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '09:40:00', 6, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-11', '16:05:00', NULL, 'DISPONIBLE');

    -- Semaine 3 
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '12:00:00', 10, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-18', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-19', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-20', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '10:15:00', 13, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-21', '16:05:00', NULL, 'DISPONIBLE');

    -- Semaine 4
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-25', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-26', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-27', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 200, '2025-08-28', '16:05:00', NULL, 'DISPONIBLE');

-- Infirmière : Isabelle Langlois (201)
    -- Semaine 1 
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-05', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-06', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-07', '16:05:00', NULL, 'DISPONIBLE');

    -- Semaine 2 
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-12', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '13:45:00', 8, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-13', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-14', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-15', '16:05:00', NULL, 'DISPONIBLE');

    -- Semaine 3 : vacances du Mercredi 20 août au Mardi 26 août 
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '09:40:00', 11, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '12:35:00', 12, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-19', '16:05:00', NULL, 'DISPONIBLE');

    -- Semaine 4 : recommence à travailler le Mercredi 27 août
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-27', '16:05:00', NULL, 'DISPONIBLE');
 
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '13:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-28', '16:05:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '08:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '09:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '09:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '10:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '10:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '11:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '12:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '12:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '13:10:00', 21, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '13:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '14:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '14:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '15:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 201, '2025-08-29', '16:05:00', NULL, 'DISPONIBLE');

-- Infirmier : Dominic Dublois (202)
    -- Semaine 1 
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-05', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-06', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-07', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '13:40:00', 5, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-08', '16:35:00', NULL, 'DISPONIBLE');

    -- Semaine 2
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '09:35:00', 7, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-12', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-13', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-14', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-15', '16:35:00', NULL, 'DISPONIBLE');

    -- Semaine 3 : En vacances entre le Mardi 19 août au Mardi 26 août 

    -- Semaine 4 : En vacances jusqu'au 26 août (donc seulement Mercredi 27 août au Vendredi 29 août)
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '10:10:00', 15, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '13:05:00', 17, 'OCCUPÉ');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-27', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-28', '16:35:00', NULL, 'DISPONIBLE');

    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '09:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '09:35:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '10:10:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '10:45:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '11:20:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '11:55:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '12:30:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '13:05:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '13:40:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '14:15:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '14:50:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '15:25:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '16:00:00', NULL, 'DISPONIBLE');
    INSERT INTO Disponibilite VALUES (NULL, 202, '2025-08-29', '16:35:00', NULL, 'DISPONIBLE');


INSERT INTO ServiceEmploye (ID_SERVICE, CODE_EMPLOYE) 
VALUES
  (1, 100),  -- Alice Durand : Consultation générale
  (2, 100),  -- Alice Durand : Suivi de grossesse
  (5, 100),  -- Alice Durand : Vaccination
  (7, 100),  -- Alice Durand : Urgence mineure

  (1, 101),  -- Jean Dupont : Consultation générale
  (2, 101),  -- Jean Dupont : Suivi de grossesse
  (3, 101),  -- Jean Dupont : Suivi maladies chroniques
  (4, 101),  -- Jean Dupont : Dépistage ITSS

  (3, 102),  -- Monique Jodoin : Suivi maladies chroniques
  (4, 102),  -- Monique Jodoin : Dépistage ITSS
  (6, 102),  -- Monique Jodoin : Prélèvement sanguin

  (6, 200),  -- Bruno Martin : Prélèvement sanguin
  (7, 200),  -- Bruno Martin : Urgences mineures

  (2, 201),  -- Isabelle Langlois : Suivi de grossesse
  (4, 201),  -- Isabelle Langlois : Dépistage ITSS
  (5, 201),  -- Isabelle Langlois : Vaccination

  (1, 202),  -- Dominic Dublois : Consultation générale
  (3, 202),  -- Dominic Dublois : Suivi maladies chroniques
  (4, 202),  -- Dominic Dublois : Dépistage ITSS
  (7, 202);  -- Dominic Dublois : Urgences mineures