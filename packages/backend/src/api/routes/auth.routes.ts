import { authController } from '../controllers/auth.controller.js';
import type { FastifyInstance } from 'fastify';

export default async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', {
    handler: authController.login.bind(authController),
  });

  // Register
  fastify.post('/register', {
    handler: authController.register.bind(authController),
  });

  // Get current user
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    handler: authController.me.bind(authController),
  });

  // Logout (client-side, but included for completeness)
  fastify.post('/logout', {
    onRequest: [fastify.authenticate],
    handler: authController.logout.bind(authController),
  });
}
