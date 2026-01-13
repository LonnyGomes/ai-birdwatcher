import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),

  // Database
  DATABASE_PATH: z.string().default('./data/database.sqlite'),

  // File Storage
  UPLOAD_DIR: z.string().default('./data/uploads'),
  FRAMES_DIR: z.string().default('./data/frames'),
  BIRD_IMAGES_DIR: z.string().default('./data/bird-images'),

  // Watch Folder
  WATCH_FOLDER: z.string().default('../../../watch-folder'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Bird Identification Settings
  SIMILARITY_THRESHOLD: z.string().transform(Number).pipe(z.number().min(0).max(100)).default('85'),
  MAX_SIMILARITY_COMPARISONS: z.string().transform(Number).pipe(z.number().int().positive()).default('5'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

// Helper to resolve paths relative to backend package root
export const resolvePath = (relativePath: string): string => {
  const backendRoot = path.resolve(__dirname, '../..');
  return path.resolve(backendRoot, relativePath);
};

// Resolved absolute paths
export const paths = {
  database: resolvePath(env.DATABASE_PATH),
  uploads: resolvePath(env.UPLOAD_DIR),
  frames: resolvePath(env.FRAMES_DIR),
  birdImages: resolvePath(env.BIRD_IMAGES_DIR),
  watchFolder: resolvePath(env.WATCH_FOLDER),
};
