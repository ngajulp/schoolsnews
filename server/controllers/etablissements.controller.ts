import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all etablissements
 * @route   GET /api/v1/etablissements
 * @access  Private
 */
export const getEtablissements = asyncHandler(async (req: Request, res: Response) => {
  const etablissements = await storage.listEtablissements();
  
  res.json(etablissements);
});

/**
 * @desc    Get etablissement by ID
 * @route   GET /api/v1/etablissements/:id
 * @access  Private
 */
export const getEtablissementById = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = parseInt(req.params.id);
  
  const etablissement = await storage.getEtablissement(etablissementId);
  
  if (!etablissement) {
    throw new ApiError(404, 'Etablissement not found');
  }
  
  res.json(etablissement);
});

/**
 * @desc    Create a new etablissement
 * @route   POST /api/v1/etablissements
 * @access  Private/Admin
 */
export const createEtablissement = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    code, 
    type, 
    adresse, 
    telephone, 
    email, 
    directeur, 
    site_web, 
    logo_url 
  } = req.body;
  
  // Create etablissement
  const etablissement = await storage.createEtablissement({
    nom,
    code,
    type,
    adresse,
    telephone,
    email,
    directeur,
    site_web,
    logo_url,
    date_creation: new Date()
  });
  
  logger.info('Etablissement created', { etablissementId: etablissement.id, nom });
  
  res.status(201).json(etablissement);
});

/**
 * @desc    Update an etablissement
 * @route   PUT /api/v1/etablissements/:id
 * @access  Private/Admin
 */
export const updateEtablissement = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = parseInt(req.params.id);
  
  const etablissement = await storage.getEtablissement(etablissementId);
  
  if (!etablissement) {
    throw new ApiError(404, 'Etablissement not found');
  }
  
  const { 
    nom, 
    code, 
    type, 
    adresse, 
    telephone, 
    email, 
    directeur, 
    site_web, 
    logo_url 
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (code !== undefined) updateData.code = code;
  if (type !== undefined) updateData.type = type;
  if (adresse !== undefined) updateData.adresse = adresse;
  if (telephone !== undefined) updateData.telephone = telephone;
  if (email !== undefined) updateData.email = email;
  if (directeur !== undefined) updateData.directeur = directeur;
  if (site_web !== undefined) updateData.site_web = site_web;
  if (logo_url !== undefined) updateData.logo_url = logo_url;
  
  // Update etablissement
  const updatedEtablissement = await storage.updateEtablissement(etablissementId, updateData);
  
  if (!updatedEtablissement) {
    throw new ApiError(500, 'Etablissement update failed');
  }
  
  logger.info('Etablissement updated', { etablissementId });
  
  res.json(updatedEtablissement);
});

/**
 * @desc    Get all classes for an etablissement
 * @route   GET /api/v1/etablissements/:id/classes
 * @access  Private
 */
export const getEtablissementClasses = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = parseInt(req.params.id);
  
  const etablissement = await storage.getEtablissement(etablissementId);
  
  if (!etablissement) {
    throw new ApiError(404, 'Etablissement not found');
  }
  
  const classes = await storage.listClasses(undefined, etablissementId);
  
  res.json(classes);
});

/**
 * @desc    Get all users for an etablissement
 * @route   GET /api/v1/etablissements/:id/utilisateurs
 * @access  Private/Admin
 */
export const getEtablissementUtilisateurs = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = parseInt(req.params.id);
  
  const etablissement = await storage.getEtablissement(etablissementId);
  
  if (!etablissement) {
    throw new ApiError(404, 'Etablissement not found');
  }
  
  const users = await storage.listUsers(etablissementId);
  
  // Remove passwords from response
  const safeUsers = users.map(user => {
    const { mot_de_passe, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json(safeUsers);
});

/**
 * @desc    Get all apprenants for an etablissement
 * @route   GET /api/v1/etablissements/:id/apprenants
 * @access  Private
 */
export const getEtablissementApprenants = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = parseInt(req.params.id);
  
  const etablissement = await storage.getEtablissement(etablissementId);
  
  if (!etablissement) {
    throw new ApiError(404, 'Etablissement not found');
  }
  
  const apprenants = await storage.listApprenants(undefined, etablissementId);
  
  res.json(apprenants);
});

/**
 * @desc    Get all matieres for an etablissement
 * @route   GET /api/v1/etablissements/:id/matieres
 * @access  Private
 */
export const getEtablissementMatieres = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = parseInt(req.params.id);
  
  const etablissement = await storage.getEtablissement(etablissementId);
  
  if (!etablissement) {
    throw new ApiError(404, 'Etablissement not found');
  }
  
  const matieres = await storage.listMatieres(etablissementId);
  
  res.json(matieres);
});
