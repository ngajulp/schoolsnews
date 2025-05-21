-- Création des types ENUM requis
CREATE TYPE statut_utilisateur AS ENUM ('actif', 'inactif', 'suspendu', 'archive');
CREATE TYPE sexe_enum AS ENUM ('Masculin', 'Féminin');
CREATE TYPE periode_jour_enum AS ENUM ('matin', 'apres-midi');
CREATE TYPE statut_presence_enum AS ENUM ('present', 'absent', 'retard', 'sortie');
CREATE TYPE niveau_gravite_enum AS ENUM ('leger', 'moyen', 'grave');
CREATE TYPE role_participant_enum AS ENUM ('admin', 'membre');
CREATE TYPE urgence_enum AS ENUM ('normal', 'important', 'critique');
CREATE TYPE etat_envoi_enum AS ENUM ('envoyé', 'échoué', 'en attente');

-- Types ENUM pour remplacer les CHECK constraints
CREATE TYPE cible_type_enum AS ENUM ('classe', 'groupe', 'role', 'tous');
CREATE TYPE niveau_acces_enum AS ENUM ('public', 'restreint', 'prive');
CREATE TYPE statut_pret_enum AS ENUM ('en cours', 'retourne', 'retard');
CREATE TYPE type_mouvement_enum AS ENUM ('entrée', 'sortie');
CREATE TYPE type_beneficiaire_enum AS ENUM ('apprenant', 'personnel');
CREATE TYPE statut_bus_enum AS ENUM ('actif', 'en maintenance', 'hors service');
CREATE TYPE usager_type_enum AS ENUM ('apprenant', 'personnel');
CREATE TYPE type_matiere_enum AS ENUM ('principale', 'secondaire', 'optionnelle');
CREATE TYPE statut_campagne_enum AS ENUM ('programmé', 'envoyé', 'échec', 'annulé');
CREATE TYPE statut_envoi_enum AS ENUM ('envoyé', 'erreur', 'en attente');
CREATE TYPE type_indicateur_enum AS ENUM ('academique', 'financier', 'discipline');
CREATE TYPE statut_archive_enum AS ENUM ('archivé');
CREATE TYPE type_certificat_enum AS ENUM ('attestation', 'diplome', 'certificat');
CREATE TYPE type_evenement_enum AS ENUM ('Réunion', 'Sortie', 'Cérémonie', 'Compétition');
CREATE TYPE type_modele_enum AS ENUM ('Inscription', 'Attestation', 'Bulletin', 'Certificat');
CREATE TYPE type_suivi_enum AS ENUM ('Observation', 'Incident', 'Entretien', 'PAI');
CREATE TYPE statut_rdv_enum AS ENUM ('prévu', 'terminé', 'annulé');
CREATE TYPE statut_participation_enum AS ENUM ('confirmé', 'annulé', 'non confirmé');

-- ENUMS
CREATE TYPE etat_decision_enum AS ENUM ('en attente', 'en cours', 'terminé');
CREATE TYPE type_support_enum AS ENUM ('pdf', 'video', 'lien', 'audio');
CREATE TYPE type_club_enum AS ENUM ('Sport', 'Art', 'Culture', 'Environnement');
CREATE TYPE type_question_enum AS ENUM ('qcm', 'texte');

-- Définition des ENUM
CREATE TYPE genre_enum AS ENUM ('Masculin', 'Féminin');
CREATE TYPE statut_livrable_enum AS ENUM ('En cours', 'Terminé', 'En retard');
CREATE TYPE type_consentement_enum AS ENUM ('stockage_photo', 'notifications');
CREATE TYPE type_demande_enum AS ENUM ('acces', 'rectification', 'effacement', 'export');
CREATE TYPE statut_demande_enum AS ENUM ('En attente', 'Traitée', 'Rejetée');
CREATE TYPE action_module_enum AS ENUM ('Bulletin', 'Présence', 'Finance');
CREATE TYPE type_don_enum AS ENUM ('Financier', 'Matériel', 'Service');
CREATE TYPE statut_stage_enum AS ENUM ('En cours', 'Terminé', 'Annulé');


CREATE TYPE type_concours_enum AS ENUM ('Interne', 'Régional', 'National', 'International');
CREATE TYPE statut_concours_enum AS ENUM ('Prévu', 'Terminé', 'Annulé');
CREATE TYPE statut_absence_enum AS ENUM ('Validée', 'En attente', 'Rejetée','prévu', 'terminé');
CREATE TYPE statut_remplacement_enum AS ENUM ('Proposé', 'Accepté', 'Refusé', 'Confirmé');
CREATE TYPE type_partenaire_enum AS ENUM ('Entreprise', 'Université', 'ONG', 'Institution', 'Individuel');
CREATE TYPE statut_partenaire_enum AS ENUM ('Actif', 'Inactif', 'Suspendu', 'Terminé');
CREATE TYPE statut_convention_enum AS ENUM ('Valide', 'Expiré', 'En négociation');
CREATE TYPE type_activite_enum AS ENUM ('Intervention', 'Don', 'Formation', 'Stage');
CREATE TYPE type_evaluation_enum AS ENUM ('Inspection externe', 'Audit interne');
CREATE TYPE statut_evaluation_enum AS ENUM ('Planifiée', 'En cours', 'Clôturée');
CREATE TYPE categorie_critere_enum AS ENUM ('Pédagogie', 'Organisation');
CREATE TYPE type_contrat_enum AS ENUM ('vacataire', 'temps partiel');


CREATE TYPE statut_intervention AS ENUM ('validée', 'annulée', 'non déclarée');
CREATE TYPE statut_paiement_vacataire AS ENUM ('payé', 'en attente');
CREATE TYPE session_examen AS ENUM ('Juin 2025', 'Août 2025');
CREATE TYPE statut_inscription AS ENUM ('enregistré', 'validé', 'en attente');
CREATE TYPE format_formation AS ENUM ('Présentiel', 'En ligne');
CREATE TYPE statut_formation AS ENUM ('prévu', 'terminé', 'annulé');
CREATE TYPE langue_parent AS ENUM ('FR', 'EN');
CREATE TYPE domaine_projet AS ENUM ('Écologie', 'Solidarité', 'Innovation');
CREATE TYPE etat_projet AS ENUM ('Planifié', 'En cours', 'Terminé', 'Suspendu');
CREATE TYPE type_participant AS ENUM ('eleve', 'enseignant', 'partenaire');
CREATE TYPE statut_jalon AS ENUM ('À faire', 'En cours', 'Terminé');
CREATE TYPE role_departement_enum AS ENUM ('membre', 'coordinateur', 'rédacteur');

CREATE TYPE type_rgpd_enum AS ENUM ('export', 'suppression');
CREATE TYPE statut_rgpd_enum AS ENUM ('en attente', 'traité');


-- Table des établissements
CREATE TABLE etablissements (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  code VARCHAR(20) UNIQUE,
  type VARCHAR(50), -- Ex : École primaire, Collège, Lycée, Université
  adresse TEXT,
  telephone VARCHAR(20),
  email VARCHAR(100),
  directeur VARCHAR(100),
  site_web VARCHAR(100),
  logo_url TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tables

CREATE TABLE niveaux_scolaires (
  id SERIAL PRIMARY KEY,
  libelle_fr VARCHAR(100),
  libelle_en VARCHAR(100),
  ordre INTEGER,
  cycle VARCHAR(50), -- Ex : Maternelle, Primaire, Collège, Lycée
  filiere VARCHAR(50), -- Ex : Général, Technique
  actif BOOLEAN DEFAULT TRUE,               -- pour désactiver d’anciens niveaux si besoin
  cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);


CREATE TABLE utilisateurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe TEXT NOT NULL,
  telephone VARCHAR(30),
  statut statut_utilisateur DEFAULT 'inactif',
  date_creation TIMESTAMP DEFAULT NOW(),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE type_employes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) UNIQUE -- exemple : Enseignant, Économe, Proviseur, Surveillant
);

CREATE TABLE employes (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  type_employe_id INTEGER REFERENCES type_employes(id),
  matricule VARCHAR(50),
  nom VARCHAR(100),
  prenom VARCHAR(100),
  poste VARCHAR(100),
  date_recrutement DATE,
  salaire NUMERIC(10,2),
  photo_url TEXT
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  fonctionnalite VARCHAR(100),
  peut_voir BOOLEAN DEFAULT FALSE,
  peut_ajouter BOOLEAN DEFAULT FALSE,
  peut_modifier BOOLEAN DEFAULT FALSE,
  peut_supprimer BOOLEAN DEFAULT FALSE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE utilisateur_roles (
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  role_id INTEGER REFERENCES roles(id),
  etablissement_id INTEGER REFERENCES etablissements(id),
  PRIMARY KEY (utilisateur_id, role_id)
);

CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id),
  permission_id INTEGER REFERENCES permissions(id),
  etablissement_id INTEGER REFERENCES etablissements(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE logs_connexions (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  date_connexion TIMESTAMP DEFAULT NOW(),
  ip_connexion VARCHAR(50),
  user_agent TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE roles_personnalises (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  cree_par INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT NOW(),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE role_personnalise_permissions (
  role_id INTEGER REFERENCES roles_personnalises(id),
  permission_id INTEGER REFERENCES permissions(id),
  etablissement_id INTEGER REFERENCES etablissements(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE utilisateur_role_personnalise (
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  role_id INTEGER REFERENCES roles_personnalises(id),
  etablissement_id INTEGER REFERENCES etablissements(id),
  PRIMARY KEY (utilisateur_id, role_id)
);

CREATE TABLE niveaux (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) UNIQUE NOT NULL,
  cycle VARCHAR(50),
  rang_pedagogique INTEGER,
  langue_enseignement VARCHAR(30),
  duree_academique VARCHAR(30),
  is_examen BOOLEAN DEFAULT FALSE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE annees_academiques (
  id SERIAL PRIMARY KEY,
  annee VARCHAR(20) UNIQUE NOT NULL,
  date_debut DATE,
  date_fin DATE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE salles (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50),
  capacite INTEGER,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  niveau_id INTEGER NOT NULL REFERENCES niveaux_scolaires(id),
  annee_scolaire_id INTEGER REFERENCES annees_academiques(id),
  enseignant_principal_id INTEGER REFERENCES utilisateurs(id),
  serie VARCHAR(30),
  effectif_max INTEGER,
  salle_id INTEGER REFERENCES salles(id),
  statut VARCHAR(20) DEFAULT 'Active',
  etablissement_id INTEGER REFERENCES etablissements(id),
  UNIQUE(nom, annee_scolaire_id, etablissement_id)
);
  
  
CREATE TABLE apprenants (
  id SERIAL PRIMARY KEY,
  matricule VARCHAR(30) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100),
  date_naissance DATE NOT NULL,
  date_inscription DATE DEFAULT CURRENT_DATE,
  statut VARCHAR(30) DEFAULT 'actif', -- actif, transféré, exclu, diplômé, etc.
  lieu_naissance VARCHAR(100),
  sexe sexe_enum,
  nationalite VARCHAR(50),
  adresse TEXT,
  email VARCHAR(100),
  type_apprenant VARCHAR(30),
  situation_medicale TEXT,
  statut_inscription VARCHAR(30) DEFAULT 'Inscrit',
  classe_actuelle_id INTEGER REFERENCES classes(id),
  annee_scolaire_id INTEGER REFERENCES annees_academiques(id),
  photo_url TEXT,
  cree_le TIMESTAMP DEFAULT NOW(),
  etablissement_id INTEGER REFERENCES etablissements(id)
);


CREATE TABLE matieres (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  langue VARCHAR(20),
  coefficient INTEGER DEFAULT 1,
  type VARCHAR(30),
  est_a_examen BOOLEAN DEFAULT FALSE,
  est_active BOOLEAN DEFAULT TRUE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE niveau_matiere (
  id SERIAL PRIMARY KEY,
  niveau_id INTEGER REFERENCES niveaux(id),
  matiere_id INTEGER REFERENCES matieres(id),
  etablissement_id INTEGER REFERENCES etablissements(id),
  UNIQUE(niveau_id, matiere_id)
);

CREATE TABLE enseignant_matiere (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  matiere_id INTEGER REFERENCES matieres(id),
  niveau_id INTEGER REFERENCES niveaux(id),
  etablissement_id INTEGER REFERENCES etablissements(id),
  UNIQUE(utilisateur_id, matiere_id, niveau_id)
);

CREATE TABLE creneaux (
  id SERIAL PRIMARY KEY,
  jour_semaine VARCHAR(10),
  heure_debut TIME,
  heure_fin TIME,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE emplois_du_temps (
  id SERIAL PRIMARY KEY,
  classe_id INTEGER REFERENCES classes(id),
  matiere_id INTEGER REFERENCES matieres(id),
  employes_id INTEGER REFERENCES utilisateurs(id),
  creneau_id INTEGER REFERENCES creneaux(id),
  salle_id INTEGER REFERENCES salles(id),
  annee_scolaire_id INTEGER REFERENCES annees_academiques(id),
  jour_semaine VARCHAR(10),
  etablissement_id INTEGER REFERENCES etablissements(id),
  UNIQUE(classe_id, creneau_id, jour_semaine)
);

CREATE TABLE trimestres (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(30),
  numero INTEGER,
  annee_academique_id INTEGER REFERENCES annees_academiques(id),
  date_debut DATE,
  date_fin DATE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE sequences (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  nom VARCHAR(50),
  trimestre_id INTEGER REFERENCES trimestres(id),
  annee_academique_id INTEGER REFERENCES annees_academiques(id),
  date_debut DATE,
  date_fin DATE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE bulletins (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  classe_id INTEGER REFERENCES classes(id),
  sequence_id INTEGER REFERENCES sequences(id),
  moyenne_generale NUMERIC(5,2),
  rang_classe INTEGER,
  mention VARCHAR(30),
  apprec_generale TEXT,
  absences INTEGER,
  retards INTEGER,
  comportement TEXT,
  statut_validation BOOLEAN DEFAULT FALSE,
  date_generation TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  matiere_id INTEGER REFERENCES matieres(id),
  employes_id INTEGER REFERENCES utilisateurs(id),
  classe_id INTEGER REFERENCES classes(id),
  sequence_id INTEGER REFERENCES sequences(id),
  type_evaluation VARCHAR(30),
  note NUMERIC(5,2) CHECK (note >= 0 AND note <= 20),
  coefficient INTEGER DEFAULT 1,
  date_saisie TIMESTAMP DEFAULT NOW(),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE appreciations (
  id SERIAL PRIMARY KEY,
  seuil_min NUMERIC(5,2),
  seuil_max NUMERIC(5,2),
  mention VARCHAR(20),
  apprec_automatique TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE presences (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  classe_id INTEGER REFERENCES classes(id),
  date_presence DATE NOT NULL,
  periode_jour periode_jour_enum,
  statut_presence statut_presence_enum,
  heure_arrivee TIME,
  justification TEXT,
  employes_id INTEGER REFERENCES utilisateurs(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE comportements (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  date_incident DATE NOT NULL,
  type_comportement VARCHAR(100),
  niveau_gravite niveau_gravite_enum,
  description TEXT,
  employes_id INTEGER REFERENCES utilisateurs(id),
  statut_traitement VARCHAR(30) DEFAULT 'non traité',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE sanctions (
  id SERIAL PRIMARY KEY,
  comportement_id INTEGER REFERENCES comportements(id),
  type_sanction VARCHAR(50),
  description TEXT,
  date_sanction DATE,
  duree_jours INTEGER,
  documents_justificatifs TEXT,
  personnel_id INTEGER REFERENCES utilisateurs(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE groupes_chat (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  cree_par INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE participants_groupes_chat (
  id SERIAL PRIMARY KEY,
  groupe_id INTEGER NOT NULL REFERENCES groupes_chat(id) ON DELETE CASCADE,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  role role_participant_enum DEFAULT 'membre',
  etablissement_id INTEGER REFERENCES etablissements(id),
  UNIQUE(groupe_id, utilisateur_id)
);

CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  message TEXT,
  fichier_url TEXT,
  expediteur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  destinataire_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
  groupe_id INTEGER REFERENCES groupes_chat(id) ON DELETE CASCADE,
  horodatage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lu BOOLEAN DEFAULT FALSE,
  etablissement_id INTEGER REFERENCES etablissements(id),
  CHECK (
    (groupe_id IS NOT NULL AND destinataire_id IS NULL) OR 
    (groupe_id IS NULL AND destinataire_id IS NOT NULL)
  )
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100),
  niveau_urgence urgence_enum DEFAULT 'normal',
  lu BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE notification_settings (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  canal_email BOOLEAN DEFAULT TRUE,
  canal_sms BOOLEAN DEFAULT FALSE,
  canal_push BOOLEAN DEFAULT TRUE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE emails_envoyes (
  id SERIAL PRIMARY KEY,
  destinataire_email VARCHAR(255) NOT NULL,
  sujet VARCHAR(255),
  contenu TEXT NOT NULL,
  fichier_joint TEXT,
  envoye_par INTEGER REFERENCES utilisateurs(id),
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etat_envoi etat_envoi_enum DEFAULT 'envoyé',
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE sms_envoyes (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(20) NOT NULL,
  contenu TEXT NOT NULL,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  envoye_par INTEGER REFERENCES utilisateurs(id),
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etat_envoi etat_envoi_enum DEFAULT 'envoyé',
  etablissement_id INTEGER REFERENCES etablissements(id)
);




























CREATE TABLE annonces (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    cible_type cible_type_enum NOT NULL,
    cible_id INTEGER,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    publie_par INTEGER REFERENCES utilisateurs(id),
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    fichier_url TEXT NOT NULL,
    type_document VARCHAR(100),
    niveau_acces niveau_acces_enum DEFAULT 'prive',
    utilisateur_cible_id INTEGER REFERENCES utilisateurs(id),
    classe_cible_id INTEGER REFERENCES classes(id),
    uploader_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version VARCHAR(50) DEFAULT '1.0'
);

CREATE TABLE telechargements_documents (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    date_telechargement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ouvrages (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    titre VARCHAR(255) NOT NULL,
    auteur VARCHAR(255),
    isbn VARCHAR(20) UNIQUE,
    niveau_conseille VARCHAR(100),
    nombre_exemplaires INTEGER DEFAULT 1 CHECK (nombre_exemplaires >= 0),
    couverture_url TEXT,
    resume TEXT
);

CREATE TABLE prets_ouvrages (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    ouvrage_id INTEGER NOT NULL REFERENCES ouvrages(id),
    apprenant_id INTEGER NOT NULL REFERENCES apprenants(id),
    date_pret DATE NOT NULL,
    date_retour_prevue DATE,
    date_retour_effective DATE,
    penalite_montant NUMERIC(10,2) DEFAULT 0.00,
    statut statut_pret_enum DEFAULT 'en cours'
);

CREATE TABLE materiels (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    quantite_disponible INTEGER DEFAULT 0,
    seuil_alerte INTEGER DEFAULT 5,
    unite VARCHAR(50) DEFAULT 'unité',
    categorie VARCHAR(100),
    lieu_stockage VARCHAR(255)
);

CREATE TABLE mouvements_stock (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    materiel_id INTEGER NOT NULL REFERENCES materiels(id),
    type_mouvement type_mouvement_enum,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responsable_id INTEGER REFERENCES utilisateurs(id),
    motif TEXT
);

CREATE TABLE attributions_materiel (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    materiel_id INTEGER NOT NULL REFERENCES materiels(id),
    type_beneficiaire type_beneficiaire_enum NOT NULL,
    beneficiaire_id INTEGER NOT NULL,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantite INTEGER CHECK (quantite > 0),
    commentaire TEXT
);

CREATE TABLE bus (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    numero_plaque VARCHAR(50) UNIQUE NOT NULL,
    capacite INTEGER NOT NULL CHECK (capacite > 0),
    statut statut_bus_enum DEFAULT 'actif',
    date_mise_en_service DATE,
    date_assurance DATE,
    commentaires TEXT
);

CREATE TABLE chauffeurs (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    numero_permis VARCHAR(100) UNIQUE,
    date_expiration_permis DATE,
    adresse TEXT
);

CREATE TABLE bus_chauffeurs (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    bus_id INTEGER REFERENCES bus(id) ON DELETE CASCADE,
    chauffeur_id INTEGER REFERENCES chauffeurs(id) ON DELETE SET NULL,
    date_affectation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE itineraires (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(255) NOT NULL,
    ligne_code VARCHAR(50),
    point_depart VARCHAR(255),
    point_arrivee VARCHAR(255),
    distance_km NUMERIC(6,2),
    duree_estimee_minutes INTEGER,
    bus_id INTEGER REFERENCES bus(id),
    chauffeur_id INTEGER REFERENCES chauffeurs(id)
);

CREATE TABLE arrets (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE itineraires_arrets (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    itineraire_id INTEGER REFERENCES itineraires(id) ON DELETE CASCADE,
    arret_id INTEGER REFERENCES arrets(id),
    ordre_passage INTEGER NOT NULL,
    heure_prevue TIME
);

CREATE TABLE affectations_transport (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    itineraire_id INTEGER REFERENCES itineraires(id),
    arret_id INTEGER REFERENCES arrets(id),
    usager_type usager_type_enum NOT NULL,
    usager_id INTEGER NOT NULL,
    jours_semaine VARCHAR(100),
    periode TEXT,
    date_affectation DATE DEFAULT CURRENT_DATE
);

CREATE TABLE historiques_trajets (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    itineraire_id INTEGER REFERENCES itineraires(id),
    date_trajet DATE NOT NULL,
    heure_depart TIME,
    heure_arrivee TIME,
    incidents TEXT,
    conducteur_id INTEGER REFERENCES chauffeurs(id)
);

CREATE TABLE departements (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    couleur VARCHAR(10),
    actif BOOLEAN DEFAULT TRUE,
    responsable_id INTEGER REFERENCES utilisateurs(id),
    parent_id INTEGER REFERENCES departements(id)
);





CREATE TABLE matieres_departements (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    matiere_id INTEGER NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
    departement_id INTEGER NOT NULL REFERENCES departements(id) ON DELETE CASCADE,
    type_matiere type_matiere_enum DEFAULT 'principale',
    UNIQUE(matiere_id, departement_id)
);

CREATE TABLE membres_departements (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    departement_id INTEGER NOT NULL REFERENCES departements(id),
    role_in_departement role_departement_enum,
    date_affectation DATE DEFAULT CURRENT_DATE,
    UNIQUE(utilisateur_id, departement_id)
);

CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(100) NOT NULL,
    sujet VARCHAR(200) NOT NULL,
    corps TEXT NOT NULL,
    langue VARCHAR(10) DEFAULT 'fr',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_campaigns (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    template_id INTEGER REFERENCES email_templates(id),
    sujet_personnalise VARCHAR(200),
    corps_personnalise TEXT,
    planifie_pour TIMESTAMP,
    cree_par INTEGER REFERENCES utilisateurs(id),
    statut statut_campagne_enum DEFAULT 'programmé',
    cible JSONB
);

CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    destinataire_email VARCHAR(150),
    sujet VARCHAR(200),
    contenu TEXT,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut_envoi statut_envoi_enum,
    erreur_message TEXT,
    campaign_id INTEGER REFERENCES email_campaigns(id)
);

CREATE TABLE indicateurs_kpi (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    type type_indicateur_enum,
    code_unique VARCHAR(50) UNIQUE,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE indicateur_valeurs (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    indicateur_id INTEGER REFERENCES indicateurs_kpi(id),
    valeur NUMERIC,
    periode VARCHAR(50),
    classe_id INTEGER,
    niveau_id INTEGER,
    employes_id INTEGER,
    apprenant_id INTEGER,
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE archives_annee_scolaire (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    annee VARCHAR(10) NOT NULL,
    date_cloture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id INTEGER REFERENCES utilisateurs(id),
    commentaire TEXT,
    statut statut_archive_enum
);


CREATE TABLE rgpd_demandes (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  type_demande type_demande_enum,
  statut statut_demande_enum DEFAULT 'En attente',
  commentaire TEXT,
  date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_traitement TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id),
  admin_id INTEGER REFERENCES utilisateurs(id)
);
 
CREATE TABLE logs_audit (
    id SERIAL PRIMARY KEY,
    etablissement_id INTEGER NOT NULL REFERENCES etablissements(id),
    utilisateur_id INTEGER REFERENCES utilisateurs(id),
    action TEXT,
    cible TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    details TEXT
);







CREATE TABLE certificats (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  type_certificat VARCHAR(50),
  contenu_json JSONB,
  date_emission DATE DEFAULT CURRENT_DATE,
  signature_pdf BOOLEAN DEFAULT FALSE,
  qr_code_url TEXT,
  emis_par INTEGER REFERENCES utilisateurs(id)
);

CREATE TABLE anciens_eleves (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  apprenant_id INTEGER UNIQUE REFERENCES apprenants(id),
  annee_sortie INTEGER,
  motif_sortie TEXT,
  parcours_post_scolaire TEXT,
  contact_email TEXT,
  contact_tel TEXT,
  recontacte BOOLEAN DEFAULT FALSE
);


CREATE TABLE modeles_documents (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  nom_modele VARCHAR(100),
  contenu_html TEXT,
  type_modele type_modele_enum,
  langue VARCHAR(10),
  cree_par INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents_generes (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  modele_id INTEGER REFERENCES modeles_documents(id),
  cible_type VARCHAR(20), -- "apprenant", "enseignant", etc.
  cible_id INTEGER,
  contenu_final TEXT,
  fichier_pdf TEXT,
  date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  genere_par INTEGER REFERENCES utilisateurs(id)
);

CREATE TABLE suivis_psychopedagogiques (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  auteur_id INTEGER REFERENCES utilisateurs(id),
  titre VARCHAR(255),
  commentaire TEXT,
  type_suivi type_suivi_enum,
  visible_par TEXT[]
);

CREATE TABLE plans_accompagnement (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  date_debut DATE,
  date_fin DATE,
  objectifs TEXT,
  actions_prevues TEXT,
  intervenants TEXT,
  cree_par INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rdv_psychopedagogiques (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  intervenant_id INTEGER REFERENCES utilisateurs(id),
  date_rdv TIMESTAMP,
  lieu VARCHAR(100),
  compte_rendu TEXT,
  statut statut_rdv_enum DEFAULT 'prévu',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents_comportementaux (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  date_incident DATE,
  type_incident VARCHAR(100),
  description TEXT,
  mesures_prises TEXT,
  lie_a_suivi BOOLEAN DEFAULT FALSE,
  auteur_id INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evenements (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  titre VARCHAR(255),
  type_evenement VARCHAR(100), -- Ex: "Réunion", "Sortie", "Cérémonie", "Compétition"
  description TEXT,
  date_debut TIMESTAMP,
  date_fin TIMESTAMP,
  lieu VARCHAR(255),
  cible_participation TEXT, -- ex: "tous", "parents", "enseignants", "classe:4eA"
  document_joint VARCHAR(255),
  cree_par INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participants_evenement (
  id SERIAL PRIMARY KEY,
  evenement_id INTEGER REFERENCES evenements(id),
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  statut_participation statut_participation_enum DEFAULT 'non confirmé',
  presence BOOLEAN DEFAULT FALSE,
  motif_absence TEXT
);
















































-- TABLES

CREATE TABLE comptes_rendus_evenement (
  id SERIAL PRIMARY KEY,
  evenement_id INTEGER REFERENCES evenements(id),
  auteur_id INTEGER REFERENCES utilisateurs(id),
  compte_rendu TEXT,
  document_pdf VARCHAR(255),
  date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE decisions_evenement (
  id SERIAL PRIMARY KEY,
  evenement_id INTEGER REFERENCES evenements(id),
  description TEXT,
  responsable_id INTEGER REFERENCES utilisateurs(id),
  etat etat_decision_enum DEFAULT 'en attente',
  date_echeance DATE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE cours_en_ligne (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255),
  description TEXT,
  classe_id INTEGER REFERENCES classes(id),
  matiere_id INTEGER REFERENCES matieres(id),
  employes_id INTEGER REFERENCES utilisateurs(id),
  date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE supports_cours (
  id SERIAL PRIMARY KEY,
  cours_id INTEGER REFERENCES cours_en_ligne(id),
  type_support type_support_enum,
  titre VARCHAR(255),
  url_fichier TEXT,
  ordre_affichage INTEGER,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE devoirs (
  id SERIAL PRIMARY KEY,
  cours_id INTEGER REFERENCES cours_en_ligne(id),
  titre VARCHAR(255),
  instructions TEXT,
  date_limite TIMESTAMP,
  fichier_joint VARCHAR(255),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE soumissions_devoirs (
  id SERIAL PRIMARY KEY,
  devoir_id INTEGER REFERENCES devoirs(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  fichier_soumis VARCHAR(255),
  commentaire_apprenant TEXT,
  date_soumission TIMESTAMP,
  note NUMERIC(5,2),
  commentaire_correction TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE quiz (
  id SERIAL PRIMARY KEY,
  cours_id INTEGER REFERENCES cours_en_ligne(id),
  titre VARCHAR(255),
  description TEXT,
  duree_minutes INTEGER,
  visible_de TIMESTAMP,
  visible_jusquau TIMESTAMP,
  tentative_max INTEGER,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id),
  type_question type_question_enum,
  question TEXT,
  bonne_reponse TEXT,
  choix_1 TEXT,
  choix_2 TEXT,
  choix_3 TEXT,
  choix_4 TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE reponses_quiz (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id),
  question_id INTEGER REFERENCES questions(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  reponse TEXT,
  est_correct BOOLEAN,
  date_reponse TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  type_club type_club_enum,
  description TEXT,
  encadreur_id INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE membres_clubs (
  id SERIAL PRIMARY KEY,
  club_id INTEGER REFERENCES clubs(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actif BOOLEAN DEFAULT TRUE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE activites_club (
  id SERIAL PRIMARY KEY,
  club_id INTEGER REFERENCES clubs(id),
  titre VARCHAR(255),
  description TEXT,
  date_activite DATE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE cantine_inscriptions (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  periode VARCHAR(100), -- exemple : "Trimestre 1 2025"
  date_inscription DATE,
  paye BOOLEAN DEFAULT FALSE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE cantine_menus (
  id SERIAL PRIMARY KEY,
  date_service DATE,
  plat_principal VARCHAR(255),
  accompagnement VARCHAR(255),
  dessert VARCHAR(255),
  boisson VARCHAR(255),
  remarque TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE cantine_presence (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  date DATE,
  present BOOLEAN,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

































-- Tables

CREATE TABLE dortoirs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  genre genre_enum,
  capacite INTEGER,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE lits (
  id SERIAL PRIMARY KEY,
  dortoir_id INTEGER REFERENCES dortoirs(id),
  numero_lit INTEGER,
  disponible BOOLEAN DEFAULT TRUE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE internes (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  lit_id INTEGER REFERENCES lits(id),
  date_entree DATE,
  date_sortie_prevue DATE,
  remarque TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE permissions_sortie (
  id SERIAL PRIMARY KEY,
  interne_id INTEGER REFERENCES internes(id),
  date_sortie DATE,
  date_retour_prevue DATE,
  date_retour_reelle DATE,
  motif TEXT,
  valide BOOLEAN DEFAULT FALSE,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE projets_pedagogiques (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255),
  description TEXT,
  classe_id INTEGER REFERENCES classes(id),
  employes_id INTEGER REFERENCES utilisateurs(id),
  date_debut DATE,
  date_fin_prevue DATE,
  budget_estime NUMERIC(10,2),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE livrables_projet (
  id SERIAL PRIMARY KEY,
  projet_id INTEGER REFERENCES projets_pedagogiques(id),
  titre VARCHAR(255),
  date_echeance DATE,
  statut statut_livrable_enum,
  fichier_joint VARCHAR(255),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE rgpd_consentements (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  type_consentement type_consentement_enum,
  donne_consentement BOOLEAN,
  date_consentement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  etablissement_id INTEGER REFERENCES etablissements(id)
);


CREATE TABLE journal_audit (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  action VARCHAR(255),
  module action_module_enum,
  cible_type VARCHAR(100),
  cible_id INTEGER,
  valeur_avant TEXT,
  valeur_apres TEXT,
  date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  navigateur TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE INDEX idx_journal_module ON journal_audit(module, cible_type, cible_id);

CREATE TABLE partenaires (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  nom VARCHAR(255) NOT NULL,
  type_partenaire type_partenaire_enum,
  secteur_activite VARCHAR(255),
  secteur_intervention VARCHAR(255),
  pays VARCHAR(100),
  contact_principal VARCHAR(255),
  email_contact VARCHAR(255),
  telephone_contact VARCHAR(50),
  responsable_nom VARCHAR(255),
  date_debut_collab DATE,
  site_web VARCHAR(255),
  adresse TEXT,
  statut statut_partenaire_enum DEFAULT 'Actif',
  commentaire TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE conventions_partenaire (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  partenaire_id INTEGER REFERENCES partenaires(id),
  titre VARCHAR(255),
  description TEXT,
  date_signature DATE,
  date_expiration DATE,
  fichier_convention_pdf VARCHAR(255),
  statut statut_convention_enum DEFAULT 'Valide',
  domaine_collaboration VARCHAR(255),
  responsable_interne_id INTEGER REFERENCES utilisateurs(id),
  date_enregistrement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dons_partenaires (
  id SERIAL PRIMARY KEY,
  partenaire_id INTEGER REFERENCES partenaires(id),
  date_don DATE,
  type_don type_don_enum,
  montant NUMERIC(12, 2),
  description TEXT,
  affectation VARCHAR(255),
  justificatif_document VARCHAR(255),
  utilisateur_enregistrement INTEGER REFERENCES utilisateurs(id),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE impact_partenariats (
  id SERIAL PRIMARY KEY,
  partenaire_id INTEGER REFERENCES partenaires(id),
  convention_id INTEGER REFERENCES conventions_partenaire(id),
  indicateur VARCHAR(255),
  valeur_attendue TEXT,
  valeur_reelle TEXT,
  date_suivi DATE,
  commentaire TEXT,
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE stages (
  id SERIAL PRIMARY KEY,
  apprenant_id INTEGER REFERENCES apprenants(id),
  entreprise_nom VARCHAR(255),
  secteur_activite VARCHAR(255),
  responsable_nom VARCHAR(255),
  contact_responsable VARCHAR(100),
  date_debut DATE,
  date_fin DATE,
  fichier_rapport VARCHAR(255),
  evaluation TEXT,
  statut statut_stage_enum DEFAULT 'En cours',
  utilisateur_enregistrement INTEGER REFERENCES utilisateurs(id),
  etablissement_id INTEGER REFERENCES etablissements(id)
);

CREATE TABLE immersions (
  id SERIAL PRIMARY KEY,
  groupe_id INTEGER REFERENCES classes(id),
  structure_accueil VARCHAR(255),
  domaine VARCHAR(255),
  responsable_accueil VARCHAR(255),
  contact_accueil VARCHAR(100),
  date_immersion DATE,
  duree_heure INTEGER,
  observations TEXT,
  fichier_feedback VARCHAR(255),
  etablissement_id INTEGER REFERENCES etablissements(id)
);


CREATE TABLE concours (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  nom_concours VARCHAR(255) NOT NULL,
  type_concours type_concours_enum,
  organisateur VARCHAR(255),
  date_concours DATE,
  lieu VARCHAR(255),
  theme VARCHAR(255),
  statut statut_concours_enum DEFAULT 'Prévu'
);

CREATE TABLE participation_concours (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  concours_id INTEGER REFERENCES concours(id),
  apprenant_id INTEGER REFERENCES apprenants(id),
  resultat TEXT,
  classement INTEGER,
  récompense VARCHAR(255),
  certificat_pdf VARCHAR(255)
);

CREATE TABLE absences_employes (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  employes_id INTEGER REFERENCES employes(id),
  date_absence DATE,
  heure_debut TIME,
  heure_fin TIME,
  motif TEXT,
  statut statut_absence_enum DEFAULT 'En attente',
  justificatif_pdf VARCHAR(255),
  date_declaration TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE remplacements (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  absence_id INTEGER REFERENCES absences_employes(id),
  remplacant_id INTEGER REFERENCES employes(id),
  classe_id INTEGER REFERENCES classes(id),
  matiere_id INTEGER REFERENCES matieres(id),
  statut_remplacement statut_remplacement_enum DEFAULT 'Proposé',
  date_remplacement DATE,
  heure_debut TIME,
  heure_fin TIME,
  commentaire TEXT
);



CREATE TABLE activites_partenaire (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  convention_id INTEGER REFERENCES conventions_partenaire(id),
  type_activite type_activite_enum,
  titre VARCHAR(255),
  description TEXT,
  date_activite DATE,
  fichier_rapport_pdf VARCHAR(255),
  observations TEXT,
  responsable_interne_id INTEGER REFERENCES utilisateurs(id)
);

CREATE TABLE evaluations_pedagogiques (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  titre VARCHAR(255) NOT NULL,
  type_evaluation type_evaluation_enum,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  statut statut_evaluation_enum DEFAULT 'Planifiée',
  responsable_id INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE criteres_evaluation (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  titre VARCHAR(255),
  categorie categorie_critere_enum,
  description TEXT,
  note_max INTEGER DEFAULT 10,
  actif BOOLEAN DEFAULT true
);

CREATE TABLE grilles_evaluation (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  evaluation_id INTEGER REFERENCES evaluations_pedagogiques(id),
  critere_id INTEGER REFERENCES criteres_evaluation(id),
  note_obtenue INTEGER,
  commentaire TEXT
);

CREATE TABLE observations_evaluation (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  evaluation_id INTEGER REFERENCES evaluations_pedagogiques(id),
  employes_id INTEGER REFERENCES employes(id),
  classe_id INTEGER REFERENCES classes(id),
  date_observation DATE,
  synthese TEXT,
  recommandation TEXT,
  rapport_pdf VARCHAR(255),
  cree_par INTEGER REFERENCES utilisateurs(id),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enseignants_vacataires (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id),
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  telephone VARCHAR(20),
  adresse TEXT,
  date_naissance DATE,
  specialites TEXT,
  date_debut_contrat DATE,
  date_fin_contrat DATE,
  type_contrat type_contrat_enum,
  heures_contractuelles INTEGER,
  actif BOOLEAN DEFAULT TRUE,
  cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE affectations_vacataires (
  id SERIAL PRIMARY KEY,
  vacataire_id INTEGER REFERENCES enseignants_vacataires(id),
  classe_id INTEGER REFERENCES classes(id),
  matiere_id INTEGER REFERENCES matieres(id),
  nb_heures_semaine INTEGER,
  date_affectation DATE,
  commentaire TEXT,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE interventions_vacataires (
  id SERIAL PRIMARY KEY,
  vacataire_id INTEGER REFERENCES enseignants_vacataires(id),
  classe_id INTEGER REFERENCES classes(id),
  matiere_id INTEGER REFERENCES matieres(id),
  date_seance DATE,
  duree_heures NUMERIC(4,2),
  statut statut_intervention DEFAULT 'validée',
  remarque TEXT,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE paiements_vacataires (
  id SERIAL PRIMARY KEY,
  vacataire_id INTEGER REFERENCES enseignants_vacataires(id),
  mois VARCHAR(7), -- exemple : '2025-05'
  heures_total NUMERIC(5,2),
  tarif_horaire NUMERIC(6,2),
  montant_brut NUMERIC(10,2),
  statut_paiement statut_paiement_vacataire DEFAULT 'en attente',
  date_paiement DATE,
  fiche_pdf VARCHAR(255),
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE examens_officiels (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  niveau_scolaire_id INTEGER REFERENCES niveaux_scolaires(id),
  annee_scolaire VARCHAR(9),
  session session_examen,
  date_examen DATE,
  centre_examen VARCHAR(100),
  cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);



CREATE TABLE candidats_examens (
  id SERIAL PRIMARY KEY,
  eleve_id INTEGER REFERENCES apprenants(id),
  examen_id INTEGER REFERENCES examens_officiels(id),
  numero_inscription VARCHAR(50) UNIQUE,
  statut_inscription statut_inscription DEFAULT 'enregistré',
  dossier_complet BOOLEAN DEFAULT FALSE,
  observation TEXT,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE epreuves_examens (
  id SERIAL PRIMARY KEY,
  examen_id INTEGER REFERENCES examens_officiels(id),
  matiere_id INTEGER REFERENCES matieres(id),
  date_epreuve DATE,
  heure_debut TIME,
  duree_minutes INTEGER,
  salle_examen VARCHAR(50),
  coefficient INTEGER,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE notes_examens (
  id SERIAL PRIMARY KEY,
  candidat_id INTEGER REFERENCES candidats_examens(id),
  epreuve_id INTEGER REFERENCES epreuves_examens(id),
  note NUMERIC(5,2),
  valide BOOLEAN DEFAULT FALSE,
  remarque TEXT,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE resultats_examens (
  id SERIAL PRIMARY KEY,
  candidat_id INTEGER REFERENCES candidats_examens(id),
  moyenne_finale NUMERIC(5,2),
  mention VARCHAR(50),
  decision_finale VARCHAR(20), -- admis, recalé
  date_resultat DATE,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE formations (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(150),
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  format format_formation,
  lieu VARCHAR(150),
  formateur VARCHAR(100),
  statut statut_formation DEFAULT 'prévu',
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE participation_formations (
  id SERIAL PRIMARY KEY,
  formation_id INTEGER REFERENCES formations(id),
  employes_id INTEGER REFERENCES employes(id),
  present BOOLEAN DEFAULT FALSE,
  evaluation_note NUMERIC(3,1),
  attestation_url TEXT,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE parents (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  telephone VARCHAR(20),
  mot_de_passe TEXT,
  langue_preferee langue_parent DEFAULT 'FR',
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE parent_eleve (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES parents(id),
  eleve_id INTEGER REFERENCES apprenants(id),
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE projets_communautaires (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(150),
  description TEXT,
  domaine domaine_projet,
  date_debut DATE,
  date_fin DATE,
  etat etat_projet DEFAULT 'Planifié',
  fichier_support TEXT,
  bilan_url TEXT,
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE participants_projet (
  id SERIAL PRIMARY KEY,
  projet_id INTEGER REFERENCES projets_communautaires(id),
  type_participant type_participant,
  participant_id INTEGER,
  role VARCHAR(100),
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE jalons_projet (
  id SERIAL PRIMARY KEY,
  projet_id INTEGER REFERENCES projets_communautaires(id),
  nom VARCHAR(100),
  description TEXT,
  date_prevue DATE,
  statut statut_jalon DEFAULT 'À faire',
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

CREATE TABLE indicateurs_projet (
  id SERIAL PRIMARY KEY,
  projet_id INTEGER REFERENCES projets_communautaires(id),
  nom VARCHAR(100),
  valeur_attendue TEXT,
  valeur_reelle TEXT,
  unite VARCHAR(20),
  etablissement_id INTEGER NOT NULL REFERENCES etablissements(id)
);

