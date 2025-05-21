import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Generate a student's bulletin for a specific period
 * @route   POST /api/v1/bulletins/generate
 * @access  Private/Admin/Teacher
 */
export const generateBulletin = asyncHandler(async (req: Request, res: Response) => {
  const { 
    apprenant_id,
    periode_type, // 'sequence', 'trimestre', 'annee'
    periode_id,
    annee_scolaire_id,
    classe_id,
    etablissement_id 
  } = req.body;
  
  // Check if student exists
  const apprenant = await storage.getApprenant(apprenant_id);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Get student's grade for the period
  let notes = [];
  
  if (periode_type === 'sequence') {
    // Get grades for a specific sequence
    notes = await storage.getSequenceGradesByStudent(apprenant_id, periode_id, classe_id);
  } else if (periode_type === 'trimestre') {
    // Get average grades for a trimester (combines multiple sequences)
    notes = await storage.getTrimestreGradesByStudent(apprenant_id, periode_id, classe_id);
  } else if (periode_type === 'annee') {
    // Get yearly average
    notes = await storage.getAnnualGradesByStudent(apprenant_id, annee_scolaire_id, classe_id);
  } else {
    throw new ApiError(400, 'Invalid period type. Must be sequence, trimestre, or annee');
  }
  
  // Calculate averages, ranks, etc.
  const moyenneGenerale = await calculateAverage(notes);
  const rang = await calculateRank(apprenant_id, periode_type, periode_id, classe_id);
  
  // Get class statistics
  const classeStats = await storage.getClasseStats(classe_id, periode_type, periode_id);
  
  // Get absences and sanctions for the period
  const absences = await storage.getAbsencesByPeriod(apprenant_id, periode_type, periode_id);
  const sanctions = await storage.getSanctionsByPeriod(apprenant_id, periode_type, periode_id);
  
  // Generate bulletin object
  const bulletin = {
    apprenant,
    periode: {
      type: periode_type,
      id: periode_id
    },
    notes,
    moyenneGenerale,
    rang,
    classeStats,
    absences,
    sanctions,
    enseignant_principal: await storage.getEnseignantPrincipal(classe_id),
    observations: await storage.getObservations(apprenant_id, periode_type, periode_id),
    decision: await determineDecision(moyenneGenerale, periode_type),
    generated_at: new Date(),
    generated_by: req.user?.id
  };
  
  // Save bulletin to database
  const savedBulletin = await storage.saveBulletin({
    apprenant_id,
    classe_id,
    periode_type,
    periode_id,
    annee_scolaire_id,
    moyenne_generale: moyenneGenerale,
    rang,
    observations: bulletin.observations?.map(o => o.commentaire).join('; '),
    decision: bulletin.decision,
    date_generation: new Date(),
    genere_par: req.user?.id,
    etablissement_id
  });
  
  logger.info('Bulletin generated', { 
    bulletinId: savedBulletin.id, 
    studentId: apprenant_id,
    periode: `${periode_type}-${periode_id}`,
    generatedBy: req.user?.id 
  });
  
  res.status(201).json(bulletin);
});

/**
 * @desc    Get a saved bulletin by ID
 * @route   GET /api/v1/bulletins/:id
 * @access  Private
 */
export const getBulletinById = asyncHandler(async (req: Request, res: Response) => {
  const bulletinId = parseInt(req.params.id);
  
  const bulletin = await storage.getBulletin(bulletinId);
  
  if (!bulletin) {
    throw new ApiError(404, 'Bulletin not found');
  }
  
  // Check if user is authorized to view this bulletin
  const isAuthorized = 
    req.user?.roles?.includes('admin') ||
    req.user?.roles?.includes('teacher') ||
    req.user?.roles?.includes('principal') ||
    req.user?.id === bulletin.apprenant_id || // Student can view own bulletin
    await storage.isParentOfStudent(req.user?.id, bulletin.apprenant_id); // Parent can view child's bulletin
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to view this bulletin');
  }
  
  // Get complete bulletin data
  const completeBulletin = await storage.getCompleteBulletinData(bulletinId);
  
  res.json(completeBulletin);
});

/**
 * @desc    Get all bulletins for a student
 * @route   GET /api/v1/bulletins/student/:id
 * @access  Private
 */
export const getStudentBulletins = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if user is authorized to view this student's bulletins
  const isAuthorized = 
    req.user?.roles?.includes('admin') ||
    req.user?.roles?.includes('teacher') ||
    req.user?.roles?.includes('principal') ||
    req.user?.id === apprenant.id || // Student can view own bulletins
    await storage.isParentOfStudent(req.user?.id, apprenant.id); // Parent can view child's bulletins
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to view this student\'s bulletins');
  }
  
  // Get all bulletins for the student
  const bulletins = await storage.getStudentBulletins(apprenantId);
  
  res.json(bulletins);
});

/**
 * @desc    Get bulletins for a class by period
 * @route   GET /api/v1/bulletins/class/:id
 * @access  Private/Admin/Teacher/Principal
 */
export const getClassBulletins = asyncHandler(async (req: Request, res: Response) => {
  const classeId = parseInt(req.params.id);
  const { periode_type, periode_id } = req.query;
  
  const classe = await storage.getClasse(classeId);
  
  if (!classe) {
    throw new ApiError(404, 'Class not found');
  }
  
  // Check if user is authorized
  if (!req.user?.roles?.some(role => ['admin', 'teacher', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to view class bulletins');
  }
  
  // Get bulletins for the class for a specific period
  const bulletins = await storage.getClassBulletins(
    classeId, 
    periode_type as string, 
    periode_id ? parseInt(periode_id as string) : undefined
  );
  
  res.json(bulletins);
});

/**
 * @desc    Delete a bulletin
 * @route   DELETE /api/v1/bulletins/:id
 * @access  Private/Admin/Principal
 */
export const deleteBulletin = asyncHandler(async (req: Request, res: Response) => {
  const bulletinId = parseInt(req.params.id);
  
  const bulletin = await storage.getBulletin(bulletinId);
  
  if (!bulletin) {
    throw new ApiError(404, 'Bulletin not found');
  }
  
  // Only admin or principal can delete bulletins
  if (!req.user?.roles?.some(role => ['admin', 'principal', 'censeur'].includes(role))) {
    throw new ApiError(403, 'Not authorized to delete bulletins');
  }
  
  await storage.deleteBulletin(bulletinId);
  
  logger.info('Bulletin deleted', { 
    bulletinId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Bulletin deleted successfully' });
});

/**
 * @desc    Generate PDF bulletin
 * @route   GET /api/v1/bulletins/:id/pdf
 * @access  Private
 */
export const generatePdfBulletin = asyncHandler(async (req: Request, res: Response) => {
  const bulletinId = parseInt(req.params.id);
  
  const bulletin = await storage.getBulletin(bulletinId);
  
  if (!bulletin) {
    throw new ApiError(404, 'Bulletin not found');
  }
  
  // Check if user is authorized to view this bulletin
  const isAuthorized = 
    req.user?.roles?.includes('admin') ||
    req.user?.roles?.includes('teacher') ||
    req.user?.roles?.includes('principal') ||
    req.user?.id === bulletin.apprenant_id || // Student can view own bulletin
    await storage.isParentOfStudent(req.user?.id, bulletin.apprenant_id); // Parent can view child's bulletin
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to view this bulletin');
  }
  
  // Generate PDF
  const pdfData = await storage.generateBulletinPDF(bulletinId);
  
  // Set headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="bulletin-${bulletin.id}.pdf"`);
  
  res.send(pdfData);
});

// Helper functions

/**
 * Calculate the average grade of a student from their notes
 */
async function calculateAverage(notes) {
  if (!notes || notes.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCoefficients = 0;
  
  for (const note of notes) {
    totalPoints += note.note * note.coefficient;
    totalCoefficients += note.coefficient;
  }
  
  return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
}

/**
 * Calculate the rank of a student in their class
 */
async function calculateRank(apprenantId, periodeType, periodeId, classeId) {
  // This would normally query the database to get all students in the class
  // and their averages, then rank them
  
  // This is a placeholder
  return 1;
}

/**
 * Determine the promotion decision based on the average grade
 */
async function determineDecision(average, periodeType) {
  if (periodeType !== 'annee') {
    return 'En cours'; // No decision for non-annual periods
  }
  
  if (average >= 10) {
    return 'Admis au niveau supérieur';
  } else if (average >= 8) {
    return 'Admis sous réserve';
  } else {
    return 'Redoublement';
  }
}