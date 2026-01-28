/**
 * Test script to debug bird detection issues
 * Tests both detection (low detail) and identification (high detail) API calls
 * Also tests the new fallback mechanism
 */

import { openaiService } from '../services/openai.service.js';
import fs from 'fs/promises';
import path from 'path';
import { paths } from '../config/environment.js';

async function main() {
  // Clear any cached results
  openaiService.clearCache();
  console.log('Cache cleared\n');

  // Get video 1 frames as test samples
  const framesDir = path.join(paths.frames, '1');
  const files = await fs.readdir(framesDir);
  const frameFiles = files.filter(f => f.endsWith('.jpg')).sort();

  console.log(`Found ${frameFiles.length} frames in video 1\n`);

  // Test first 3 frames
  const testFrames = frameFiles.slice(0, 3);
  let successCount = 0;
  let fallbackUsedCount = 0;

  for (const frameFile of testFrames) {
    const framePath = path.join(framesDir, frameFile);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing frame: ${frameFile}`);
    console.log('='.repeat(60));

    try {
      // Test detection (low detail)
      console.log('\n1. DETECTION (low detail):');
      const detection = await openaiService.detectBirds(framePath);
      console.log(`   birds_detected: ${detection.birds_detected}`);
      console.log(`   confidence: ${detection.confidence}`);

      if (detection.birds_detected === 0) {
        console.log('   No birds detected, skipping identification test');
        continue;
      }

      // Test NEW: identification with fallback
      console.log('\n2. IDENTIFICATION WITH FALLBACK:');
      const identificationWithFallback = await openaiService.identifyBirdsWithFallback(framePath);
      console.log(`   birds_detected: ${identificationWithFallback.birds_detected}`);
      console.log(`   birds array length: ${identificationWithFallback.birds?.length ?? 0}`);

      if (identificationWithFallback.birds && identificationWithFallback.birds.length > 0) {
        successCount++;
        for (const bird of identificationWithFallback.birds) {
          console.log(`\n   Bird found:`);
          console.log(`     - species: ${bird.species}`);
          console.log(`     - common_name: ${bird.common_name}`);
          console.log(`     - gender: ${bird.gender}`);
          console.log(`     - confidence: ${bird.confidence}`);
          console.log(`     - image_quality: ${bird.image_quality}`);
        }
      } else {
        console.log('   No birds identified even with fallback!');
      }

    } catch (error) {
      console.error(`Error processing frame: ${(error as Error).message}`);
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Frames tested: ${testFrames.length}`);
  console.log(`Successful identifications: ${successCount}`);
  console.log(`Success rate: ${((successCount / testFrames.length) * 100).toFixed(1)}%`);
  console.log('\nTest complete.');
}

main().catch(console.error);
