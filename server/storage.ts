import { 
  users, 
  apprenants, 
  classes, 
  etablissements, 
  matieres, 
  niveaux_scolaires,
  roles,
  permissions,
  utilisateur_roles
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";
import type { 
  User, InsertUser, 
  Apprenant, InsertApprenant,
  Classe, InsertClasse,
  Etablissement, InsertEtablissement,
  Matiere, InsertMatiere,
  NiveauScolaire, InsertNiveauScolaire,
  Role, InsertRole,
  Permission, InsertPermission,
  UtilisateurRole, InsertUtilisateurRole
} from "@shared/schema";

// Interface for database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  listUsers(etablissementId?: number): Promise<User[]>;
  
  // Apprenant operations
  getApprenant(id: number): Promise<Apprenant | undefined>;
  getApprenantByMatricule(matricule: string): Promise<Apprenant | undefined>;
  createApprenant(apprenant: InsertApprenant): Promise<Apprenant>;
  updateApprenant(id: number, apprenantData: Partial<Apprenant>): Promise<Apprenant | undefined>;
  listApprenants(classeId?: number, etablissementId?: number): Promise<Apprenant[]>;
  
  // Classe operations
  getClasse(id: number): Promise<Classe | undefined>;
  createClasse(classe: InsertClasse): Promise<Classe>;
  updateClasse(id: number, classeData: Partial<Classe>): Promise<Classe | undefined>;
  listClasses(niveauId?: number, etablissementId?: number): Promise<Classe[]>;
  
  // Etablissement operations
  getEtablissement(id: number): Promise<Etablissement | undefined>;
  createEtablissement(etablissement: InsertEtablissement): Promise<Etablissement>;
  updateEtablissement(id: number, etablissementData: Partial<Etablissement>): Promise<Etablissement | undefined>;
  listEtablissements(): Promise<Etablissement[]>;
  
  // Matiere operations
  getMatiere(id: number): Promise<Matiere | undefined>;
  createMatiere(matiere: InsertMatiere): Promise<Matiere>;
  updateMatiere(id: number, matiereData: Partial<Matiere>): Promise<Matiere | undefined>;
  listMatieres(etablissementId?: number): Promise<Matiere[]>;

  // Role and permission operations
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  listRoles(etablissementId?: number): Promise<Role[]>;
  
  getPermission(id: number): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  listPermissions(etablissementId?: number): Promise<Permission[]>;
  
  assignRoleToUser(utilisateurRole: InsertUtilisateurRole): Promise<UtilisateurRole>;
  getUserRoles(userId: number): Promise<Role[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      logger.error('Error fetching user by ID', { error, userId: id });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      logger.error('Error fetching user by email', { error, email });
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [createdUser] = await db.insert(users).values(user).returning();
      return createdUser;
    } catch (error) {
      logger.error('Error creating user', { error, userData: user });
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user', { error, userId: id, userData });
      throw error;
    }
  }

  async listUsers(etablissementId?: number): Promise<User[]> {
    try {
      if (etablissementId) {
        return await db
          .select()
          .from(users)
          .where(eq(users.etablissement_id, etablissementId));
      }
      return await db.select().from(users);
    } catch (error) {
      logger.error('Error listing users', { error, etablissementId });
      throw error;
    }
  }
  
  // Apprenant operations
  async getApprenant(id: number): Promise<Apprenant | undefined> {
    try {
      const [apprenant] = await db.select().from(apprenants).where(eq(apprenants.id, id));
      return apprenant;
    } catch (error) {
      logger.error('Error fetching apprenant by ID', { error, apprenantId: id });
      throw error;
    }
  }

  async getApprenantByMatricule(matricule: string): Promise<Apprenant | undefined> {
    try {
      const [apprenant] = await db.select().from(apprenants).where(eq(apprenants.matricule, matricule));
      return apprenant;
    } catch (error) {
      logger.error('Error fetching apprenant by matricule', { error, matricule });
      throw error;
    }
  }

  async createApprenant(apprenant: InsertApprenant): Promise<Apprenant> {
    try {
      const [createdApprenant] = await db.insert(apprenants).values(apprenant).returning();
      return createdApprenant;
    } catch (error) {
      logger.error('Error creating apprenant', { error, apprenantData: apprenant });
      throw error;
    }
  }

  async updateApprenant(id: number, apprenantData: Partial<Apprenant>): Promise<Apprenant | undefined> {
    try {
      const [updatedApprenant] = await db
        .update(apprenants)
        .set(apprenantData)
        .where(eq(apprenants.id, id))
        .returning();
      return updatedApprenant;
    } catch (error) {
      logger.error('Error updating apprenant', { error, apprenantId: id, apprenantData });
      throw error;
    }
  }

  async listApprenants(classeId?: number, etablissementId?: number): Promise<Apprenant[]> {
    try {
      if (classeId) {
        return await db
          .select()
          .from(apprenants)
          .where(eq(apprenants.classe_actuelle_id, classeId));
      }
      if (etablissementId) {
        return await db
          .select()
          .from(apprenants)
          .where(eq(apprenants.etablissement_id, etablissementId));
      }
      return await db.select().from(apprenants);
    } catch (error) {
      logger.error('Error listing apprenants', { error, classeId, etablissementId });
      throw error;
    }
  }
  
  // Classe operations
  async getClasse(id: number): Promise<Classe | undefined> {
    try {
      const [classe] = await db.select().from(classes).where(eq(classes.id, id));
      return classe;
    } catch (error) {
      logger.error('Error fetching classe by ID', { error, classeId: id });
      throw error;
    }
  }

  async createClasse(classe: InsertClasse): Promise<Classe> {
    try {
      const [createdClasse] = await db.insert(classes).values(classe).returning();
      return createdClasse;
    } catch (error) {
      logger.error('Error creating classe', { error, classeData: classe });
      throw error;
    }
  }

  async updateClasse(id: number, classeData: Partial<Classe>): Promise<Classe | undefined> {
    try {
      const [updatedClasse] = await db
        .update(classes)
        .set(classeData)
        .where(eq(classes.id, id))
        .returning();
      return updatedClasse;
    } catch (error) {
      logger.error('Error updating classe', { error, classeId: id, classeData });
      throw error;
    }
  }

  async listClasses(niveauId?: number, etablissementId?: number): Promise<Classe[]> {
    try {
      if (niveauId) {
        return await db
          .select()
          .from(classes)
          .where(eq(classes.niveau_id, niveauId));
      }
      if (etablissementId) {
        return await db
          .select()
          .from(classes)
          .where(eq(classes.etablissement_id, etablissementId));
      }
      return await db.select().from(classes);
    } catch (error) {
      logger.error('Error listing classes', { error, niveauId, etablissementId });
      throw error;
    }
  }
  
  // Etablissement operations
  async getEtablissement(id: number): Promise<Etablissement | undefined> {
    try {
      const [etablissement] = await db.select().from(etablissements).where(eq(etablissements.id, id));
      return etablissement;
    } catch (error) {
      logger.error('Error fetching etablissement by ID', { error, etablissementId: id });
      throw error;
    }
  }

  async createEtablissement(etablissement: InsertEtablissement): Promise<Etablissement> {
    try {
      const [createdEtablissement] = await db.insert(etablissements).values(etablissement).returning();
      return createdEtablissement;
    } catch (error) {
      logger.error('Error creating etablissement', { error, etablissementData: etablissement });
      throw error;
    }
  }

  async updateEtablissement(id: number, etablissementData: Partial<Etablissement>): Promise<Etablissement | undefined> {
    try {
      const [updatedEtablissement] = await db
        .update(etablissements)
        .set(etablissementData)
        .where(eq(etablissements.id, id))
        .returning();
      return updatedEtablissement;
    } catch (error) {
      logger.error('Error updating etablissement', { error, etablissementId: id, etablissementData });
      throw error;
    }
  }

  async listEtablissements(): Promise<Etablissement[]> {
    try {
      return await db.select().from(etablissements);
    } catch (error) {
      logger.error('Error listing etablissements', { error });
      throw error;
    }
  }
  
  // Matiere operations
  async getMatiere(id: number): Promise<Matiere | undefined> {
    try {
      const [matiere] = await db.select().from(matieres).where(eq(matieres.id, id));
      return matiere;
    } catch (error) {
      logger.error('Error fetching matiere by ID', { error, matiereId: id });
      throw error;
    }
  }

  async createMatiere(matiere: InsertMatiere): Promise<Matiere> {
    try {
      const [createdMatiere] = await db.insert(matieres).values(matiere).returning();
      return createdMatiere;
    } catch (error) {
      logger.error('Error creating matiere', { error, matiereData: matiere });
      throw error;
    }
  }

  async updateMatiere(id: number, matiereData: Partial<Matiere>): Promise<Matiere | undefined> {
    try {
      const [updatedMatiere] = await db
        .update(matieres)
        .set(matiereData)
        .where(eq(matieres.id, id))
        .returning();
      return updatedMatiere;
    } catch (error) {
      logger.error('Error updating matiere', { error, matiereId: id, matiereData });
      throw error;
    }
  }

  async listMatieres(etablissementId?: number): Promise<Matiere[]> {
    try {
      if (etablissementId) {
        return await db
          .select()
          .from(matieres)
          .where(eq(matieres.etablissement_id, etablissementId));
      }
      return await db.select().from(matieres);
    } catch (error) {
      logger.error('Error listing matieres', { error, etablissementId });
      throw error;
    }
  }

  // Role and permission operations
  async getRole(id: number): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      return role;
    } catch (error) {
      logger.error('Error fetching role by ID', { error, roleId: id });
      throw error;
    }
  }

  async createRole(role: InsertRole): Promise<Role> {
    try {
      const [createdRole] = await db.insert(roles).values(role).returning();
      return createdRole;
    } catch (error) {
      logger.error('Error creating role', { error, roleData: role });
      throw error;
    }
  }

  async listRoles(etablissementId?: number): Promise<Role[]> {
    try {
      if (etablissementId) {
        return await db
          .select()
          .from(roles)
          .where(eq(roles.etablissement_id, etablissementId));
      }
      return await db.select().from(roles);
    } catch (error) {
      logger.error('Error listing roles', { error, etablissementId });
      throw error;
    }
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    try {
      const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
      return permission;
    } catch (error) {
      logger.error('Error fetching permission by ID', { error, permissionId: id });
      throw error;
    }
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    try {
      const [createdPermission] = await db.insert(permissions).values(permission).returning();
      return createdPermission;
    } catch (error) {
      logger.error('Error creating permission', { error, permissionData: permission });
      throw error;
    }
  }

  async listPermissions(etablissementId?: number): Promise<Permission[]> {
    try {
      if (etablissementId) {
        return await db
          .select()
          .from(permissions)
          .where(eq(permissions.etablissement_id, etablissementId));
      }
      return await db.select().from(permissions);
    } catch (error) {
      logger.error('Error listing permissions', { error, etablissementId });
      throw error;
    }
  }

  async assignRoleToUser(utilisateurRole: InsertUtilisateurRole): Promise<UtilisateurRole> {
    try {
      const [createdAssignment] = await db.insert(utilisateur_roles).values(utilisateurRole).returning();
      return createdAssignment;
    } catch (error) {
      logger.error('Error assigning role to user', { error, assignmentData: utilisateurRole });
      throw error;
    }
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    try {
      // Join between utilisateur_roles and roles tables
      const roleIds = await db
        .select({ roleId: utilisateur_roles.role_id })
        .from(utilisateur_roles)
        .where(eq(utilisateur_roles.utilisateur_id, userId));
      
      if (roleIds.length === 0) return [];
      
      const userRoles = await Promise.all(
        roleIds.map(async (r) => {
          const [role] = await db.select().from(roles).where(eq(roles.id, r.roleId));
          return role;
        })
      );
      
      return userRoles.filter(Boolean) as Role[];
    } catch (error) {
      logger.error('Error getting user roles', { error, userId });
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
