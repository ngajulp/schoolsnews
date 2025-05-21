import { db } from './server/db.js';
import { 
  etablissements, 
  niveaux_scolaires, 
  users, 
  roles, 
  permissions, 
  utilisateur_roles,
  niveaux,
  annees_academiques,
  salles,
  classes,
  matieres
} from './shared/schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // Add an establishment
    const [etablissement] = await db.insert(etablissements).values({
      nom: 'Lycée Jean Moulin',
      code: 'LJM',
      type: 'Lycée',
      adresse: '10 Rue des Écoles, 75001 Paris',
      telephone: '+33123456789',
      email: 'contact@ljm.edu',
      directeur: 'Martin Dubois',
      site_web: 'https://www.ljm.edu',
      logo_url: 'https://example.com/logos/ljm.png',
    }).returning();
    
    console.log('Created establishment:', etablissement.nom);
    
    // Add school levels
    const [niveauScolaireCollege] = await db.insert(niveaux_scolaires).values({
      libelle_fr: 'Collège',
      libelle_en: 'Middle School',
      ordre: 1,
      cycle: 'Secondaire',
      filiere: 'Général',
      etablissement_id: etablissement.id
    }).returning();
    
    const [niveauScolaireLycee] = await db.insert(niveaux_scolaires).values({
      libelle_fr: 'Lycée',
      libelle_en: 'High School',
      ordre: 2,
      cycle: 'Secondaire',
      filiere: 'Général',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created school levels');
    
    // Add admin role
    const [adminRole] = await db.insert(roles).values({
      nom: 'admin',
      description: 'Administrateur système avec tous les droits',
      etablissement_id: etablissement.id
    }).returning();
    
    const [enseignantRole] = await db.insert(roles).values({
      nom: 'enseignant',
      description: 'Enseignant avec accès aux classes et notes',
      etablissement_id: etablissement.id
    }).returning();
    
    const [etudiantRole] = await db.insert(roles).values({
      nom: 'etudiant',
      description: 'Étudiant avec accès limité',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created roles');
    
    // Add permissions
    const [viewPermission] = await db.insert(permissions).values({
      fonctionnalite: 'apprenants',
      peut_voir: true,
      peut_ajouter: false,
      peut_modifier: false,
      peut_supprimer: false,
      etablissement_id: etablissement.id
    }).returning();
    
    const [editPermission] = await db.insert(permissions).values({
      fonctionnalite: 'apprenants',
      peut_voir: true,
      peut_ajouter: true,
      peut_modifier: true,
      peut_supprimer: false,
      etablissement_id: etablissement.id
    }).returning();
    
    const [adminPermission] = await db.insert(permissions).values({
      fonctionnalite: 'apprenants',
      peut_voir: true,
      peut_ajouter: true,
      peut_modifier: true,
      peut_supprimer: true,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created permissions');
    
    // Add users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    
    const [adminUser] = await db.insert(users).values({
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@example.com',
      mot_de_passe: hashedPassword,
      telephone: '+33123456789',
      statut: 'actif',
      etablissement_id: etablissement.id
    }).returning();
    
    const [teacherUser] = await db.insert(users).values({
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.dupont@example.com',
      mot_de_passe: hashedPassword,
      telephone: '+33987654321',
      statut: 'actif',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created users');
    
    // Assign roles to users
    await db.insert(utilisateur_roles).values({
      utilisateur_id: adminUser.id,
      role_id: adminRole.id,
      etablissement_id: etablissement.id
    });
    
    await db.insert(utilisateur_roles).values({
      utilisateur_id: teacherUser.id,
      role_id: enseignantRole.id,
      etablissement_id: etablissement.id
    });
    
    console.log('Assigned roles to users');
    
    // Add academic levels
    const [niveau6eme] = await db.insert(niveaux).values({
      nom: '6ème',
      cycle: 'Collège',
      rang_pedagogique: 1,
      langue_enseignement: 'Français',
      duree_academique: '1 an',
      is_examen: false,
      etablissement_id: etablissement.id
    }).returning();
    
    const [niveau5eme] = await db.insert(niveaux).values({
      nom: '5ème',
      cycle: 'Collège',
      rang_pedagogique: 2,
      langue_enseignement: 'Français',
      duree_academique: '1 an',
      is_examen: false,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created academic levels');
    
    // Add academic year
    const [anneeAcademique] = await db.insert(annees_academiques).values({
      annee: '2024-2025',
      date_debut: '2024-09-01',
      date_fin: '2025-06-30',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created academic year');
    
    // Add classrooms
    const [salle1] = await db.insert(salles).values({
      nom: 'Salle 101',
      capacite: 30,
      etablissement_id: etablissement.id
    }).returning();
    
    const [salle2] = await db.insert(salles).values({
      nom: 'Salle 102',
      capacite: 25,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created classrooms');
    
    // Add classes
    const [classe6A] = await db.insert(classes).values({
      nom: '6ème A',
      niveau_id: niveauScolaireCollege.id,
      annee_scolaire_id: anneeAcademique.id,
      enseignant_principal_id: teacherUser.id,
      serie: 'Générale',
      effectif_max: 30,
      salle_id: salle1.id,
      etablissement_id: etablissement.id
    }).returning();
    
    const [classe5A] = await db.insert(classes).values({
      nom: '5ème A',
      niveau_id: niveauScolaireCollege.id,
      annee_scolaire_id: anneeAcademique.id,
      enseignant_principal_id: teacherUser.id,
      serie: 'Générale',
      effectif_max: 25,
      salle_id: salle2.id,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created classes');
    
    // Add subjects
    const [matiereMath] = await db.insert(matieres).values({
      nom: 'Mathématiques',
      code: 'MATH',
      langue: 'FR',
      coefficient: 4,
      type: 'principale',
      est_a_examen: true,
      est_active: true,
      etablissement_id: etablissement.id
    }).returning();
    
    const [matierePhysique] = await db.insert(matieres).values({
      nom: 'Physique-Chimie',
      code: 'PHCH',
      langue: 'FR',
      coefficient: 3,
      type: 'principale',
      est_a_examen: true,
      est_active: true,
      etablissement_id: etablissement.id
    }).returning();
    
    const [matiereHistGeo] = await db.insert(matieres).values({
      nom: 'Histoire-Géographie',
      code: 'HIGE',
      langue: 'FR',
      coefficient: 3,
      type: 'principale',
      est_a_examen: true,
      est_active: true,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('Created subjects');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();