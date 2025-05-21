import { Request, Response } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { logger } from '../logger';

/**
 * @desc    Get all books
 * @route   GET /api/v1/library/books
 * @access  Private
 */
export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const books = await storage.listBooks(etablissementId);
  
  res.json(books);
});

/**
 * @desc    Get book by ID
 * @route   GET /api/v1/library/books/:id
 * @access  Private
 */
export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id);
  
  const book = await storage.getBook(bookId);
  
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  
  res.json(book);
});

/**
 * @desc    Create a new book
 * @route   POST /api/v1/library/books
 * @access  Private/Admin/Librarian
 */
export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const { 
    titre, 
    isbn, 
    auteur, 
    editeur, 
    annee_publication, 
    categorie, 
    description, 
    nombre_exemplaires, 
    disponible, 
    cote, 
    photo_couverture, 
    etablissement_id 
  } = req.body;
  
  // Create book
  const book = await storage.createBook({
    titre,
    isbn,
    auteur,
    editeur,
    annee_publication,
    categorie,
    description,
    nombre_exemplaires: nombre_exemplaires || 1,
    disponible: disponible || nombre_exemplaires || 1,
    cote,
    photo_couverture,
    etablissement_id,
    statut: 'disponible',
    date_ajout: new Date()
  });
  
  logger.info('Book created', { 
    bookId: book.id, 
    title: book.titre,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(book);
});

/**
 * @desc    Update a book
 * @route   PUT /api/v1/library/books/:id
 * @access  Private/Admin/Librarian
 */
export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id);
  
  const book = await storage.getBook(bookId);
  
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  
  const { 
    titre, 
    isbn, 
    auteur, 
    editeur, 
    annee_publication, 
    categorie, 
    description, 
    nombre_exemplaires, 
    disponible, 
    statut,
    cote, 
    photo_couverture
  } = req.body;
  
  // Prepare update data
  const updateData: any = {};
  
  if (titre !== undefined) updateData.titre = titre;
  if (isbn !== undefined) updateData.isbn = isbn;
  if (auteur !== undefined) updateData.auteur = auteur;
  if (editeur !== undefined) updateData.editeur = editeur;
  if (annee_publication !== undefined) updateData.annee_publication = annee_publication;
  if (categorie !== undefined) updateData.categorie = categorie;
  if (description !== undefined) updateData.description = description;
  if (nombre_exemplaires !== undefined) updateData.nombre_exemplaires = nombre_exemplaires;
  if (disponible !== undefined) updateData.disponible = disponible;
  if (statut !== undefined) updateData.statut = statut;
  if (cote !== undefined) updateData.cote = cote;
  if (photo_couverture !== undefined) updateData.photo_couverture = photo_couverture;
  
  // Update book
  const updatedBook = await storage.updateBook(bookId, updateData);
  
  if (!updatedBook) {
    throw new ApiError(500, 'Book update failed');
  }
  
  logger.info('Book updated', { 
    bookId, 
    updatedBy: req.user?.id 
  });
  
  res.json(updatedBook);
});

/**
 * @desc    Delete a book
 * @route   DELETE /api/v1/library/books/:id
 * @access  Private/Admin/Librarian
 */
export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id);
  
  const book = await storage.getBook(bookId);
  
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  
  // Check if book has active loans
  const activeLoans = await storage.getActiveBookLoans(bookId);
  
  if (activeLoans && activeLoans.length > 0) {
    throw new ApiError(400, `Book cannot be deleted as it has ${activeLoans.length} active loan(s)`);
  }
  
  // Delete book (or set status to 'retire')
  await storage.updateBook(bookId, { statut: 'retire' });
  
  logger.info('Book marked as retired', { 
    bookId, 
    title: book.titre,
    deletedBy: req.user?.id 
  });
  
  res.json({ message: 'Book removed successfully' });
});

/**
 * @desc    Search books
 * @route   GET /api/v1/library/books/search
 * @access  Private
 */
export const searchBooks = asyncHandler(async (req: Request, res: Response) => {
  const { query, category, status } = req.query;
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  
  const books = await storage.searchBooks({
    query: query as string,
    category: category as string,
    status: status as string,
    etablissementId
  });
  
  res.json(books);
});

/**
 * @desc    Get all loans
 * @route   GET /api/v1/library/loans
 * @access  Private/Admin/Librarian
 */
export const getLoans = asyncHandler(async (req: Request, res: Response) => {
  const etablissementId = req.query.etablissement_id 
    ? parseInt(req.query.etablissement_id as string) 
    : undefined;
  const status = req.query.status as string | undefined;
  
  const loans = await storage.listLoans(etablissementId, status);
  
  res.json(loans);
});

/**
 * @desc    Get loan by ID
 * @route   GET /api/v1/library/loans/:id
 * @access  Private/Admin/Librarian
 */
export const getLoanById = asyncHandler(async (req: Request, res: Response) => {
  const loanId = parseInt(req.params.id);
  
  const loan = await storage.getLoan(loanId);
  
  if (!loan) {
    throw new ApiError(404, 'Loan not found');
  }
  
  res.json(loan);
});

/**
 * @desc    Create a new loan
 * @route   POST /api/v1/library/loans
 * @access  Private/Admin/Librarian
 */
export const createLoan = asyncHandler(async (req: Request, res: Response) => {
  const { 
    livre_id, 
    utilisateur_id, 
    date_emprunt, 
    date_retour_prevue,
    remarques,
    etablissement_id 
  } = req.body;
  
  // Check if book exists and is available
  const book = await storage.getBook(livre_id);
  
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  
  if (book.disponible < 1 || book.statut !== 'disponible') {
    throw new ApiError(400, 'Book is not available for loan');
  }
  
  // Check if user exists
  const user = await storage.getUser(utilisateur_id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Create loan
  const loan = await storage.createLoan({
    livre_id,
    utilisateur_id,
    date_emprunt: date_emprunt || new Date(),
    date_retour_prevue,
    statut: 'en cours',
    remarques,
    etablissement_id: etablissement_id || book.etablissement_id
  });
  
  // Update book availability
  await storage.updateBook(livre_id, { 
    disponible: book.disponible - 1,
    statut: book.disponible <= 1 ? 'emprunte' : 'disponible'
  });
  
  logger.info('Loan created', { 
    loanId: loan.id, 
    bookId: book.id,
    userId: user.id,
    createdBy: req.user?.id 
  });
  
  res.status(201).json(loan);
});

/**
 * @desc    Return a book (update loan status)
 * @route   PUT /api/v1/library/loans/:id/return
 * @access  Private/Admin/Librarian
 */
export const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const loanId = parseInt(req.params.id);
  
  const loan = await storage.getLoan(loanId);
  
  if (!loan) {
    throw new ApiError(404, 'Loan not found');
  }
  
  if (loan.statut === 'retourne') {
    throw new ApiError(400, 'Book has already been returned');
  }
  
  const { remarques } = req.body;
  
  // Update loan
  const updatedLoan = await storage.updateLoan(loanId, {
    statut: 'retourne',
    date_retour_reelle: new Date(),
    remarques: remarques || loan.remarques
  });
  
  // Update book availability
  const book = await storage.getBook(loan.livre_id);
  
  if (book) {
    await storage.updateBook(loan.livre_id, {
      disponible: book.disponible + 1,
      statut: 'disponible'
    });
  }
  
  logger.info('Book returned', { 
    loanId, 
    bookId: loan.livre_id,
    returnedBy: req.user?.id 
  });
  
  res.json(updatedLoan);
});

/**
 * @desc    Get user loans
 * @route   GET /api/v1/library/users/:id/loans
 * @access  Private
 */
export const getUserLoans = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const status = req.query.status as string | undefined;
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Check if requesting user is allowed to view this data
  if (req.user?.id !== userId && !req.user?.roles?.includes('admin') && !req.user?.roles?.includes('librarian')) {
    throw new ApiError(403, 'Not authorized to view this user\'s loans');
  }
  
  const loans = await storage.getUserLoans(userId, status);
  
  res.json(loans);
});