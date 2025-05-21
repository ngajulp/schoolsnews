import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Create a new chat room
 * @route   POST /api/v1/chat/rooms
 * @access  Private/Admin/Director/Principal
 */
export const createChatRoom = asyncHandler(async (req: Request, res: Response) => {
  const {
    nom,
    description,
    type, // 'classe', 'departement', 'administration', 'parents', 'teacher_student'
    classe_id,
    departement_id,
    participants,
    etablissement_id
  } = req.body;
  
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  // Check permissions based on chat room type
  const user = await storage.getUser(userId);
  const roles = await storage.getUserRoles(userId);
  const roleNames = roles.map(r => r.nom.toLowerCase());
  
  // Director or principal can create any room
  const isAdmin = roleNames.some(r => ['admin', 'directeur', 'principal', 'censeur'].includes(r));
  
  if (type === 'administration' && !isAdmin) {
    throw new ApiError(403, 'Only administrators can create administration chat rooms');
  }
  
  // Check if teacher for teacher-specific rooms
  const isTeacher = roleNames.includes('teacher');
  
  if (type === 'departement' && !isTeacher && !isAdmin) {
    // Only teachers or admin can create department rooms
    throw new ApiError(403, 'Only teachers or administrators can create department chat rooms');
  }
  
  if (type === 'teacher_student' && !isTeacher && !isAdmin) {
    // Only teachers or admin can create teacher-student channels
    throw new ApiError(403, 'Only teachers or administrators can create teacher-student chat rooms');
  }
  
  // For teacher, verify they belong to the department or class
  if (isTeacher && !isAdmin) {
    if (type === 'departement' && departement_id) {
      const isInDepartment = await storage.isTeacherInDepartment(userId, departement_id);
      if (!isInDepartment) {
        throw new ApiError(403, 'You must be a member of this department to create a department chat room');
      }
    }
    
    if (type === 'classe' && classe_id) {
      const teachesInClass = await storage.isTeacherInClass(userId, classe_id);
      if (!teachesInClass) {
        throw new ApiError(403, 'You must teach in this class to create a class chat room');
      }
    }
  }

  // Participants list based on room type
  let roomParticipants = [];
  
  if (type === 'classe' && classe_id) {
    // Add all students from this class
    const students = await storage.getClassStudents(classe_id);
    roomParticipants = students.map(s => ({
      utilisateur_id: s.utilisateur_id,
      role: 'member'
    }));
    
    // Add class teacher(s)
    const teachers = await storage.getClassTeachers(classe_id);
    const teacherParticipants = teachers.map(t => ({
      utilisateur_id: t.utilisateur_id,
      role: 'moderator'
    }));
    
    roomParticipants = [...roomParticipants, ...teacherParticipants];
  } 
  else if (type === 'departement' && departement_id) {
    // Add all teachers from this department
    const teachers = await storage.getDepartmentTeachers(departement_id);
    roomParticipants = teachers.map(t => ({
      utilisateur_id: t.utilisateur_id,
      role: 'member'
    }));

    // Make department head a moderator
    const departmentHead = await storage.getDepartmentHead(departement_id);
    if (departmentHead) {
      const headIndex = roomParticipants.findIndex(p => p.utilisateur_id === departmentHead.utilisateur_id);
      if (headIndex !== -1) {
        roomParticipants[headIndex].role = 'moderator';
      }
    }
  } 
  else if (type === 'administration') {
    // Add all admin staff
    const adminStaff = await storage.getAdministrationStaff(etablissement_id);
    roomParticipants = adminStaff.map(a => ({
      utilisateur_id: a.utilisateur_id,
      role: 'member'
    }));
    
    // Make director and principal moderators
    for (let i = 0; i < roomParticipants.length; i++) {
      const participant = roomParticipants[i];
      const userRoles = await storage.getUserRoles(participant.utilisateur_id);
      const userRoleNames = userRoles.map(r => r.nom.toLowerCase());
      
      if (userRoleNames.some(r => ['directeur', 'principal'].includes(r))) {
        roomParticipants[i].role = 'moderator';
      }
    }
  } 
  else if (type === 'parents' && classe_id) {
    // Add parents of students in the specified class
    const parents = await storage.getClassParents(classe_id);
    roomParticipants = parents.map(p => ({
      utilisateur_id: p.utilisateur_id,
      role: 'member'
    }));
    
    // Add class teacher as moderator
    const teachers = await storage.getClassTeachers(classe_id);
    const teacherParticipants = teachers.map(t => ({
      utilisateur_id: t.utilisateur_id,
      role: 'moderator'
    }));
    
    roomParticipants = [...roomParticipants, ...teacherParticipants];
  } 
  else if (participants && Array.isArray(participants)) {
    // Use the specified participants
    roomParticipants = participants.map(p => ({
      utilisateur_id: p.utilisateur_id,
      role: p.role || 'member'
    }));
  }
  
  // Ensure creator is included as an admin
  const creatorExists = roomParticipants.some(p => p.utilisateur_id === userId);
  if (!creatorExists) {
    roomParticipants.push({
      utilisateur_id: userId,
      role: 'admin'
    });
  } else {
    // Update creator's role to admin
    const creatorIndex = roomParticipants.findIndex(p => p.utilisateur_id === userId);
    roomParticipants[creatorIndex].role = 'admin';
  }
  
  // Create chat room
  const chatRoom = await storage.createChatRoom({
    nom,
    description,
    type,
    classe_id,
    departement_id,
    etablissement_id: etablissement_id || user.etablissement_id,
    cree_par: userId,
    date_creation: new Date(),
    est_actif: true
  });
  
  // Add participants
  for (const participant of roomParticipants) {
    await storage.addChatRoomParticipant({
      salle_id: chatRoom.id,
      utilisateur_id: participant.utilisateur_id,
      role: participant.role,
      date_ajout: new Date()
    });
  }
  
  // Get room with participants
  const roomWithParticipants = await storage.getChatRoomWithParticipants(chatRoom.id);
  
  logger.info('Chat room created', { 
    roomId: chatRoom.id, 
    createdBy: userId,
    participantCount: roomParticipants.length
  });
  
  res.status(201).json(roomWithParticipants);
});

/**
 * @desc    Get all chat rooms for a user
 * @route   GET /api/v1/chat/rooms
 * @access  Private
 */
export const getUserChatRooms = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const chatRooms = await storage.getUserChatRooms(userId);
  
  res.json(chatRooms);
});

/**
 * @desc    Get a specific chat room
 * @route   GET /api/v1/chat/rooms/:id
 * @access  Private
 */
export const getChatRoom = asyncHandler(async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const chatRoom = await storage.getChatRoom(roomId);
  
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }
  
  // Check if user is a participant
  const isParticipant = await storage.isUserInChatRoom(roomId, userId);
  
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat room');
  }
  
  // Get room with participants
  const roomWithParticipants = await storage.getChatRoomWithParticipants(roomId);
  
  res.json(roomWithParticipants);
});

/**
 * @desc    Send a message in a chat room
 * @route   POST /api/v1/chat/rooms/:id/messages
 * @access  Private
 */
export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);
  const userId = req.user?.id;
  const { contenu, langue = 'français' } = req.body;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const chatRoom = await storage.getChatRoom(roomId);
  
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }
  
  // Check if user is a participant
  const isParticipant = await storage.isUserInChatRoom(roomId, userId);
  
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat room');
  }
  
  // Create chat message
  const message = await storage.createChatMessage({
    salle_id: roomId,
    expediteur_id: userId,
    contenu,
    date_envoi: new Date(),
    langue
  });
  
  // Get sender info
  const sender = await storage.getUser(userId);
  
  const enrichedMessage = {
    ...message,
    expediteur: {
      id: sender.id,
      nom: sender.nom,
      prenom: sender.prenom,
      email: sender.email,
      photo_url: sender.photo_url
    }
  };
  
  logger.info('Chat message sent', { 
    messageId: message.id, 
    roomId,
    senderId: userId
  });
  
  res.status(201).json(enrichedMessage);
});

/**
 * @desc    Get messages for a chat room
 * @route   GET /api/v1/chat/rooms/:id/messages
 * @access  Private
 */
export const getChatRoomMessages = asyncHandler(async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);
  const userId = req.user?.id;
  
  // Support pagination
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const chatRoom = await storage.getChatRoom(roomId);
  
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }
  
  // Check if user is a participant
  const isParticipant = await storage.isUserInChatRoom(roomId, userId);
  
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat room');
  }
  
  // Get messages for this room with pagination
  const messages = await storage.getChatRoomMessages(roomId, limit, offset);
  
  // Mark messages as read for this user
  await storage.markChatRoomMessagesAsRead(roomId, userId);
  
  res.json(messages);
});

/**
 * @desc    Get unread message count for all chat rooms
 * @route   GET /api/v1/chat/unread
 * @access  Private
 */
export const getUnreadChatCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const unreadCounts = await storage.getUnreadChatMessageCounts(userId);
  
  res.json(unreadCounts);
});

/**
 * @desc    Add a participant to a chat room
 * @route   POST /api/v1/chat/rooms/:id/participants
 * @access  Private
 */
export const addChatRoomParticipant = asyncHandler(async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);
  const userId = req.user?.id;
  const { participant_id, role = 'member' } = req.body;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const chatRoom = await storage.getChatRoom(roomId);
  
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }
  
  // Check if user is a room admin or moderator
  const userParticipation = await storage.getChatRoomParticipant(roomId, userId);
  
  if (!userParticipation || !['admin', 'moderator'].includes(userParticipation.role)) {
    throw new ApiError(403, 'Only room admins and moderators can add participants');
  }
  
  // Only admin can add moderators or admins
  if (['moderator', 'admin'].includes(role) && userParticipation.role !== 'admin') {
    throw new ApiError(403, 'Only room admins can add moderators or admins');
  }
  
  // Check if user to add exists
  const userToAdd = await storage.getUser(participant_id);
  
  if (!userToAdd) {
    throw new ApiError(404, 'User to add not found');
  }
  
  // Check if user is already a participant
  const existingParticipation = await storage.getChatRoomParticipant(roomId, participant_id);
  
  if (existingParticipation) {
    throw new ApiError(400, 'User is already a participant in this chat room');
  }
  
  // Add participant
  const participation = await storage.addChatRoomParticipant({
    salle_id: roomId,
    utilisateur_id: participant_id,
    role,
    date_ajout: new Date()
  });
  
  logger.info('Participant added to chat room', { 
    roomId, 
    participantId: participant_id,
    addedBy: userId 
  });
  
  res.status(201).json(participation);
});

/**
 * @desc    Remove a participant from a chat room
 * @route   DELETE /api/v1/chat/rooms/:id/participants/:participantId
 * @access  Private
 */
export const removeChatRoomParticipant = asyncHandler(async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);
  const participantId = parseInt(req.params.participantId);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  const chatRoom = await storage.getChatRoom(roomId);
  
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }
  
  // Check if user is a room admin or moderator or removing themselves
  const userParticipation = await storage.getChatRoomParticipant(roomId, userId);
  
  if (!userParticipation) {
    throw new ApiError(403, 'You are not a participant in this chat room');
  }
  
  if (!['admin', 'moderator'].includes(userParticipation.role) && userId !== participantId) {
    throw new ApiError(403, 'Only room admins and moderators can remove other participants');
  }
  
  // Check if participant to remove exists
  const participantToRemove = await storage.getChatRoomParticipant(roomId, participantId);
  
  if (!participantToRemove) {
    throw new ApiError(404, 'Participant not found in this chat room');
  }
  
  // Moderators can't remove admins
  if (userParticipation.role === 'moderator' && participantToRemove.role === 'admin') {
    throw new ApiError(403, 'Moderators cannot remove admins from the chat room');
  }
  
  // Don't allow removal of the last admin
  if (participantToRemove.role === 'admin') {
    const adminCount = await storage.countChatRoomAdmins(roomId);
    
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot remove the last admin from the chat room');
    }
  }
  
  // Remove participant
  await storage.removeChatRoomParticipant(roomId, participantId);
  
  logger.info('Participant removed from chat room', { 
    roomId, 
    participantId,
    removedBy: userId 
  });
  
  res.json({ message: 'Participant removed successfully' });
});

/**
 * @desc    Update a participant's role in a chat room
 * @route   PUT /api/v1/chat/rooms/:id/participants/:participantId
 * @access  Private
 */
export const updateParticipantRole = asyncHandler(async (req: Request, res: Response) => {
  const roomId = parseInt(req.params.id);
  const participantId = parseInt(req.params.participantId);
  const userId = req.user?.id;
  const { role } = req.body;
  
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  if (!['admin', 'moderator', 'member'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be one of: admin, moderator, member');
  }
  
  const chatRoom = await storage.getChatRoom(roomId);
  
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }
  
  // Check if user is a room admin
  const userParticipation = await storage.getChatRoomParticipant(roomId, userId);
  
  if (!userParticipation || userParticipation.role !== 'admin') {
    throw new ApiError(403, 'Only room admins can update participant roles');
  }
  
  // Check if participant exists
  const participantToUpdate = await storage.getChatRoomParticipant(roomId, participantId);
  
  if (!participantToUpdate) {
    throw new ApiError(404, 'Participant not found in this chat room');
  }
  
  // Don't allow changing the role of the last admin
  if (participantToUpdate.role === 'admin' && role !== 'admin') {
    const adminCount = await storage.countChatRoomAdmins(roomId);
    
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot demote the last admin of the chat room');
    }
  }
  
  // Update participant role
  const updatedParticipant = await storage.updateChatRoomParticipant(roomId, participantId, role);
  
  logger.info('Participant role updated in chat room', { 
    roomId, 
    participantId,
    newRole: role,
    updatedBy: userId 
  });
  
  res.json(updatedParticipant);
});