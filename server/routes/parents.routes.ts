import express from 'express';
import { 
  getParents, 
  getParentById, 
  createParent, 
  updateParent,
  getParentChildren,
  linkChildToParent,
  unlinkChildFromParent,
  getParentPaymentStatus,
  sendParentConvocation,
  getParentConvocations,
  updateConvocationStatus
} from '../controllers/parents.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Parent validation schemas
const createParentSchema = z.object({
  utilisateur_id: z.number(),
  profession: z.string().optional(),
  revenu_mensuel: z.number().optional(),
  nombre_enfants: z.number().optional(),
  etablissement_id: z.number().optional()
});

const updateParentSchema = z.object({
  profession: z.string().optional(),
  revenu_mensuel: z.number().optional(),
  nombre_enfants: z.number().optional()
});

const linkChildSchema = z.object({
  apprenant_id: z.number(),
  lien_parente: z.string().optional()
});

const convocationSchema = z.object({
  sujet: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  date_convocation: z.string().optional(),
  motif: z.string().optional(),
  apprenant_id: z.number().optional(),
  est_urgent: z.boolean().optional()
});

const updateConvocationSchema = z.object({
  statut: z.enum(['envoyée', 'vue', 'acceptée', 'refusée', 'reportée', 'complétée']),
  commentaire: z.string().optional()
});

// Parent routes
router.route('/')
  .get(protect, authorize(['admin', 'principal', 'censeur']), getParents)
  .post(
    protect, 
    authorize(['admin']), 
    validateRequest(createParentSchema), 
    createParent
  );

router.route('/:id')
  .get(protect, getParentById)
  .put(
    protect, 
    authorize(['admin']), 
    validateRequest(updateParentSchema), 
    updateParent
  );

// Children management routes
router.route('/:id/enfants')
  .get(protect, getParentChildren)
  .post(
    protect, 
    authorize(['admin']), 
    validateRequest(linkChildSchema), 
    linkChildToParent
  );

router.route('/:id/enfants/:apprenantId')
  .delete(protect, authorize(['admin']), unlinkChildFromParent);

// Payment status routes
router.route('/:id/paiements')
  .get(protect, getParentPaymentStatus);

// Convocation routes
router.route('/:id/convocations')
  .get(protect, getParentConvocations)
  .post(
    protect, 
    authorize(['admin', 'teacher', 'principal', 'censeur']), 
    validateRequest(convocationSchema), 
    sendParentConvocation
  );

router.route('/convocations/:id')
  .put(
    protect, 
    validateRequest(updateConvocationSchema), 
    updateConvocationStatus
  );

export default router;