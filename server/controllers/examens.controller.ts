import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all exams
 * @route   GET /api/v1/examens
 * @access  Private/Admin/Teacher
 */
export const getExamens = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const classeId = req.query.classe_id
    ? parseInt(req.query.classe_id as string)
    : undefined;
    
  const matiereId = req.query.matiere_id
    ? parseInt(req.query.matiere_id as string)
    : undefined;
  
  const examens = await storage.listExamens(etablissementId, classeId, matiereId);
  
  res.json(examens);
});

/**
 * @desc    Get exam by ID
 * @route   GET /api/v1/examens/:id
 * @access  Private/Admin/Teacher
 */
export const getExamenById = asyncHandler(async (req: Request, res: Response) => {
  const examenId = parseInt(req.params.id);
  
  const examen = await storage.getExamen(examenId);
  
  if (!examen) {
    throw new ApiError(404, 'Exam not found');
  }
  
  res.json(examen);
});

/**
 * @desc    Create a new exam
 * @route   POST /api/v1/examens
 * @access  Private/Admin/Teacher
 */
export const createExamen = asyncHandler(async (req: Request, res: Response) => {
  const { 
    titre,
    description,
    type_examen,
    date_debut,
    date_fin,
    duree_minutes,
    classe_id,
    matiere_id,
    note_max,
    coefficient,
    etablissement_id 
  } = req.body;
  
  // Check if class exists
  if (classe_id) {
    const classe = await storage.getClasse(classe_id);
    
    if (!classe) {
      throw new ApiError(404, 'Class not found');
    }
  }
  
  // Check if subject exists
  if (matiere_id) {
    const matiere = await storage.getMatiere(matiere_id);
    
    if (!matiere) {
      throw new ApiError(404, 'Subject not found');
    }
  }
  
  // Create exam
  const examen = await storage.createExamen({
    titre,
    description,
    type_examen,
    date_debut,
    date_fin,
    duree_minutes,
    classe_id,
    matiere_id,
    enseignant_id: req.user?.id,
    statut: 'planifie',
    note_max: note_max || 20,
    coefficient: coefficient || 1,
    etablissement_id
  });
  
  logger.info('Exam created', { 
    examenId: examen.id, 
    title: examen.titre,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(examen);
});

/**
 * @desc    Update an exam
 * @route   PUT /api/v1/examens/:id
 * @access  Private/Admin/Teacher
 */
export const updateExamen = asyncHandler(async (req: Request, res: Response) => {
  const examenId = parseInt(req.params.id);
  
  const examen = await storage.getExamen(examenId);
  
  if (!examen) {
    throw new ApiError(404, 'Exam not found');
  }
  
  // Check if user is authorized to update this exam
  if (examen.enseignant_id !== req.user?.id && !req.user?.roles?.includes('admin')) {
    throw new ApiError(403, 'Not authorized to update this exam');
  }
  
  const { 
    titre,
    description,
    type_examen,
    date_debut,
    date_fin,
    duree_minutes,
    classe_id,
    matiere_id,
    note_max,
    coefficient,
    statut
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (titre !== undefined) updateData.titre = titre;
  if (description !== undefined) updateData.description = description;
  if (type_examen !== undefined) updateData.type_examen = type_examen;
  if (date_debut !== undefined) updateData.date_debut = date_debut;
  if (date_fin !== undefined) updateData.date_fin = date_fin;
  if (duree_minutes !== undefined) updateData.duree_minutes = duree_minutes;
  if (classe_id !== undefined) {
    const classe = await storage.getClasse(classe_id);
    if (!classe) {
      throw new ApiError(404, 'Class not found');
    }
    updateData.classe_id = classe_id;
  }
  if (matiere_id !== undefined) {
    const matiere = await storage.getMatiere(matiere_id);
    if (!matiere) {
      throw new ApiError(404, 'Subject not found');
    }
    updateData.matiere_id = matiere_id;
  }
  if (note_max !== undefined) updateData.note_max = note_max;
  if (coefficient !== undefined) updateData.coefficient = coefficient;
  if (statut !== undefined) updateData.statut = statut;
  
  // Update exam
  const updatedExamen = await storage.updateExamen(examenId, updateData);
  
  if (!updatedExamen) {
    throw new ApiError(500, 'Exam update failed');
  }
  
  logger.info('Exam updated', { 
    examenId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedExamen);
});

/**
 * @desc    Delete an exam
 * @route   DELETE /api/v1/examens/:id
 * @access  Private/Admin
 */
export const deleteExamen = asyncHandler(async (req: Request, res: Response) => {
  const examenId = parseInt(req.params.id);
  
  const examen = await storage.getExamen(examenId);
  
  if (!examen) {
    throw new ApiError(404, 'Exam not found');
  }
  
  // Check if user is authorized to delete this exam
  if (examen.enseignant_id !== req.user?.id && !req.user?.roles?.includes('admin')) {
    throw new ApiError(403, 'Not authorized to delete this exam');
  }
  
  // Check if exam has grades
  const grades = await storage.getExamenGrades(examenId);
  
  if (grades && grades.length > 0) {
    // Instead of deleting, set status to 'annule'
    const updatedExamen = await storage.updateExamen(examenId, { statut: 'annule' });
    
    if (!updatedExamen) {
      throw new ApiError(500, 'Exam cancellation failed');
    }
    
    logger.info('Exam cancelled (has grades)', { 
      examenId, 
      cancelledBy: req.user?.id 
    });
    
    res.json({ message: 'Exam cancelled successfully' });
  } else {
    // If no grades, can be deleted
    await storage.deleteExamen(examenId);
    
    logger.info('Exam deleted', { 
      examenId, 
      deletedBy: req.user?.id 
    });
    
    res.json({ message: 'Exam deleted successfully' });
  }
});

/**
 * @desc    Get exam grades
 * @route   GET /api/v1/examens/:id/grades
 * @access  Private/Admin/Teacher
 */
export const getExamenGrades = asyncHandler(async (req: Request, res: Response) => {
  const examenId = parseInt(req.params.id);
  
  const examen = await storage.getExamen(examenId);
  
  if (!examen) {
    throw new ApiError(404, 'Exam not found');
  }
  
  const grades = await storage.getExamenGrades(examenId);
  
  res.json(grades);
});

/**
 * @desc    Add or update a grade for an exam
 * @route   POST /api/v1/examens/:id/grades
 * @access  Private/Admin/Teacher
 */
export const addExamenGrade = asyncHandler(async (req: Request, res: Response) => {
  const examenId = parseInt(req.params.id);
  const { apprenant_id, note, remarque } = req.body;
  
  const examen = await storage.getExamen(examenId);
  
  if (!examen) {
    throw new ApiError(404, 'Exam not found');
  }
  
  // Check if user is authorized to add grades to this exam
  if (examen.enseignant_id !== req.user?.id && !req.user?.roles?.includes('admin')) {
    throw new ApiError(403, 'Not authorized to add grades to this exam');
  }
  
  // Check if student exists
  const apprenant = await storage.getApprenant(apprenant_id);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if student is in the class (if exam is class-specific)
  if (examen.classe_id && apprenant.classe_actuelle_id !== examen.classe_id) {
    throw new ApiError(400, 'Student is not in the class for this exam');
  }
  
  // Check if grade already exists for this student
  const existingGrade = await storage.getExamenGradeByStudent(examenId, apprenant_id);
  
  let grade;
  
  if (existingGrade) {
    // Update existing grade
    grade = await storage.updateExamenGrade(existingGrade.id, {
      note,
      remarque,
      saisi_par: req.user?.id,
      date_saisie: new Date()
    });
    
    logger.info('Exam grade updated', { 
      examenId, 
      apprenantId: apprenant_id,
      updatedBy: req.user?.id 
    });
  } else {
    // Create new grade
    grade = await storage.createExamenGrade({
      examen_id: examenId,
      apprenant_id,
      note,
      remarque,
      saisi_par: req.user?.id,
      date_saisie: new Date(),
      etablissement_id: examen.etablissement_id
    });
    
    logger.info('Exam grade created', { 
      examenId, 
      apprenantId: apprenant_id,
      createdBy: req.user?.id 
    });
  }
  
  res.status(existingGrade ? 200 : 201).json(grade);
});

/**
 * @desc    Delete a grade
 * @route   DELETE /api/v1/examens/:id/grades/:gradeId
 * @access  Private/Admin/Teacher
 */
export const deleteExamenGrade = asyncHandler(async (req: Request, res: Response) => {
  const examenId = parseInt(req.params.id);
  const gradeId = parseInt(req.params.gradeId);
  
  const examen = await storage.getExamen(examenId);
  
  if (!examen) {
    throw new ApiError(404, 'Exam not found');
  }
  
  // Check if user is authorized to delete grades from this exam
  if (examen.enseignant_id !== req.user?.id && !req.user?.roles?.includes('admin')) {
    throw new ApiError(403, 'Not authorized to delete grades from this exam');
  }
  
  const grade = await storage.getExamenGrade(gradeId);
  
  if (!grade || grade.examen_id !== examenId) {
    throw new ApiError(404, 'Grade not found for this exam');
  }
  
  await storage.deleteExamenGrade(gradeId);
  
  logger.info('Exam grade deleted', { 
    examenId, 
    gradeId,
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Grade deleted successfully' });
});

/**
 * @desc    Get student grades across all exams
 * @route   GET /api/v1/apprenants/:id/grades
 * @access  Private/Admin/Teacher
 */
export const getStudentGrades = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  const matiereId = req.query.matiere_id
    ? parseInt(req.query.matiere_id as string)
    : undefined;
    
  const grades = await storage.getStudentGrades(apprenantId, matiereId);
  
  res.json(grades);
});