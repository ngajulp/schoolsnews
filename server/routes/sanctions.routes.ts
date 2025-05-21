import express from 'express';
import { 
  getSanctions, 
  getSanctionById, 
  createSanction, 
  updateSanction, 
  deleteSanction,
  getStudentSanctions
} from '../controllers/sanctions.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Sanction validation schemas
const createSanctionSchema = z.object({
  apprenant_id: z.number(),
  type_sanction: z.string().min(1, 'Type of sanction is required'),
  motif: z.string().min(1, 'Reason is required'),
  date_sanction: z.string().optional(),
  date_fin: z.string().optional(),
  description: z.string().optional(),
  etablissement_id: z.number().optional()
});

const updateSanctionSchema = z.object({
  type_sanction: z.string().optional(),
  motif: z.string().optional(),
  date_sanction: z.string().optional(),
  date_fin: z.string().optional(),
  description: z.string().optional(),
  statut: z.string().optional()
});

// Sanction routes
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'principal', 'censeur', 'surveillant'), getSanctions)
  .post(protect, authorize('admin', 'teacher', 'principal', 'censeur', 'surveillant'), validateRequest(createSanctionSchema), createSanction);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'principal', 'censeur', 'surveillant'), getSanctionById)
  .put(protect, authorize('admin', 'principal', 'censeur'), validateRequest(updateSanctionSchema), updateSanction)
  .delete(protect, authorize('admin', 'principal', 'censeur'), deleteSanction);

export default router;