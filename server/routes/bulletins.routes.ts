import express from 'express';
import { 
  generateBulletin, 
  getBulletinById, 
  getStudentBulletins, 
  getClassBulletins, 
  deleteBulletin,
  generatePdfBulletin
} from '../controllers/bulletins.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Bulletin validation schemas
const generateBulletinSchema = z.object({
  apprenant_id: z.number(),
  periode_type: z.enum(['sequence', 'trimestre', 'annee']),
  periode_id: z.number(),
  annee_scolaire_id: z.number(),
  classe_id: z.number(),
  etablissement_id: z.number().optional()
});

// Bulletin routes
router.route('/')
  .post(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    validateRequest(generateBulletinSchema), 
    generateBulletin
  );

router.route('/:id')
  .get(protect, getBulletinById)
  .delete(protect, authorize(['admin', 'principal', 'censeur']), deleteBulletin);

router.route('/:id/pdf')
  .get(protect, generatePdfBulletin);

router.route('/student/:id')
  .get(protect, getStudentBulletins);

router.route('/class/:id')
  .get(protect, authorize(['admin', 'teacher', 'principal', 'censeur']), getClassBulletins);

export default router;