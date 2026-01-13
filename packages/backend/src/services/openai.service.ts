import OpenAI from 'openai';
import fs from 'fs/promises';
import { openaiConfig, prompts } from '../config/openai.js';
import { createLogger } from '../utils/logger.js';
import { retryWithCondition } from '../utils/retry.js';
import { calculateFileHash } from '../utils/imageUtils.js';

const logger = createLogger('OpenAIService');

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

  constructor() {
    this.client = new OpenAI({
      apiKey: openaiConfig.apiKey,
      timeout: openaiConfig.timeout,
    });
    this.cache = new Map();
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
                    detail: openaiConfig.vision.detail,
                  },
                },
              ],
            },
          ],
          max_tokens: openaiConfig.vision.maxTokens,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response content from OpenAI');
        }

        return JSON.parse(content) as BirdIdentification;
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
                    detail: openaiConfig.vision.detail,
                  },
                },
                { type: 'text', text: 'Image 2:' },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image2}`,
                    detail: openaiConfig.vision.detail,
                  },
                },
                { type: 'text', text: prompts.compare },
              ],
            },
          ],
          max_tokens: openaiConfig.vision.maxTokens,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response content from OpenAI');
        }

        return JSON.parse(content) as BirdComparison;
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
}

// Export singleton instance
export const openaiService = new OpenAIService();
