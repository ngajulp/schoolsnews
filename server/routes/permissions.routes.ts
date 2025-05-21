import express from 'express';
import { 
  getPermissions, 
  getPermissionById, 
  createPermission, 
  updatePermission, 
  deletePermission,
  getPermissionRoles
} from '../controllers/permissions.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Permission validation schemas
const createPermissionSchema = z.object({
  fonctionnalite: z.string().min(1, 'Functionality name is required'),
  peut_voir: z.boolean().optional(),
  peut_ajouter: z.boolean().optional(),
  peut_modifier: z.boolean().optional(),
  peut_supprimer: z.boolean().optional(),
  etablissement_id: z.number().optional()
});

const updatePermissionSchema = z.object({
  fonctionnalite: z.string().optional(),
  peut_voir: z.boolean().optional(),
  peut_ajouter: z.boolean().optional(),
  peut_modifier: z.boolean().optional(),
  peut_supprimer: z.boolean().optional()
});

// Permission routes
router.route('/')
  .get(protect, authorize('admin', 'principal'), getPermissions)
  .post(protect, authorize('admin'), validateRequest(createPermissionSchema), createPermission);

router.route('/:id')
  .get(protect, authorize('admin', 'principal'), getPermissionById)
  .put(protect, authorize('admin'), validateRequest(updatePermissionSchema), updatePermission)
  .delete(protect, authorize('admin'), deletePermission);

// Get roles with a specific permission
router.route('/:id/roles')
  .get(protect, authorize('admin', 'principal'), getPermissionRoles);

export default router;