import Database from 'better-sqlite3';
import { paths } from '../config/environment.js';
import { databaseConfig } from '../config/database.js';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Initialize SQLite database connection
 */
export const initializeDatabase = (): Database.Database => {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  const dataDir = path.dirname(paths.database);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database connection
  db = new Database(paths.database, databaseConfig.options);

  // Apply pragmas for optimization
  databaseConfig.pragmas.forEach(pragma => {
    db!.pragma(pragma);
  });

  console.log(`✓ Database connected: ${paths.database}`);

  return db;
};

/**
 * Get existing database connection
 */
export const getDatabase = (): Database.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

/**
 * Close database connection
 */
export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('✓ Database connection closed');
  }
};

/**
 * Execute a database transaction
 */
export const transaction = <T>(
  callback: (db: Database.Database) => T
): T => {
  const database = getDatabase();
  const result = database.transaction(callback)(database);
  return result;
};
