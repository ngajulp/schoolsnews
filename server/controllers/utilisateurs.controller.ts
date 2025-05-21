import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all users
 * @route   GET /api/v1/utilisateurs
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const users = await storage.listUsers(etablissementId);
  
  // Remove passwords from response
  const safeUsers = users.map(user => {
    const { mot_de_passe, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json(safeUsers);
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/utilisateurs/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Get user roles
  const roles = await storage.getUserRoles(user.id);
  
  // Remove password from response
  const { mot_de_passe, ...userWithoutPassword } = user;
  
  res.json({
    ...userWithoutPassword,
    roles
  });
});

/**
 * @desc    Create a new user
 * @route   POST /api/v1/utilisateurs
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { nom, prenom, email, password, telephone, statut, etablissement_id, roles } = req.body;
  
  // Check if user exists
  const existingUser = await storage.getUserByEmail(email);
  
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create user
  const user = await storage.createUser({
    nom,
    prenom,
    email,
    mot_de_passe: hashedPassword,
    telephone,
    statut: statut || 'actif',
    etablissement_id
  });
  
  // Assign roles if provided
  if (roles && Array.isArray(roles) && roles.length > 0) {
    await Promise.all(roles.map(roleId => 
      storage.assignRoleToUser({
        utilisateur_id: user.id,
        role_id: roleId,
        etablissement_id: user.etablissement_id
      })
    ));
  }
  
  logger.info('User created', { userId: user.id, email });
  
  // Return created user (without password)
  const { mot_de_passe, ...userWithoutPassword } = user;
  
  res.status(201).json(userWithoutPassword);
});

/**
 * @desc    Update a user
 * @route   PUT /api/v1/utilisateurs/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  const { nom, prenom, email, password, telephone, statut, etablissement_id } = req.body;
  
  // Check if email is being changed and if it's already in use
  if (email && email !== user.email) {
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (prenom !== undefined) updateData.prenom = prenom;
  if (email !== undefined) updateData.email = email;
  if (telephone !== undefined) updateData.telephone = telephone;
  if (statut !== undefined) updateData.statut = statut;
  if (etablissement_id !== undefined) updateData.etablissement_id = etablissement_id;
  
  // Hash new password if provided
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.mot_de_passe = await bcrypt.hash(password, salt);
  }
  
  // Update user
  const updatedUser = await storage.updateUser(userId, updateData);
  
  if (!updatedUser) {
    throw new ApiError(500, 'User update failed');
  }
  
  logger.info('User updated', { userId });
  
  // Return updated user (without password)
  const { mot_de_passe, ...userWithoutPassword } = updatedUser;
  
  res.json(userWithoutPassword);
});

/**
 * @desc    Delete a user (set status to 'archive')
 * @route   DELETE /api/v1/utilisateurs/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Instead of deleting, set status to 'archive'
  const updatedUser = await storage.updateUser(userId, { statut: 'archive' });
  
  if (!updatedUser) {
    throw new ApiError(500, 'User deletion failed');
  }
  
  logger.info('User archived', { userId });
  
  res.json({ message: 'User archived successfully' });
});

/**
 * @desc    Assign a role to a user
 * @route   POST /api/v1/utilisateurs/:id/roles
 * @access  Private/Admin
 */
export const assignRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { role_id, etablissement_id } = req.body;
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Assign role
  await storage.assignRoleToUser({
    utilisateur_id: userId,
    role_id,
    etablissement_id: etablissement_id || user.etablissement_id
  });
  
  logger.info('Role assigned to user', { userId, roleId: role_id });
  
  // Get updated user roles
  const roles = await storage.getUserRoles(userId);
  
  res.status(201).json({
    message: 'Role assigned successfully',
    roles
  });
});

/**
 * @desc    Get user roles
 * @route   GET /api/v1/utilisateurs/:id/roles
 * @access  Private/Admin
 */
export const getUserRoles = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  const roles = await storage.getUserRoles(userId);
  
  res.json(roles);
});
