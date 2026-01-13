import sharp from 'sharp';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/**
 * Calculate perceptual hash of an image
 * Useful for quick similarity pre-filtering before AI comparison
 */
export async function calculateImageHash(imagePath: string): Promise<string> {
  const buffer = await sharp(imagePath)
    .resize(8, 8, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer();

  // Calculate average pixel value
  const pixels = Array.from(buffer);
  const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

  // Create hash based on pixels above/below average
  let hash = '';
  for (const pixel of pixels) {
    hash += pixel > avg ? '1' : '0';
  }

  // Convert binary string to hex
  return parseInt(hash, 2).toString(16).padStart(16, '0');
}

/**
 * Calculate Hamming distance between two hashes
 * Lower distance = more similar images
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error('Hashes must be the same length');
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Check if two images are similar based on perceptual hash
 * Returns similarity score (0-100)
 */
export async function calculateImageSimilarity(
  imagePath1: string,
  imagePath2: string
): Promise<number> {
  const hash1 = await calculateImageHash(imagePath1);
  const hash2 = await calculateImageHash(imagePath2);

  const distance = hammingDistance(hash1, hash2);
  const maxDistance = hash1.length * 4; // Each hex char represents 4 bits

  // Convert distance to similarity percentage
  const similarity = (1 - distance / maxDistance) * 100;

  return Math.max(0, Math.min(100, similarity));
}

/**
 * Assess image quality based on sharpness and brightness
 * Returns quality score (0-10)
 */
export async function assessImageQuality(imagePath: string): Promise<number> {
  const stats = await sharp(imagePath).stats();

  // Check brightness (avoid too dark or too bright images)
  const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
  const brightnessScore = avgBrightness > 30 && avgBrightness < 220 ? 10 : 5;

  // Check for blur (using standard deviation as proxy)
  const avgStdDev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  const sharpnessScore = avgStdDev > 30 ? 10 : 5; // Higher std dev = more detail/sharpness

  // Combined score (average)
  const qualityScore = (brightnessScore + sharpnessScore) / 2;

  return Math.round(qualityScore);
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  sourcePath: string,
  destPath: string,
  width = 300,
  height = 300
): Promise<void> {
  await sharp(sourcePath)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toFile(destPath);
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imagePath: string) {
  const metadata = await sharp(imagePath).metadata();

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: (await fs.stat(imagePath)).size,
    hasAlpha: metadata.hasAlpha,
  };
}

/**
 * Convert image to JPEG (for consistency)
 */
export async function convertToJpeg(
  sourcePath: string,
  destPath: string,
  quality = 90
): Promise<void> {
  await sharp(sourcePath)
    .jpeg({ quality })
    .toFile(destPath);
}

/**
 * Calculate file hash (MD5) for caching purposes
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Get unique filename by appending number if file exists
 */
export async function getUniqueFilename(
  dir: string,
  basename: string,
  ext: string
): Promise<string> {
  let counter = 1;
  let filename = `${basename}${ext}`;
  let fullPath = path.join(dir, filename);

  while (true) {
    try {
      await fs.access(fullPath);
      filename = `${basename}_${counter}${ext}`;
      fullPath = path.join(dir, filename);
      counter++;
    } catch {
      return filename;
    }
  }
}
