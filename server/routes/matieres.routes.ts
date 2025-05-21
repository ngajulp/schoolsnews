import express from 'express';
import { 
  getMatieres, 
  getMatiereById, 
  createMatiere, 
  updateMatiere, 
  deleteMatiere 
} from '../controllers/matieres.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createMatiereSchema, 
  updateMatiereSchema 
} from '@shared/validators';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/v1/matieres
// @desc    Get all matieres
// @access  Private
router.get('/', getMatieres);

// @route   GET /api/v1/matieres/:id
// @desc    Get matiere by ID
// @access  Private
router.get('/:id', getMatiereById);

// @route   POST /api/v1/matieres
// @desc    Create a new matiere
// @access  Private/Admin
router.post(
  '/', 
  authorize(['admin', 'superadmin', 'directeur']), 
  validate(createMatiereSchema), 
  createMatiere
);

// @route   PUT /api/v1/matieres/:id
// @desc    Update a matiere
// @access  Private/Admin
router.put(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur']), 
  validate(updateMatiereSchema), 
  updateMatiere
);

// @route   DELETE /api/v1/matieres/:id
// @desc    Delete a matiere (set est_active to false)
// @access  Private/Admin
router.delete(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur']), 
  deleteMatiere
);

export default router;
