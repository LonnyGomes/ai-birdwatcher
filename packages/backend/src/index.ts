import { initializeDatabase } from './database/connection.js';
import { runMigrations } from './database/migrations/migration-runner.js';
import { authService } from './services/auth.service.js';
import { jobQueueService } from './services/jobQueue.service.js';
import { fileWatcherService } from './services/fileWatcher.service.js';
import { startServer } from './api/server.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('Main');

async function main() {
  try {
    logger.info('🐦 Starting AI Bird Watcher Backend...');

    // Initialize database
    logger.info('Initializing database...');
    initializeDatabase();

    // Run migrations
    logger.info('Running database migrations...');
    runMigrations();

    // Ensure default user exists
    logger.info('Checking for default user...');
    await authService.ensureDefaultUser();

    // Start job queue
    logger.info('Starting job queue...');
    jobQueueService.start().catch(error => {
      logger.error('Job queue error', { error: error.message });
    });

    // Start file watcher
    logger.info('Starting file watcher...');
    await fileWatcherService.start();

    // Start HTTP server
    logger.info('Starting HTTP server...');
    const server = await startServer();

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];

    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully...`);

        // Stop job queue
        jobQueueService.stop();

        // Stop file watcher
        await fileWatcherService.stop();

        // Stop HTTP server
        await server.close();

        logger.info('Shutdown complete');
        process.exit(0);
      });
    }

    logger.info('✅ AI Bird Watcher Backend is running!');
  } catch (error) {
    logger.error('Failed to start application', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
}

// Run the application
main();
