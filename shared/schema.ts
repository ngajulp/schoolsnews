import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  varchar, 
  timestamp, 
  date, 
  numeric,
  pgEnum,
  time
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Create ENUMs for PostgreSQL
export const statutUtilisateurEnum = pgEnum('statut_utilisateur', ['actif', 'inactif', 'suspendu', 'archive']);
export const sexeEnum = pgEnum('sexe_enum', ['Masculin', 'Féminin']);

// Etablissements table
export const etablissements = pgTable("etablissements", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  code: varchar("code", { length: 20 }).unique(),
  type: varchar("type", { length: 50 }),
  adresse: text("adresse"),
  telephone: varchar("telephone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  directeur: varchar("directeur", { length: 100 }),
  site_web: varchar("site_web", { length: 100 }),
  logo_url: text("logo_url"),
  date_creation: timestamp("date_creation").defaultNow()
});

// Relations for etablissements
export const etablissementsRelations = relations(etablissements, ({ many }) => ({
  users: many(users),
  classes: many(classes),
  apprenants: many(apprenants),
  matieres: many(matieres),
  niveauxScolaires: many(niveaux_scolaires)
}));

// Niveaux scolaires table
export const niveaux_scolaires = pgTable("niveaux_scolaires", {
  id: serial("id").primaryKey(),
  libelle_fr: varchar("libelle_fr", { length: 100 }),
  libelle_en: varchar("libelle_en", { length: 100 }),
  ordre: integer("ordre"),
  cycle: varchar("cycle", { length: 50 }),
  filiere: varchar("filiere", { length: 50 }),
  actif: boolean("actif").default(true),
  cree_le: timestamp("cree_le").defaultNow(),
  etablissement_id: integer("etablissement_id").notNull().references(() => etablissements.id)
});

// Relations for niveaux_scolaires
export const niveauxScolairesRelations = relations(niveaux_scolaires, ({ one, many }) => ({
  etablissement: one(etablissements, {
    fields: [niveaux_scolaires.etablissement_id],
    references: [etablissements.id]
  }),
  classes: many(classes)
}));

// Users table
export const users = pgTable("utilisateurs", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 100 }),
  prenom: varchar("prenom", { length: 100 }),
  email: varchar("email", { length: 150 }).notNull().unique(),
  mot_de_passe: text("mot_de_passe").notNull(),
  telephone: varchar("telephone", { length: 30 }),
  statut: statutUtilisateurEnum("statut").default('inactif'),
  date_creation: timestamp("date_creation").defaultNow(),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Relations for users
export const usersRelations = relations(users, ({ one, many }) => ({
  etablissement: one(etablissements, {
    fields: [users.etablissement_id],
    references: [etablissements.id]
  }),
  roles: many(utilisateur_roles)
}));

// Type employes table
export const type_employes = pgTable("type_employes", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 50 }).unique()
});

// Employes table
export const employes = pgTable("employes", {
  id: serial("id").primaryKey(),
  utilisateur_id: integer("utilisateur_id").references(() => users.id),
  type_employe_id: integer("type_employe_id").references(() => type_employes.id),
  matricule: varchar("matricule", { length: 50 }),
  nom: varchar("nom", { length: 100 }),
  prenom: varchar("prenom", { length: 100 }),
  poste: varchar("poste", { length: 100 }),
  date_recrutement: date("date_recrutement"),
  salaire: numeric("salaire", { precision: 10, scale: 2 }),
  photo_url: text("photo_url")
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 100 }).notNull().unique(),
  description: text("description"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  fonctionnalite: varchar("fonctionnalite", { length: 100 }),
  peut_voir: boolean("peut_voir").default(false),
  peut_ajouter: boolean("peut_ajouter").default(false),
  peut_modifier: boolean("peut_modifier").default(false),
  peut_supprimer: boolean("peut_supprimer").default(false),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// User roles junction table
export const utilisateur_roles = pgTable("utilisateur_roles", {
  utilisateur_id: integer("utilisateur_id").notNull().references(() => users.id),
  role_id: integer("role_id").notNull().references(() => roles.id),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id),
}, (table) => {
  return {
    pk: { name: "utilisateur_roles_pkey", columns: [table.utilisateur_id, table.role_id] }
  };
});

// Relations for utilisateur_roles
export const utilisateurRolesRelations = relations(utilisateur_roles, ({ one }) => ({
  user: one(users, {
    fields: [utilisateur_roles.utilisateur_id],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [utilisateur_roles.role_id],
    references: [roles.id]
  }),
  etablissement: one(etablissements, {
    fields: [utilisateur_roles.etablissement_id],
    references: [etablissements.id]
  })
}));

// Role permissions junction table
export const role_permissions = pgTable("role_permissions", {
  role_id: integer("role_id").notNull().references(() => roles.id),
  permission_id: integer("permission_id").notNull().references(() => permissions.id),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id),
}, (table) => {
  return {
    pk: { name: "role_permissions_pkey", columns: [table.role_id, table.permission_id] }
  };
});

// Niveaux table
export const niveaux = pgTable("niveaux", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 50 }).notNull().unique(),
  cycle: varchar("cycle", { length: 50 }),
  rang_pedagogique: integer("rang_pedagogique"),
  langue_enseignement: varchar("langue_enseignement", { length: 30 }),
  duree_academique: varchar("duree_academique", { length: 30 }),
  is_examen: boolean("is_examen").default(false),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Années académiques table
export const annees_academiques = pgTable("annees_academiques", {
  id: serial("id").primaryKey(),
  annee: varchar("annee", { length: 20 }).notNull().unique(),
  date_debut: date("date_debut"),
  date_fin: date("date_fin"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Salles table
export const salles = pgTable("salles", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 50 }),
  capacite: integer("capacite"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 50 }).notNull(),
  niveau_id: integer("niveau_id").notNull().references(() => niveaux_scolaires.id),
  annee_scolaire_id: integer("annee_scolaire_id").references(() => annees_academiques.id),
  enseignant_principal_id: integer("enseignant_principal_id").references(() => users.id),
  serie: varchar("serie", { length: 30 }),
  effectif_max: integer("effectif_max"),
  salle_id: integer("salle_id").references(() => salles.id),
  statut: varchar("statut", { length: 20 }).default('Active'),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Relations for classes
export const classesRelations = relations(classes, ({ one, many }) => ({
  niveau: one(niveaux_scolaires, {
    fields: [classes.niveau_id],
    references: [niveaux_scolaires.id]
  }),
  anneeScolaire: one(annees_academiques, {
    fields: [classes.annee_scolaire_id],
    references: [annees_academiques.id]
  }),
  enseignantPrincipal: one(users, {
    fields: [classes.enseignant_principal_id],
    references: [users.id]
  }),
  salle: one(salles, {
    fields: [classes.salle_id],
    references: [salles.id]
  }),
  etablissement: one(etablissements, {
    fields: [classes.etablissement_id],
    references: [etablissements.id]
  }),
  apprenants: many(apprenants)
}));

// Apprenants table
export const apprenants = pgTable("apprenants", {
  id: serial("id").primaryKey(),
  matricule: varchar("matricule", { length: 30 }).notNull().unique(),
  nom: varchar("nom", { length: 100 }).notNull(),
  prenom: varchar("prenom", { length: 100 }),
  date_naissance: date("date_naissance").notNull(),
  date_inscription: date("date_inscription").defaultNow(),
  statut: varchar("statut", { length: 30 }).default('actif'),
  lieu_naissance: varchar("lieu_naissance", { length: 100 }),
  sexe: sexeEnum("sexe"),
  nationalite: varchar("nationalite", { length: 50 }),
  adresse: text("adresse"),
  email: varchar("email", { length: 100 }),
  type_apprenant: varchar("type_apprenant", { length: 30 }),
  situation_medicale: text("situation_medicale"),
  statut_inscription: varchar("statut_inscription", { length: 30 }).default('Inscrit'),
  classe_actuelle_id: integer("classe_actuelle_id").references(() => classes.id),
  annee_scolaire_id: integer("annee_scolaire_id").references(() => annees_academiques.id),
  photo_url: text("photo_url"),
  cree_le: timestamp("cree_le").defaultNow(),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Relations for apprenants
export const apprenantsRelations = relations(apprenants, ({ one }) => ({
  classeActuelle: one(classes, {
    fields: [apprenants.classe_actuelle_id],
    references: [classes.id]
  }),
  anneeScolaire: one(annees_academiques, {
    fields: [apprenants.annee_scolaire_id],
    references: [annees_academiques.id]
  }),
  etablissement: one(etablissements, {
    fields: [apprenants.etablissement_id],
    references: [etablissements.id]
  })
}));

// Matières table
export const matieres = pgTable("matieres", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  langue: varchar("langue", { length: 20 }),
  coefficient: integer("coefficient").default(1),
  type: varchar("type", { length: 30 }),
  est_a_examen: boolean("est_a_examen").default(false),
  est_active: boolean("est_active").default(true),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Relations for matieres
export const matieresRelations = relations(matieres, ({ one, many }) => ({
  etablissement: one(etablissements, {
    fields: [matieres.etablissement_id],
    references: [etablissements.id]
  }),
  niveaux: many(niveau_matiere)
}));

// Niveau matiere junction table
export const niveau_matiere = pgTable("niveau_matiere", {
  id: serial("id").primaryKey(),
  niveau_id: integer("niveau_id").references(() => niveaux.id),
  matiere_id: integer("matiere_id").references(() => matieres.id),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Create Zod schemas and TypeScript types for each table

// Etablissement
export const insertEtablissementSchema = createInsertSchema(etablissements);
export type InsertEtablissement = z.infer<typeof insertEtablissementSchema>;
export type Etablissement = typeof etablissements.$inferSelect;

// Niveau Scolaire
export const insertNiveauScolaireSchema = createInsertSchema(niveaux_scolaires);
export type InsertNiveauScolaire = z.infer<typeof insertNiveauScolaireSchema>;
export type NiveauScolaire = typeof niveaux_scolaires.$inferSelect;

// User
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Role
export const insertRoleSchema = createInsertSchema(roles);
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// Permission
export const insertPermissionSchema = createInsertSchema(permissions);
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

// Utilisateur Role
export const insertUtilisateurRoleSchema = createInsertSchema(utilisateur_roles);
export type InsertUtilisateurRole = z.infer<typeof insertUtilisateurRoleSchema>;
export type UtilisateurRole = typeof utilisateur_roles.$inferSelect;

// Classe
export const insertClasseSchema = createInsertSchema(classes);
export type InsertClasse = z.infer<typeof insertClasseSchema>;
export type Classe = typeof classes.$inferSelect;

// Apprenant
export const insertApprenantSchema = createInsertSchema(apprenants);
export type InsertApprenant = z.infer<typeof insertApprenantSchema>;
export type Apprenant = typeof apprenants.$inferSelect;

// Matiere
export const insertMatiereSchema = createInsertSchema(matieres);
export type InsertMatiere = z.infer<typeof insertMatiereSchema>;
export type Matiere = typeof matieres.$inferSelect;

// Année Académique
export const insertAnneeAcademiqueSchema = createInsertSchema(annees_academiques);
export type InsertAnneeAcademique = z.infer<typeof insertAnneeAcademiqueSchema>;
export type AnneeAcademique = typeof annees_academiques.$inferSelect;

// Salle
export const insertSalleSchema = createInsertSchema(salles);
export type InsertSalle = z.infer<typeof insertSalleSchema>;
export type Salle = typeof salles.$inferSelect;

// Library book statuses enum
export const statutLivreEnum = pgEnum('statut_livre', ['disponible', 'emprunte', 'reserve', 'retire', 'perdu', 'endommage']);

// Library management - Books
export const livres = pgTable("livres", {
  id: serial("id").primaryKey(),
  titre: varchar("titre", { length: 200 }).notNull(),
  isbn: varchar("isbn", { length: 30 }),
  auteur: varchar("auteur", { length: 150 }),
  editeur: varchar("editeur", { length: 150 }),
  annee_publication: integer("annee_publication"),
  categorie: varchar("categorie", { length: 100 }),
  description: text("description"),
  nombre_exemplaires: integer("nombre_exemplaires").default(1),
  disponible: integer("disponible").default(1),
  date_ajout: timestamp("date_ajout").defaultNow(),
  statut: statutLivreEnum("statut").default('disponible'),
  cote: varchar("cote", { length: 50 }),
  photo_couverture: text("photo_couverture"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Library relations
export const livresRelations = relations(livres, ({ one, many }) => ({
  etablissement: one(etablissements, {
    fields: [livres.etablissement_id],
    references: [etablissements.id]
  }),
  emprunts: many(emprunts)
}));

// Library loans
export const emprunts = pgTable("emprunts", {
  id: serial("id").primaryKey(),
  livre_id: integer("livre_id").notNull().references(() => livres.id),
  utilisateur_id: integer("utilisateur_id").notNull().references(() => users.id),
  date_emprunt: timestamp("date_emprunt").defaultNow(),
  date_retour_prevue: date("date_retour_prevue").notNull(),
  date_retour_reelle: date("date_retour_reelle"),
  statut: varchar("statut", { length: 30 }).default('en cours'),
  remarques: text("remarques"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Loan relations
export const empruntsRelations = relations(emprunts, ({ one }) => ({
  livre: one(livres, {
    fields: [emprunts.livre_id],
    references: [livres.id]
  }),
  utilisateur: one(users, {
    fields: [emprunts.utilisateur_id],
    references: [users.id]
  }),
  etablissement: one(etablissements, {
    fields: [emprunts.etablissement_id],
    references: [etablissements.id]
  })
}));

// Sanctions management
export const sanctions = pgTable("sanctions", {
  id: serial("id").primaryKey(),
  apprenant_id: integer("apprenant_id").notNull().references(() => apprenants.id),
  type_sanction: varchar("type_sanction", { length: 100 }).notNull(),
  motif: text("motif").notNull(),
  date_sanction: date("date_sanction").defaultNow(),
  date_fin: date("date_fin"),
  description: text("description"),
  delivre_par: integer("delivre_par").references(() => users.id),
  statut: varchar("statut", { length: 30 }).default('active'),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Sanctions relations
export const sanctionsRelations = relations(sanctions, ({ one }) => ({
  apprenant: one(apprenants, {
    fields: [sanctions.apprenant_id],
    references: [apprenants.id]
  }),
  utilisateur: one(users, {
    fields: [sanctions.delivre_par],
    references: [users.id]
  }),
  etablissement: one(etablissements, {
    fields: [sanctions.etablissement_id],
    references: [etablissements.id]
  })
}));

// Exams management
export const examens = pgTable("examens", {
  id: serial("id").primaryKey(),
  titre: varchar("titre", { length: 200 }).notNull(),
  description: text("description"),
  type_examen: varchar("type_examen", { length: 50 }).notNull(),
  date_debut: timestamp("date_debut").notNull(),
  date_fin: timestamp("date_fin").notNull(),
  duree_minutes: integer("duree_minutes"),
  classe_id: integer("classe_id").references(() => classes.id),
  matiere_id: integer("matiere_id").references(() => matieres.id),
  enseignant_id: integer("enseignant_id").references(() => users.id),
  statut: varchar("statut", { length: 30 }).default('planifie'),
  note_max: numeric("note_max", { precision: 5, scale: 2 }).default(20),
  coefficient: integer("coefficient").default(1),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Exams relations
export const examensRelations = relations(examens, ({ one, many }) => ({
  classe: one(classes, {
    fields: [examens.classe_id],
    references: [classes.id]
  }),
  matiere: one(matieres, {
    fields: [examens.matiere_id],
    references: [matieres.id]
  }),
  enseignant: one(users, {
    fields: [examens.enseignant_id],
    references: [users.id]
  }),
  etablissement: one(etablissements, {
    fields: [examens.etablissement_id],
    references: [etablissements.id]
  }),
  notes: many(notes_examens)
}));

// Exam results/grades
export const notes_examens = pgTable("notes_examens", {
  id: serial("id").primaryKey(),
  examen_id: integer("examen_id").notNull().references(() => examens.id),
  apprenant_id: integer("apprenant_id").notNull().references(() => apprenants.id),
  note: numeric("note", { precision: 5, scale: 2 }),
  remarque: text("remarque"),
  date_saisie: timestamp("date_saisie").defaultNow(),
  saisi_par: integer("saisi_par").references(() => users.id),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
}, (table) => {
  return {
    unq: { name: "unique_note_apprenant_examen", columns: [table.examen_id, table.apprenant_id] }
  };
});

// Exam grades relations
export const notesExamensRelations = relations(notes_examens, ({ one }) => ({
  examen: one(examens, {
    fields: [notes_examens.examen_id],
    references: [examens.id]
  }),
  apprenant: one(apprenants, {
    fields: [notes_examens.apprenant_id],
    references: [apprenants.id]
  }),
  utilisateur: one(users, {
    fields: [notes_examens.saisi_par],
    references: [users.id]
  }),
  etablissement: one(etablissements, {
    fields: [notes_examens.etablissement_id],
    references: [etablissements.id]
  })
}));

// Communication - Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sujet: varchar("sujet", { length: 200 }).notNull(),
  contenu: text("contenu").notNull(),
  expediteur_id: integer("expediteur_id").notNull().references(() => users.id),
  date_envoi: timestamp("date_envoi").defaultNow(),
  type_message: varchar("type_message", { length: 50 }).default('standard'),
  priorite: varchar("priorite", { length: 30 }).default('normale'),
  piece_jointe_url: text("piece_jointe_url"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Messages relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
  expediteur: one(users, {
    fields: [messages.expediteur_id],
    references: [users.id]
  }),
  etablissement: one(etablissements, {
    fields: [messages.etablissement_id],
    references: [etablissements.id]
  }),
  destinataires: many(message_destinataires)
}));

// Message recipients
export const message_destinataires = pgTable("message_destinataires", {
  id: serial("id").primaryKey(),
  message_id: integer("message_id").notNull().references(() => messages.id),
  destinataire_id: integer("destinataire_id").notNull().references(() => users.id),
  lu: boolean("lu").default(false),
  date_lecture: timestamp("date_lecture"),
  statut: varchar("statut", { length: 30 }).default('envoye'),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

// Message recipients relations
export const messageDestinatairesRelations = relations(message_destinataires, ({ one }) => ({
  message: one(messages, {
    fields: [message_destinataires.message_id],
    references: [messages.id]
  }),
  destinataire: one(users, {
    fields: [message_destinataires.destinataire_id],
    references: [users.id]
  }),
  etablissement: one(etablissements, {
    fields: [message_destinataires.etablissement_id],
    references: [etablissements.id]
  })
}));

// Homework management
export const devoirs = pgTable("devoirs", {
  id: serial("id").primaryKey(),
  titre: varchar("titre", { length: 200 }).notNull(),
  description: text("description").notNull(),
  date_creation: timestamp("date_creation").defaultNow(),
  date_limite: timestamp("date_limite").notNull(),
  fichier_url: text("fichier_url"),
  matiere_id: integer("matiere_id").references(() => matieres.id, { onDelete: 'cascade' }),
  classe_id: integer("classe_id").references(() => classes.id, { onDelete: 'cascade' }),
  cree_par: integer("cree_par").references(() => users.id, { onDelete: 'set null' }),
  statut: varchar("statut", { length: 20 }).default('actif'), // 'actif', 'archive'
  points_possibles: integer("points_possibles"),
  instructions_soumission: text("instructions_soumission"),
  etablissement_id: integer("etablissement_id").references(() => etablissements.id)
});

export const devoirsRelations = relations(devoirs, ({ one, many }) => ({
  matiere: one(matieres, {
    fields: [devoirs.matiere_id],
    references: [matieres.id],
  }),
  classe: one(classes, {
    fields: [devoirs.classe_id],
    references: [classes.id],
  }),
  createur: one(users, {
    fields: [devoirs.cree_par],
    references: [users.id],
  }),
  etablissement: one(etablissements, {
    fields: [devoirs.etablissement_id],
    references: [etablissements.id],
  }),
  soumissions: many(soumissions_devoirs)
}));

export const soumissions_devoirs = pgTable("soumissions_devoirs", {
  id: serial("id").primaryKey(),
  devoir_id: integer("devoir_id").references(() => devoirs.id, { onDelete: 'cascade' }).notNull(),
  apprenant_id: integer("apprenant_id").references(() => apprenants.id, { onDelete: 'cascade' }).notNull(),
  date_soumission: timestamp("date_soumission").defaultNow(),
  contenu: text("contenu"),
  fichier_url: text("fichier_url"),
  commentaire_enseignant: text("commentaire_enseignant"),
  note: integer("note"),
  date_notation: timestamp("date_notation"),
  statut: varchar("statut", { length: 20 }).default('soumis'), // 'soumis', 'note', 'retourne'
});

export const soumissionsDevoirsRelations = relations(soumissions_devoirs, ({ one }) => ({
  devoir: one(devoirs, {
    fields: [soumissions_devoirs.devoir_id],
    references: [devoirs.id],
  }),
  apprenant: one(apprenants, {
    fields: [soumissions_devoirs.apprenant_id],
    references: [apprenants.id],
  }),
}));

// Create Zod schemas and TypeScript types for the new tables

// Homework
export const insertDevoirSchema = createInsertSchema(devoirs);
export type InsertDevoir = z.infer<typeof insertDevoirSchema>;
export type Devoir = typeof devoirs.$inferSelect;

// Homework submissions
export const insertSoumissionDevoirSchema = createInsertSchema(soumissions_devoirs);
export type InsertSoumissionDevoir = z.infer<typeof insertSoumissionDevoirSchema>;
export type SoumissionDevoir = typeof soumissions_devoirs.$inferSelect;

// Library books
export const insertLivreSchema = createInsertSchema(livres);
export type InsertLivre = z.infer<typeof insertLivreSchema>;
export type Livre = typeof livres.$inferSelect;

// Library loans
export const insertEmpruntSchema = createInsertSchema(emprunts);
export type InsertEmprunt = z.infer<typeof insertEmpruntSchema>;
export type Emprunt = typeof emprunts.$inferSelect;

// Sanctions
export const insertSanctionSchema = createInsertSchema(sanctions);
export type InsertSanction = z.infer<typeof insertSanctionSchema>;
export type Sanction = typeof sanctions.$inferSelect;

// Exams
export const insertExamenSchema = createInsertSchema(examens);
export type InsertExamen = z.infer<typeof insertExamenSchema>;
export type Examen = typeof examens.$inferSelect;

// Exam grades
export const insertNoteExamenSchema = createInsertSchema(notes_examens);
export type InsertNoteExamen = z.infer<typeof insertNoteExamenSchema>;
export type NoteExamen = typeof notes_examens.$inferSelect;

// Messages
export const insertMessageSchema = createInsertSchema(messages);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Message recipients
export const insertMessageDestinataireSchema = createInsertSchema(message_destinataires);
export type InsertMessageDestinataire = z.infer<typeof insertMessageDestinataireSchema>;
export type MessageDestinataire = typeof message_destinataires.$inferSelect;
