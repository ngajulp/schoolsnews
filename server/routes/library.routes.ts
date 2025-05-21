import express from 'express';
import { 
  getBooks, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook,
  searchBooks,
  getLoans,
  getLoanById,
  createLoan,
  returnBook,
  getUserLoans
} from '../controllers/library.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Book validation schemas
const createBookSchema = z.object({
  titre: z.string().min(1, 'Title is required'),
  isbn: z.string().optional(),
  auteur: z.string().optional(),
  editeur: z.string().optional(),
  annee_publication: z.number().optional(),
  categorie: z.string().optional(),
  description: z.string().optional(),
  nombre_exemplaires: z.number().optional(),
  disponible: z.number().optional(),
  cote: z.string().optional(),
  photo_couverture: z.string().optional(),
  etablissement_id: z.number().optional()
});

const updateBookSchema = createBookSchema.partial();

// Loan validation schemas
const createLoanSchema = z.object({
  livre_id: z.number(),
  utilisateur_id: z.number(),
  date_emprunt: z.string().optional(),
  date_retour_prevue: z.string(),
  remarques: z.string().optional(),
  etablissement_id: z.number().optional()
});

// Book routes
router.route('/books')
  .get(protect, getBooks)
  .post(protect, authorize('admin', 'librarian'), validateRequest(createBookSchema), createBook);

router.route('/books/search')
  .get(protect, searchBooks);

router.route('/books/:id')
  .get(protect, getBookById)
  .put(protect, authorize('admin', 'librarian'), validateRequest(updateBookSchema), updateBook)
  .delete(protect, authorize('admin', 'librarian'), deleteBook);

// Loan routes
router.route('/loans')
  .get(protect, authorize('admin', 'librarian'), getLoans)
  .post(protect, authorize('admin', 'librarian'), validateRequest(createLoanSchema), createLoan);

router.route('/loans/:id')
  .get(protect, authorize('admin', 'librarian'), getLoanById);

router.route('/loans/:id/return')
  .put(protect, authorize('admin', 'librarian'), returnBook);

router.route('/users/:id/loans')
  .get(protect, getUserLoans);

export default router;