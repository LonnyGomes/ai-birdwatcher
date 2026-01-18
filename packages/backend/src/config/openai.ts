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
    maxTokens: 500,
    detail: 'high' as const, // 'low', 'high', or 'auto'
  },

  // Cost optimization
  caching: {
    enabled: true,
    ttl: 3600000, // 1 hour in milliseconds
  },
};

// Prompts for bird identification
export const prompts = {
  identify: `Analyze this bird feeder image. If birds are present, provide detailed analysis:

1. Identify species (scientific + common name)
2. Determine gender if possible (male/female/unknown)
3. Describe unique identifying features (markings, colors, size, patterns)
4. Rate image quality for identification purposes (1-10)
5. Provide confidence score (0-100)

Respond in JSON format with this structure:
{
  "birds_detected": number,
  "birds": [{
    "species": "Scientific Name",
    "common_name": "Common Name",
    "gender": "male" | "female" | "unknown",
    "features": "Detailed description of unique identifying features",
    "image_quality": number (1-10),
    "confidence": number (0-100)
  }]
}

If no birds are present, respond with: {"birds_detected": 0, "birds": []}`,

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
