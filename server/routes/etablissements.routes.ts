import express from 'express';
import { 
  getEtablissements, 
  getEtablissementById, 
  createEtablissement, 
  updateEtablissement,
  getEtablissementClasses,
  getEtablissementUtilisateurs,
  getEtablissementApprenants,
  getEtablissementMatieres
} from '../controllers/etablissements.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createEtablissementSchema, 
  updateEtablissementSchema 
} from '@shared/validators';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/v1/etablissements
// @desc    Get all etablissements
// @access  Private
router.get('/', getEtablissements);

// @route   GET /api/v1/etablissements/:id
// @desc    Get etablissement by ID
// @access  Private
router.get('/:id', getEtablissementById);

// @route   POST /api/v1/etablissements
// @desc    Create a new etablissement
// @access  Private/Admin
router.post(
  '/', 
  authorize(['admin', 'superadmin']), 
  validate(createEtablissementSchema), 
  createEtablissement
);

// @route   PUT /api/v1/etablissements/:id
// @desc    Update an etablissement
// @access  Private/Admin
router.put(
  '/:id', 
  authorize(['admin', 'superadmin']), 
  validate(updateEtablissementSchema), 
  updateEtablissement
);

// @route   GET /api/v1/etablissements/:id/classes
// @desc    Get all classes for an etablissement
// @access  Private
router.get('/:id/classes', getEtablissementClasses);

// @route   GET /api/v1/etablissements/:id/utilisateurs
// @desc    Get all users for an etablissement
// @access  Private/Admin
router.get(
  '/:id/utilisateurs', 
  authorize(['admin', 'superadmin', 'directeur']), 
  getEtablissementUtilisateurs
);

// @route   GET /api/v1/etablissements/:id/apprenants
// @desc    Get all apprenants for an etablissement
// @access  Private
router.get('/:id/apprenants', getEtablissementApprenants);

// @route   GET /api/v1/etablissements/:id/matieres
// @desc    Get all matieres for an etablissement
// @access  Private
router.get('/:id/matieres', getEtablissementMatieres);

export default router;
