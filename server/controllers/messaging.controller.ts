import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all messages for a user
 * @route   GET /api/v1/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  const messages = await storage.listUserMessages(userId);
  
  res.json(messages);
});

/**
 * @desc    Get message by ID
 * @route   GET /api/v1/messages/:id
 * @access  Private
 */
export const getMessageById = asyncHandler(async (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  const message = await storage.getMessage(messageId);
  
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }
  
  // Check if user is authorized to view this message
  const isAuthorized = message.expediteur_id === userId || 
                     await storage.isMessageRecipient(messageId, userId);
  
  if (!isAuthorized && !req.user?.roles?.includes('admin')) {
    throw new ApiError(403, 'Not authorized to view this message');
  }
  
  // If user is recipient, mark message as read
  if (await storage.isMessageRecipient(messageId, userId)) {
    await storage.markMessageAsRead(messageId, userId);
  }
  
  // Get message with recipients
  const messageWithRecipients = await storage.getMessageWithRecipients(messageId);
  
  res.json(messageWithRecipients);
});

/**
 * @desc    Send a new message
 * @route   POST /api/v1/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  const { 
    sujet, 
    contenu, 
    destinataires, 
    type_message,
    priorite,
    piece_jointe_url,
    etablissement_id 
  } = req.body;
  
  // Validate recipients
  if (!destinataires || !Array.isArray(destinataires) || destinataires.length === 0) {
    throw new ApiError(400, 'At least one recipient is required');
  }
  
  // Check if all recipients exist
  for (const destinataireId of destinataires) {
    const destinataire = await storage.getUser(destinataireId);
    if (!destinataire) {
      throw new ApiError(404, `Recipient with ID ${destinataireId} not found`);
    }
  }
  
  // Create message
  const message = await storage.createMessage({
    sujet,
    contenu,
    expediteur_id: userId,
    date_envoi: new Date(),
    type_message: type_message || 'standard',
    priorite: priorite || 'normale',
    piece_jointe_url,
    etablissement_id
  });
  
  // Add recipients
  await Promise.all(destinataires.map(destinataireId => 
    storage.addMessageRecipient({
      message_id: message.id,
      destinataire_id: destinataireId,
      lu: false,
      statut: 'envoye',
      etablissement_id
    })
  ));
  
  logger.info('Message sent', { 
    messageId: message.id, 
    senderId: userId,
    recipients: destinataires
  });
  
  // Get message with recipients
  const messageWithRecipients = await storage.getMessageWithRecipients(message.id);
  
  res.status(201).json(messageWithRecipients);
});

/**
 * @desc    Mark a message as read
 * @route   PUT /api/v1/messages/:id/read
 * @access  Private
 */
export const markMessageAsRead = asyncHandler(async (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  const message = await storage.getMessage(messageId);
  
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }
  
  // Check if user is a recipient
  const isRecipient = await storage.isMessageRecipient(messageId, userId);
  
  if (!isRecipient) {
    throw new ApiError(403, 'Not authorized to mark this message as read');
  }
  
  await storage.markMessageAsRead(messageId, userId);
  
  res.json({ message: 'Message marked as read' });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/v1/messages/:id
 * @access  Private
 */
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const messageId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  const message = await storage.getMessage(messageId);
  
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }
  
  // Check if user is authorized to delete this message
  if (message.expediteur_id !== userId && !req.user?.roles?.includes('admin')) {
    throw new ApiError(403, 'Not authorized to delete this message');
  }
  
  await storage.deleteMessage(messageId);
  
  logger.info('Message deleted', { 
    messageId, 
    deletedBy: userId 
  });
  
  res.json({ message: 'Message deleted successfully' });
});

/**
 * @desc    Get unread message count
 * @route   GET /api/v1/messages/unread/count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  const count = await storage.getUnreadMessageCount(userId);
  
  res.json({ count });
});

/**
 * @desc    Send a message to all users with a specific role
 * @route   POST /api/v1/messages/bulk
 * @access  Private/Admin
 */
export const sendBulkMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }
  
  // Only admin, principal, or censeur can send bulk messages
  if (!req.user?.roles?.some(role => ['admin', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to send bulk messages');
  }
  
  const { 
    sujet, 
    contenu, 
    role_id,
    classe_id,
    type_message,
    priorite,
    piece_jointe_url,
    etablissement_id 
  } = req.body;
  
  let destinataires: number[] = [];
  
  // Get recipients based on role or class
  if (role_id) {
    const usersWithRole = await storage.getUsersByRoleId(role_id);
    destinataires = usersWithRole.map(user => user.id);
  } else if (classe_id) {
    // Get all parents of students in the class
    const studentsParents = await storage.getParentsByClassId(classe_id);
    destinataires = studentsParents.map(parent => parent.id);
  } else {
    throw new ApiError(400, 'Either role_id or classe_id must be provided');
  }
  
  if (destinataires.length === 0) {
    throw new ApiError(404, 'No recipients found with the specified criteria');
  }
  
  // Create message
  const message = await storage.createMessage({
    sujet,
    contenu,
    expediteur_id: userId,
    date_envoi: new Date(),
    type_message: type_message || 'broadcast',
    priorite: priorite || 'normale',
    piece_jointe_url,
    etablissement_id
  });
  
  // Add recipients
  await Promise.all(destinataires.map(destinataireId => 
    storage.addMessageRecipient({
      message_id: message.id,
      destinataire_id: destinataireId,
      lu: false,
      statut: 'envoye',
      etablissement_id
    })
  ));
  
  logger.info('Bulk message sent', { 
    messageId: message.id, 
    senderId: userId,
    recipientCount: destinataires.length,
    recipientType: role_id ? 'role' : 'class'
  });
  
  res.status(201).json({
    message: `Message sent to ${destinataires.length} recipients`,
    messageId: message.id
  });
});