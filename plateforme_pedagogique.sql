-- ============================================================
--  Plateforme de suivi pédagogique des étudiants
--  Cahier des charges – Projet de fin d'année
--  Base de données PostgreSQL
-- ============================================================

-- ============================================================
--  EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  ENUMÉRATIONS
-- ============================================================

CREATE TYPE role_utilisateur AS ENUM (
    'administrateur',
    'enseignant',
    'responsable_pedagogique'
);

CREATE TYPE type_evaluation AS ENUM (
    'controle_continu',
    'examen_final',
    'tp',
    'projet',
    'rattrapage',
    'autre'
);

CREATE TYPE niveau_alerte AS ENUM (
    'info',
    'avertissement',
    'critique'
);

CREATE TYPE statut_alerte AS ENUM (
    'ouverte',
    'en_cours',
    'resolue',
    'ignoree'
);

CREATE TYPE statut_etudiant AS ENUM (
    'actif',
    'suspendu',
    'diplome',
    'abandonne'
);

CREATE TYPE semestre AS ENUM (
    'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'
);

CREATE TYPE statut_validation AS ENUM (
    'valide',
    'rattrapage',
    'echec',
    'en_attente'
);

-- ============================================================
--  1. GESTION DES UTILISATEURS
-- ============================================================

CREATE TABLE utilisateur (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe    TEXT NOT NULL,  -- hash bcrypt
    role            role_utilisateur NOT NULL,
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    derniere_connexion TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  2. STRUCTURE PÉDAGOGIQUE
-- ============================================================

CREATE TABLE formation (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    libelle         VARCHAR(200) NOT NULL,
    description     TEXT,
    duree_semestres SMALLINT NOT NULL DEFAULT 6,
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE promotion (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formation_id    UUID NOT NULL REFERENCES formation(id),
    annee_debut     SMALLINT NOT NULL,  -- ex: 2023
    annee_fin       SMALLINT NOT NULL,  -- ex: 2026
    libelle         VARCHAR(100) NOT NULL,  -- ex: "Promo 2023-2026"
    responsable_id  UUID REFERENCES utilisateur(id),
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (formation_id, annee_debut)
);

CREATE TABLE groupe (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id    UUID NOT NULL REFERENCES promotion(id),
    code            VARCHAR(30) NOT NULL,
    libelle         VARCHAR(100) NOT NULL,  -- ex: "Groupe A", "TD1"
    capacite_max    SMALLINT,
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (promotion_id, code)
);

CREATE TABLE matiere (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(30) NOT NULL UNIQUE,
    libelle         VARCHAR(200) NOT NULL,
    description     TEXT,
    coefficient     NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    credits_ects    SMALLINT,
    semestre        semestre,
    note_minimale   NUMERIC(5,2) DEFAULT 10.0,  -- seuil de validation
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Association matières <-> promotions (programme)
CREATE TABLE programme (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id    UUID NOT NULL REFERENCES promotion(id),
    matiere_id      UUID NOT NULL REFERENCES matiere(id),
    semestre        semestre NOT NULL,
    obligatoire     BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (promotion_id, matiere_id, semestre)
);

-- ============================================================
--  3. ÉTUDIANTS
-- ============================================================

CREATE TABLE etudiant (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_etudiant VARCHAR(20) NOT NULL UNIQUE,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    telephone       VARCHAR(20),
    date_naissance  DATE,
    statut          statut_etudiant NOT NULL DEFAULT 'actif',
    promotion_id    UUID NOT NULL REFERENCES promotion(id),
    groupe_id       UUID REFERENCES groupe(id),
    date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  4. ENSEIGNANTS & AFFECTATIONS
-- ============================================================

CREATE TABLE enseignant (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id  UUID NOT NULL UNIQUE REFERENCES utilisateur(id),
    specialite      VARCHAR(200),
    grade           VARCHAR(100),
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Affectation enseignant <-> groupe <-> matière
CREATE TABLE affectation (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enseignant_id   UUID NOT NULL REFERENCES enseignant(id),
    groupe_id       UUID NOT NULL REFERENCES groupe(id),
    matiere_id      UUID NOT NULL REFERENCES matiere(id),
    semestre        semestre NOT NULL,
    annee_academique VARCHAR(9) NOT NULL,  -- ex: "2024-2025"
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (enseignant_id, groupe_id, matiere_id, semestre, annee_academique)
);

-- ============================================================
--  5. ÉVALUATIONS & NOTES
-- ============================================================

CREATE TABLE evaluation (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affectation_id  UUID NOT NULL REFERENCES affectation(id),
    intitule        VARCHAR(200) NOT NULL,
    type_eval       type_evaluation NOT NULL,
    date_eval       DATE NOT NULL,
    bareme          NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    coefficient     NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE note (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id   UUID NOT NULL REFERENCES evaluation(id),
    etudiant_id     UUID NOT NULL REFERENCES etudiant(id),
    valeur          NUMERIC(5,2),          -- NULL = absent
    absent          BOOLEAN NOT NULL DEFAULT FALSE,
    justifie        BOOLEAN NOT NULL DEFAULT FALSE,
    remarque        TEXT,
    saisie_par      UUID NOT NULL REFERENCES utilisateur(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (evaluation_id, etudiant_id)
);

-- Moyenne calculée par matière et par semestre (matérialisée)
CREATE TABLE moyenne_matiere (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiant(id),
    matiere_id      UUID NOT NULL REFERENCES matiere(id),
    semestre        semestre NOT NULL,
    annee_academique VARCHAR(9) NOT NULL,
    moyenne         NUMERIC(5,2),
    nb_evaluations  SMALLINT NOT NULL DEFAULT 0,
    statut_valid    statut_validation NOT NULL DEFAULT 'en_attente',
    calcule_le      TIMESTAMP,
    UNIQUE (etudiant_id, matiere_id, semestre, annee_academique)
);

-- Moyenne générale par semestre
CREATE TABLE moyenne_semestre (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiant(id),
    semestre        semestre NOT NULL,
    annee_academique VARCHAR(9) NOT NULL,
    moyenne_generale NUMERIC(5,2),
    credits_valides SMALLINT NOT NULL DEFAULT 0,
    credits_totaux  SMALLINT NOT NULL DEFAULT 0,
    statut_valid    statut_validation NOT NULL DEFAULT 'en_attente',
    calcule_le      TIMESTAMP,
    UNIQUE (etudiant_id, semestre, annee_academique)
);

-- ============================================================
--  6. REMARQUES PÉDAGOGIQUES
-- ============================================================

CREATE TABLE remarque (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiant(id),
    auteur_id       UUID NOT NULL REFERENCES utilisateur(id),
    contenu         TEXT NOT NULL,
    confidentiel    BOOLEAN NOT NULL DEFAULT FALSE,  -- visible enseignants seulement
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  7. SYSTÈME D'ALERTES PÉDAGOGIQUES
-- ============================================================

CREATE TABLE alerte (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiant(id),
    niveau          niveau_alerte NOT NULL,
    statut          statut_alerte NOT NULL DEFAULT 'ouverte',
    titre           VARCHAR(200) NOT NULL,
    description     TEXT,
    declenchee_par  VARCHAR(100),  -- "score_risque", "note_critique", "absence", etc.
    score_risque    NUMERIC(5,2),  -- score calculé (0-100)
    assignee_a      UUID REFERENCES utilisateur(id),
    resolue_le      TIMESTAMP,
    resolue_par     UUID REFERENCES utilisateur(id),
    resolution_note TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  8. SCORE DE RISQUE (détection étudiants à risque)
-- ============================================================

CREATE TABLE score_risque (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id         UUID NOT NULL REFERENCES etudiant(id),
    semestre            semestre NOT NULL,
    annee_academique    VARCHAR(9) NOT NULL,
    score               NUMERIC(5,2) NOT NULL,  -- 0 (pas de risque) à 100 (risque maximal)
    poids_notes         NUMERIC(5,2),           -- contribution des notes
    poids_progression   NUMERIC(5,2),           -- contribution de la progression
    poids_absences      NUMERIC(5,2),           -- contribution des absences
    poids_remarques     NUMERIC(5,2),           -- contribution des remarques négatives
    details_calcul      JSONB,                  -- détail du calcul pour l'audit
    calcule_le          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (etudiant_id, semestre, annee_academique)
);

-- ============================================================
--  9. ABSENCES
-- ============================================================

CREATE TABLE absence (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiant(id),
    affectation_id  UUID REFERENCES affectation(id),
    date_absence    DATE NOT NULL,
    nb_heures       NUMERIC(4,1) NOT NULL DEFAULT 1.0,
    justifiee       BOOLEAN NOT NULL DEFAULT FALSE,
    justificatif    TEXT,
    saisie_par      UUID NOT NULL REFERENCES utilisateur(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  10. IMPORT/EXPORT CSV
-- ============================================================

CREATE TABLE import_csv (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fichier_nom     VARCHAR(255) NOT NULL,
    type_import     VARCHAR(50) NOT NULL,  -- "notes", "etudiants", "absences"
    importe_par     UUID NOT NULL REFERENCES utilisateur(id),
    nb_lignes_total INTEGER,
    nb_lignes_ok    INTEGER,
    nb_lignes_erreur INTEGER,
    statut          VARCHAR(20) NOT NULL DEFAULT 'en_cours',  -- "succes", "partiel", "echec"
    mapping_colonnes JSONB,    -- correspondance colonnes détectées → champs BDD
    erreurs         JSONB,     -- liste des erreurs ligne par ligne
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  11. RAPPORTS GÉNÉRÉS
-- ============================================================

CREATE TABLE rapport (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_rapport    VARCHAR(50) NOT NULL,  -- "etudiant", "groupe", "promotion", "simulation"
    titre           VARCHAR(200) NOT NULL,
    paramètres      JSONB,           -- filtres, scope, options utilisés
    genere_par      UUID NOT NULL REFERENCES utilisateur(id),
    fichier_chemin  TEXT,            -- chemin vers le PDF/XLS exporté
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  12. SIMULATIONS PÉDAGOGIQUES
-- ============================================================

CREATE TABLE simulation (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre           VARCHAR(200) NOT NULL,
    type_simulation VARCHAR(50) NOT NULL,  -- "validation_semestre", "rattrapage", "coefficients"
    scope_type      VARCHAR(20) NOT NULL,  -- "etudiant", "groupe", "promotion"
    scope_id        UUID NOT NULL,         -- id de l'étudiant/groupe/promotion
    semestre        semestre NOT NULL,
    annee_academique VARCHAR(9) NOT NULL,
    parametres      JSONB NOT NULL,        -- coefficients simulés, notes de rattrapage, etc.
    resultats       JSONB,                 -- résultats calculés
    cree_par        UUID NOT NULL REFERENCES utilisateur(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  13. AUDIT & TRAÇABILITÉ
-- ============================================================

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    table_cible     VARCHAR(100) NOT NULL,
    enregistrement_id UUID NOT NULL,
    action          VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    anciennes_valeurs JSONB,
    nouvelles_valeurs JSONB,
    effectue_par    UUID REFERENCES utilisateur(id),
    ip_adresse      INET,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  14. PARAMÈTRES SYSTÈME
-- ============================================================

CREATE TABLE parametre_systeme (
    cle             VARCHAR(100) PRIMARY KEY,
    valeur          TEXT NOT NULL,
    description     TEXT,
    modifiable_par  role_utilisateur NOT NULL DEFAULT 'administrateur',
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  INDEX DE PERFORMANCE
-- ============================================================

-- Étudiants
CREATE INDEX idx_etudiant_promotion  ON etudiant(promotion_id);
CREATE INDEX idx_etudiant_groupe     ON etudiant(groupe_id);
CREATE INDEX idx_etudiant_statut     ON etudiant(statut);
CREATE INDEX idx_etudiant_nom        ON etudiant(nom, prenom);

-- Notes
CREATE INDEX idx_note_evaluation     ON note(evaluation_id);
CREATE INDEX idx_note_etudiant       ON note(etudiant_id);

-- Évaluations
CREATE INDEX idx_eval_affectation    ON evaluation(affectation_id);
CREATE INDEX idx_eval_date           ON evaluation(date_eval);

-- Moyennes
CREATE INDEX idx_moy_mat_etudiant    ON moyenne_matiere(etudiant_id);
CREATE INDEX idx_moy_sem_etudiant    ON moyenne_semestre(etudiant_id);

-- Alertes
CREATE INDEX idx_alerte_etudiant     ON alerte(etudiant_id);
CREATE INDEX idx_alerte_statut       ON alerte(statut);
CREATE INDEX idx_alerte_niveau       ON alerte(niveau);

-- Score risque
CREATE INDEX idx_risque_etudiant     ON score_risque(etudiant_id);
CREATE INDEX idx_risque_score        ON score_risque(score DESC);

-- Absences
CREATE INDEX idx_absence_etudiant    ON absence(etudiant_id);
CREATE INDEX idx_absence_date        ON absence(date_absence);

-- Affectations
CREATE INDEX idx_affectation_ens     ON affectation(enseignant_id);
CREATE INDEX idx_affectation_groupe  ON affectation(groupe_id);

-- Audit
CREATE INDEX idx_audit_table         ON audit_log(table_cible, enregistrement_id);
CREATE INDEX idx_audit_utilisateur   ON audit_log(effectue_par);
CREATE INDEX idx_audit_date          ON audit_log(created_at DESC);

-- ============================================================
--  TRIGGERS : updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION maj_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_utilisateur_upd  BEFORE UPDATE ON utilisateur  FOR EACH ROW EXECUTE FUNCTION maj_updated_at();
CREATE TRIGGER trg_etudiant_upd     BEFORE UPDATE ON etudiant      FOR EACH ROW EXECUTE FUNCTION maj_updated_at();
CREATE TRIGGER trg_note_upd         BEFORE UPDATE ON note           FOR EACH ROW EXECUTE FUNCTION maj_updated_at();
CREATE TRIGGER trg_alerte_upd       BEFORE UPDATE ON alerte         FOR EACH ROW EXECUTE FUNCTION maj_updated_at();
CREATE TRIGGER trg_evaluation_upd   BEFORE UPDATE ON evaluation     FOR EACH ROW EXECUTE FUNCTION maj_updated_at();

-- ============================================================
--  TRIGGER : audit automatique sur la table note
-- ============================================================

CREATE OR REPLACE FUNCTION audit_note()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(table_cible, enregistrement_id, action, anciennes_valeurs, nouvelles_valeurs)
    VALUES (
        'note',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::jsonb ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_note
AFTER INSERT OR UPDATE OR DELETE ON note
FOR EACH ROW EXECUTE FUNCTION audit_note();

-- ============================================================
--  DONNÉES INITIALES
-- ============================================================

-- Paramètres système par défaut
INSERT INTO parametre_systeme (cle, valeur, description) VALUES
    ('seuil_risque_critique',  '75',  'Score de risque à partir duquel une alerte critique est déclenchée'),
    ('seuil_risque_warning',   '50',  'Score de risque à partir duquel une alerte avertissement est déclenchée'),
    ('note_minimale_defaut',   '10',  'Note minimale par défaut pour valider une matière'),
    ('bareme_defaut',          '20',  'Barème par défaut des évaluations'),
    ('nb_absences_alerte',     '3',   'Nombre d'absences injustifiées déclenchant une alerte'),
    ('poids_notes_risque',     '50',  'Poids (%) des notes dans le calcul du score de risque'),
    ('poids_absences_risque',  '30',  'Poids (%) des absences dans le calcul du score de risque'),
    ('poids_remarques_risque', '20',  'Poids (%) des remarques négatives dans le calcul du score de risque');

-- Compte administrateur par défaut (mot de passe : "admin" hashé)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES
    ('Admin', 'Système', 'admin@plateforme.local',
     crypt('admin', gen_salt('bf')), 'administrateur');
