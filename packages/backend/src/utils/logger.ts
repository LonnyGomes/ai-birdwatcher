import winston from 'winston';
import { env } from '../config/environment.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return msg;
});

// Create winston logger instance
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

// Add file transport in production
if (env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

// Create contextual loggers for different modules
export const createLogger = (context: string) => {
  return {
    error: (message: string, meta?: any) => logger.error(`[${context}] ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`[${context}] ${message}`, meta),
    info: (message: string, meta?: any) => logger.info(`[${context}] ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`[${context}] ${message}`, meta),
  };
};

export default logger;
