import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all sanctions
 * @route   GET /api/v1/sanctions
 * @access  Private/Admin/Teacher
 */
export const getSanctions = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const apprenantId = req.query.apprenant_id
    ? parseInt(req.query.apprenant_id as string)
    : undefined;
  
  const sanctions = await storage.listSanctions(etablissementId, apprenantId);
  
  res.json(sanctions);
});

/**
 * @desc    Get sanction by ID
 * @route   GET /api/v1/sanctions/:id
 * @access  Private/Admin/Teacher
 */
export const getSanctionById = asyncHandler(async (req: Request, res: Response) => {
  const sanctionId = parseInt(req.params.id);
  
  const sanction = await storage.getSanction(sanctionId);
  
  if (!sanction) {
    throw new ApiError(404, 'Sanction not found');
  }
  
  res.json(sanction);
});

/**
 * @desc    Create a new sanction
 * @route   POST /api/v1/sanctions
 * @access  Private/Admin/Teacher
 */
export const createSanction = asyncHandler(async (req: Request, res: Response) => {
  const { 
    apprenant_id,
    type_sanction,
    motif,
    date_sanction,
    date_fin,
    description,
    etablissement_id 
  } = req.body;
  
  // Check if student exists
  const apprenant = await storage.getApprenant(apprenant_id);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Create sanction
  const sanction = await storage.createSanction({
    apprenant_id,
    type_sanction,
    motif,
    date_sanction: date_sanction || new Date(),
    date_fin,
    description,
    delivre_par: req.user?.id,
    statut: 'active',
    etablissement_id: etablissement_id || apprenant.etablissement_id
  });
  
  logger.info('Sanction created', { 
    sanctionId: sanction.id, 
    studentId: apprenant_id,
    type: type_sanction,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(sanction);
});

/**
 * @desc    Update a sanction
 * @route   PUT /api/v1/sanctions/:id
 * @access  Private/Admin
 */
export const updateSanction = asyncHandler(async (req: Request, res: Response) => {
  const sanctionId = parseInt(req.params.id);
  
  const sanction = await storage.getSanction(sanctionId);
  
  if (!sanction) {
    throw new ApiError(404, 'Sanction not found');
  }
  
  const { 
    type_sanction,
    motif,
    date_sanction,
    date_fin,
    description,
    statut
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (type_sanction !== undefined) updateData.type_sanction = type_sanction;
  if (motif !== undefined) updateData.motif = motif;
  if (date_sanction !== undefined) updateData.date_sanction = date_sanction;
  if (date_fin !== undefined) updateData.date_fin = date_fin;
  if (description !== undefined) updateData.description = description;
  if (statut !== undefined) updateData.statut = statut;
  
  // Update sanction
  const updatedSanction = await storage.updateSanction(sanctionId, updateData);
  
  if (!updatedSanction) {
    throw new ApiError(500, 'Sanction update failed');
  }
  
  logger.info('Sanction updated', { 
    sanctionId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedSanction);
});

/**
 * @desc    Delete a sanction (set status to 'cancelled')
 * @route   DELETE /api/v1/sanctions/:id
 * @access  Private/Admin
 */
export const deleteSanction = asyncHandler(async (req: Request, res: Response) => {
  const sanctionId = parseInt(req.params.id);
  
  const sanction = await storage.getSanction(sanctionId);
  
  if (!sanction) {
    throw new ApiError(404, 'Sanction not found');
  }
  
  // Instead of deleting, set status to 'annulee'
  const updatedSanction = await storage.updateSanction(sanctionId, { statut: 'annulee' });
  
  if (!updatedSanction) {
    throw new ApiError(500, 'Sanction cancellation failed');
  }
  
  logger.info('Sanction cancelled', { 
    sanctionId, 
    cancelledBy: req.user?.id 
  });
  
  res.json({ message: 'Sanction cancelled successfully' });
});

/**
 * @desc    Get student sanctions
 * @route   GET /api/v1/apprenants/:id/sanctions
 * @access  Private/Admin/Teacher
 */
export const getStudentSanctions = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  const sanctions = await storage.listSanctions(undefined, apprenantId);
  
  res.json(sanctions);
});