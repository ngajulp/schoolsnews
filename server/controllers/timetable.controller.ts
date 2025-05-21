import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get timetable periods configuration
 * @route   GET /api/v1/timetable/periods
 * @access  Private
 */
export const getTimetablePeriods = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const periods = await storage.getTimetablePeriods(etablissementId);
  
  res.json(periods);
});

/**
 * @desc    Create a timetable period
 * @route   POST /api/v1/timetable/periods
 * @access  Private/Admin
 */
export const createTimetablePeriod = asyncHandler(async (req: Request, res: Response) => {
  const {
    nom,
    heure_debut,
    heure_fin,
    ordre,
    jour_semaine,
    est_pause,
    etablissement_id
  } = req.body;
  
  // Get user's establishment if not provided
  const userEtablissementId = etablissement_id || req.user?.etablissement_id;
  
  if (!userEtablissementId) {
    throw new ApiError(400, 'Establishment ID is required');
  }
  
  // Check if period with same time slot exists
  const existingPeriod = await storage.findOverlappingPeriod(
    userEtablissementId,
    jour_semaine,
    heure_debut,
    heure_fin
  );
  
  if (existingPeriod) {
    throw new ApiError(400, 'A period with overlapping time already exists for this day');
  }
  
  // Create period
  const period = await storage.createTimetablePeriod({
    nom,
    heure_debut,
    heure_fin,
    ordre,
    jour_semaine,
    est_pause: est_pause || false,
    etablissement_id: userEtablissementId,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  logger.info('Timetable period created', { 
    periodId: period.id, 
    name: period.nom,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(period);
});

/**
 * @desc    Update a timetable period
 * @route   PUT /api/v1/timetable/periods/:id
 * @access  Private/Admin
 */
export const updateTimetablePeriod = asyncHandler(async (req: Request, res: Response) => {
  const periodId = parseInt(req.params.id);
  
  const period = await storage.getTimetablePeriod(periodId);
  
  if (!period) {
    throw new ApiError(404, 'Timetable period not found');
  }
  
  const {
    nom,
    heure_debut,
    heure_fin,
    ordre,
    jour_semaine,
    est_pause
  } = req.body;
  
  // Check if time has changed
  const timeChanged = (heure_debut && heure_debut !== period.heure_debut) || 
                      (heure_fin && heure_fin !== period.heure_fin) ||
                      (jour_semaine && jour_semaine !== period.jour_semaine);
  
  // If time changed, check for overlaps
  if (timeChanged) {
    const existingPeriod = await storage.findOverlappingPeriod(
      period.etablissement_id,
      jour_semaine || period.jour_semaine,
      heure_debut || period.heure_debut,
      heure_fin || period.heure_fin,
      periodId // Exclude this period from check
    );
    
    if (existingPeriod) {
      throw new ApiError(400, 'A period with overlapping time already exists for this day');
    }
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (heure_debut !== undefined) updateData.heure_debut = heure_debut;
  if (heure_fin !== undefined) updateData.heure_fin = heure_fin;
  if (ordre !== undefined) updateData.ordre = ordre;
  if (jour_semaine !== undefined) updateData.jour_semaine = jour_semaine;
  if (est_pause !== undefined) updateData.est_pause = est_pause;
  
  updateData.modifie_par = req.user?.id;
  updateData.date_modification = new Date();
  
  // Update period
  const updatedPeriod = await storage.updateTimetablePeriod(periodId, updateData);
  
  logger.info('Timetable period updated', { 
    periodId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedPeriod);
});

/**
 * @desc    Delete a timetable period
 * @route   DELETE /api/v1/timetable/periods/:id
 * @access  Private/Admin
 */
export const deleteTimetablePeriod = asyncHandler(async (req: Request, res: Response) => {
  const periodId = parseInt(req.params.id);
  
  const period = await storage.getTimetablePeriod(periodId);
  
  if (!period) {
    throw new ApiError(404, 'Timetable period not found');
  }
  
  // Check if period is used in any timetable
  const isUsed = await storage.isPeriodUsedInTimetable(periodId);
  
  if (isUsed) {
    throw new ApiError(400, 'Cannot delete period that is used in timetables');
  }
  
  // Delete period
  await storage.deleteTimetablePeriod(periodId);
  
  logger.info('Timetable period deleted', { 
    periodId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Timetable period deleted successfully' });
});

/**
 * @desc    Get all timetable entries for a class
 * @route   GET /api/v1/timetable/classe/:classeId
 * @access  Private
 */
export const getClassTimetable = asyncHandler(async (req: Request, res: Response) => {
  const classeId = parseInt(req.params.classeId);
  
  const classe = await storage.getClasse(classeId);
  
  if (!classe) {
    throw new ApiError(404, 'Class not found');
  }
  
  const timetable = await storage.getClassTimetable(classeId);
  
  res.json(timetable);
});

/**
 * @desc    Get all timetable entries for a teacher
 * @route   GET /api/v1/timetable/teacher/:teacherId
 * @access  Private
 */
export const getTeacherTimetable = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = parseInt(req.params.teacherId);
  
  const employee = await storage.getEmployee(teacherId);
  
  if (!employee) {
    throw new ApiError(404, 'Teacher not found');
  }
  
  const timetable = await storage.getTeacherTimetable(teacherId);
  
  res.json(timetable);
});

/**
 * @desc    Create a timetable entry
 * @route   POST /api/v1/timetable/entries
 * @access  Private/Admin
 */
export const createTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const {
    classe_id,
    matiere_id,
    enseignant_id,
    periode_id,
    salle_id,
    annee_scolaire_id
  } = req.body;
  
  // Validate class exists
  const classe = await storage.getClasse(classe_id);
  
  if (!classe) {
    throw new ApiError(404, 'Class not found');
  }
  
  // Validate subject exists
  const matiere = await storage.getMatiere(matiere_id);
  
  if (!matiere) {
    throw new ApiError(404, 'Subject not found');
  }
  
  // Validate teacher exists
  const enseignant = await storage.getEmployee(enseignant_id);
  
  if (!enseignant) {
    throw new ApiError(404, 'Teacher not found');
  }
  
  // Validate period exists
  const periode = await storage.getTimetablePeriod(periode_id);
  
  if (!periode) {
    throw new ApiError(404, 'Period not found');
  }
  
  // Validate room exists if provided
  if (salle_id) {
    const salle = await storage.getSalle(salle_id);
    
    if (!salle) {
      throw new ApiError(404, 'Room not found');
    }
  }
  
  // Check if class already has an entry for this period
  const classConflict = await storage.findTimetableConflict('classe', classe_id, periode_id);
  
  if (classConflict) {
    throw new ApiError(400, 'Class already has an entry for this period');
  }
  
  // Check if teacher already has an entry for this period
  const teacherConflict = await storage.findTimetableConflict('enseignant', enseignant_id, periode_id);
  
  if (teacherConflict) {
    throw new ApiError(400, 'Teacher already has an entry for this period');
  }
  
  // Check if room already has an entry for this period
  if (salle_id) {
    const roomConflict = await storage.findTimetableConflict('salle', salle_id, periode_id);
    
    if (roomConflict) {
      throw new ApiError(400, 'Room already has an entry for this period');
    }
  }
  
  // Create timetable entry
  const entry = await storage.createTimetableEntry({
    classe_id,
    matiere_id,
    enseignant_id,
    periode_id,
    salle_id,
    annee_scolaire_id,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  // Get enriched entry with relations
  const enrichedEntry = await storage.getTimetableEntry(entry.id);
  
  logger.info('Timetable entry created', { 
    entryId: entry.id, 
    classId: classe_id,
    subjectId: matiere_id,
    teacherId: enseignant_id,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(enrichedEntry);
});

/**
 * @desc    Update a timetable entry
 * @route   PUT /api/v1/timetable/entries/:id
 * @access  Private/Admin
 */
export const updateTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const entryId = parseInt(req.params.id);
  
  const entry = await storage.getTimetableEntry(entryId);
  
  if (!entry) {
    throw new ApiError(404, 'Timetable entry not found');
  }
  
  const {
    classe_id,
    matiere_id,
    enseignant_id,
    periode_id,
    salle_id
  } = req.body;
  
  // Validate class if provided
  if (classe_id) {
    const classe = await storage.getClasse(classe_id);
    
    if (!classe) {
      throw new ApiError(404, 'Class not found');
    }
  }
  
  // Validate subject if provided
  if (matiere_id) {
    const matiere = await storage.getMatiere(matiere_id);
    
    if (!matiere) {
      throw new ApiError(404, 'Subject not found');
    }
  }
  
  // Validate teacher if provided
  if (enseignant_id) {
    const enseignant = await storage.getEmployee(enseignant_id);
    
    if (!enseignant) {
      throw new ApiError(404, 'Teacher not found');
    }
  }
  
  // Validate period if provided
  if (periode_id) {
    const periode = await storage.getTimetablePeriod(periode_id);
    
    if (!periode) {
      throw new ApiError(404, 'Period not found');
    }
  }
  
  // Validate room if provided
  if (salle_id) {
    const salle = await storage.getSalle(salle_id);
    
    if (!salle) {
      throw new ApiError(404, 'Room not found');
    }
  }
  
  // Check conflicts if period or key resources changed
  const periodChanged = periode_id && periode_id !== entry.periode_id;
  const classChanged = classe_id && classe_id !== entry.classe_id;
  const teacherChanged = enseignant_id && enseignant_id !== entry.enseignant_id;
  const roomChanged = salle_id && salle_id !== entry.salle_id;
  
  if (periodChanged || classChanged) {
    const effectiveClassId = classe_id || entry.classe_id;
    const effectivePeriodId = periode_id || entry.periode_id;
    
    const classConflict = await storage.findTimetableConflict(
      'classe', 
      effectiveClassId, 
      effectivePeriodId,
      entryId  // Exclude current entry
    );
    
    if (classConflict) {
      throw new ApiError(400, 'Class already has an entry for this period');
    }
  }
  
  if (periodChanged || teacherChanged) {
    const effectiveTeacherId = enseignant_id || entry.enseignant_id;
    const effectivePeriodId = periode_id || entry.periode_id;
    
    const teacherConflict = await storage.findTimetableConflict(
      'enseignant', 
      effectiveTeacherId, 
      effectivePeriodId,
      entryId  // Exclude current entry
    );
    
    if (teacherConflict) {
      throw new ApiError(400, 'Teacher already has an entry for this period');
    }
  }
  
  if ((periodChanged || roomChanged) && (salle_id || entry.salle_id)) {
    const effectiveRoomId = salle_id || entry.salle_id;
    const effectivePeriodId = periode_id || entry.periode_id;
    
    const roomConflict = await storage.findTimetableConflict(
      'salle', 
      effectiveRoomId, 
      effectivePeriodId,
      entryId  // Exclude current entry
    );
    
    if (roomConflict) {
      throw new ApiError(400, 'Room already has an entry for this period');
    }
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (classe_id !== undefined) updateData.classe_id = classe_id;
  if (matiere_id !== undefined) updateData.matiere_id = matiere_id;
  if (enseignant_id !== undefined) updateData.enseignant_id = enseignant_id;
  if (periode_id !== undefined) updateData.periode_id = periode_id;
  if (salle_id !== undefined) updateData.salle_id = salle_id;
  
  updateData.modifie_par = req.user?.id;
  updateData.date_modification = new Date();
  
  // Update entry
  const updatedEntry = await storage.updateTimetableEntry(entryId, updateData);
  
  // Get enriched entry with relations
  const enrichedEntry = await storage.getTimetableEntry(entryId);
  
  logger.info('Timetable entry updated', { 
    entryId, 
    updatedBy: req.user?.id 
  });
  
  res.json(enrichedEntry);
});

/**
 * @desc    Delete a timetable entry
 * @route   DELETE /api/v1/timetable/entries/:id
 * @access  Private/Admin
 */
export const deleteTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const entryId = parseInt(req.params.id);
  
  const entry = await storage.getTimetableEntry(entryId);
  
  if (!entry) {
    throw new ApiError(404, 'Timetable entry not found');
  }
  
  // Delete entry
  await storage.deleteTimetableEntry(entryId);
  
  logger.info('Timetable entry deleted', { 
    entryId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Timetable entry deleted successfully' });
});

/**
 * @desc    Bulk create timetable entries
 * @route   POST /api/v1/timetable/entries/bulk
 * @access  Private/Admin
 */
export const bulkCreateTimetableEntries = asyncHandler(async (req: Request, res: Response) => {
  const { entries, annee_scolaire_id } = req.body;
  
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(400, 'Entries array is required and must not be empty');
  }
  
  if (!annee_scolaire_id) {
    throw new ApiError(400, 'Academic year ID is required');
  }
  
  // Validate annee_scolaire_id
  const anneeAcademique = await storage.getAnneeAcademique(annee_scolaire_id);
  
  if (!anneeAcademique) {
    throw new ApiError(404, 'Academic year not found');
  }
  
  // Track errors for each entry
  const results = [];
  
  for (const [index, entry] of entries.entries()) {
    try {
      // Validate required fields
      const { classe_id, matiere_id, enseignant_id, periode_id } = entry;
      
      if (!classe_id || !matiere_id || !enseignant_id || !periode_id) {
        results.push({
          index,
          success: false,
          error: 'Missing required fields',
          entry
        });
        continue;
      }
      
      // Validate class exists
      const classe = await storage.getClasse(classe_id);
      
      if (!classe) {
        results.push({
          index,
          success: false,
          error: `Class with ID ${classe_id} not found`,
          entry
        });
        continue;
      }
      
      // Validate subject exists
      const matiere = await storage.getMatiere(matiere_id);
      
      if (!matiere) {
        results.push({
          index,
          success: false,
          error: `Subject with ID ${matiere_id} not found`,
          entry
        });
        continue;
      }
      
      // Validate teacher exists
      const enseignant = await storage.getEmployee(enseignant_id);
      
      if (!enseignant) {
        results.push({
          index,
          success: false,
          error: `Teacher with ID ${enseignant_id} not found`,
          entry
        });
        continue;
      }
      
      // Validate period exists
      const periode = await storage.getTimetablePeriod(periode_id);
      
      if (!periode) {
        results.push({
          index,
          success: false,
          error: `Period with ID ${periode_id} not found`,
          entry
        });
        continue;
      }
      
      // Validate room if provided
      if (entry.salle_id) {
        const salle = await storage.getSalle(entry.salle_id);
        
        if (!salle) {
          results.push({
            index,
            success: false,
            error: `Room with ID ${entry.salle_id} not found`,
            entry
          });
          continue;
        }
      }
      
      // Check if class already has an entry for this period
      const classConflict = await storage.findTimetableConflict('classe', classe_id, periode_id);
      
      if (classConflict) {
        results.push({
          index,
          success: false,
          error: `Class already has an entry for this period`,
          entry,
          conflictWith: classConflict
        });
        continue;
      }
      
      // Check if teacher already has an entry for this period
      const teacherConflict = await storage.findTimetableConflict('enseignant', enseignant_id, periode_id);
      
      if (teacherConflict) {
        results.push({
          index,
          success: false,
          error: `Teacher already has an entry for this period`,
          entry,
          conflictWith: teacherConflict
        });
        continue;
      }
      
      // Check if room already has an entry for this period
      if (entry.salle_id) {
        const roomConflict = await storage.findTimetableConflict('salle', entry.salle_id, periode_id);
        
        if (roomConflict) {
          results.push({
            index,
            success: false,
            error: `Room already has an entry for this period`,
            entry,
            conflictWith: roomConflict
          });
          continue;
        }
      }
      
      // Create timetable entry
      const timetableEntry = await storage.createTimetableEntry({
        classe_id,
        matiere_id,
        enseignant_id,
        periode_id,
        salle_id: entry.salle_id,
        annee_scolaire_id,
        cree_par: req.user?.id,
        date_creation: new Date()
      });
      
      results.push({
        index,
        success: true,
        entry: timetableEntry
      });
      
    } catch (error: any) {
      results.push({
        index,
        success: false,
        error: error.message || 'Unknown error',
        entry
      });
    }
  }
  
  // Count successes and failures
  const successCount = results.filter(result => result.success).length;
  const failureCount = results.length - successCount;
  
  logger.info('Bulk timetable entries created', { 
    totalEntries: entries.length,
    successCount,
    failureCount,
    createdBy: req.user?.id 
  });
  
  res.status(201).json({
    totalEntries: entries.length,
    successCount,
    failureCount,
    results
  });
});