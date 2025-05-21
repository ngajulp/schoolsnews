import express from 'express';
import { 
  getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole,
  assignPermission,
  getRolePermissions,
  removePermission,
  getRoleUsers
} from '../controllers/roles.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { z } from 'zod';

const router = express.Router();

// Role validation schemas
const createRoleSchema = z.object({
  nom: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  etablissement_id: z.number().optional()
});

const updateRoleSchema = z.object({
  nom: z.string().optional(),
  description: z.string().optional()
});

const assignPermissionSchema = z.object({
  permission_id: z.number(),
  etablissement_id: z.number().optional()
});

// Role routes
router.route('/')
  .get(protect, authorize('admin', 'principal'), getRoles)
  .post(protect, authorize('admin', 'principal'), validateRequest(createRoleSchema), createRole);

router.route('/:id')
  .get(protect, authorize('admin', 'principal'), getRoleById)
  .put(protect, authorize('admin'), validateRequest(updateRoleSchema), updateRole)
  .delete(protect, authorize('admin'), deleteRole);

// Role permissions routes
router.route('/:id/permissions')
  .get(protect, authorize('admin', 'principal'), getRolePermissions)
  .post(protect, authorize('admin'), validateRequest(assignPermissionSchema), assignPermission);

router.route('/:id/permissions/:permissionId')
  .delete(protect, authorize('admin'), removePermission);

// Role users routes
router.route('/:id/users')
  .get(protect, authorize('admin', 'principal'), getRoleUsers);

export default router;