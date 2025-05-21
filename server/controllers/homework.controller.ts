import { Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../logger';
import { insertDevoirSchema, insertSoumissionDevoirSchema } from '@shared/schema';
import { z } from 'zod';

// Get all homework assignments
export const getHomeworkAssignments = async (req: Request, res: Response) => {
  try {
    const { classeId, matiereId, etablissementId } = req.query;
    
    const classId = classeId ? parseInt(classeId as string) : undefined;
    const subjectId = matiereId ? parseInt(matiereId as string) : undefined;
    const schoolId = etablissementId ? parseInt(etablissementId as string) : undefined;
    
    const homeworks = await storage.listDevoirs(classId, subjectId, schoolId);
    
    return res.status(200).json({
      success: true,
      data: homeworks
    });
  } catch (error) {
    logger.error('Failed to get homework assignments', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to get homework assignments'
    });
  }
};

// Get a specific homework assignment
export const getHomeworkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const homeworkId = parseInt(id);
    
    const homework = await storage.getDevoir(homeworkId);
    
    if (!homework) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: homework
    });
  } catch (error) {
    logger.error('Failed to get homework assignment', { error, id: req.params.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to get homework assignment'
    });
  }
};

// Create a new homework assignment
export const createHomework = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get validated data from request body
    const homeworkData = {
      ...req.body,
      cree_par: req.user.id
    };
    
    // Create the homework assignment
    const homework = await storage.createDevoir(homeworkData);
    
    return res.status(201).json({
      success: true,
      data: homework,
      message: 'Homework assignment created successfully'
    });
  } catch (error) {
    logger.error('Failed to create homework assignment', { error, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to create homework assignment'
    });
  }
};

// Update a homework assignment
export const updateHomework = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { id } = req.params;
    const homeworkId = parseInt(id);
    
    // Check if homework exists
    const existingHomework = await storage.getDevoir(homeworkId);
    
    if (!existingHomework) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found'
      });
    }
    
    // Check if user is the creator of the homework or has admin rights
    if (existingHomework.cree_par !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this homework assignment'
      });
    }
    
    // Update the homework
    const updatedHomework = await storage.updateDevoir(homeworkId, req.body);
    
    return res.status(200).json({
      success: true,
      data: updatedHomework,
      message: 'Homework assignment updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update homework assignment', { error, id: req.params.id, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to update homework assignment'
    });
  }
};

// Delete a homework assignment
export const deleteHomework = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { id } = req.params;
    const homeworkId = parseInt(id);
    
    // Check if homework exists
    const existingHomework = await storage.getDevoir(homeworkId);
    
    if (!existingHomework) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found'
      });
    }
    
    // Check if user is the creator of the homework or has admin rights
    if (existingHomework.cree_par !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this homework assignment'
      });
    }
    
    // Delete the homework
    await storage.deleteDevoir(homeworkId);
    
    return res.status(200).json({
      success: true,
      message: 'Homework assignment deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete homework assignment', { error, id: req.params.id, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete homework assignment'
    });
  }
};

// Get student submissions for a homework assignment
export const getHomeworkSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const homeworkId = parseInt(id);
    
    // Check if homework exists
    const existingHomework = await storage.getDevoir(homeworkId);
    
    if (!existingHomework) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found'
      });
    }
    
    // Get all submissions
    const submissions = await storage.listSoumissionsDevoir(homeworkId);
    
    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    logger.error('Failed to get homework submissions', { error, id: req.params.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to get homework submissions'
    });
  }
};

// Create a submission for a homework assignment
export const createSubmission = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { id } = req.params;
    const homeworkId = parseInt(id);
    
    // Check if homework exists
    const existingHomework = await storage.getDevoir(homeworkId);
    
    if (!existingHomework) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found'
      });
    }
    
    // Check if student exists
    const student = await storage.getApprenantByUserId(req.user.id);
    
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit homework'
      });
    }
    
    // Check for existing submission
    const existingSubmission = await storage.getSoumissionDevoirByApprenantId(homeworkId, student.id);
    
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this homework assignment'
      });
    }
    
    // Create submission
    const submissionData = {
      ...req.body,
      devoir_id: homeworkId,
      apprenant_id: student.id,
      date_soumission: new Date(),
      statut: 'soumis'
    };
    
    const submission = await storage.createSoumissionDevoir(submissionData);
    
    return res.status(201).json({
      success: true,
      data: submission,
      message: 'Homework submitted successfully'
    });
  } catch (error) {
    logger.error('Failed to submit homework', { error, id: req.params.id, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to submit homework'
    });
  }
};

// Update a submission (grade/comment by teacher)
export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { id, submissionId } = req.params;
    const homeworkId = parseInt(id);
    const subId = parseInt(submissionId);
    
    // Check if homework exists
    const existingHomework = await storage.getDevoir(homeworkId);
    
    if (!existingHomework) {
      return res.status(404).json({
        success: false,
        message: 'Homework assignment not found'
      });
    }
    
    // Check if submission exists
    const submission = await storage.getSoumissionDevoir(subId);
    
    if (!submission || submission.devoir_id !== homeworkId) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if user is the creator of the homework or has admin rights
    if (existingHomework.cree_par !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to grade this submission'
      });
    }
    
    // Update the submission with grade and comments
    const updateData = {
      ...req.body,
      date_notation: new Date(),
      statut: 'note'
    };
    
    const updatedSubmission = await storage.updateSoumissionDevoir(subId, updateData);
    
    return res.status(200).json({
      success: true,
      data: updatedSubmission,
      message: 'Submission graded successfully'
    });
  } catch (error) {
    logger.error('Failed to grade submission', { error, id: req.params.id, submissionId: req.params.submissionId, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to grade submission'
    });
  }
};

// Get student's submissions
export const getStudentSubmissions = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if student exists
    const student = await storage.getApprenantByUserId(req.user.id);
    
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only students can view their submissions'
      });
    }
    
    // Get all submissions for this student
    const submissions = await storage.listSoumissionsDevoirByApprenant(student.id);
    
    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    logger.error('Failed to get student submissions', { error, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Failed to get student submissions'
    });
  }
};