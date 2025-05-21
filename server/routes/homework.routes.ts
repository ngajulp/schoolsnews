import express from 'express';
import { 
  getHomeworkAssignments,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
  getHomeworkSubmissions,
  createSubmission,
  gradeSubmission,
  getStudentSubmissions
} from '../controllers/homework.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Homework validation schemas
const createHomeworkSchema = z.object({
  titre: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date_limite: z.string().refine(date => !isNaN(Date.parse(date)), 'Valid date required'),
  fichier_url: z.string().optional(),
  matiere_id: z.number().positive('Valid subject ID required'),
  classe_id: z.number().positive('Valid class ID required'),
  points_possibles: z.number().min(0).optional(),
  instructions_soumission: z.string().optional(),
  etablissement_id: z.number().positive('Valid school ID required').optional()
});

const updateHomeworkSchema = createHomeworkSchema.partial();

// Submission validation schemas
const createSubmissionSchema = z.object({
  contenu: z.string().optional(),
  fichier_url: z.string().optional()
}).refine(data => data.contenu || data.fichier_url, {
  message: 'Either content or file URL must be provided',
  path: ['contenu']
});

const gradeSubmissionSchema = z.object({
  note: z.number().min(0),
  commentaire_enseignant: z.string().optional(),
  statut: z.string().optional()
});

// Homework routes
router.route('/')
  .get(protect, getHomeworkAssignments)
  .post(protect, authorize(['admin', 'teacher']), validateRequest(createHomeworkSchema), createHomework);

router.route('/:id')
  .get(protect, getHomeworkById)
  .put(protect, authorize(['admin', 'teacher']), validateRequest(updateHomeworkSchema), updateHomework)
  .delete(protect, authorize(['admin', 'teacher']), deleteHomework);

// Submission routes
router.route('/:id/submissions')
  .get(protect, authorize(['admin', 'teacher']), getHomeworkSubmissions)
  .post(protect, authorize(['student']), validateRequest(createSubmissionSchema), createSubmission);

router.route('/:id/submissions/:submissionId')
  .put(protect, authorize(['admin', 'teacher']), validateRequest(gradeSubmissionSchema), gradeSubmission);

// Student submissions route
router.route('/student/submissions')
  .get(protect, authorize(['student']), getStudentSubmissions);

export default router;