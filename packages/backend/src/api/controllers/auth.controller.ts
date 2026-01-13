import { authService } from '../../services/auth.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface LoginBody {
  username: string;
  password: string;
}

interface RegisterBody {
  username: string;
  password: string;
}

export class AuthController {
  /**
   * Login endpoint
   */
  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Username and password are required',
      });
    }

    const user = await authService.authenticateUser(username, password);

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }

    // Generate JWT token
    const token = request.server.jwt.sign({
      userId: user.id,
      username: user.username,
    });

    return reply.send({
      token,
      user,
    });
  }

  /**
   * Register endpoint
   */
  async register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Username and password are required',
      });
    }

    try {
      const user = await authService.createUser(username, password);

      // Generate JWT token
      const token = request.server.jwt.sign({
        userId: user.id,
        username: user.username,
      });

      return reply.status(201).send({
        token,
        user,
      });
    } catch (error) {
      const message = (error as Error).message;

      if (message.includes('already exists')) {
        return reply.status(409).send({
          error: 'Conflict',
          message,
        });
      }

      return reply.status(400).send({
        error: 'Bad Request',
        message,
      });
    }
  }

  /**
   * Get current user endpoint
   */
  async me(request: FastifyRequest, reply: FastifyReply) {
    // User is already attached by authenticate decorator
    return reply.send({
      user: request.user,
    });
  }

  /**
   * Logout endpoint (client-side only, invalidates token)
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      message: 'Logged out successfully',
    });
  }
}

export const authController = new AuthController();
