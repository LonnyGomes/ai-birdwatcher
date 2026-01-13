export const databaseConfig = {
  // SQLite configuration
  options: {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    fileMustExist: false,
  },

  // Connection pool settings (for better-sqlite3, these are mostly for reference)
  pool: {
    max: 1, // SQLite only supports one writer at a time
    idleTimeoutMillis: 30000,
  },

  // Pragmas for performance optimization
  pragmas: [
    'PRAGMA journal_mode = WAL', // Write-Ahead Logging for better concurrency
    'PRAGMA synchronous = NORMAL', // Balanced durability vs performance
    'PRAGMA cache_size = -64000', // 64MB cache
    'PRAGMA foreign_keys = ON', // Enable foreign key constraints
    'PRAGMA busy_timeout = 5000', // Wait up to 5 seconds on locked database
  ],
};
