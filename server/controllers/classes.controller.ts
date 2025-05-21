import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all classes
 * @route   GET /api/v1/classes
 * @access  Private
 */
export const getClasses = asyncHandler(async (req: Request, res: Response) => {
  const niveauId = req.query.niveau_id 
    ? parseInt(req.query.niveau_id as string) 
    : undefined;
  
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const classes = await storage.listClasses(niveauId, etablissementId);
  
  res.json(classes);
});

/**
 * @desc    Get class by ID
 * @route   GET /api/v1/classes/:id
 * @access  Private
 */
export const getClasseById = asyncHandler(async (req: Request, res: Response) => {
  const classeId = parseInt(req.params.id);
  
  const classe = await storage.getClasse(classeId);
  
  if (!classe) {
    throw new ApiError(404, 'Classe not found');
  }
  
  res.json(classe);
});

/**
 * @desc    Create a new class
 * @route   POST /api/v1/classes
 * @access  Private/Admin
 */
export const createClasse = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    niveau_id, 
    annee_scolaire_id, 
    enseignant_principal_id, 
    serie, 
    effectif_max, 
    salle_id, 
    statut, 
    etablissement_id 
  } = req.body;
  
  // Create classe
  const classe = await storage.createClasse({
    nom,
    niveau_id,
    annee_scolaire_id,
    enseignant_principal_id,
    serie,
    effectif_max,
    salle_id,
    statut: statut || 'Active',
    etablissement_id
  });
  
  logger.info('Classe created', { classeId: classe.id, nom });
  
  res.status(201).json(classe);
});

/**
 * @desc    Update a class
 * @route   PUT /api/v1/classes/:id
 * @access  Private/Admin
 */
export const updateClasse = asyncHandler(async (req: Request, res: Response) => {
  const classeId = parseInt(req.params.id);
  
  const classe = await storage.getClasse(classeId);
  
  if (!classe) {
    throw new ApiError(404, 'Classe not found');
  }
  
  const { 
    nom, 
    niveau_id, 
    annee_scolaire_id, 
    enseignant_principal_id, 
    serie, 
    effectif_max, 
    salle_id, 
    statut, 
    etablissement_id 
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (niveau_id !== undefined) updateData.niveau_id = niveau_id;
  if (annee_scolaire_id !== undefined) updateData.annee_scolaire_id = annee_scolaire_id;
  if (enseignant_principal_id !== undefined) updateData.enseignant_principal_id = enseignant_principal_id;
  if (serie !== undefined) updateData.serie = serie;
  if (effectif_max !== undefined) updateData.effectif_max = effectif_max;
  if (salle_id !== undefined) updateData.salle_id = salle_id;
  if (statut !== undefined) updateData.statut = statut;
  if (etablissement_id !== undefined) updateData.etablissement_id = etablissement_id;
  
  // Update classe
  const updatedClasse = await storage.updateClasse(classeId, updateData);
  
  if (!updatedClasse) {
    throw new ApiError(500, 'Classe update failed');
  }
  
  logger.info('Classe updated', { classeId });
  
  res.json(updatedClasse);
});

/**
 * @desc    Delete a class (set status to 'Inactive')
 * @route   DELETE /api/v1/classes/:id
 * @access  Private/Admin
 */
export const deleteClasse = asyncHandler(async (req: Request, res: Response) => {
  const classeId = parseInt(req.params.id);
  
  const classe = await storage.getClasse(classeId);
  
  if (!classe) {
    throw new ApiError(404, 'Classe not found');
  }
  
  // Instead of deleting, set status to 'Inactive'
  const updatedClasse = await storage.updateClasse(classeId, { statut: 'Inactive' });
  
  if (!updatedClasse) {
    throw new ApiError(500, 'Classe deletion failed');
  }
  
  logger.info('Classe marked as inactive', { classeId });
  
  res.json({ message: 'Classe deleted successfully' });
});

/**
 * @desc    Get students in a class
 * @route   GET /api/v1/classes/:id/apprenants
 * @access  Private
 */
export const getClasseApprenants = asyncHandler(async (req: Request, res: Response) => {
  const classeId = parseInt(req.params.id);
  
  const classe = await storage.getClasse(classeId);
  
  if (!classe) {
    throw new ApiError(404, 'Classe not found');
  }
  
  const apprenants = await storage.listApprenants(classeId);
  
  res.json(apprenants);
});
