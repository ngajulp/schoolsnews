import express from 'express';
import { 
  login, 
  refreshToken, 
  logout, 
  register, 
  getProfile 
} from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  loginSchema,
  refreshTokenSchema,
  registerUserSchema 
} from '@shared/validators';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = express.Router();

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validate(loginSchema), authLimiter.middleware, login);

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Private/Admin
router.post(
  '/register', 
  authenticate, 
  authorize(['admin', 'superadmin']), 
  validate(registerUserSchema), 
  register
);

// @route   GET /api/v1/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

export default router;
