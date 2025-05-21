import express from 'express';
import { 
  createChatRoom,
  getUserChatRooms,
  getChatRoom,
  sendChatMessage,
  getChatRoomMessages,
  getUnreadChatCount,
  addChatRoomParticipant,
  removeChatRoomParticipant,
  updateParticipantRole
} from '../controllers/chat.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Chat room validation schemas
const createChatRoomSchema = z.object({
  nom: z.string().min(1, 'Chat room name is required'),
  description: z.string().optional(),
  type: z.enum(['classe', 'departement', 'administration', 'parents', 'teacher_student']),
  classe_id: z.number().optional(),
  departement_id: z.number().optional(),
  participants: z.array(
    z.object({
      utilisateur_id: z.number(),
      role: z.enum(['admin', 'moderator', 'member']).optional()
    })
  ).optional(),
  etablissement_id: z.number().optional()
});

const sendMessageSchema = z.object({
  contenu: z.string().min(1, 'Message content is required'),
  langue: z.enum(['français', 'english']).optional()
});

const addParticipantSchema = z.object({
  participant_id: z.number(),
  role: z.enum(['admin', 'moderator', 'member']).optional()
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'moderator', 'member'])
});

// Chat room routes
router.route('/rooms')
  .get(protect, getUserChatRooms)
  .post(
    protect, 
    validateRequest(createChatRoomSchema), 
    createChatRoom
  );

router.route('/rooms/:id')
  .get(protect, getChatRoom);

// Chat message routes
router.route('/rooms/:id/messages')
  .get(protect, getChatRoomMessages)
  .post(
    protect, 
    validateRequest(sendMessageSchema), 
    sendChatMessage
  );

// Unread count
router.route('/unread')
  .get(protect, getUnreadChatCount);

// Participant management
router.route('/rooms/:id/participants')
  .post(
    protect, 
    validateRequest(addParticipantSchema), 
    addChatRoomParticipant
  );

router.route('/rooms/:id/participants/:participantId')
  .delete(protect, removeChatRoomParticipant)
  .put(
    protect, 
    validateRequest(updateRoleSchema), 
    updateParticipantRole
  );

export default router;