import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { authService } from '../../services/auth.service.js';
import { env } from '../../config/environment.js';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { UserSafe } from '@ai-birdwatcher/shared';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: UserSafe;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '7d', // Token expires in 7 days
    },
  });

  // Authentication decorator
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();

      // Get user from token payload
      const payload = request.user as any;

      if (!payload || !payload.userId) {
        throw new Error('Invalid token payload');
      }

      // Fetch user from database
      const user = authService.getUserById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Attach user to request
      request.user = user;
    } catch (error) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  });

  // Optional authentication decorator (doesn't throw on missing token)
  fastify.decorate('optionalAuth', async function (request: FastifyRequest) {
    try {
      await request.jwtVerify();

      const payload = request.user as any;

      if (payload && payload.userId) {
        const user = authService.getUserById(payload.userId);
        if (user) {
          request.user = user;
        }
      }
    } catch {
      // Token invalid or missing, continue without user
    }
  });
}

export default fp(authPlugin, {
  name: 'auth-plugin',
});
