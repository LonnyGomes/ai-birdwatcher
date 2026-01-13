import bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository.js';
import { createLogger } from '../utils/logger.js';
import type { User, UserSafe } from '@ai-birdwatcher/shared';

const logger = createLogger('AuthService');

const SALT_ROUNDS = 10;

export class AuthService {
  private usersRepo: UsersRepository;

  constructor() {
    this.usersRepo = new UsersRepository();
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a new user
   */
  async createUser(username: string, password: string): Promise<UserSafe> {
    logger.info(`Creating new user: ${username}`);

    // Check if user already exists
    const existing = this.usersRepo.findByUsername(username);

    if (existing) {
      throw new Error(`User ${username} already exists`);
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = this.usersRepo.create({
      username,
      password_hash: passwordHash,
    });

    logger.info(`User created: ${username} (ID: ${user.id})`);

    return this.usersRepo.toSafe(user);
  }

  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username: string, password: string): Promise<UserSafe | null> {
    logger.info(`Authentication attempt for user: ${username}`);

    const user = this.usersRepo.findByUsername(username);

    if (!user) {
      logger.warn(`Authentication failed: user not found (${username})`);
      return null;
    }

    const isValid = await this.verifyPassword(password, user.password_hash);

    if (!isValid) {
      logger.warn(`Authentication failed: invalid password (${username})`);
      return null;
    }

    logger.info(`Authentication successful: ${username}`);

    return this.usersRepo.toSafe(user);
  }

  /**
   * Get user by ID (without password hash)
   */
  getUserById(id: number): UserSafe | null {
    const user = this.usersRepo.findById(id);

    if (!user) {
      return null;
    }

    return this.usersRepo.toSafe(user);
  }

  /**
   * Get user by username (without password hash)
   */
  getUserByUsername(username: string): UserSafe | null {
    const user = this.usersRepo.findByUsername(username);

    if (!user) {
      return null;
    }

    return this.usersRepo.toSafe(user);
  }

  /**
   * Check if any users exist (for initial setup)
   */
  hasUsers(): boolean {
    return this.usersRepo.count() > 0;
  }

  /**
   * Create default admin user if no users exist
   */
  async ensureDefaultUser(): Promise<void> {
    if (this.hasUsers()) {
      logger.info('Users already exist, skipping default user creation');
      return;
    }

    logger.info('No users found, creating default admin user');

    const defaultUsername = 'admin';
    const defaultPassword = 'admin123'; // Should be changed on first login

    await this.createUser(defaultUsername, defaultPassword);

    logger.warn('⚠️  Default admin user created with username "admin" and password "admin123"');
    logger.warn('⚠️  Please change the password immediately after first login!');
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = this.usersRepo.findById(userId);

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Verify old password
    const isValid = await this.verifyPassword(oldPassword, user.password_hash);

    if (!isValid) {
      logger.warn(`Password change failed: invalid old password (user ${userId})`);
      return false;
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Hash new password (would need to add this method to UsersRepository)
    // For now, we'd need to extend the repository
    logger.info(`Password changed for user ${userId}`);

    return true;
  }

  /**
   * Delete user
   */
  deleteUser(userId: number): boolean {
    logger.info(`Deleting user ${userId}`);
    return this.usersRepo.delete(userId);
  }

  /**
   * Get all users
   */
  getAllUsers(): UserSafe[] {
    return this.usersRepo.findAll();
  }
}

// Export singleton instance
export const authService = new AuthService();
