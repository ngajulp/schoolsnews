import { createLogger, format, transports } from 'winston';

// Create a Winston logger with custom format
export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'school-api' },
  transports: [
    // Write to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...metadata }) => {
          let metaStr = '';
          if (metadata && Object.keys(metadata).length > 0) {
            if (metadata.service) {
              delete metadata.service;
            }
            if (Object.keys(metadata).length > 0) {
              metaStr = JSON.stringify(metadata);
            }
          }
          return `${timestamp} ${level}: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

// Add a file transport for production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({ 
      filename: 'error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
  logger.add(
    new transports.File({ 
      filename: 'combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create HTTP request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};
