import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import * as schema from './shared/schema.js';

// Configure websocket for Neon database
const { neonConfig } = await import('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    
    // Create an establishment
    const [etablissement] = await db.insert(schema.etablissements).values({
      nom: 'Lycée Jean Moulin',
      code: 'LJM',
      type: 'Lycée',
      adresse: '10 Rue des Écoles, 75001 Paris',
      telephone: '+33123456789',
      email: 'contact@ljm.edu',
      directeur: 'Martin Dubois',
      site_web: 'https://www.ljm.edu'
    }).returning();
    
    console.log('✅ Created establishment:', etablissement.nom);
    
    // Create a school level
    const [niveau] = await db.insert(schema.niveaux_scolaires).values({
      libelle_fr: 'Lycée',
      libelle_en: 'High School',
      ordre: 1,
      cycle: 'Secondaire',
      filiere: 'Général',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('✅ Created school level:', niveau.libelle_fr);
    
    // Create admin role
    const [adminRole] = await db.insert(schema.roles).values({
      nom: 'admin',
      description: 'Administrator with all privileges',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('✅ Created admin role');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    
    const [admin] = await db.insert(schema.users).values({
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@example.com',
      mot_de_passe: hashedPassword,
      telephone: '+33612345678',
      statut: 'actif',
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('✅ Created admin user (email: admin@example.com, password: Password123)');
    
    // Assign admin role to user
    await db.insert(schema.utilisateur_roles).values({
      utilisateur_id: admin.id,
      role_id: adminRole.id,
      etablissement_id: etablissement.id
    });
    
    console.log('✅ Assigned admin role to user');
    
    // Create academic year
    const [anneeAcademique] = await db.insert(schema.annees_academiques).values({
      annee: '2024-2025',
      date_debut: new Date('2024-09-01'),
      date_fin: new Date('2025-07-01'),
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('✅ Created academic year:', anneeAcademique.annee);
    
    // Create a classroom
    const [salle] = await db.insert(schema.salles).values({
      nom: 'Salle 101',
      capacite: 30,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('✅ Created classroom:', salle.nom);
    
    // Create class
    const [classe] = await db.insert(schema.classes).values({
      nom: 'Terminale S',
      niveau_id: niveau.id,
      annee_scolaire_id: anneeAcademique.id,
      enseignant_principal_id: admin.id,
      serie: 'Scientifique',
      effectif_max: 30,
      salle_id: salle.id,
      etablissement_id: etablissement.id
    }).returning();
    
    console.log('✅ Created class:', classe.nom);
    
    // Create subjects
    const subjects = [
      { nom: 'Mathématiques', code: 'MATH', coefficient: 4 },
      { nom: 'Physique-Chimie', code: 'PHCH', coefficient: 3 },
      { nom: 'Sciences de la Vie et de la Terre', code: 'SVT', coefficient: 3 }
    ];
    
    for (const subject of subjects) {
      await db.insert(schema.matieres).values({
        nom: subject.nom,
        code: subject.code,
        langue: 'FR',
        coefficient: subject.coefficient,
        type: 'principale',
        est_a_examen: true,
        est_active: true,
        etablissement_id: etablissement.id
      });
    }
    
    console.log('✅ Created subjects');
    
    console.log('✅ Database seeding completed successfully!');
    console.log('You can now log in with: admin@example.com / Password123');
    
    await pool.end();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();