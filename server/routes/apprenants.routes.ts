import express from 'express';
import { 
  getApprenants, 
  getApprenantById, 
  getApprenantByMatricule,
  createApprenant, 
  updateApprenant, 
  deleteApprenant,
  changeClasse
} from '../controllers/apprenants.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createApprenantSchema, 
  updateApprenantSchema,
  changeClasseSchema
} from '@shared/validators';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/v1/apprenants
// @desc    Get all apprenants
// @access  Private
router.get('/', getApprenants);

// @route   GET /api/v1/apprenants/:id
// @desc    Get apprenant by ID
// @access  Private
router.get('/:id', getApprenantById);

// @route   GET /api/v1/apprenants/matricule/:matricule
// @desc    Get apprenant by matricule
// @access  Private
router.get('/matricule/:matricule', getApprenantByMatricule);

// @route   POST /api/v1/apprenants
// @desc    Create a new apprenant
// @access  Private/Admin
router.post(
  '/', 
  authorize(['admin', 'superadmin', 'directeur', 'secretaire']), 
  validate(createApprenantSchema), 
  createApprenant
);

// @route   PUT /api/v1/apprenants/:id
// @desc    Update an apprenant
// @access  Private/Admin
router.put(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur', 'secretaire']), 
  validate(updateApprenantSchema), 
  updateApprenant
);

// @route   DELETE /api/v1/apprenants/:id
// @desc    Delete an apprenant (set status to 'inactive')
// @access  Private/Admin
router.delete(
  '/:id', 
  authorize(['admin', 'superadmin', 'directeur']), 
  deleteApprenant
);

// @route   PUT /api/v1/apprenants/:id/classe
// @desc    Change class for an apprenant
// @access  Private/Admin
router.put(
  '/:id/classe', 
  authorize(['admin', 'superadmin', 'directeur', 'secretaire']), 
  validate(changeClasseSchema),
  changeClasse
);

export default router;
