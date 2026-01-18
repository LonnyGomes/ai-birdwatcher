import OpenAI from 'openai';
import fs from 'fs/promises';
import { openaiConfig, prompts } from '../config/openai.js';
import { createLogger } from '../utils/logger.js';
import { retryWithCondition, sleep } from '../utils/retry.js';
import { calculateFileHash } from '../utils/imageUtils.js';

const logger = createLogger('OpenAIService');

interface BirdDetection {
  birds_detected: number;
  confidence: number;
}

interface BirdIdentification {
  birds_detected: number;
  birds: Array<{
    species: string;
    common_name: string;
    gender: 'male' | 'female' | 'unknown';
    features: string;
    image_quality: number;
    confidence: number;
  }>;
}

interface BirdComparison {
  is_same_bird: boolean;
  confidence: number;
  reasoning: string;
  matching_features: string[];
  differences_noted: string[];
}

export class OpenAIService {
  private client: OpenAI;
  private cache: Map<string, any>;
  private lastRequestTimestamp: number;
  private throttleQueue: Promise<void>;
  private tokenUsageWindow: Array<{ timestamp: number; tokens: number }>;
  private tokenUsageTotal: number;

  constructor() {
    this.client = new OpenAI({
      apiKey: openaiConfig.apiKey,
      timeout: openaiConfig.timeout,
    });
    this.cache = new Map();
    this.lastRequestTimestamp = 0;
    this.throttleQueue = Promise.resolve();
    this.tokenUsageWindow = [];
    this.tokenUsageTotal = 0;
  }

  /**
   * Detect if birds are present in an image
   */
  async detectBirds(imagePath: string): Promise<BirdDetection> {
    logger.info(`Detecting birds in image: ${imagePath}`);

    // Check cache
    if (openaiConfig.caching.enabled) {
      const cacheKey = await this.getCacheKey(imagePath, 'detect');
      const cached = this.cache.get(cacheKey);

      if (cached) {
        logger.debug('Returning cached detection result');
        return cached;
      }
    }

    // Read image and encode to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Call OpenAI API with retry
    const result = await retryWithCondition(
      async () => {
        const releaseTokens = await this.throttleRequests(openaiConfig.vision.detect.maxTokens);
        try {
          const response = await this.client.chat.completions.create({
            model: openaiConfig.models.vision,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompts.detect },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                      detail: openaiConfig.vision.detect.detail,
                    },
                  },
                ],
              },
            ],
            max_tokens: openaiConfig.vision.detect.maxTokens,
            response_format: { type: 'json_object' },
          });

          releaseTokens(response.usage?.total_tokens);

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error('No response content from OpenAI');
          }

          return JSON.parse(content) as BirdDetection;
        } catch (error) {
          releaseTokens(0);
          throw error;
        }
      },
      {
        maxRetries: openaiConfig.rateLimit.maxRetries,
        retryDelay: openaiConfig.rateLimit.retryDelay,
        backoffMultiplier: openaiConfig.rateLimit.backoffMultiplier,
        onRetry: (error, attempt) => {
          logger.warn(`OpenAI API retry attempt ${attempt}`, { error: error.message });
        },
      }
    );

    // Cache result
    if (openaiConfig.caching.enabled) {
      const cacheKey = await this.getCacheKey(imagePath, 'detect');
      this.cache.set(cacheKey, result);

      // Clear cache after TTL
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, openaiConfig.caching.ttl);
    }

    logger.info(`Detection result: ${result.birds_detected} bird(s)`);
    return result;
  }

  /**
   * Identify birds in an image
   */
  async identifyBirds(imagePath: string): Promise<BirdIdentification> {
    logger.info(`Identifying birds in image: ${imagePath}`);

    // Check cache
    if (openaiConfig.caching.enabled) {
      const cacheKey = await this.getCacheKey(imagePath, 'identify');
      const cached = this.cache.get(cacheKey);

      if (cached) {
        logger.debug('Returning cached identification result');
        return cached;
      }
    }

    // Read image and encode to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Call OpenAI API with retry
    const result = await retryWithCondition(
      async () => {
        const releaseTokens = await this.throttleRequests(openaiConfig.vision.identify.maxTokens);
        try {
          const response = await this.client.chat.completions.create({
            model: openaiConfig.models.vision,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompts.identify },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                      detail: openaiConfig.vision.identify.detail,
                    },
                  },
                ],
              },
            ],
            max_tokens: openaiConfig.vision.identify.maxTokens,
            response_format: { type: 'json_object' },
          });

          releaseTokens(response.usage?.total_tokens);

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error('No response content from OpenAI');
          }

          return JSON.parse(content) as BirdIdentification;
        } catch (error) {
          releaseTokens(0);
          throw error;
        }
      },
      {
        maxRetries: openaiConfig.rateLimit.maxRetries,
        retryDelay: openaiConfig.rateLimit.retryDelay,
        backoffMultiplier: openaiConfig.rateLimit.backoffMultiplier,
        onRetry: (error, attempt) => {
          logger.warn(`OpenAI API retry attempt ${attempt}`, { error: error.message });
        },
      }
    );

    // Cache result
    if (openaiConfig.caching.enabled) {
      const cacheKey = await this.getCacheKey(imagePath, 'identify');
      this.cache.set(cacheKey, result);

      // Clear cache after TTL
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, openaiConfig.caching.ttl);
    }

    logger.info(`Identified ${result.birds_detected} bird(s)`);
    return result;
  }

  /**
   * Compare two bird images to determine if they're the same individual
   */
  async compareBirds(
    imagePath1: string,
    imagePath2: string
  ): Promise<BirdComparison> {
    logger.info('Comparing two bird images for similarity');

    // Check cache
    if (openaiConfig.caching.enabled) {
      const cacheKey = await this.getCacheKey([imagePath1, imagePath2].join(':'), 'compare');
      const cached = this.cache.get(cacheKey);

      if (cached) {
        logger.debug('Returning cached comparison result');
        return cached;
      }
    }

    // Read and encode both images
    const [image1Buffer, image2Buffer] = await Promise.all([
      fs.readFile(imagePath1),
      fs.readFile(imagePath2),
    ]);

    const base64Image1 = image1Buffer.toString('base64');
    const base64Image2 = image2Buffer.toString('base64');

    // Call OpenAI API with retry
    const result = await retryWithCondition(
      async () => {
        const releaseTokens = await this.throttleRequests(openaiConfig.vision.compare.maxTokens);
        try {
          const response = await this.client.chat.completions.create({
            model: openaiConfig.models.vision,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Image 1:' },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image1}`,
                      detail: openaiConfig.vision.compare.detail,
                    },
                  },
                  { type: 'text', text: 'Image 2:' },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image2}`,
                      detail: openaiConfig.vision.compare.detail,
                    },
                  },
                  { type: 'text', text: prompts.compare },
                ],
              },
            ],
            max_tokens: openaiConfig.vision.compare.maxTokens,
            response_format: { type: 'json_object' },
          });

          releaseTokens(response.usage?.total_tokens);

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error('No response content from OpenAI');
          }

          return JSON.parse(content) as BirdComparison;
        } catch (error) {
          releaseTokens(0);
          throw error;
        }
      },
      {
        maxRetries: openaiConfig.rateLimit.maxRetries,
        retryDelay: openaiConfig.rateLimit.retryDelay,
        backoffMultiplier: openaiConfig.rateLimit.backoffMultiplier,
        onRetry: (error, attempt) => {
          logger.warn(`OpenAI API retry attempt ${attempt}`, { error: error.message });
        },
      }
    );

    // Cache result
    if (openaiConfig.caching.enabled) {
      const cacheKey = await this.getCacheKey([imagePath1, imagePath2].join(':'), 'compare');
      this.cache.set(cacheKey, result);

      // Clear cache after TTL
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, openaiConfig.caching.ttl);
    }

    logger.info(`Comparison result: ${result.is_same_bird ? 'Same bird' : 'Different birds'} (confidence: ${result.confidence}%)`);
    return result;
  }

  /**
   * Generate cache key based on file content hash and operation type
   */
  private async getCacheKey(identifier: string, operation: string): Promise<string> {
    // For file paths, use file hash; for compound keys, use the identifier directly
    if (identifier.includes(':')) {
      return `${operation}:${identifier}`;
    }

    const fileHash = await calculateFileHash(identifier);
    return `${operation}:${fileHash}`;
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('OpenAI cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Ensure we respect OpenAI rate limits by spacing requests
   */
  private async throttleRequests(estimatedTokens = openaiConfig.vision.identify.maxTokens): Promise<(actualTokens?: number) => void> {
    const minInterval = openaiConfig.rateLimit.minRequestIntervalMs;
    const tokensPerMinute = openaiConfig.rateLimit.tokensPerMinute;
    let release: (actualTokens?: number) => void = () => {};

    this.throttleQueue = this.throttleQueue.then(async () => {
      const now = Date.now();

      if (minInterval) {
        const elapsed = now - this.lastRequestTimestamp;
        if (elapsed < minInterval) {
          await sleep(minInterval - elapsed);
        }
        this.lastRequestTimestamp = Date.now();
      }

      if (!tokensPerMinute) {
        release = () => {};
        return;
      }

      const windowMs = 60000;
      while (true) {
        const currentTime = Date.now();
        this.cleanupTokenUsage(currentTime, windowMs);

        if (this.tokenUsageTotal + estimatedTokens <= tokensPerMinute) {
          const reservation = { timestamp: currentTime, tokens: estimatedTokens };
          this.tokenUsageWindow.push(reservation);
          this.tokenUsageTotal += estimatedTokens;

          let released = false;
          release = (actualTokens?: number) => {
            if (released) {
              return;
            }
            released = true;
            const normalized = typeof actualTokens === 'number' && !Number.isNaN(actualTokens)
              ? Math.max(actualTokens, 0)
              : 0;
            this.tokenUsageTotal += normalized - reservation.tokens;
            reservation.tokens = normalized;
          };

          break;
        }

        const oldest = this.tokenUsageWindow[0];
        if (!oldest) {
          await sleep(windowMs);
        } else {
          const wait = Math.max(oldest.timestamp + windowMs - currentTime, 50);
          await sleep(wait);
        }
      }
    });

    await this.throttleQueue;
    return release;
  }

  private cleanupTokenUsage(currentTime: number, windowMs: number): void {
    while (this.tokenUsageWindow.length > 0 && currentTime - this.tokenUsageWindow[0].timestamp >= windowMs) {
      const expired = this.tokenUsageWindow.shift();
      if (expired) {
        this.tokenUsageTotal -= expired.tokens;
      }
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
