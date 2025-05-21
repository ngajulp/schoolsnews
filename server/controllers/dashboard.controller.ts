import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.middleware';
import { db } from '../db';
import { users, classes, apprenants, matieres, etablissements } from '@shared/schema';
import { count } from 'drizzle-orm';
import { logger } from '../logger';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Get counts from database
  const usersCount = await db.select({ count: count() }).from(users);
  const classesCount = await db.select({ count: count() }).from(classes);
  const apprenantsCount = await db.select({ count: count() }).from(apprenants);
  const matieresCount = await db.select({ count: count() }).from(matieres);
  const etablissementsCount = await db.select({ count: count() }).from(etablissements);

  // Generate sample API metrics
  const currentConnections = Math.floor(Math.random() * 500) + 100;
  const maxConnections = 1000;
  const connectionPercentage = Number(((currentConnections / maxConnections) * 100).toFixed(1));
  
  const apiRequests = Math.floor(Math.random() * 50000) + 80000;
  const apiRequestsFormatted = `${Math.floor(apiRequests / 1000)}K`;
  
  const responseTimeMs = Math.floor(Math.random() * 30) + 15;
  
  const errorCount400 = Math.floor(Math.random() * 5);
  const errorCount500 = Math.floor(Math.random() * 3);
  const errorCountOther = Math.floor(Math.random() * 2);
  const totalErrors = errorCount400 + errorCount500 + errorCountOther;

  logger.info('Dashboard statistics requested', { userId: req.user?.id });
  
  res.json({
    entityCounts: {
      users: usersCount[0].count,
      classes: classesCount[0].count,
      apprenants: apprenantsCount[0].count,
      matieres: matieresCount[0].count,
      etablissements: etablissementsCount[0].count
    },
    activeConnections: {
      value: currentConnections,
      percentage: connectionPercentage,
      trend: Math.floor(Math.random() * 25) + 5
    },
    apiRequests: {
      value: apiRequestsFormatted,
      trend: Math.floor(Math.random() * 15) + 5
    },
    responseTime: {
      value: `${responseTimeMs}ms`,
      trend: -1 * (Math.floor(Math.random() * 10) + 3)
    },
    apiErrors: {
      value: totalErrors,
      trend: Math.floor(Math.random() * 5),
      breakdown: {
        400: errorCount400,
        500: errorCount500,
        other: errorCountOther
      }
    },
    serverHealth: {
      status: 'Healthy',
      uptime: '99.98%',
      lastRestart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

/**
 * @desc    Get recent API activity
 * @route   GET /api/v1/dashboard/activity
 * @access  Private
 */
export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  // Generate sample activity data
  const activities = [
    {
      id: 1,
      type: 'login',
      user: 'admin@example.com',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      details: 'Administrator login from 192.168.1.1'
    },
    {
      id: 2,
      type: 'data_update',
      user: 'admin@example.com',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      details: 'Updated class information for Terminale S'
    },
    {
      id: 3,
      type: 'error',
      user: 'system',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      details: 'Database connection temporarily lost and recovered'
    },
    {
      id: 4,
      type: 'data_create',
      user: 'admin@example.com',
      timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      details: 'Created new user account'
    },
    {
      id: 5,
      type: 'security',
      user: 'system',
      timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
      details: 'Rate limiting applied to IP 203.0.113.42'
    }
  ];

  logger.info('Dashboard activity requested', { userId: req.user?.id });
  
  res.json(activities);
});