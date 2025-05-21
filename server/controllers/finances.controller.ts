import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all payment types
 * @route   GET /api/v1/finances/payment-types
 * @access  Private/Admin/Financier
 */
export const getPaymentTypes = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const paymentTypes = await storage.listPaymentTypes(etablissementId);
  
  res.json(paymentTypes);
});

/**
 * @desc    Create a new payment type
 * @route   POST /api/v1/finances/payment-types
 * @access  Private/Admin/Financier
 */
export const createPaymentType = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    description, 
    montant, 
    echeances,
    obligatoire,
    applicable_to,
    niveau_id,
    classe_id,
    annee_scolaire_id,
    etablissement_id 
  } = req.body;
  
  // Create payment type
  const paymentType = await storage.createPaymentType({
    nom,
    description,
    montant,
    echeances: echeances || 1,
    obligatoire: obligatoire || true,
    applicable_to, // 'all', 'niveau', 'classe'
    niveau_id,
    classe_id,
    annee_scolaire_id,
    etablissement_id,
    cree_par: req.user?.id,
    date_creation: new Date()
  });
  
  logger.info('Payment type created', { 
    paymentTypeId: paymentType.id, 
    name: paymentType.nom,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(paymentType);
});

/**
 * @desc    Update a payment type
 * @route   PUT /api/v1/finances/payment-types/:id
 * @access  Private/Admin/Financier
 */
export const updatePaymentType = asyncHandler(async (req: Request, res: Response) => {
  const paymentTypeId = parseInt(req.params.id);
  
  const paymentType = await storage.getPaymentType(paymentTypeId);
  
  if (!paymentType) {
    throw new ApiError(404, 'Payment type not found');
  }
  
  const { 
    nom, 
    description, 
    montant, 
    echeances,
    obligatoire,
    applicable_to,
    niveau_id,
    classe_id
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  if (montant !== undefined) updateData.montant = montant;
  if (echeances !== undefined) updateData.echeances = echeances;
  if (obligatoire !== undefined) updateData.obligatoire = obligatoire;
  if (applicable_to !== undefined) updateData.applicable_to = applicable_to;
  if (niveau_id !== undefined) updateData.niveau_id = niveau_id;
  if (classe_id !== undefined) updateData.classe_id = classe_id;
  
  // Update payment type
  const updatedPaymentType = await storage.updatePaymentType(paymentTypeId, updateData);
  
  if (!updatedPaymentType) {
    throw new ApiError(500, 'Payment type update failed');
  }
  
  logger.info('Payment type updated', { 
    paymentTypeId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedPaymentType);
});

/**
 * @desc    Delete a payment type
 * @route   DELETE /api/v1/finances/payment-types/:id
 * @access  Private/Admin
 */
export const deletePaymentType = asyncHandler(async (req: Request, res: Response) => {
  const paymentTypeId = parseInt(req.params.id);
  
  const paymentType = await storage.getPaymentType(paymentTypeId);
  
  if (!paymentType) {
    throw new ApiError(404, 'Payment type not found');
  }
  
  // Check if this payment type has payments associated with it
  const hasPayments = await storage.paymentTypeHasPayments(paymentTypeId);
  
  if (hasPayments) {
    throw new ApiError(400, 'Cannot delete payment type that has payments associated with it');
  }
  
  // Delete payment type
  await storage.deletePaymentType(paymentTypeId);
  
  logger.info('Payment type deleted', { 
    paymentTypeId, 
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Payment type deleted successfully' });
});

/**
 * @desc    Get all payments
 * @route   GET /api/v1/finances/payments
 * @access  Private/Admin/Financier
 */
export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const { classe_id, apprenant_id, payment_type_id, status, date_from, date_to } = req.query;
  
  // Build filter object
  const filter: any = {};
  
  if (etablissementId) filter.etablissement_id = etablissementId;
  if (classe_id) filter.classe_id = parseInt(classe_id as string);
  if (apprenant_id) filter.apprenant_id = parseInt(apprenant_id as string);
  if (payment_type_id) filter.type_paiement_id = parseInt(payment_type_id as string);
  if (status) filter.statut = status as string;
  if (date_from) filter.date_from = new Date(date_from as string);
  if (date_to) filter.date_to = new Date(date_to as string);
  
  const payments = await storage.listPayments(filter);
  
  res.json(payments);
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/v1/finances/payments/:id
 * @access  Private/Admin/Financier
 */
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  
  const payment = await storage.getPayment(paymentId);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  
  res.json(payment);
});

/**
 * @desc    Create a new payment
 * @route   POST /api/v1/finances/payments
 * @access  Private/Admin/Financier
 */
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { 
    apprenant_id, 
    type_paiement_id, 
    montant, 
    methode_paiement,
    reference_transaction,
    commentaire,
    recu_par,
    etablissement_id 
  } = req.body;
  
  // Check if student exists
  const apprenant = await storage.getApprenant(apprenant_id);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if payment type exists
  const paymentType = await storage.getPaymentType(type_paiement_id);
  
  if (!paymentType) {
    throw new ApiError(404, 'Payment type not found');
  }
  
  // Create payment
  const payment = await storage.createPayment({
    apprenant_id,
    type_paiement_id,
    montant,
    methode_paiement,
    reference_transaction,
    date_paiement: new Date(),
    statut: 'complete',
    commentaire,
    recu_par: recu_par || req.user?.id,
    etablissement_id: etablissement_id || apprenant.etablissement_id
  });
  
  // Update student's financial status
  await storage.updateStudentFinancialStatus(apprenant_id);
  
  logger.info('Payment created', { 
    paymentId: payment.id, 
    studentId: apprenant_id,
    amount: montant,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(payment);
});

/**
 * @desc    Update a payment
 * @route   PUT /api/v1/finances/payments/:id
 * @access  Private/Admin/Financier
 */
export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  
  const payment = await storage.getPayment(paymentId);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  
  const { 
    montant, 
    methode_paiement,
    reference_transaction,
    statut,
    commentaire
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (montant !== undefined) updateData.montant = montant;
  if (methode_paiement !== undefined) updateData.methode_paiement = methode_paiement;
  if (reference_transaction !== undefined) updateData.reference_transaction = reference_transaction;
  if (statut !== undefined) updateData.statut = statut;
  if (commentaire !== undefined) updateData.commentaire = commentaire;
  
  // Add modification info
  updateData.modifie_par = req.user?.id;
  updateData.date_modification = new Date();
  
  // Update payment
  const updatedPayment = await storage.updatePayment(paymentId, updateData);
  
  if (!updatedPayment) {
    throw new ApiError(500, 'Payment update failed');
  }
  
  // Update student's financial status
  await storage.updateStudentFinancialStatus(payment.apprenant_id);
  
  logger.info('Payment updated', { 
    paymentId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedPayment);
});

/**
 * @desc    Delete a payment (soft delete / cancel)
 * @route   DELETE /api/v1/finances/payments/:id
 * @access  Private/Admin
 */
export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  
  const payment = await storage.getPayment(paymentId);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  
  // Instead of deleting, mark as cancelled
  const updatedPayment = await storage.updatePayment(paymentId, { 
    statut: 'annule',
    modifie_par: req.user?.id,
    date_modification: new Date()
  });
  
  if (!updatedPayment) {
    throw new ApiError(500, 'Payment cancellation failed');
  }
  
  // Update student's financial status
  await storage.updateStudentFinancialStatus(payment.apprenant_id);
  
  logger.info('Payment cancelled', { 
    paymentId, 
    cancelledBy: req.user?.id 
  });
  
  res.json({ message: 'Payment cancelled successfully' });
});

/**
 * @desc    Generate payment receipt
 * @route   GET /api/v1/finances/payments/:id/receipt
 * @access  Private
 */
export const generatePaymentReceipt = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  
  const payment = await storage.getPayment(paymentId);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  
  // Check if user is authorized to access this payment receipt
  const isAuthorized = 
    req.user?.roles?.some(role => ['admin', 'financier', 'principal', 'censeur'].includes(role)) ||
    req.user?.id === payment.apprenant_id || // Student can view own receipts
    await storage.isParentOfStudent(req.user?.id, payment.apprenant_id); // Parent can view child's receipts
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to access this payment receipt');
  }
  
  // Generate receipt data
  const receiptData = await storage.generatePaymentReceipt(paymentId);
  
  res.json(receiptData);
});

/**
 * @desc    Generate payment receipt PDF
 * @route   GET /api/v1/finances/payments/:id/receipt/pdf
 * @access  Private
 */
export const generatePaymentReceiptPDF = asyncHandler(async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  
  const payment = await storage.getPayment(paymentId);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }
  
  // Check if user is authorized to access this payment receipt
  const isAuthorized = 
    req.user?.roles?.some(role => ['admin', 'financier', 'principal', 'censeur'].includes(role)) ||
    req.user?.id === payment.apprenant_id || // Student can view own receipts
    await storage.isParentOfStudent(req.user?.id, payment.apprenant_id); // Parent can view child's receipts
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to access this payment receipt');
  }
  
  // Generate PDF
  const pdfData = await storage.generatePaymentReceiptPDF(paymentId);
  
  // Set headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="payment-receipt-${payment.id}.pdf"`);
  
  res.send(pdfData);
});

/**
 * @desc    Get student financial status and payment history
 * @route   GET /api/v1/finances/students/:id
 * @access  Private
 */
export const getStudentFinancialStatus = asyncHandler(async (req: Request, res: Response) => {
  const apprenantId = parseInt(req.params.id);
  
  const apprenant = await storage.getApprenant(apprenantId);
  
  if (!apprenant) {
    throw new ApiError(404, 'Student not found');
  }
  
  // Check if user is authorized to view this student's financial status
  const isAuthorized = 
    req.user?.roles?.some(role => ['admin', 'financier', 'principal', 'censeur'].includes(role)) ||
    req.user?.id === apprenant.id || // Student can view own financial status
    await storage.isParentOfStudent(req.user?.id, apprenant.id); // Parent can view child's financial status
  
  if (!isAuthorized) {
    throw new ApiError(403, 'Not authorized to view this student\'s financial status');
  }
  
  // Get student's financial information
  const financialStatus = await storage.getStudentFinancialStatus(apprenantId);
  
  res.json(financialStatus);
});

/**
 * @desc    Get financial dashboard statistics
 * @route   GET /api/v1/finances/dashboard
 * @access  Private/Admin/Financier
 */
export const getFinancialDashboard = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const { periode } = req.query;
  
  // Get financial statistics
  const dashboard = await storage.getFinancialDashboard(etablissementId, periode as string);
  
  res.json(dashboard);
});