import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Error caught by global handler', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Handle ZodError (validation errors)
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: validationError.details
    });
  }
  
  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }
  
  // Handle Drizzle ORM errors
  if (err.message && err.message.includes('duplicate key value violates unique constraint')) {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate entry'
    });
  }
  
  if (err.message && err.message.includes('violates foreign key constraint')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid reference to another entity'
    });
  }
  
  // Handle unknown errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};

// Async handler to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
