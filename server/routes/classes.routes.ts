import express from 'express';
import { 
  getClasses, 
  getClasseById, 
  createClasse, 
  updateClasse, 
  deleteClasse,
  getClasseApprenants
} from '../controllers/classes.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createClasseSchema, 
  updateClasseSchema 
} from '@shared/validators';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/v1/classes
// @desc    Get all classes
// @access  Private
router.get('/', getClasses);

// @route   GET /api/v1/classes/:id
// @desc    Get class by ID
// @access  Private
router.get('/:id', getClasseById);

// @route   POST /api/v1/classes
// @desc    Create a new class
// @access  Private/Admin
router.post(
  '/', 
  authorize(['admin', 'superadmin', 'directeur']), 
  validate(createClasseSchema), 
  createClasse
);

// @route   PUT /api/v1/classes/:id
// @desc    Update a class
// @access  Private/Admin
router.put(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur']), 
  validate(updateClasseSchema), 
  updateClasse
);

// @route   DELETE /api/v1/classes/:id
// @desc    Delete a class (set status to 'Inactive')
// @access  Private/Admin
router.delete(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur']), 
  deleteClasse
);

// @route   GET /api/v1/classes/:id/apprenants
// @desc    Get students in a class
// @access  Private
router.get(
  '/:id/apprenants', 
  getClasseApprenants
);

export default router;
