import express from 'express';
import { 
  getActivityTypes, 
  createActivityType, 
  updateActivityType, 
  deleteActivityType,
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityParticipants,
  addParticipant,
  removeParticipant,
  getStudentActivities,
  takeAttendance,
  getAttendanceRecords
} from '../controllers/activities.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Activity type validation schemas
const createActivityTypeSchema = z.object({
  nom: z.string().min(1, 'Activity type name is required'),
  description: z.string().optional(),
  categorie: z.string().min(1, 'Category is required'),
  etablissement_id: z.number().optional()
});

const updateActivityTypeSchema = z.object({
  nom: z.string().optional(),
  description: z.string().optional(),
  categorie: z.string().optional()
});

// Activity validation schemas
const createActivitySchema = z.object({
  nom: z.string().min(1, 'Activity name is required'),
  description: z.string().optional(),
  type_activite_id: z.number(),
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
  heure_debut: z.string().optional(),
  heure_fin: z.string().optional(),
  jour_semaine: z.string().optional(),
  lieu: z.string().optional(),
  responsable_id: z.number().optional(),
  max_participants: z.number().optional(),
  classes_cibles: z.array(z.number()).optional(),
  annee_scolaire_id: z.number(),
  etablissement_id: z.number().optional()
});

const updateActivitySchema = z.object({
  nom: z.string().optional(),
  description: z.string().optional(),
  type_activite_id: z.number().optional(),
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
  heure_debut: z.string().optional(),
  heure_fin: z.string().optional(),
  jour_semaine: z.string().optional(),
  lieu: z.string().optional(),
  responsable_id: z.number().optional(),
  max_participants: z.number().optional(),
  classes_cibles: z.array(z.number()).optional(),
  statut: z.enum(['active', 'inactive', 'archived', 'completed']).optional()
});

const participantSchema = z.object({
  apprenant_id: z.number()
});

const attendanceSchema = z.object({
  date: z.string().optional(),
  attendances: z.array(
    z.object({
      apprenant_id: z.number(),
      present: z.boolean(),
      observation: z.string().optional()
    })
  )
});

// Activity type routes
router.route('/types')
  .get(protect, getActivityTypes)
  .post(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(createActivityTypeSchema), 
    createActivityType
  );

router.route('/types/:id')
  .put(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(updateActivityTypeSchema), 
    updateActivityType
  )
  .delete(
    protect, 
    authorize(['admin']), 
    deleteActivityType
  );

// Activity routes
router.route('/')
  .get(protect, getActivities)
  .post(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    validateRequest(createActivitySchema), 
    createActivity
  );

router.route('/:id')
  .get(protect, getActivityById)
  .put(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    validateRequest(updateActivitySchema), 
    updateActivity
  )
  .delete(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    deleteActivity
  );

// Participant routes
router.route('/:id/participants')
  .get(protect, getActivityParticipants)
  .post(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    validateRequest(participantSchema), 
    addParticipant
  );

router.route('/:id/participants/:apprenantId')
  .delete(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    removeParticipant
  );

// Student activities route
router.route('/student/:id')
  .get(protect, getStudentActivities);

// Attendance routes
router.route('/:id/attendance')
  .get(protect, authorize(['admin', 'teacher', 'principal', 'censeur']), getAttendanceRecords)
  .post(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    validateRequest(attendanceSchema), 
    takeAttendance
  );

export default router;