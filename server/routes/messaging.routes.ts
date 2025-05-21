import express from 'express';
import { 
  getMessages, 
  getMessageById, 
  sendMessage, 
  markMessageAsRead, 
  deleteMessage,
  getUnreadCount,
  sendBulkMessage
} from '../controllers/messaging.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Message validation schemas
const sendMessageSchema = z.object({
  sujet: z.string().min(1, 'Subject is required'),
  contenu: z.string().min(1, 'Content is required'),
  destinataires: z.array(z.number()).min(1, 'At least one recipient is required'),
  type_message: z.string().optional(),
  priorite: z.string().optional(),
  piece_jointe_url: z.string().optional(),
  etablissement_id: z.number().optional()
});

const sendBulkMessageSchema = z.object({
  sujet: z.string().min(1, 'Subject is required'),
  contenu: z.string().min(1, 'Content is required'),
  role_id: z.number().optional(),
  classe_id: z.number().optional(),
  type_message: z.string().optional(),
  priorite: z.string().optional(),
  piece_jointe_url: z.string().optional(),
  etablissement_id: z.number().optional()
}).refine(data => data.role_id !== undefined || data.classe_id !== undefined, {
  message: 'Either role_id or classe_id must be provided',
  path: ['role_id']
});

// Message routes
router.route('/')
  .get(protect, getMessages)
  .post(protect, validateRequest(sendMessageSchema), sendMessage);

router.route('/unread/count')
  .get(protect, getUnreadCount);

router.route('/bulk')
  .post(protect, authorize('admin', 'principal', 'censeur'), validateRequest(sendBulkMessageSchema), sendBulkMessage);

router.route('/:id')
  .get(protect, getMessageById)
  .delete(protect, deleteMessage);

router.route('/:id/read')
  .put(protect, markMessageAsRead);

export default router;