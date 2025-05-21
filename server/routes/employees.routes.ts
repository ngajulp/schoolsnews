import express from 'express';
import { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getEmployeeTypes,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType,
  assignSubjectsToTeacher,
  getTeacherSubjects,
  removeSubjectFromTeacher
} from '../controllers/employees.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Employee validation schemas
const createEmployeeSchema = z.object({
  utilisateur_id: z.number(),
  type_employe_id: z.number(),
  date_embauche: z.string().optional(),
  statut_contrat: z.string(),
  salaire: z.number().optional(),
  specialite: z.string().optional(),
  qualifications: z.string().optional(),
  etablissement_id: z.number().optional()
});

const updateEmployeeSchema = z.object({
  type_employe_id: z.number().optional(),
  date_embauche: z.string().optional(),
  statut_contrat: z.string().optional(),
  salaire: z.number().optional(),
  specialite: z.string().optional(),
  qualifications: z.string().optional(),
  statut: z.string().optional()
});

// Employee type validation schemas
const createEmployeeTypeSchema = z.object({
  nom: z.string().min(1, 'Employee type name is required'),
  description: z.string().optional(),
  etablissement_id: z.number().optional()
});

const updateEmployeeTypeSchema = z.object({
  nom: z.string().optional(),
  description: z.string().optional()
});

// Teacher subject assignment schema
const assignSubjectsSchema = z.object({
  matiere_ids: z.array(z.number()),
  classe_ids: z.array(z.number()),
  annee_scolaire_id: z.number()
});

// Employee routes
router.route('/')
  .get(protect, authorize(['admin', 'hr', 'principal']), getEmployees)
  .post(
    protect, 
    authorize(['admin', 'hr']), 
    validateRequest(createEmployeeSchema), 
    createEmployee
  );

router.route('/:id')
  .get(protect, authorize(['admin', 'hr', 'principal']), getEmployeeById)
  .put(
    protect, 
    authorize(['admin', 'hr']), 
    validateRequest(updateEmployeeSchema), 
    updateEmployee
  )
  .delete(protect, authorize(['admin']), deleteEmployee);

// Employee types routes
router.route('/types')
  .get(protect, authorize(['admin', 'hr', 'principal']), getEmployeeTypes)
  .post(
    protect, 
    authorize(['admin']), 
    validateRequest(createEmployeeTypeSchema), 
    createEmployeeType
  );

router.route('/types/:id')
  .put(
    protect, 
    authorize(['admin']), 
    validateRequest(updateEmployeeTypeSchema), 
    updateEmployeeType
  )
  .delete(protect, authorize(['admin']), deleteEmployeeType);

// Teacher subject assignments
router.route('/:id/subjects')
  .get(protect, getTeacherSubjects)
  .post(
    protect, 
    authorize(['admin', 'principal']), 
    validateRequest(assignSubjectsSchema), 
    assignSubjectsToTeacher
  );

router.route('/:id/subjects/:assignmentId')
  .delete(protect, authorize(['admin', 'principal']), removeSubjectFromTeacher);

export default router;