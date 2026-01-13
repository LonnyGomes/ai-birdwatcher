import { logger } from './logger.js';

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxRetries,
    retryDelay,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let currentDelay = retryDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        logger.error(`Retry failed after ${maxRetries} attempts`, {
          error: lastError.message,
        });
        throw lastError;
      }

      // Log retry attempt
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        error: lastError.message,
        nextRetryIn: `${currentDelay}ms`,
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // Wait before retrying
      await sleep(currentDelay);

      // Increase delay for next attempt (exponential backoff)
      currentDelay *= backoffMultiplier;
    }
  }

  // TypeScript requires this, but it will never be reached
  throw lastError!;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP status codes that are retryable
  if (error.response?.status) {
    const status = error.response.status;
    return status === 429 || status === 502 || status === 503 || status === 504;
  }

  // OpenAI specific errors
  if (error.type === 'rate_limit_error' || error.type === 'server_error') {
    return true;
  }

  return false;
}

/**
 * Retry with conditional retry logic
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  options: RetryOptions & { shouldRetry?: (error: Error) => boolean }
): Promise<T> {
  const { shouldRetry = isRetryableError, ...retryOptions } = options;

  return retry(async () => {
    try {
      return await fn();
    } catch (error) {
      if (!shouldRetry(error as Error)) {
        throw error;
      }
      throw error;
    }
  }, retryOptions);
}
