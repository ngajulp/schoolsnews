import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all employees
 * @route   GET /api/v1/employees
 * @access  Private/Admin/HR
 */
export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
    
  const typeId = req.query.type_id
    ? parseInt(req.query.type_id as string)
    : undefined;
    
  const employees = await storage.listEmployees(etablissementId, typeId);
  
  res.json(employees);
});

/**
 * @desc    Get employee by ID
 * @route   GET /api/v1/employees/:id
 * @access  Private/Admin/HR
 */
export const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);
  
  const employee = await storage.getEmployee(employeeId);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  res.json(employee);
});

/**
 * @desc    Create a new employee
 * @route   POST /api/v1/employees
 * @access  Private/Admin/HR
 */
export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { 
    utilisateur_id,
    type_employe_id,
    date_embauche,
    statut_contrat, // 'permanent', 'contractuel', 'temporaire', etc.
    salaire,
    specialite,
    qualifications,
    etablissement_id
  } = req.body;
  
  // Check if user exists
  const user = await storage.getUser(utilisateur_id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Check if employee type exists
  const employeeType = await storage.getEmployeeType(type_employe_id);
  
  if (!employeeType) {
    throw new ApiError(404, 'Employee type not found');
  }
  
  // Check if employee with this user_id already exists
  const existingEmployee = await storage.getEmployeeByUserId(utilisateur_id);
  
  if (existingEmployee) {
    throw new ApiError(400, 'An employee record already exists for this user');
  }
  
  // Create employee
  const employee = await storage.createEmployee({
    utilisateur_id,
    type_employe_id,
    date_embauche: date_embauche || new Date(),
    statut_contrat,
    salaire,
    specialite,
    qualifications,
    etablissement_id: etablissement_id || user.etablissement_id,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  logger.info('Employee created', { 
    employeeId: employee.id, 
    userId: utilisateur_id,
    typeId: type_employe_id,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(employee);
});

/**
 * @desc    Update an employee
 * @route   PUT /api/v1/employees/:id
 * @access  Private/Admin/HR
 */
export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);
  
  const employee = await storage.getEmployee(employeeId);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  const { 
    type_employe_id,
    date_embauche,
    statut_contrat,
    salaire,
    specialite,
    qualifications,
    statut
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (type_employe_id !== undefined) {
    // Check if employee type exists
    const employeeType = await storage.getEmployeeType(type_employe_id);
    
    if (!employeeType) {
      throw new ApiError(404, 'Employee type not found');
    }
    
    updateData.type_employe_id = type_employe_id;
  }
  
  if (date_embauche !== undefined) updateData.date_embauche = date_embauche;
  if (statut_contrat !== undefined) updateData.statut_contrat = statut_contrat;
  if (salaire !== undefined) updateData.salaire = salaire;
  if (specialite !== undefined) updateData.specialite = specialite;
  if (qualifications !== undefined) updateData.qualifications = qualifications;
  if (statut !== undefined) updateData.statut = statut;
  
  // Add modification info
  updateData.modifie_par = req.user?.id;
  updateData.date_modification = new Date();
  
  // Update employee
  const updatedEmployee = await storage.updateEmployee(employeeId, updateData);
  
  if (!updatedEmployee) {
    throw new ApiError(500, 'Employee update failed');
  }
  
  logger.info('Employee updated', { 
    employeeId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedEmployee);
});

/**
 * @desc    Delete an employee (archive)
 * @route   DELETE /api/v1/employees/:id
 * @access  Private/Admin
 */
export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);
  
  const employee = await storage.getEmployee(employeeId);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  // Instead of deleting, mark as archived
  const updatedEmployee = await storage.updateEmployee(employeeId, { 
    statut: 'archived',
    modifie_par: req.user?.id,
    date_modification: new Date()
  });
  
  if (!updatedEmployee) {
    throw new ApiError(500, 'Employee archival failed');
  }
  
  logger.info('Employee archived', { 
    employeeId, 
    archivedBy: req.user?.id 
  });
  
  res.json({ message: 'Employee archived successfully' });
});

/**
 * @desc    Get all employee types
 * @route   GET /api/v1/employees/types
 * @access  Private/Admin/HR
 */
export const getEmployeeTypes = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
    
  const employeeTypes = await storage.listEmployeeTypes(etablissementId);
  
  res.json(employeeTypes);
});

/**
 * @desc    Create employee type
 * @route   POST /api/v1/employees/types
 * @access  Private/Admin
 */
export const createEmployeeType = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    description, 
    etablissement_id 
  } = req.body;
  
  // Create employee type
  const employeeType = await storage.createEmployeeType({
    nom,
    description,
    etablissement_id,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  logger.info('Employee type created', { 
    typeId: employeeType.id, 
    name: employeeType.nom,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(employeeType);
});

/**
 * @desc    Update employee type
 * @route   PUT /api/v1/employees/types/:id
 * @access  Private/Admin
 */
export const updateEmployeeType = asyncHandler(async (req: Request, res: Response) => {
  const typeId = parseInt(req.params.id);
  
  const employeeType = await storage.getEmployeeType(typeId);
  
  if (!employeeType) {
    throw new ApiError(404, 'Employee type not found');
  }
  
  const { nom, description } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  
  // Add modification info
  updateData.modifie_par = req.user?.id;
  updateData.date_modification = new Date();
  
  // Update employee type
  const updatedType = await storage.updateEmployeeType(typeId, updateData);
  
  if (!updatedType) {
    throw new ApiError(500, 'Employee type update failed');
  }
  
  logger.info('Employee type updated', { 
    typeId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedType);
});

/**
 * @desc    Delete employee type
 * @route   DELETE /api/v1/employees/types/:id
 * @access  Private/Admin
 */
export const deleteEmployeeType = asyncHandler(async (req: Request, res: Response) => {
  const typeId = parseInt(req.params.id);
  
  const employeeType = await storage.getEmployeeType(typeId);
  
  if (!employeeType) {
    throw new ApiError(404, 'Employee type not found');
  }
  
  // Check if this type has employees associated with it
  const hasEmployees = await storage.employeeTypeHasEmployees(typeId);
  
  if (hasEmployees) {
    throw new ApiError(400, 'Cannot delete employee type that has employees associated with it');
  }
  
  // Delete employee type
  await storage.deleteEmployeeType(typeId);
  
  logger.info('Employee type deleted', { 
    typeId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Employee type deleted successfully' });
});

/**
 * @desc    Assign teaching subjects to a teacher
 * @route   POST /api/v1/employees/:id/subjects
 * @access  Private/Admin/Principal
 */
export const assignSubjectsToTeacher = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);
  
  const employee = await storage.getEmployee(employeeId);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  // Check if employee is a teacher
  const employeeType = await storage.getEmployeeType(employee.type_employe_id);
  
  if (!employeeType || employeeType.nom !== 'Enseignant') {
    throw new ApiError(400, 'Employee is not a teacher');
  }
  
  const { matiere_ids, classe_ids, annee_scolaire_id } = req.body;
  
  if (!Array.isArray(matiere_ids) || matiere_ids.length === 0) {
    throw new ApiError(400, 'Please provide at least one subject id');
  }
  
  if (!Array.isArray(classe_ids) || classe_ids.length === 0) {
    throw new ApiError(400, 'Please provide at least one class id');
  }
  
  if (!annee_scolaire_id) {
    throw new ApiError(400, 'Please provide an academic year id');
  }
  
  // Assign subjects to teacher
  const assignments = [];
  
  for (const matiereId of matiere_ids) {
    for (const classeId of classe_ids) {
      assignments.push(await storage.assignSubjectToTeacher({
        enseignant_id: employeeId,
        matiere_id: matiereId,
        classe_id: classeId,
        annee_scolaire_id,
        etablissement_id: employee.etablissement_id,
        date_affectation: new Date(),
        cree_par: req.user?.id
      }));
    }
  }
  
  logger.info('Subjects assigned to teacher', { 
    teacherId: employeeId, 
    subjectIds: matiere_ids,
    classIds: classe_ids,
    assignedBy: req.user?.id 
  });
  
  res.status(201).json(assignments);
});

/**
 * @desc    Get teacher's assigned subjects
 * @route   GET /api/v1/employees/:id/subjects
 * @access  Private/Admin/Principal/Teacher
 */
export const getTeacherSubjects = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);
  
  const employee = await storage.getEmployee(employeeId);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  const anneeId = req.query.annee_scolaire_id 
    ? parseInt(req.query.annee_scolaire_id as string) 
    : undefined;
    
  // Get teacher's subjects
  const subjects = await storage.getTeacherSubjects(employeeId, anneeId);
  
  res.json(subjects);
});

/**
 * @desc    Remove subject assignment from teacher
 * @route   DELETE /api/v1/employees/:id/subjects/:assignmentId
 * @access  Private/Admin/Principal
 */
export const removeSubjectFromTeacher = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = parseInt(req.params.id);
  const assignmentId = parseInt(req.params.assignmentId);
  
  const employee = await storage.getEmployee(employeeId);
  
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }
  
  // Get assignment
  const assignment = await storage.getTeacherSubjectAssignment(assignmentId);
  
  if (!assignment) {
    throw new ApiError(404, 'Subject assignment not found');
  }
  
  if (assignment.enseignant_id !== employeeId) {
    throw new ApiError(400, 'Assignment does not belong to this teacher');
  }
  
  // Remove assignment
  await storage.removeSubjectFromTeacher(assignmentId);
  
  logger.info('Subject removed from teacher', { 
    teacherId: employeeId, 
    assignmentId,
    removedBy: req.user?.id 
  });
  
  res.json({ message: 'Subject assignment removed successfully' });
});