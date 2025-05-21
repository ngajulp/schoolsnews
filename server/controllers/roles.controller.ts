import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all roles
 * @route   GET /api/v1/roles
 * @access  Private/Admin
 */
export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const roles = await storage.listRoles(etablissementId);
  
  res.json(roles);
});

/**
 * @desc    Get role by ID
 * @route   GET /api/v1/roles/:id
 * @access  Private/Admin
 */
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  res.json(role);
});

/**
 * @desc    Create a new role
 * @route   POST /api/v1/roles
 * @access  Private/Admin
 */
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { nom, description, etablissement_id } = req.body;
  
  // Check if role with same name exists in the same establishment
  const roles = await storage.listRoles(etablissement_id);
  const existingRole = roles.find(r => r.nom === nom);
  
  if (existingRole) {
    throw new ApiError(400, 'Role with this name already exists in this establishment');
  }
  
  // Create role
  const role = await storage.createRole({
    nom,
    description,
    etablissement_id
  });
  
  logger.info('Role created', { 
    roleId: role.id, 
    roleName: role.nom, 
    createdBy: req.user?.id 
  });
  
  res.status(201).json(role);
});

/**
 * @desc    Update a role
 * @route   PUT /api/v1/roles/:id
 * @access  Private/Admin
 */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  // Check if this is a protected system role
  if (role.nom === 'superadmin' && req.user?.roles && !req.user.roles.includes('superadmin')) {
    throw new ApiError(403, 'Protected role cannot be modified');
  }
  
  const { nom, description } = req.body;
  
  // Check if name is being changed and if it's already in use
  if (nom && nom !== role.nom) {
    const roles = await storage.listRoles(role.etablissement_id);
    const existingRole = roles.find(r => r.nom === nom);
    
    if (existingRole) {
      throw new ApiError(400, 'Role name already in use');
    }
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  
  // Update role
  const updatedRole = await storage.updateRole(roleId, updateData);
  
  if (!updatedRole) {
    throw new ApiError(500, 'Role update failed');
  }
  
  logger.info('Role updated', { 
    roleId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedRole);
});

/**
 * @desc    Delete a role
 * @route   DELETE /api/v1/roles/:id
 * @access  Private/Admin
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  // Check if this is a protected system role
  if (['superadmin', 'admin', 'enseignant', 'parent', 'apprenant'].includes(role.nom)) {
    throw new ApiError(403, 'Protected system role cannot be deleted');
  }
  
  // Check if role is assigned to any users
  const usersWithRole = await storage.getUsersByRoleId(roleId);
  
  if (usersWithRole && usersWithRole.length > 0) {
    throw new ApiError(400, `Role cannot be deleted as it is assigned to ${usersWithRole.length} user(s)`);
  }
  
  // Delete role
  await storage.deleteRole(roleId);
  
  logger.info('Role deleted', { 
    roleId, 
    roleName: role.nom, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Role deleted successfully' });
});

/**
 * @desc    Assign permissions to a role
 * @route   POST /api/v1/roles/:id/permissions
 * @access  Private/Admin
 */
export const assignPermission = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  const { permission_id, etablissement_id } = req.body;
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  const permission = await storage.getPermission(permission_id);
  
  if (!permission) {
    throw new ApiError(404, 'Permission not found');
  }
  
  // Assign permission to role
  await storage.assignPermissionToRole({
    role_id: roleId,
    permission_id,
    etablissement_id: etablissement_id || role.etablissement_id
  });
  
  logger.info('Permission assigned to role', { 
    roleId, 
    permissionId: permission_id, 
    assignedBy: req.user?.id 
  });
  
  // Get updated role permissions
  const permissions = await storage.getRolePermissions(roleId);
  
  res.status(201).json({
    message: 'Permission assigned successfully',
    permissions
  });
});

/**
 * @desc    Get role permissions
 * @route   GET /api/v1/roles/:id/permissions
 * @access  Private/Admin
 */
export const getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  const permissions = await storage.getRolePermissions(roleId);
  
  res.json(permissions);
});

/**
 * @desc    Remove permission from a role
 * @route   DELETE /api/v1/roles/:id/permissions/:permissionId
 * @access  Private/Admin
 */
export const removePermission = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  const permissionId = parseInt(req.params.permissionId);
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  // Check if this is a protected system role
  if (role.nom === 'superadmin') {
    throw new ApiError(403, 'Cannot modify permissions for superadmin role');
  }
  
  // Remove permission from role
  await storage.removePermissionFromRole(roleId, permissionId);
  
  logger.info('Permission removed from role', { 
    roleId, 
    permissionId, 
    removedBy: req.user?.id 
  });
  
  // Get updated role permissions
  const permissions = await storage.getRolePermissions(roleId);
  
  res.json({
    message: 'Permission removed successfully',
    permissions
  });
});

/**
 * @desc    Get users with a specific role
 * @route   GET /api/v1/roles/:id/users
 * @access  Private/Admin
 */
export const getRoleUsers = asyncHandler(async (req: Request, res: Response) => {
  const roleId = parseInt(req.params.id);
  
  const role = await storage.getRole(roleId);
  
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  
  const users = await storage.getUsersByRoleId(roleId);
  
  // Remove passwords from response
  const safeUsers = users.map(user => {
    const { mot_de_passe, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json(safeUsers);
});