import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all parents
 * @route   GET /api/v1/parents
 * @access  Private/Admin
 */
export const getParents = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const parents = await storage.listParents(etablissementId);
  
  res.json(parents);
});

/**
 * @desc    Get parent by ID
 * @route   GET /api/v1/parents/:id
 * @access  Private/Admin
 */
export const getParentById = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  res.json(parent);
});

/**
 * @desc    Create a new parent
 * @route   POST /api/v1/parents
 * @access  Private/Admin
 */
export const createParent = asyncHandler(async (req: Request, res: Response) => {
  const { 
    utilisateur_id, 
    profession,
    revenu_mensuel,
    nombre_enfants,
    etablissement_id 
  } = req.body;
  
  // Check if user exists
  const user = await storage.getUser(utilisateur_id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Check if parent with this user_id already exists
  const existingParent = await storage.getParentByUserId(utilisateur_id);
  
  if (existingParent) {
    throw new ApiError(400, 'A parent record already exists for this user');
  }
  
  // Create parent
  const parent = await storage.createParent({
    utilisateur_id,
    profession,
    revenu_mensuel,
    nombre_enfants: nombre_enfants || 0,
    etablissement_id: etablissement_id || user.etablissement_id,
    date_creation: new Date()
  });
  
  logger.info('Parent created', { 
    parentId: parent.id, 
    userId: utilisateur_id,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(parent);
});

/**
 * @desc    Update a parent
 * @route   PUT /api/v1/parents/:id
 * @access  Private/Admin
 */
export const updateParent = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  const { 
    profession,
    revenu_mensuel,
    nombre_enfants
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (profession !== undefined) updateData.profession = profession;
  if (revenu_mensuel !== undefined) updateData.revenu_mensuel = revenu_mensuel;
  if (nombre_enfants !== undefined) updateData.nombre_enfants = nombre_enfants;
  
  // Add modification info
  updateData.date_modification = new Date();
  
  // Update parent
  const updatedParent = await storage.updateParent(parentId, updateData);
  
  if (!updatedParent) {
    throw new ApiError(500, 'Parent update failed');
  }
  
  logger.info('Parent updated', { 
    parentId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedParent);
});

/**
 * @desc    Get parent's children
 * @route   GET /api/v1/parents/:id/enfants
 * @access  Private/Admin/Parent
 */
export const getParentChildren = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  // Check if the user is authorized (admin or the parent themselves)
  if (req.user?.id !== parent.utilisateur_id && !req.user?.roles?.some(role => ['admin', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to view this parent\'s children');
  }
  
  const children = await storage.getParentChildren(parentId);
  
  res.json(children);
});

/**
 * @desc    Link child to parent
 * @route   POST /api/v1/parents/:id/enfants
 * @access  Private/Admin
 */
export const linkChildToParent = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  const { apprenant_id, lien_parente } = req.body;
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  const apprenant = await storage.getApprenant(apprenant_id);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if relationship already exists
  const existingRelationship = await storage.getParentChildRelationship(parentId, apprenant_id);
  
  if (existingRelationship) {
    throw new ApiError(400, 'This parent is already linked to this child');
  }
  
  // Create parent-child relationship
  const relationship = await storage.createParentChildRelationship({
    parent_id: parentId,
    apprenant_id,
    lien_parente: lien_parente || 'Parent',
    date_creation: new Date()
  });
  
  // Update parent's children count
  await storage.updateParent(parentId, { 
    nombre_enfants: (parent.nombre_enfants || 0) + 1
  });
  
  logger.info('Child linked to parent', { 
    parentId, 
    studentId: apprenant_id,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(relationship);
});

/**
 * @desc    Remove child from parent
 * @route   DELETE /api/v1/parents/:id/enfants/:apprenantId
 * @access  Private/Admin
 */
export const unlinkChildFromParent = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  const apprenantId = parseInt(req.params.apprenantId);
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  // Check if relationship exists
  const relationship = await storage.getParentChildRelationship(parentId, apprenantId);
  
  if (!relationship) {
    throw new ApiError(404, 'This parent is not linked to this child');
  }
  
  // Remove parent-child relationship
  await storage.deleteParentChildRelationship(parentId, apprenantId);
  
  // Update parent's children count
  if (parent.nombre_enfants && parent.nombre_enfants > 0) {
    await storage.updateParent(parentId, { 
      nombre_enfants: parent.nombre_enfants - 1
    });
  }
  
  logger.info('Child unlinked from parent', { 
    parentId, 
    studentId: apprenantId,
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Child successfully unlinked from parent' });
});

/**
 * @desc    Get parent's fees payment status for all children
 * @route   GET /api/v1/parents/:id/paiements
 * @access  Private/Admin/Parent
 */
export const getParentPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  // Check if the user is authorized (admin or the parent themselves)
  if (req.user?.id !== parent.utilisateur_id && !req.user?.roles?.some(role => ['admin', 'financier', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to view this parent\'s payment status');
  }
  
  const children = await storage.getParentChildren(parentId);
  
  if (!children || children.length === 0) {
    return res.json([]);
  }
  
  // Get financial status for each child
  const paymentStatus = await Promise.all(
    children.map(async child => {
      const financialStatus = await storage.getStudentFinancialStatus(child.id);
      return {
        apprenant: child,
        statut_financier: financialStatus
      };
    })
  );
  
  res.json(paymentStatus);
});

/**
 * @desc    Send convocation to parent
 * @route   POST /api/v1/parents/:id/convocations
 * @access  Private/Admin/Teacher/Principal
 */
export const sendParentConvocation = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  const { 
    sujet, 
    message, 
    date_convocation, 
    motif, 
    apprenant_id, 
    est_urgent
  } = req.body;
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  // Verify that the student is linked to this parent if apprenant_id is provided
  if (apprenant_id) {
    const relationship = await storage.getParentChildRelationship(parentId, apprenant_id);
    
    if (!relationship) {
      throw new ApiError(400, 'This parent is not linked to the specified student');
    }
  }
  
  // Create convocation
  const convocation = await storage.createConvocation({
    parent_id: parentId,
    apprenant_id,
    sujet,
    message,
    date_convocation: date_convocation ? new Date(date_convocation) : new Date(),
    motif,
    est_urgent: est_urgent || false,
    statut: 'envoyée',
    envoyee_par: req.user?.id,
    date_creation: new Date()
  });
  
  // Send notification message to parent
  await storage.createMessage({
    expediteur_id: req.user?.id,
    sujet: `Convocation: ${sujet}`,
    contenu: message,
    date_envoi: new Date(),
    priorite: est_urgent ? 'haute' : 'normale',
    est_systeme: true
  }).then(async message => {
    await storage.addMessageRecipient({
      message_id: message.id,
      destinataire_id: parent.utilisateur_id,
      statut: 'non_lu'
    });
  });
  
  logger.info('Parent convocation sent', { 
    parentId, 
    convocationId: convocation.id,
    sentBy: req.user?.id 
  });
  
  res.status(201).json(convocation);
});

/**
 * @desc    Get convocations for a parent
 * @route   GET /api/v1/parents/:id/convocations
 * @access  Private/Admin/Parent
 */
export const getParentConvocations = asyncHandler(async (req: Request, res: Response) => {
  const parentId = parseInt(req.params.id);
  
  const parent = await storage.getParent(parentId);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  // Check if the user is authorized (admin or the parent themselves)
  if (req.user?.id !== parent.utilisateur_id && !req.user?.roles?.some(role => ['admin', 'teacher', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to view this parent\'s convocations');
  }
  
  const convocations = await storage.getParentConvocations(parentId);
  
  res.json(convocations);
});

/**
 * @desc    Update convocation status
 * @route   PUT /api/v1/parents/convocations/:id
 * @access  Private/Admin/Parent
 */
export const updateConvocationStatus = asyncHandler(async (req: Request, res: Response) => {
  const convocationId = parseInt(req.params.id);
  const { statut, commentaire } = req.body;
  
  const convocation = await storage.getConvocation(convocationId);
  
  if (!convocation) {
    throw new ApiError(404, 'Convocation not found');
  }
  
  // Check if the user is authorized (admin or the parent themselves)
  const parent = await storage.getParent(convocation.parent_id);
  
  if (!parent) {
    throw new ApiError(404, 'Parent not found');
  }
  
  if (req.user?.id !== parent.utilisateur_id && !req.user?.roles?.some(role => ['admin', 'teacher', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to update this convocation');
  }
  
  // Update convocation
  const updatedConvocation = await storage.updateConvocation(convocationId, {
    statut,
    commentaire,
    date_modification: new Date()
  });
  
  logger.info('Convocation status updated', { 
    convocationId, 
    status: statut,
    updatedBy: req.user?.id 
  });
  
  res.json(updatedConvocation);
});