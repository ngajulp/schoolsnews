import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all apprenants
 * @route   GET /api/v1/apprenants
 * @access  Private
 */
export const getApprenants = asyncHandler(async (req: Request, res: Response) => {
  const classeId = req.query.classe_id 
    ? parseInt(req.query.classe_id as string) 
    : undefined;
  
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const apprenants = await storage.listApprenants(classeId, etablissementId);
  
  res.json(apprenants);
});

/**
 * @desc    Get apprenant by ID
 * @route   GET /api/v1/apprenants/:id
 * @access  Private
 */
export const getApprenantById = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Apprenant not found');
  }
  
  res.json(apprenant);
});

/**
 * @desc    Get apprenant by matricule
 * @route   GET /api/v1/apprenants/matricule/:matricule
 * @access  Private
 */
export const getApprenantByMatricule = asyncHandler(async (req: Request, res: Response) => {
  const matricule = req.params.matricule;
  
  const apprenant = await storage.getApprenantByMatricule(matricule);
  
  if (!apprenant) {
    throw new ApiError(404, 'Apprenant not found');
  }
  
  res.json(apprenant);
});

/**
 * @desc    Create a new apprenant
 * @route   POST /api/v1/apprenants
 * @access  Private/Admin
 */
export const createApprenant = asyncHandler(async (req: Request, res: Response) => {
  const { 
    matricule,
    nom,
    prenom,
    date_naissance,
    date_inscription,
    statut,
    lieu_naissance,
    sexe,
    nationalite,
    adresse,
    email,
    type_apprenant,
    situation_medicale,
    statut_inscription,
    classe_actuelle_id,
    annee_scolaire_id,
    photo_url,
    etablissement_id
  } = req.body;
  
  // Check if apprenant with matricule already exists
  const existingApprenant = await storage.getApprenantByMatricule(matricule);
  
  if (existingApprenant) {
    throw new ApiError(400, 'Apprenant with this matricule already exists');
  }
  
  // Create apprenant
  const apprenant = await storage.createApprenant({
    matricule,
    nom,
    prenom,
    date_naissance,
    date_inscription: date_inscription || new Date(),
    statut: statut || 'actif',
    lieu_naissance,
    sexe,
    nationalite,
    adresse,
    email,
    type_apprenant,
    situation_medicale,
    statut_inscription: statut_inscription || 'Inscrit',
    classe_actuelle_id,
    annee_scolaire_id,
    photo_url,
    etablissement_id,
    cree_le: new Date()
  });
  
  logger.info('Apprenant created', { apprenantId: apprenant.id, matricule });
  
  res.status(201).json(apprenant);
});

/**
 * @desc    Update an apprenant
 * @route   PUT /api/v1/apprenants/:id
 * @access  Private/Admin
 */
export const updateApprenant = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Apprenant not found');
  }
  
  const { 
    nom,
    prenom,
    date_naissance,
    date_inscription,
    statut,
    lieu_naissance,
    sexe,
    nationalite,
    adresse,
    email,
    type_apprenant,
    situation_medicale,
    statut_inscription,
    classe_actuelle_id,
    annee_scolaire_id,
    photo_url,
    etablissement_id
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (prenom !== undefined) updateData.prenom = prenom;
  if (date_naissance !== undefined) updateData.date_naissance = date_naissance;
  if (date_inscription !== undefined) updateData.date_inscription = date_inscription;
  if (statut !== undefined) updateData.statut = statut;
  if (lieu_naissance !== undefined) updateData.lieu_naissance = lieu_naissance;
  if (sexe !== undefined) updateData.sexe = sexe;
  if (nationalite !== undefined) updateData.nationalite = nationalite;
  if (adresse !== undefined) updateData.adresse = adresse;
  if (email !== undefined) updateData.email = email;
  if (type_apprenant !== undefined) updateData.type_apprenant = type_apprenant;
  if (situation_medicale !== undefined) updateData.situation_medicale = situation_medicale;
  if (statut_inscription !== undefined) updateData.statut_inscription = statut_inscription;
  if (classe_actuelle_id !== undefined) updateData.classe_actuelle_id = classe_actuelle_id;
  if (annee_scolaire_id !== undefined) updateData.annee_scolaire_id = annee_scolaire_id;
  if (photo_url !== undefined) updateData.photo_url = photo_url;
  if (etablissement_id !== undefined) updateData.etablissement_id = etablissement_id;
  
  // Update apprenant
  const updatedApprenant = await storage.updateApprenant(apprenantId, updateData);
  
  if (!updatedApprenant) {
    throw new ApiError(500, 'Apprenant update failed');
  }
  
  logger.info('Apprenant updated', { apprenantId });
  
  res.json(updatedApprenant);
});

/**
 * @desc    Delete an apprenant (set status to 'inactive')
 * @route   DELETE /api/v1/apprenants/:id
 * @access  Private/Admin
 */
export const deleteApprenant = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Apprenant not found');
  }
  
  // Instead of deleting, set status to 'inactive'
  const updatedApprenant = await storage.updateApprenant(apprenantId, { statut: 'inactive' });
  
  if (!updatedApprenant) {
    throw new ApiError(500, 'Apprenant deletion failed');
  }
  
  logger.info('Apprenant marked as inactive', { apprenantId });
  
  res.json({ message: 'Apprenant deleted successfully' });
});

/**
 * @desc    Change class for an apprenant
 * @route   PUT /api/v1/apprenants/:id/classe
 * @access  Private/Admin
 */
export const changeClasse = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  const { classe_id } = req.body;
  
  if (!classe_id) {
    throw new ApiError(400, 'Class ID is required');
  }
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Apprenant not found');
  }
  
  const classe = await storage.getClasse(classe_id);
  
  if (!classe) {
    throw new ApiError(404, 'Classe not found');
  }
  
  // Update apprenant's class
  const updatedApprenant = await storage.updateApprenant(apprenantId, { 
    classe_actuelle_id: classe_id 
  });
  
  if (!updatedApprenant) {
    throw new ApiError(500, 'Class change failed');
  }
  
  logger.info('Apprenant class changed', { 
    apprenantId, 
    oldClassId: apprenant.classe_actuelle_id, 
    newClassId: classe_id 
  });
  
  res.json({
    message: 'Class changed successfully',
    apprenant: updatedApprenant
  });
});
