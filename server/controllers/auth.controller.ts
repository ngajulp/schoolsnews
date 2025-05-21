import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../middlewares/auth.middleware';
import { logger } from '../logger';

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await storage.getUserByEmail(email);
  
  if (!user) {
    logger.warn('Login attempt with invalid email', { email });
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Check if user is active
  if (user.statut !== 'actif') {
    logger.warn('Login attempt with inactive account', { email });
    throw new ApiError(401, 'Account is not active');
  }
  
  // Check password
  const isMatch = await bcrypt.compare(password, user.mot_de_passe);
  
  if (!isMatch) {
    logger.warn('Login attempt with invalid password', { email });
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Get user roles
  const roles = await storage.getUserRoles(user.id);
  const roleNames = roles.map(role => role.nom);
  
  // Generate tokens
  const token = generateToken(user, roleNames);
  const refreshToken = generateRefreshToken(user);
  
  logger.info('User logged in successfully', { userId: user.id, email });
  
  // Return user data and tokens
  res.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      roles: roleNames
    }
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  
  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }
  
  // Verify refresh token
  const decoded = verifyRefreshToken(token);
  
  if (!decoded) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
  
  // Find user
  const user = await storage.getUser(decoded.id);
  
  if (!user) {
    throw new ApiError(401, 'User not found');
  }
  
  // Get user roles
  const roles = await storage.getUserRoles(user.id);
  const roleNames = roles.map(role => role.nom);
  
  // Generate new access token
  const newToken = generateToken(user, roleNames);
  
  logger.info('Token refreshed successfully', { userId: user.id });
  
  res.json({
    token: newToken
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, we could add the token to a blacklist
  // or use Redis to track invalidated tokens
  
  // For now, just return success
  logger.info('User logged out', { userId: req.user?.id });
  
  res.json({ message: 'Logged out successfully' });
});

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Private/Admin
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { nom, prenom, email, password, telephone, etablissement_id } = req.body;
  
  // Check if user exists
  const existingUser = await storage.getUserByEmail(email);
  
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
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
    statut: 'actif',
    etablissement_id
  });
  
  logger.info('New user registered', { userId: user.id, email });
  
  // Return created user (without password)
  res.status(201).json({
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    statut: user.statut,
    etablissement_id: user.etablissement_id
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await storage.getUser(req.user!.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Get user roles
  const roles = await storage.getUserRoles(user.id);
  const roleNames = roles.map(role => role.nom);
  
  res.json({
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    statut: user.statut,
    etablissement_id: user.etablissement_id,
    roles: roleNames
  });
});
