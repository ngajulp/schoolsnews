import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private windowMs: number;
  private max: number;
  private message: string;
  private statusCode: number;
  private keyGenerator: (req: Request) => string;
  private records: Map<string, RateLimitRecord> = new Map();

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.message = options.message || 'Too many requests, please try again later.';
    this.statusCode = options.statusCode || 429;
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
    
    // Clean up expired records periodically
    setInterval(() => this.cleanUpExpired(), this.windowMs);
  }

  private cleanUpExpired() {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (record.resetTime <= now) {
        this.records.delete(key);
      }
    }
  }

  public middleware = (req: Request, res: Response, next: NextFunction) => {
    const key = this.keyGenerator(req);
    const now = Date.now();
    
    let record = this.records.get(key);
    
    if (!record) {
      // Create new record
      record = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.records.set(key, record);
      return next();
    }
    
    // Reset if window has passed
    if (record.resetTime <= now) {
      record.count = 1;
      record.resetTime = now + this.windowMs;
      return next();
    }
    
    // Increment count
    record.count += 1;
    
    // If over limit, return error
    if (record.count > this.max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      // Log rate limit hit
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        count: record.count,
        limit: this.max,
        retryAfter
      });
      
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(this.max));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
      
      return res.status(this.statusCode).json({
        message: this.message,
        retryAfter
      });
    }
    
    // Set headers
    res.set('X-RateLimit-Limit', String(this.max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, this.max - record.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
    
    next();
  };
}

// Default rate limiters
export const globalLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again after a minute.'
});

export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes.'
});

// Dynamic rate limiter factory
export const createRateLimiter = (options: RateLimitOptions) => {
  return new RateLimiter(options).middleware;
};
