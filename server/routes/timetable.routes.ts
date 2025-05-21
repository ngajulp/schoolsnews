import express from 'express';
import { 
  getTimetablePeriods,
  createTimetablePeriod,
  updateTimetablePeriod,
  deleteTimetablePeriod,
  getClassTimetable,
  getTeacherTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  bulkCreateTimetableEntries
} from '../controllers/timetable.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Timetable period validation schemas
const createPeriodSchema = z.object({
  nom: z.string().min(1, 'Period name is required'),
  heure_debut: z.string().min(1, 'Start time is required'),
  heure_fin: z.string().min(1, 'End time is required'),
  ordre: z.number().min(1, 'Order is required'),
  jour_semaine: z.string().min(1, 'Day of week is required'),
  est_pause: z.boolean().optional(),
  etablissement_id: z.number().optional()
});

const updatePeriodSchema = z.object({
  nom: z.string().optional(),
  heure_debut: z.string().optional(),
  heure_fin: z.string().optional(),
  ordre: z.number().optional(),
  jour_semaine: z.string().optional(),
  est_pause: z.boolean().optional()
});

// Timetable entry validation schemas
const createEntrySchema = z.object({
  classe_id: z.number(),
  matiere_id: z.number(),
  enseignant_id: z.number(),
  periode_id: z.number(),
  salle_id: z.number().optional(),
  annee_scolaire_id: z.number()
});

const updateEntrySchema = z.object({
  classe_id: z.number().optional(),
  matiere_id: z.number().optional(),
  enseignant_id: z.number().optional(),
  periode_id: z.number().optional(),
  salle_id: z.number().optional()
});

const bulkCreateEntriesSchema = z.object({
  entries: z.array(
    z.object({
      classe_id: z.number(),
      matiere_id: z.number(),
      enseignant_id: z.number(),
      periode_id: z.number(),
      salle_id: z.number().optional()
    })
  ),
  annee_scolaire_id: z.number()
});

// Period routes
router.route('/periods')
  .get(protect, getTimetablePeriods)
  .post(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(createPeriodSchema), 
    createTimetablePeriod
  );

router.route('/periods/:id')
  .put(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(updatePeriodSchema), 
    updateTimetablePeriod
  )
  .delete(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    deleteTimetablePeriod
  );

// Timetable routes for different views
router.route('/classe/:classeId')
  .get(protect, getClassTimetable);

router.route('/teacher/:teacherId')
  .get(protect, getTeacherTimetable);

// Timetable entry management
router.route('/entries')
  .post(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(createEntrySchema), 
    createTimetableEntry
  );

router.route('/entries/bulk')
  .post(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(bulkCreateEntriesSchema), 
    bulkCreateTimetableEntries
  );

router.route('/entries/:id')
  .put(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    validateRequest(updateEntrySchema), 
    updateTimetableEntry
  )
  .delete(
    protect, 
    authorize(['admin', 'principal', 'censeur']), 
    deleteTimetableEntry
  );

export default router;