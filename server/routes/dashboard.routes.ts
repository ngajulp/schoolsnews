import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// @route   GET /api/v1/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', authenticate, getDashboardStats);

// @route   GET /api/v1/dashboard/activity
// @desc    Get recent activity
// @access  Private
router.get('/activity', authenticate, getRecentActivity);

export default router;