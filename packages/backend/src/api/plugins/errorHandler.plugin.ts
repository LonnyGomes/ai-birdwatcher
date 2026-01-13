import fp from 'fastify-plugin';
import { createLogger } from '../../utils/logger.js';
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';

const logger = createLogger('ErrorHandler');

async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Log error
    logger.error('Request error', {
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
    });

    // Handle specific error types
    if (error.validation) {
      // Validation error
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.validation,
      });
    }

    if (error.statusCode === 401) {
      // Authentication error
      return reply.status(401).send({
        error: 'Unauthorized',
        message: error.message || 'Authentication required',
      });
    }

    if (error.statusCode === 403) {
      // Authorization error
      return reply.status(403).send({
        error: 'Forbidden',
        message: error.message || 'Access denied',
      });
    }

    if (error.statusCode === 404) {
      // Not found error
      return reply.status(404).send({
        error: 'Not Found',
        message: error.message || 'Resource not found',
      });
    }

    // Generic server error
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500
      ? 'Internal server error'
      : error.message;

    return reply.status(statusCode).send({
      error: statusCode === 500 ? 'Internal Server Error' : 'Error',
      message,
    });
  });

  // Handle 404 routes
  fastify.setNotFoundHandler((request, reply) => {
    logger.warn('Route not found', {
      method: request.method,
      url: request.url,
    });

    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler-plugin',
});
