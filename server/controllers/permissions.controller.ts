import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all permissions
 * @route   GET /api/v1/permissions
 * @access  Private/Admin
 */
export const getPermissions = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const permissions = await storage.listPermissions(etablissementId);
  
  res.json(permissions);
});

/**
 * @desc    Get permission by ID
 * @route   GET /api/v1/permissions/:id
 * @access  Private/Admin
 */
export const getPermissionById = asyncHandler(async (req: Request, res: Response) => {
  const permissionId = parseInt(req.params.id);
  
  const permission = await storage.getPermission(permissionId);
  
  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }
  
  res.json(permission);
});

/**
 * @desc    Create a new permission
 * @route   POST /api/v1/permissions
 * @access  Private/Admin
 */
export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const { 
    fonctionnalite, 
    peut_voir, 
    peut_ajouter, 
    peut_modifier, 
    peut_supprimer, 
    etablissement_id 
  } = req.body;
  
  // Check if permission with same function name exists
  const permissions = await storage.listPermissions(etablissement_id);
  const existingPermission = permissions.find(p => 
    p.fonctionnalite === fonctionnalite && 
    p.etablissement_id === etablissement_id
  );
  
  if (existingPermission) {
    throw new ApiError(400, 'Permission for this functionality already exists');
  }
  
  // Create permission
  const permission = await storage.createPermission({
    fonctionnalite,
    peut_voir: peut_voir || false,
    peut_ajouter: peut_ajouter || false,
    peut_modifier: peut_modifier || false,
    peut_supprimer: peut_supprimer || false,
    etablissement_id
  });
  
  logger.info('Permission created', { 
    permissionId: permission.id, 
    functionality: permission.fonctionnalite,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(permission);
});

/**
 * @desc    Update a permission
 * @route   PUT /api/v1/permissions/:id
 * @access  Private/Admin
 */
export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  const permissionId = parseInt(req.params.id);
  
  const permission = await storage.getPermission(permissionId);
  
  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }
  
  const { 
    fonctionnalite, 
    peut_voir, 
    peut_ajouter, 
    peut_modifier, 
    peut_supprimer 
  } = req.body;
  
  // Check if function name is being changed and if it's already in use
  if (fonctionnalite && fonctionnalite !== permission.fonctionnalite) {
    const permissions = await storage.listPermissions(permission.etablissement_id);
    const existingPermission = permissions.find(p => 
      p.fonctionnalite === fonctionnalite && 
      p.etablissement_id === permission.etablissement_id
    );
    
    if (existingPermission) {
      throw new ApiError(400, 'Permission for this functionality already exists');
    }
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (fonctionnalite !== undefined) updateData.fonctionnalite = fonctionnalite;
  if (peut_voir !== undefined) updateData.peut_voir = peut_voir;
  if (peut_ajouter !== undefined) updateData.peut_ajouter = peut_ajouter;
  if (peut_modifier !== undefined) updateData.peut_modifier = peut_modifier;
  if (peut_supprimer !== undefined) updateData.peut_supprimer = peut_supprimer;
  
  // Update permission
  const updatedPermission = await storage.updatePermission(permissionId, updateData);
  
  if (!updatedPermission) {
    throw new ApiError(500, 'Permission update failed');
  }
  
  logger.info('Permission updated', { 
    permissionId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedPermission);
});

/**
 * @desc    Delete a permission
 * @route   DELETE /api/v1/permissions/:id
 * @access  Private/Admin
 */
export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  const permissionId = parseInt(req.params.id);
  
  const permission = await storage.getPermission(permissionId);
  
  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }
  
  // Check if permission is assigned to any roles
  const rolesWithPermission = await storage.getRolesByPermissionId(permissionId);
  
  if (rolesWithPermission && rolesWithPermission.length > 0) {
    throw new ApiError(400, `Permission cannot be deleted as it is assigned to ${rolesWithPermission.length} role(s)`);
  }
  
  // Delete permission
  await storage.deletePermission(permissionId);
  
  logger.info('Permission deleted', { 
    permissionId, 
    functionality: permission.fonctionnalite, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Permission deleted successfully' });
});

/**
 * @desc    Get roles with a specific permission
 * @route   GET /api/v1/permissions/:id/roles
 * @access  Private/Admin
 */
export const getPermissionRoles = asyncHandler(async (req: Request, res: Response) => {
  const permissionId = parseInt(req.params.id);
  
  const permission = await storage.getPermission(permissionId);
  
  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }
  
  const roles = await storage.getRolesByPermissionId(permissionId);
  
  res.json(roles);
});