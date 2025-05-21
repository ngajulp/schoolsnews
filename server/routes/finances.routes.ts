import express from 'express';
import { 
  getPaymentTypes, 
  createPaymentType, 
  updatePaymentType, 
  deletePaymentType,
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  generatePaymentReceipt,
  generatePaymentReceiptPDF,
  getStudentFinancialStatus,
  getFinancialDashboard
} from '../controllers/finances.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Payment type validation schemas
const createPaymentTypeSchema = z.object({
  nom: z.string().min(1, 'Payment type name is required'),
  description: z.string().optional(),
  montant: z.number().min(0, 'Amount must be greater than or equal to 0'),
  echeances: z.number().int().positive().optional(),
  obligatoire: z.boolean().optional(),
  applicable_to: z.enum(['all', 'niveau', 'classe']),
  niveau_id: z.number().optional(),
  classe_id: z.number().optional(),
  annee_scolaire_id: z.number(),
  etablissement_id: z.number().optional()
});

const updatePaymentTypeSchema = z.object({
  nom: z.string().optional(),
  description: z.string().optional(),
  montant: z.number().min(0).optional(),
  echeances: z.number().int().positive().optional(),
  obligatoire: z.boolean().optional(),
  applicable_to: z.enum(['all', 'niveau', 'classe']).optional(),
  niveau_id: z.number().optional(),
  classe_id: z.number().optional()
});

// Payment validation schemas
const createPaymentSchema = z.object({
  apprenant_id: z.number(),
  type_paiement_id: z.number(),
  montant: z.number().min(0, 'Amount must be greater than or equal to 0'),
  methode_paiement: z.string(),
  reference_transaction: z.string().optional(),
  commentaire: z.string().optional(),
  recu_par: z.number().optional(),
  etablissement_id: z.number().optional()
});

const updatePaymentSchema = z.object({
  montant: z.number().min(0).optional(),
  methode_paiement: z.string().optional(),
  reference_transaction: z.string().optional(),
  statut: z.enum(['complete', 'pending', 'annule', 'failed']).optional(),
  commentaire: z.string().optional()
});

// Payment type routes
router.route('/payment-types')
  .get(protect, authorize(['admin', 'financier', 'principal']), getPaymentTypes)
  .post(
    protect, 
    authorize(['admin', 'financier']), 
    validateRequest(createPaymentTypeSchema), 
    createPaymentType
  );

router.route('/payment-types/:id')
  .put(
    protect, 
    authorize(['admin', 'financier']), 
    validateRequest(updatePaymentTypeSchema), 
    updatePaymentType
  )
  .delete(protect, authorize(['admin']), deletePaymentType);

// Payment routes
router.route('/payments')
  .get(protect, authorize(['admin', 'financier', 'principal']), getPayments)
  .post(
    protect, 
    authorize(['admin', 'financier']), 
    validateRequest(createPaymentSchema), 
    createPayment
  );

router.route('/payments/:id')
  .get(protect, authorize(['admin', 'financier', 'principal']), getPaymentById)
  .put(
    protect, 
    authorize(['admin', 'financier']), 
    validateRequest(updatePaymentSchema), 
    updatePayment
  )
  .delete(protect, authorize(['admin']), deletePayment);

router.route('/payments/:id/receipt')
  .get(protect, generatePaymentReceipt);

router.route('/payments/:id/receipt/pdf')
  .get(protect, generatePaymentReceiptPDF);

// Student financial status
router.route('/students/:id')
  .get(protect, getStudentFinancialStatus);

// Financial dashboard
router.route('/dashboard')
  .get(protect, authorize(['admin', 'financier', 'principal']), getFinancialDashboard);

export default router;