import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../logger';

/**
 * Middleware factory for validating request data against a Zod schema
 */
export const validate = <T extends z.ZodType>(
  schema: T,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the data from the specified source
      const data = source === 'body' ? req.body : 
                   source === 'params' ? req.params : 
                   req.query;
      
      // Parse the data against the schema
      const validatedData = schema.parse(data);
      
      // Replace the original data with the validated data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      } else {
        req.query = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod error to more readable format
        const validationError = fromZodError(error);

        logger.warn('Validation error', {
          path: req.path,
          method: req.method,
          errors: validationError.details
        });
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationError.details
        });
      }
      
      // If it's not a validation error, pass to the next error handler
      next(error);
    }
  };
};
