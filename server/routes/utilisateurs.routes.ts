import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  assignRole,
  getUserRoles
} from '../controllers/utilisateurs.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createUserSchema, 
  updateUserSchema, 
  assignRoleSchema 
} from '@shared/validators';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/v1/utilisateurs
// @desc    Get all users
// @access  Private/Admin
router.get(
  '/', 
  authorize(['admin', 'superadmin', 'directeur']), 
  getUsers
);

// @route   GET /api/v1/utilisateurs/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur']), 
  getUserById
);

// @route   POST /api/v1/utilisateurs
// @desc    Create a new user
// @access  Private/Admin
router.post(
  '/', 
  authorize(['admin', 'superadmin']), 
  validate(createUserSchema), 
  createUser
);

// @route   PUT /api/v1/utilisateurs/:id
// @desc    Update a user
// @access  Private/Admin
router.put(
  '/:id', 
  authorize(['admin', 'superadmin']), 
  validate(updateUserSchema), 
  updateUser
);

// @route   DELETE /api/v1/utilisateurs/:id
// @desc    Delete a user (set status to 'archive')
// @access  Private/Admin
router.delete(
  '/:id', 
  authorize(['admin', 'superadmin']), 
  deleteUser
);

// @route   POST /api/v1/utilisateurs/:id/roles
// @desc    Assign a role to a user
// @access  Private/Admin
router.post(
  '/:id/roles', 
  authorize(['admin', 'superadmin']), 
  validate(assignRoleSchema), 
  assignRole
);

// @route   GET /api/v1/utilisateurs/:id/roles
// @desc    Get user roles
// @access  Private/Admin
router.get(
  '/:id/roles', 
  authorize(['admin', 'superadmin', 'directeur']), 
  getUserRoles
);

export default router;
