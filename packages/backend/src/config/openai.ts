import { env } from './environment.js';

export const openaiConfig = {
  apiKey: env.OPENAI_API_KEY,

  // Model configuration
  models: {
    vision: 'gpt-4o-mini', // Latest multimodal model for bird identification/comparison
  },

  // Rate limiting and retry configuration
  rateLimit: {
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    backoffMultiplier: 2,
    minRequestIntervalMs: 1100, // pacing between requests to avoid rate limits
    tokensPerMinute: 200000, // align with org TPM quota
  },

  // Request timeouts
  timeout: 30000, // 30 seconds

  // Vision API specific settings
  vision: {
    detect: {
      maxTokens: 180,
      detail: 'low' as const, // 'low', 'high', or 'auto'
    },
    identify: {
      maxTokens: 500,
      detail: 'high' as const,
    },
    compare: {
      maxTokens: 500,
      detail: 'high' as const,
    },
  },

  // Cost optimization
  caching: {
    enabled: true,
    ttl: 3600000, // 1 hour in milliseconds
  },
};

// Prompts for bird identification
export const prompts = {
  detect: `Determine if any birds are present in this image.

Respond in JSON format:
{
  "birds_detected": number,
  "confidence": number (0-100)
}

If no birds are present, respond with: {"birds_detected": 0, "confidence": 0}`,

  identify: `Examine this image for birds. Identify any birds visible, even if partially obscured or image quality is not optimal.

For each bird detected:
1. Identify species (scientific + common name). If unsure, provide best guess with lower confidence.
2. Determine gender if possible (male/female/unknown)
3. Describe visible identifying features (markings, colors, size, patterns)
4. Rate image quality for identification purposes (1-10)
5. Provide confidence score (0-100) - use lower scores if identification is uncertain

IMPORTANT: If you can see any bird or bird-like shape, include it in the results even with low confidence. Err on the side of detection over missing birds.

Respond in JSON format:
{
  "birds_detected": number,
  "birds": [{
    "species": "Scientific Name",
    "common_name": "Common Name",
    "gender": "male" | "female" | "unknown",
    "features": "Description of visible identifying features",
    "image_quality": number (1-10),
    "confidence": number (0-100)
  }]
}

Only respond with {"birds_detected": 0, "birds": []} if you are certain no birds are visible.`,

  compare: `Compare these two birds of the same species and determine if they are the same individual.

Analysis criteria:
1. Plumage patterns and unique markings
2. Physical characteristics (size, beak shape, posture)
3. Color intensity and variations
4. Any distinctive features (scars, unusual feathers, etc.)

Consider that:
- Lighting and angle may differ between photos
- Seasonal plumage changes are possible
- Photo quality may vary

Respond in JSON format:
{
  "is_same_bird": boolean,
  "confidence": number (0-100),
  "reasoning": "Detailed explanation of the decision",
  "matching_features": ["feature1", "feature2"],
  "differences_noted": ["difference1", "difference2"]
}`,
};
