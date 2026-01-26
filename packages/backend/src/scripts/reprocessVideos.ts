import { getDatabase } from '../database/connection.js';
import { jobQueueService } from '../services/jobQueue.service.js';
import { openaiService } from '../services/openai.service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ReprocessVideos');
const db = getDatabase();

interface VideoToReprocess {
  id: number;
  filename: string;
  status: string;
  created_at: string;
}

/**
 * Find all completed videos with zero sightings
 */
function findVideosToReprocess(options?: { minId?: number; maxId?: number }): VideoToReprocess[] {
  let query = `
    SELECT v.id, v.filename, v.status, v.created_at
    FROM videos v
    LEFT JOIN sightings s ON v.id = s.video_id
    WHERE v.status = 'completed'
  `;

  const params: any[] = [];

  if (options?.minId) {
    query += ` AND v.id >= ?`;
    params.push(options.minId);
  }

  if (options?.maxId) {
    query += ` AND v.id <= ?`;
    params.push(options.maxId);
  }

  query += `
    GROUP BY v.id
    HAVING COUNT(s.id) = 0
    ORDER BY v.id DESC
  `;

  return db.prepare(query).all(...params) as VideoToReprocess[];
}

/**
 * Delete existing processing jobs for a video
 */
function deleteProcessingJobs(videoId: number): void {
  const deleteQuery = `DELETE FROM processing_jobs WHERE video_id = ?`;
  const result = db.prepare(deleteQuery).run(videoId);
  logger.info(`Deleted ${result.changes} processing job(s) for video ${videoId}`);
}

/**
 * Delete existing processing metrics for a video
 */
function deleteProcessingMetrics(videoId: number): void {
  const deleteQuery = `DELETE FROM processing_metrics WHERE video_id = ?`;
  const result = db.prepare(deleteQuery).run(videoId);
  logger.info(`Deleted ${result.changes} processing metric(s) for video ${videoId}`);
}

/**
 * Reset video status to pending
 */
function resetVideoStatus(videoId: number): void {
  const updateQuery = `
    UPDATE videos
    SET status = 'pending', error_message = NULL, processed_at = NULL
    WHERE id = ?
  `;
  db.prepare(updateQuery).run(videoId);
  logger.info(`Reset video ${videoId} status to pending`);
}

/**
 * Reprocess a single video
 */
async function reprocessVideo(video: VideoToReprocess): Promise<void> {
  logger.info(`Reprocessing video ${video.id}: ${video.filename}`);

  try {
    // Delete existing jobs and metrics
    deleteProcessingJobs(video.id);
    deleteProcessingMetrics(video.id);

    // Reset video status
    resetVideoStatus(video.id);

    // Create new bird_identification job (frames already exist)
    await jobQueueService.addJob(video.id, 'bird_identification');

    logger.info(`✓ Video ${video.id} queued for reprocessing`);
  } catch (error) {
    logger.error(`Failed to reprocess video ${video.id}`, {
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Main reprocessing function
 */
async function main() {
  logger.info('Starting video reprocessing script...');

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const minIdArg = args.find(arg => arg.startsWith('--min-id='));
  const maxIdArg = args.find(arg => arg.startsWith('--max-id='));
  const recentFlag = args.includes('--recent');

  const options: { minId?: number; maxId?: number } = {};

  if (recentFlag) {
    // Only reprocess videos from the Jan 25 batch (61-81)
    options.minId = 61;
    options.maxId = 81;
    logger.info('Filtering to recent videos (61-81)');
  } else {
    if (minIdArg) {
      options.minId = parseInt(minIdArg.split('=')[1], 10);
      logger.info(`Filtering to videos >= ${options.minId}`);
    }
    if (maxIdArg) {
      options.maxId = parseInt(maxIdArg.split('=')[1], 10);
      logger.info(`Filtering to videos <= ${options.maxId}`);
    }
  }

  // Find videos to reprocess
  const videos = findVideosToReprocess(options);

  if (videos.length === 0) {
    logger.info('No videos found that need reprocessing');
    return;
  }

  logger.info(`Found ${videos.length} video(s) with zero sightings to reprocess`);

  // Display videos to reprocess
  console.log('\nVideos to reprocess:');
  console.log('─'.repeat(80));
  videos.forEach((v) => {
    console.log(`  ${v.id}. ${v.filename} (created: ${v.created_at})`);
  });
  console.log('─'.repeat(80));

  // Ask for confirmation
  const forceFlag = args.includes('--force') || args.includes('-f');

  if (!forceFlag) {
    console.log('\nTo proceed with reprocessing, run:');
    console.log('  npm run reprocess-videos -- --force\n');
    console.log('Options:');
    console.log('  --force              Actually perform the reprocessing');
    console.log('  --recent             Only reprocess recent videos (61-81)');
    console.log('  --min-id=N           Only reprocess videos with ID >= N');
    console.log('  --max-id=N           Only reprocess videos with ID <= N');
    console.log('\nExamples:');
    console.log('  npm run reprocess-videos -- --recent --force');
    console.log('  npm run reprocess-videos -- --min-id=70 --max-id=81 --force\n');
    return;
  }

  // Clear OpenAI cache to ensure fresh API calls
  logger.info('Clearing OpenAI cache to ensure fresh API responses...');
  const cacheStats = openaiService.getCacheStats();
  logger.info(`Cache had ${cacheStats.size} cached entries`);
  openaiService.clearCache();
  logger.info('✓ Cache cleared');

  // Reprocess all videos
  let successCount = 0;
  let failureCount = 0;

  for (const video of videos) {
    try {
      await reprocessVideo(video);
      successCount++;
    } catch (error) {
      failureCount++;
    }
  }

  logger.info('─'.repeat(80));
  logger.info(`Reprocessing complete: ${successCount} succeeded, ${failureCount} failed`);
  logger.info('─'.repeat(80));

  if (successCount > 0) {
    logger.info('\nVideos have been queued for bird identification.');
    logger.info('Make sure the backend is running to process the jobs.');
    logger.info('Monitor progress at: http://localhost:3000/api/videos');
  }
}

// Run the script
main().catch((error) => {
  logger.error('Script failed', { error: error.message });
  process.exit(1);
});
