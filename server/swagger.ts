import swaggerJsdoc from 'swagger-jsdoc';
import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { logger } from './logger';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management System API',
      version: '1.0.0',
      description: 'API documentation for School Management System',
      contact: {
        name: 'API Support',
        email: 'support@schoolapi.com'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Authentication schemas
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nom: { type: 'string', example: 'Doe' },
                prenom: { type: 'string', example: 'John' },
                email: { type: 'string', example: 'john.doe@example.com' },
                roles: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['admin']
                }
              }
            }
          }
        },
        
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Doe' },
            prenom: { type: 'string', example: 'John' },
            email: { type: 'string', example: 'john.doe@example.com' },
            telephone: { type: 'string', example: '+1234567890' },
            statut: { 
              type: 'string', 
              enum: ['actif', 'inactif', 'suspendu', 'archive'],
              example: 'actif'
            },
            etablissement_id: { type: 'integer', example: 1 },
            date_creation: { 
              type: 'string', 
              format: 'date-time',
              example: '2023-01-01T00:00:00Z'
            }
          }
        },
        
        // Apprenant schemas
        Apprenant: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            matricule: { type: 'string', example: 'APP001' },
            nom: { type: 'string', example: 'Dupont' },
            prenom: { type: 'string', example: 'Marie' },
            date_naissance: { 
              type: 'string', 
              format: 'date',
              example: '2005-06-15'
            },
            date_inscription: { 
              type: 'string', 
              format: 'date',
              example: '2022-09-01'
            },
            statut: { type: 'string', example: 'actif' },
            lieu_naissance: { type: 'string', example: 'Paris' },
            sexe: { 
              type: 'string', 
              enum: ['Masculin', 'Féminin'],
              example: 'Féminin' 
            },
            nationalite: { type: 'string', example: 'Française' },
            adresse: { type: 'string', example: '123 Rue des Écoles' },
            email: { type: 'string', example: 'marie.dupont@example.com' },
            type_apprenant: { type: 'string', example: 'externe' },
            situation_medicale: { type: 'string', example: 'RAS' },
            statut_inscription: { type: 'string', example: 'Inscrit' },
            classe_actuelle_id: { type: 'integer', example: 5 },
            annee_scolaire_id: { type: 'integer', example: 2 },
            photo_url: { type: 'string', example: 'https://example.com/photos/marie.jpg' },
            etablissement_id: { type: 'integer', example: 1 }
          }
        },
        
        // Classe schemas
        Classe: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nom: { type: 'string', example: '6ème A' },
            niveau_id: { type: 'integer', example: 2 },
            annee_scolaire_id: { type: 'integer', example: 3 },
            enseignant_principal_id: { type: 'integer', example: 5 },
            serie: { type: 'string', example: 'Générale' },
            effectif_max: { type: 'integer', example: 30 },
            salle_id: { type: 'integer', example: 10 },
            statut: { type: 'string', example: 'Active' },
            etablissement_id: { type: 'integer', example: 1 }
          }
        },
        
        // Matiere schemas
        Matiere: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Mathématiques' },
            code: { type: 'string', example: 'MATH' },
            langue: { type: 'string', example: 'FR' },
            coefficient: { type: 'integer', example: 4 },
            type: { type: 'string', example: 'principale' },
            est_a_examen: { type: 'boolean', example: true },
            est_active: { type: 'boolean', example: true },
            etablissement_id: { type: 'integer', example: 1 }
          }
        },
        
        // Etablissement schemas
        Etablissement: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Lycée Jean Moulin' },
            code: { type: 'string', example: 'LJM' },
            type: { type: 'string', example: 'Lycée' },
            adresse: { type: 'string', example: '10 Rue des Écoles, 75001 Paris' },
            telephone: { type: 'string', example: '+33123456789' },
            email: { type: 'string', example: 'contact@ljm.edu' },
            directeur: { type: 'string', example: 'Martin Dubois' },
            site_web: { type: 'string', example: 'https://www.ljm.edu' },
            logo_url: { type: 'string', example: 'https://example.com/logos/ljm.png' },
            date_creation: { 
              type: 'string', 
              format: 'date-time',
              example: '2020-01-01T00:00:00Z' 
            }
          }
        },
        
        // Error schemas
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'An error occurred' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./server/routes/*.ts'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup Swagger in Express app
export const setupSwagger = (app: Express) => {
  // Serve swagger docs
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve swagger specs as JSON
  app.get('/api/v1/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  logger.info('Swagger documentation initialized');
};
