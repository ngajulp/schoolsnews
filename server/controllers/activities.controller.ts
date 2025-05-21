import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all activity types
 * @route   GET /api/v1/activities/types
 * @access  Private
 */
export const getActivityTypes = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const activityTypes = await storage.listActivityTypes(etablissementId);
  
  res.json(activityTypes);
});

/**
 * @desc    Create activity type
 * @route   POST /api/v1/activities/types
 * @access  Private/Admin
 */
export const createActivityType = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    description, 
    categorie,
    etablissement_id 
  } = req.body;
  
  // Create activity type
  const activityType = await storage.createActivityType({
    nom,
    description,
    categorie, // 'sportive', 'culturelle', 'scientifique', etc.
    etablissement_id,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  logger.info('Activity type created', { 
    typeId: activityType.id, 
    name: activityType.nom,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(activityType);
});

/**
 * @desc    Update activity type
 * @route   PUT /api/v1/activities/types/:id
 * @access  Private/Admin
 */
export const updateActivityType = asyncHandler(async (req: Request, res: Response) => {
  const typeId = parseInt(req.params.id);
  
  const activityType = await storage.getActivityType(typeId);
  
  if (!activityType) {
    throw new ApiError(404, 'Activity type not found');
  }
  
  const { nom, description, categorie } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  if (categorie !== undefined) updateData.categorie = categorie;
  
  // Update activity type
  const updatedType = await storage.updateActivityType(typeId, updateData);
  
  if (!updatedType) {
    throw new ApiError(500, 'Activity type update failed');
  }
  
  logger.info('Activity type updated', { 
    typeId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedType);
});

/**
 * @desc    Delete activity type
 * @route   DELETE /api/v1/activities/types/:id
 * @access  Private/Admin
 */
export const deleteActivityType = asyncHandler(async (req: Request, res: Response) => {
  const typeId = parseInt(req.params.id);
  
  const activityType = await storage.getActivityType(typeId);
  
  if (!activityType) {
    throw new ApiError(404, 'Activity type not found');
  }
  
  // Check if activities use this type
  const hasActivities = await storage.activityTypeHasActivities(typeId);
  
  if (hasActivities) {
    throw new ApiError(400, 'Cannot delete activity type that has activities associated with it');
  }
  
  // Delete activity type
  await storage.deleteActivityType(typeId);
  
  logger.info('Activity type deleted', { 
    typeId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Activity type deleted successfully' });
});

/**
 * @desc    Get all activities
 * @route   GET /api/v1/activities
 * @access  Private
 */
export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
    
  const typeId = req.query.type_id
    ? parseInt(req.query.type_id as string)
    : undefined;
    
  const anneeId = req.query.annee_scolaire_id
    ? parseInt(req.query.annee_scolaire_id as string)
    : undefined;
    
  const filter: any = {};
  
  if (etablissementId) filter.etablissement_id = etablissementId;
  if (typeId) filter.type_activite_id = typeId;
  if (anneeId) filter.annee_scolaire_id = anneeId;
  
  const activities = await storage.listActivities(filter);
  
  res.json(activities);
});

/**
 * @desc    Get activity by ID
 * @route   GET /api/v1/activities/:id
 * @access  Private
 */
export const getActivityById = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  res.json(activity);
});

/**
 * @desc    Create new activity
 * @route   POST /api/v1/activities
 * @access  Private/Admin/Teacher
 */
export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    description, 
    type_activite_id,
    date_debut,
    date_fin,
    heure_debut,
    heure_fin,
    jour_semaine,
    lieu,
    responsable_id,
    max_participants,
    classes_cibles,
    annee_scolaire_id,
    etablissement_id 
  } = req.body;
  
  // Check if activity type exists
  const activityType = await storage.getActivityType(type_activite_id);
  
  if (!activityType) {
    throw new ApiError(404, 'Activity type not found');
  }
  
  // Check if responsible (teacher) exists
  if (responsable_id) {
    const responsible = await storage.getEmployee(responsable_id);
    
    if (!responsible) {
      throw new ApiError(404, 'Responsible employee not found');
    }
  }
  
  // Create activity
  const activity = await storage.createActivity({
    nom,
    description,
    type_activite_id,
    date_debut: date_debut ? new Date(date_debut) : undefined,
    date_fin: date_fin ? new Date(date_fin) : undefined,
    heure_debut,
    heure_fin,
    jour_semaine,
    lieu,
    responsable_id: responsable_id || req.user?.id,
    max_participants,
    classes_cibles: classes_cibles || [],
    statut: 'active',
    annee_scolaire_id,
    etablissement_id,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  logger.info('Activity created', { 
    activityId: activity.id, 
    name: activity.nom,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(activity);
});

/**
 * @desc    Update activity
 * @route   PUT /api/v1/activities/:id
 * @access  Private/Admin/Teacher
 */
export const updateActivity = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  // Check if user is authorized (admin or the responsible)
  if (req.user?.id !== activity.responsable_id && !req.user?.roles?.some(role => ['admin', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to update this activity');
  }
  
  const { 
    nom, 
    description, 
    type_activite_id,
    date_debut,
    date_fin,
    heure_debut,
    heure_fin,
    jour_semaine,
    lieu,
    responsable_id,
    max_participants,
    classes_cibles,
    statut
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  if (type_activite_id !== undefined) {
    // Check if activity type exists
    const activityType = await storage.getActivityType(type_activite_id);
    
    if (!activityType) {
      throw new ApiError(404, 'Activity type not found');
    }
    
    updateData.type_activite_id = type_activite_id;
  }
  if (date_debut !== undefined) updateData.date_debut = new Date(date_debut);
  if (date_fin !== undefined) updateData.date_fin = new Date(date_fin);
  if (heure_debut !== undefined) updateData.heure_debut = heure_debut;
  if (heure_fin !== undefined) updateData.heure_fin = heure_fin;
  if (jour_semaine !== undefined) updateData.jour_semaine = jour_semaine;
  if (lieu !== undefined) updateData.lieu = lieu;
  if (responsable_id !== undefined) {
    // Check if responsible exists
    const responsible = await storage.getEmployee(responsable_id);
    
    if (!responsible) {
      throw new ApiError(404, 'Responsible employee not found');
    }
    
    updateData.responsable_id = responsable_id;
  }
  if (max_participants !== undefined) updateData.max_participants = max_participants;
  if (classes_cibles !== undefined) updateData.classes_cibles = classes_cibles;
  if (statut !== undefined) updateData.statut = statut;
  
  // Add modification info
  updateData.modifie_par = req.user?.id;
  updateData.date_modification = new Date();
  
  // Update activity
  const updatedActivity = await storage.updateActivity(activityId, updateData);
  
  if (!updatedActivity) {
    throw new ApiError(500, 'Activity update failed');
  }
  
  logger.info('Activity updated', { 
    activityId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedActivity);
});

/**
 * @desc    Delete activity (archive)
 * @route   DELETE /api/v1/activities/:id
 * @access  Private/Admin
 */
export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  // Check if activity has participants
  const hasParticipants = await storage.activityHasParticipants(activityId);
  
  // Archive instead of delete if has participants
  if (hasParticipants) {
    const updatedActivity = await storage.updateActivity(activityId, { 
      statut: 'archived',
      modifie_par: req.user?.id,
      date_modification: new Date()
    });
    
    if (!updatedActivity) {
      throw new ApiError(500, 'Activity archival failed');
    }
    
    logger.info('Activity archived', { 
      activityId, 
      archivedBy: req.user?.id 
    });
    
    return res.json({ message: 'Activity archived successfully' });
  }
  
  // Delete activity if no participants
  await storage.deleteActivity(activityId);
  
  logger.info('Activity deleted', { 
    activityId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Activity deleted successfully' });
});

/**
 * @desc    Get activity participants
 * @route   GET /api/v1/activities/:id/participants
 * @access  Private/Admin/Teacher
 */
export const getActivityParticipants = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  const participants = await storage.getActivityParticipants(activityId);
  
  res.json(participants);
});

/**
 * @desc    Add participant to activity
 * @route   POST /api/v1/activities/:id/participants
 * @access  Private/Admin/Teacher
 */
export const addParticipant = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  const { apprenant_id } = req.body;
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  const apprenant = await storage.getApprenant(apprenant_id);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if activity reached maximum participants
  const participants = await storage.getActivityParticipants(activityId);
  
  if (activity.max_participants && participants.length >= activity.max_participants) {
    throw new ApiError(400, 'Activity has reached maximum number of participants');
  }
  
  // Check if student is already a participant
  const isParticipant = participants.some(p => p.id === apprenant_id);
  
  if (isParticipant) {
    throw new ApiError(400, 'Student is already a participant');
  }
  
  // Add participant
  const participation = await storage.addActivityParticipant({
    activite_id: activityId,
    apprenant_id,
    date_inscription: new Date(),
    statut: 'inscrit',
    cree_par: req.user?.id
  });
  
  logger.info('Participant added to activity', { 
    activityId, 
    studentId: apprenant_id,
    addedBy: req.user?.id 
  });
  
  res.status(201).json(participation);
});

/**
 * @desc    Remove participant from activity
 * @route   DELETE /api/v1/activities/:id/participants/:apprenantId
 * @access  Private/Admin/Teacher
 */
export const removeParticipant = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  const apprenantId = parseInt(req.params.apprenantId);
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  // Check if student is a participant
  const participation = await storage.getActivityParticipation(activityId, apprenantId);
  
  if (!participation) {
    throw new ApiError(404, 'Student is not a participant in this activity');
  }
  
  // Remove participant
  await storage.removeActivityParticipant(activityId, apprenantId);
  
  logger.info('Participant removed from activity', { 
    activityId, 
    studentId: apprenantId,
    removedBy: req.user?.id 
  });
  
  res.json({ message: 'Participant removed successfully' });
});

/**
 * @desc    Get activities by student
 * @route   GET /api/v1/activities/student/:id
 * @access  Private/Admin/Teacher/Parent/Student
 */
export const getStudentActivities = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if user is authorized
  const isAuthorized = 
    req.user?.roles?.some(role => ['admin', 'teacher', 'principal', 'censeur'].includes(role)) ||
    req.user?.id === apprenant.utilisateur_id || // Student themselves
    await storage.isParentOfStudent(req.user?.id, apprenantId); // Parent
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to view this student\'s activities');
  }
  
  const activities = await storage.getStudentActivities(apprenantId);
  
  res.json(activities);
});

/**
 * @desc    Take attendance for activity session
 * @route   POST /api/v1/activities/:id/attendance
 * @access  Private/Admin/Teacher
 */
export const takeAttendance = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  const { date, attendances } = req.body;
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  // Check if user is authorized (admin or the responsible)
  if (req.user?.id !== activity.responsable_id && !req.user?.roles?.some(role => ['admin', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to take attendance for this activity');
  }
  
  // Check if attendances is an array and validate format
  if (!Array.isArray(attendances) || attendances.length === 0) {
    throw new ApiError(400, 'Attendances must be an array of { apprenant_id, present, observation }');
  }
  
  // Process each attendance
  const attendanceDate = date ? new Date(date) : new Date();
  const results = [];
  
  for (const attendance of attendances) {
    const { apprenant_id, present, observation } = attendance;
    
    // Verify that student is a participant
    const participation = await storage.getActivityParticipation(activityId, apprenant_id);
    
    if (!participation) {
      continue; // Skip non-participants
    }
    
    // Create or update attendance record
    const record = await storage.createActivityAttendance({
      activite_id: activityId,
      apprenant_id,
      date: attendanceDate,
      present: present || false,
      observation,
      enregistre_par: req.user?.id,
      date_creation: new Date()
    });
    
    results.push(record);
  }
  
  logger.info('Activity attendance taken', { 
    activityId, 
    date: attendanceDate,
    count: results.length,
    takenBy: req.user?.id 
  });
  
  res.status(201).json(results);
});

/**
 * @desc    Get attendance records for activity
 * @route   GET /api/v1/activities/:id/attendance
 * @access  Private/Admin/Teacher
 */
export const getAttendanceRecords = asyncHandler(async (req: Request, res: Response) => {
  const activityId = parseInt(req.params.id);
  const { date, date_from, date_to } = req.query;
  
  const activity = await storage.getActivity(activityId);
  
  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }
  
  // Build filter
  const filter: any = { activite_id: activityId };
  
  if (date) {
    filter.date = new Date(date as string);
  } else if (date_from && date_to) {
    filter.date_from = new Date(date_from as string);
    filter.date_to = new Date(date_to as string);
  }
  
  const attendanceRecords = await storage.getActivityAttendance(filter);
  
  res.json(attendanceRecords);
});