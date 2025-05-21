import { z } from "zod";
import {
  insertUserSchema,
  insertClasseSchema,
  insertApprenantSchema,
  insertMatiereSchema,
  insertEtablissementSchema
} from "./schema";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token invalide")
});

// User schemas
export const registerUserSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
  })
  .omit({ mot_de_passe: true, date_creation: true, statut: true });

export const createUserSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    roles: z.array(z.number()).optional()
  })
  .omit({ mot_de_passe: true, date_creation: true });

export const updateUserSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional()
  })
  .omit({ mot_de_passe: true, date_creation: true })
  .partial();

export const assignRoleSchema = z.object({
  role_id: z.number(),
  etablissement_id: z.number().optional()
});

// Classe schemas
export const createClasseSchema = insertClasseSchema
  .omit({ id: true });

export const updateClasseSchema = insertClasseSchema
  .omit({ id: true })
  .partial();

// Apprenant schemas
export const createApprenantSchema = insertApprenantSchema
  .omit({ id: true, cree_le: true });

export const updateApprenantSchema = insertApprenantSchema
  .omit({ id: true, cree_le: true, matricule: true })
  .partial();

export const changeClasseSchema = z.object({
  classe_id: z.number()
});

// Matiere schemas
export const createMatiereSchema = insertMatiereSchema
  .omit({ id: true });

export const updateMatiereSchema = insertMatiereSchema
  .omit({ id: true })
  .partial();

// Etablissement schemas
export const createEtablissementSchema = insertEtablissementSchema
  .omit({ id: true, date_creation: true });

export const updateEtablissementSchema = insertEtablissementSchema
  .omit({ id: true, date_creation: true })
  .partial();
