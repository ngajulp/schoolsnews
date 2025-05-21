import express from 'express';
import { 
  getExamens, 
  getExamenById, 
  createExamen, 
  updateExamen, 
  deleteExamen,
  getExamenGrades,
  addExamenGrade,
  deleteExamenGrade,
  getStudentGrades
} from '../controllers/examens.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Exam validation schemas
const createExamenSchema = z.object({
  titre: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type_examen: z.string().min(1, 'Exam type is required'),
  date_debut: z.string(),
  date_fin: z.string(),
  duree_minutes: z.number().optional(),
  classe_id: z.number().optional(),
  matiere_id: z.number().optional(),
  note_max: z.number().optional(),
  coefficient: z.number().optional(),
  etablissement_id: z.number().optional()
});

const updateExamenSchema = createExamenSchema.partial().extend({
  statut: z.string().optional()
});

// Grade validation schema
const addGradeSchema = z.object({
  apprenant_id: z.number(),
  note: z.number(),
  remarque: z.string().optional()
});

// Exam routes
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'principal', 'censeur'), getExamens)
  .post(protect, authorize('admin', 'teacher', 'principal', 'censeur'), validateRequest(createExamenSchema), createExamen);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'principal', 'censeur'), getExamenById)
  .put(protect, authorize('admin', 'teacher', 'principal', 'censeur'), validateRequest(updateExamenSchema), updateExamen)
  .delete(protect, authorize('admin', 'principal', 'censeur'), deleteExamen);

// Exam grades routes
router.route('/:id/grades')
  .get(protect, authorize('admin', 'teacher', 'principal', 'censeur'), getExamenGrades)
  .post(protect, authorize('admin', 'teacher'), validateRequest(addGradeSchema), addExamenGrade);

router.route('/:id/grades/:gradeId')
  .delete(protect, authorize('admin', 'teacher', 'principal', 'censeur'), deleteExamenGrade);

export default router;