import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all matieres
 * @route   GET /api/v1/matieres
 * @access  Private
 */
export const getMatieres = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const matieres = await storage.listMatieres(etablissementId);
  
  res.json(matieres);
});

/**
 * @desc    Get matiere by ID
 * @route   GET /api/v1/matieres/:id
 * @access  Private
 */
export const getMatiereById = asyncHandler(async (req: Request, res: Response) => {
  const matiereId = parseInt(req.params.id);
  
  const matiere = await storage.getMatiere(matiereId);
  
  if (!matiere) {
    throw new ApiError(404, 'Matiere not found');
  }
  
  res.json(matiere);
});

/**
 * @desc    Create a new matiere
 * @route   POST /api/v1/matieres
 * @access  Private/Admin
 */
export const createMatiere = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    code, 
    langue, 
    coefficient, 
    type, 
    est_a_examen, 
    est_active, 
    etablissement_id 
  } = req.body;
  
  // Create matiere
  const matiere = await storage.createMatiere({
    nom,
    code,
    langue,
    coefficient: coefficient || 1,
    type,
    est_a_examen: est_a_examen || false,
    est_active: est_active === undefined ? true : est_active,
    etablissement_id
  });
  
  logger.info('Matiere created', { matiereId: matiere.id, code });
  
  res.status(201).json(matiere);
});

/**
 * @desc    Update a matiere
 * @route   PUT /api/v1/matieres/:id
 * @access  Private/Admin
 */
export const updateMatiere = asyncHandler(async (req: Request, res: Response) => {
  const matiereId = parseInt(req.params.id);
  
  const matiere = await storage.getMatiere(matiereId);
  
  if (!matiere) {
    throw new ApiError(404, 'Matiere not found');
  }
  
  const { 
    nom, 
    code, 
    langue, 
    coefficient, 
    type, 
    est_a_examen, 
    est_active, 
    etablissement_id 
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (code !== undefined) updateData.code = code;
  if (langue !== undefined) updateData.langue = langue;
  if (coefficient !== undefined) updateData.coefficient = coefficient;
  if (type !== undefined) updateData.type = type;
  if (est_a_examen !== undefined) updateData.est_a_examen = est_a_examen;
  if (est_active !== undefined) updateData.est_active = est_active;
  if (etablissement_id !== undefined) updateData.etablissement_id = etablissement_id;
  
  // Update matiere
  const updatedMatiere = await storage.updateMatiere(matiereId, updateData);
  
  if (!updatedMatiere) {
    throw new ApiError(500, 'Matiere update failed');
  }
  
  logger.info('Matiere updated', { matiereId });
  
  res.json(updatedMatiere);
});

/**
 * @desc    Delete a matiere (set est_active to false)
 * @route   DELETE /api/v1/matieres/:id
 * @access  Private/Admin
 */
export const deleteMatiere = asyncHandler(async (req: Request, res: Response) => {
  const matiereId = parseInt(req.params.id);
  
  const matiere = await storage.getMatiere(matiereId);
  
  if (!matiere) {
    throw new ApiError(404, 'Matiere not found');
  }
  
  // Instead of deleting, set est_active to false
  const updatedMatiere = await storage.updateMatiere(matiereId, { est_active: false });
  
  if (!updatedMatiere) {
    throw new ApiError(500, 'Matiere deletion failed');
  }
  
  logger.info('Matiere deactivated', { matiereId });
  
  res.json({ message: 'Matiere deleted successfully' });
});
