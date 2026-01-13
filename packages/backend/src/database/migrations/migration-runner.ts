import { getDatabase, initializeDatabase } from '../connection.js';
import type Database from 'better-sqlite3';
import * as migration001 from './001_initial_schema.js';

interface Migration {
  id: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

// Registry of all migrations
const migrations: Migration[] = [
  {
    id: 1,
    name: '001_initial_schema',
    up: migration001.up,
    down: migration001.down,
  },
];

/**
 * Create migrations tracking table if it doesn't exist
 */
const createMigrationsTable = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

/**
 * Get list of executed migrations
 */
const getExecutedMigrations = (db: Database.Database): number[] => {
  const rows = db.prepare('SELECT id FROM migrations ORDER BY id').all() as { id: number }[];
  return rows.map(row => row.id);
};

/**
 * Mark migration as executed
 */
const markMigrationExecuted = (db: Database.Database, migration: Migration): void => {
  db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)')
    .run(migration.id, migration.name);
};

/**
 * Run all pending migrations
 */
export const runMigrations = (): void => {
  const db = getDatabase();

  createMigrationsTable(db);
  const executedMigrations = getExecutedMigrations(db);

  console.log('Running database migrations...');

  let migrationCount = 0;

  for (const migration of migrations) {
    if (!executedMigrations.includes(migration.id)) {
      console.log(`  Running migration: ${migration.name}`);

      try {
        migration.up(db);
        markMigrationExecuted(db, migration);
        migrationCount++;
      } catch (error) {
        console.error(`  ✗ Migration failed: ${migration.name}`);
        throw error;
      }
    }
  }

  if (migrationCount === 0) {
    console.log('  No pending migrations');
  } else {
    console.log(`✓ Executed ${migrationCount} migration(s)`);
  }
};

/**
 * Rollback last migration
 */
export const rollbackMigration = (): void => {
  const db = getDatabase();

  const lastMigration = db.prepare(
    'SELECT id, name FROM migrations ORDER BY id DESC LIMIT 1'
  ).get() as { id: number; name: string } | undefined;

  if (!lastMigration) {
    console.log('No migrations to rollback');
    return;
  }

  const migration = migrations.find(m => m.id === lastMigration.id);

  if (!migration) {
    throw new Error(`Migration not found: ${lastMigration.name}`);
  }

  console.log(`Rolling back migration: ${migration.name}`);

  try {
    migration.down(db);
    db.prepare('DELETE FROM migrations WHERE id = ?').run(migration.id);
    console.log(`✓ Rolled back migration: ${migration.name}`);
  } catch (error) {
    console.error(`✗ Rollback failed: ${migration.name}`);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    initializeDatabase();
    runMigrations();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
