import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { logger } from '../logger';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';

// Interface for decoded JWT token
interface DecodedToken {
  id: number;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

// Augment Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        roles: string[];
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      // Set user info in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

// Authorization middleware
export const authorize = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some(role => req.user!.roles.includes(role));
    
    if (!hasRequiredRole) {
      logger.warn('Unauthorized access attempt', { 
        userId: req.user.id, 
        userRoles: req.user.roles, 
        requiredRoles
      });
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Alias for authenticate middleware (for backward compatibility)
export const protect = authenticate;

// Generate JWT token
export const generateToken = (user: { id: number; email: string }, roles: string[] = []) => {
  return jwt.sign(
    { id: user.id, email: user.email, roles },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Generate refresh token
export const generateRefreshToken = (user: { id: number; email: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET + '-refresh',
    { expiresIn: '7d' }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET + '-refresh') as DecodedToken;
  } catch (error) {
    return null;
  }
};
