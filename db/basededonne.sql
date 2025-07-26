-- 1) SERVICE
CREATE TABLE Service (
  ID_SERVICE   INT(20)        PRIMARY KEY,
  NOM          VARCHAR(30),
  DESCRIPTION  VARCHAR(30)
);

-- 2) EMPLOYE
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

-- 4) RENDEZVOUS
CREATE TABLE Rendezvous (
  NUM_RDV           INT AUTO_INCREMENT PRIMARY KEY,
  CODE_EMPLOYE      INT        NOT NULL,
  COURRIEL          VARCHAR(30)NOT NULL,
  JOUR              DATE       NOT NULL,
  HEURE             TIME       NOT NULL,
  DUREE             INT        NOT NULL,
  ID_SERVICE        INT        NOT NULL,
  NOTE_CONSULT      VARCHAR(255),
  STATUT            ENUM('CONFIRMÉ','ANNULÉ','TERMINÉ') NOT NULL DEFAULT 'CONFIRMÉ',
  CONSTRAINT FK_RV_EMP FOREIGN KEY (CODE_EMPLOYE)
    REFERENCES Employe(CODE_EMPLOYE) ON DELETE CASCADE,
  CONSTRAINT FK_RV_PAT FOREIGN KEY (COURRIEL)
    REFERENCES Patient(COURRIEL)      ON DELETE CASCADE,
  CONSTRAINT FK_RV_SVC FOREIGN KEY (ID_SERVICE)
    REFERENCES Service(ID_SERVICE)    ON DELETE RESTRICT
);

-- 5) HORAIRE (JOURS en VARCHAR pour libellés “Lundi au Jeudi”)
CREATE TABLE Horaire (
  ID_HORAIRE    INT AUTO_INCREMENT PRIMARY KEY,
  CODE_EMPLOYE  INT               NOT NULL,
  HEURE_DEBUT   TIME              NOT NULL,
  HEURE_FIN     TIME              NOT NULL,
  JOURS         VARCHAR(50)       NOT NULL,
  CONSTRAINT FK_HORAIRE_EMP FOREIGN KEY (CODE_EMPLOYE)
    REFERENCES Employe(CODE_EMPLOYE) ON DELETE CASCADE
);

-- 6) EXCEPTION_HORAIRE
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


-- 7) Disponibilite (pour l'application)
CREATE TABLE Disponibilite (
   ID_DISPONIBILITE    INT AUTO_INCREMENT PRIMARY KEY,
   CODE_EMPLOYE        INT        NOT NULL,
   DEBUT_DISPONIBILITE DATETIME   NOT NULL,
   FIN_DISPONIBILITE   DATETIME   NOT NULL,
   STATUT              ENUM('DISPONIBLE','OCCUPÉ') NOT NULL DEFAULT 'DISPONIBLE',
   NUM_RDV             INT        NULL,
   FOREIGN KEY (CODE_EMPLOYE)
     REFERENCES Employe(CODE_EMPLOYE),
   FOREIGN KEY (NUM_RDV)
     REFERENCES Rendezvous(NUM_RDV)
 );


-- 8) INSERTIONS

INSERT INTO Service (ID_SERVICE, NOM, DESCRIPTION) VALUES
  (1, 'Consultation générale',          'Évaluation de santé pour tout problème courant'),
  (2, 'Suivi de grossesse',             'Suivi médical de grossesse'),
  (3, 'Suivi de maladies chroniques',    'Contrôle régulier (diabète, hypertension, etc.)'),
  (4, 'Dépistage ITSS',                 'Tests pour infections transmissibles (ITSS)'),
  (5, 'Vaccination',                    'Vaccin de routine, voyage ou saisonnier'),
  (6, 'Prélèvement sanguin / test urine','Prise de sang ou test urinaire'),
  (7, 'Urgence mineure',                'Blessures légères, infections, douleurs modérées');

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
  (300, 'Claire',   'Moreau',   'Marier',      'Cn9#Hj2MfW',  'claire.moreau@example.com',  5141234573, '135 rue Papineau',          '1980-07-25', 'F', 'Secrétaire'),
  (301, 'Xavier',   'Dubé',     'Celibataire', 'Xb5$Qn3RpK',  'xavier.dube@example.com',    5141234574, '246 rue Sainte-Catherine',  '1995-04-12', 'M', 'Secrétaire'),
  (400, 'George',   'Smith',    'Marier',      'Gt8!Lz1WfR',  'george.smith@example.com',   5141234575, '369 rue Berri',             '1975-01-30', 'M', 'Administrateur');

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

INSERT INTO Rendezvous (
  CODE_EMPLOYE, COURRIEL, JOUR, HEURE, DUREE, ID_SERVICE, NOTE_CONSULT
) VALUES
  -- Dr Alice Durand (100)
  (100, 'leo@example.com',                  '2025-07-28', '08:00:00', 20, 1, ''),
  (100, 'lucie.morel@example.com',          '2025-07-28', '08:35:00', 20, 2, ''),
  (100, 'paul.gagnon@example.com',          '2025-07-28', '09:10:00', 20, 5, ''),
  (100, 'julie.bernard@example.com',        '2025-07-28', '09:45:00', 20, 7, ''),

  -- Dr Jean Dupont (101)
  (101, 'antoine.lavoie@example.com',       '2025-07-28', '09:00:00', 20, 3, ''),
  (101, 'marie-claude.leblanc@example.com', '2025-07-28', '09:35:00', 20, 4, ''),
  (101, 'david@example.com',                '2025-07-28', '10:10:00', 20, 1, ''),
  (101, 'eric@example.com',                 '2025-07-28', '10:45:00', 20, 2, ''),

  -- Inf Monique Jodoin (102)
  (102, 'marc@example.com',                 '2025-07-30', '08:00:00', 20, 3, ''),
  (102, 'sophie.girard@example.com',        '2025-07-30', '08:35:00', 20, 6, ''),
  (102, 'yannick@example.com',              '2025-07-30', '09:10:00', 20, 4, ''),
  (102, 'claire@example.com',               '2025-07-30', '09:45:00', 20, 7, ''),

  -- Inf Bruno Martin (200)
  (200, 'kevin.dumont@example.com',         '2025-07-29', '10:00:00', 20, 6, ''),
  (200, 'amanda.boudreau@example.com',      '2025-07-29', '10:35:00', 20, 6, ''),
  (200, 'philippe.leblanc@example.com',     '2025-07-29', '11:10:00', 20, 6, ''),
  (200, 'antoine.lavoie@example.com',       '2025-07-29', '11:45:00', 20, 6, ''),

  -- Inf Isabelle Langlois (201)
  (201, 'pierre.fortin@example.com',        '2025-07-31', '13:00:00', 20, 4, ''),
  (201, 'alexandre.robert@example.com',     '2025-07-31', '13:35:00', 20, 5, ''),
  (201, 'celine.durand@example.com',        '2025-07-31', '14:10:00', 20, 2, ''),
  (201, 'sophie@example.com',               '2025-07-31', '14:45:00', 20, 1, ''),

  -- Inf Dominic Dublois (202)
  (202, 'olivier.perreault@example.com',    '2025-08-01', '14:00:00', 20, 3, ''),
  (202, 'kevin.dumont@example.com',         '2025-08-01', '14:35:00', 20, 7, ''),
  (202, 'pierre.fortin@example.com',        '2025-08-01', '15:10:00', 20, 1, ''),
  (202, 'celine.durand@example.com',        '2025-08-01', '15:45:00', 20, 4, '');

INSERT INTO Horaire (CODE_EMPLOYE, HEURE_DEBUT, HEURE_FIN, JOURS) VALUES
  (100, '08:00:00', '16:00:00', 'Lundi'),
  (101, '11:00:00', '17:00:00', 'Mercredi'),
  (102, '09:30:00', '13:45:00', 'Jeudi'),
  (200, '08:30:00', '16:30:00', 'Lundi au Jeudi'),
  (201, '08:30:00', '16:30:00', 'Mardi au Vendredi'),
  (202, '09:00:00', '17:00:00', 'Mardi au Vendredi'),
  (300, '09:30:00', '17:30:00', 'Lundi au Jeudi'),
  (301, '10:00:00', '18:00:00', 'Mardi au Vendredi');

INSERT INTO Exception_horaire (CODE_EMPLOYE, DATE_DEBUT, DATE_FIN, TYPE_EXCEPTION) VALUES
  (100, '2025-07-01', '2025-07-15', 'VACANCES'),
  (101, '2025-08-10', '2025-08-10', 'ATTENTE'),
  (102, '2025-06-05', '2025-06-07', 'VACANCES'),
  (200, '2025-09-12', '2025-09-12', 'VACANCES'),
  (201, '2025-07-20', '2025-07-25', 'ATTENTE'),
  (202, '2025-08-01', '2025-08-14', 'VACANCES');

 INSERT INTO Disponibilite (
   CODE_EMPLOYE, DEBUT_DISPONIBILITE, FIN_DISPONIBILITE, NUM_RDV, STATUT
 ) VALUES
   (100, '2025-07-28 08:00:00','2025-07-28 08:20:00', NULL, 'DISPONIBLE'),
   (100, '2025-07-28 08:35:00','2025-07-28 08:55:00',    1, 'OCCUPÉ'),
   (101, '2025-07-28 09:00:00','2025-07-28 09:20:00', NULL, 'DISPONIBLE'),
   (101, '2025-07-28 09:35:00','2025-07-28 09:55:00',    5, 'OCCUPÉ');


