import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';
import type { User, CreateUserInput, UserSafe } from '@ai-birdwatcher/shared';

export class UsersRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new user
   */
  create(input: CreateUserInput): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `);

    const result = stmt.run(input.username, input.password_hash);
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find user by ID
   */
  findById(id: number): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  }

  /**
   * Find user by username
   */
  findByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | null;
  }

  /**
   * Find all users (without password hashes)
   */
  findAll(): UserSafe[] {
    const stmt = this.db.prepare('SELECT id, username, created_at FROM users');
    return stmt.all() as UserSafe[];
  }

  /**
   * Delete user
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Count users
   */
  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Convert User to UserSafe (remove password hash)
   */
  toSafe(user: User): UserSafe {
    return {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
    };
  }
}
