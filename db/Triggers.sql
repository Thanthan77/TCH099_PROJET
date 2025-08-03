CREATE TRIGGER mise_a_jour_disponibilite_apres_annulation
AFTER UPDATE ON Rendezvous
FOR EACH ROW
BEGIN
  IF OLD.STATUT <> NEW.STATUT AND NEW.STATUT = 'ANNULÉ' THEN
    UPDATE Disponibilite
    SET STATUT = 'DISPONIBLE',
        NUM_RDV = NULL
    WHERE NUM_RDV = NEW.NUM_RDV;
  END IF;
END;


CREATE TRIGGER maj_statut_disponibilite
AFTER INSERT ON Rendezvous
FOR EACH ROW
BEGIN
  UPDATE Disponibilite
  SET STATUT = 'OCCUPÉ', NUM_RDV = NEW.NUM_RDV
  WHERE CODE_EMPLOYE = NEW.CODE_EMPLOYE
    AND JOUR = NEW.JOUR
    AND HEURE = NEW.HEURE
    AND STATUT = 'DISPONIBLE';
END;


CREATE TRIGGER mise_a_jour_disponibilite_apres_modif_rendezvous
AFTER UPDATE ON Rendezvous
FOR EACH ROW
BEGIN
  -- Si la date ou l'heure a changé
  IF OLD.JOUR <> NEW.JOUR OR OLD.HEURE <> NEW.HEURE THEN

    -- Libération de l'ancienne disponibilité
    UPDATE Disponibilite
    SET STATUT = 'DISPONIBLE',
        NUM_RDV = NULL
    WHERE CODE_EMPLOYE = OLD.CODE_EMPLOYE
      AND JOUR = OLD.JOUR
      AND HEURE = OLD.HEURE
      AND NUM_RDV = OLD.NUM_RDV;

    -- Occupation de la nouvelle disponibilité
    UPDATE Disponibilite
    SET STATUT = 'OCCUPÉ',
        NUM_RDV = NEW.NUM_RDV
    WHERE CODE_EMPLOYE = NEW.CODE_EMPLOYE
      AND JOUR = NEW.JOUR
      AND HEURE = NEW.HEURE
      AND STATUT = 'DISPONIBLE';

  END IF;
END; 
