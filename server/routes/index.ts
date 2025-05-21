import express from 'express';
import authRoutes from './auth.routes';
import utilisateursRoutes from './utilisateurs.routes';
import classesRoutes from './classes.routes';
import apprenantsRoutes from './apprenants.routes';
import matieresRoutes from './matieres.routes';
import etablissementsRoutes from './etablissements.routes';
import dashboardRoutes from './dashboard.routes';
import libraryRoutes from './library.routes';
import sanctionsRoutes from './sanctions.routes';
import examensRoutes from './examens.routes';
import messagingRoutes from './messaging.routes';
import rolesRoutes from './roles.routes';
import permissionsRoutes from './permissions.routes';
import bulletinsRoutes from './bulletins.routes';
import financesRoutes from './finances.routes';
import employeesRoutes from './employees.routes';
import { globalLimiter } from '../middlewares/rateLimit.middleware';

const router = express.Router();

// Apply rate limiting to all API routes
router.use(globalLimiter.middleware);

// Mount all routes
router.use('/auth', authRoutes);
router.use('/utilisateurs', utilisateursRoutes);
router.use('/classes', classesRoutes);
router.use('/apprenants', apprenantsRoutes);
router.use('/matieres', matieresRoutes);
router.use('/etablissements', etablissementsRoutes);
router.use('/dashboard', dashboardRoutes);

// Core modules
router.use('/library', libraryRoutes);
router.use('/sanctions', sanctionsRoutes);
router.use('/examens', examensRoutes);
router.use('/messages', messagingRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);

// Advanced modules
router.use('/bulletins', bulletinsRoutes);
router.use('/finances', financesRoutes);
router.use('/employees', employeesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

export default router;
