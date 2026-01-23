import type Database from 'better-sqlite3';
import ffmpeg from 'fluent-ffmpeg';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('Migration005');

/**
 * Migration 005: Recalculate All Dates Based on Video Recording Times
 *
 * This migration:
 * 1. Extracts recorded_at for all existing videos
 * 2. Recalculates detected_at for all sightings
 * 3. Updates bird profile first_seen/last_seen dates
 * 4. Recreates sightings table without DEFAULT CURRENT_TIMESTAMP
 *
 * CRITICAL: This migration cannot be rolled back - backup database first!
 */

interface FailedVideo {
  videoId: number;
  error: string;
}

export const up = async (db: Database.Database): Promise<void> => {
  console.log('Starting date recalculation migration...');
  console.log('⚠️  This migration will overwrite existing detected_at values');
  console.log('   Make sure you have backed up your database!');

  const failedVideos: FailedVideo[] = [];

  // Step 1: Extract recording dates for all videos
  console.log('\nStep 1: Extracting recording dates for all videos...');

  const videos = db.prepare('SELECT * FROM videos ORDER BY id').all() as any[];
  console.log(`Found ${videos.length} videos to process`);

  let videosUpdated = 0;
  let videosWithMetadata = 0;
  let videosWithFilename = 0;
  let videosWithFileCtime = 0;
  let videosWithFallback = 0;

  for (const video of videos) {
    try {
      const { recordedAt, recordedAtSource } = await extractRecordingDate(
        video.filepath,
        video.filename
      );

      if (recordedAt) {
        db.prepare(`
          UPDATE videos
          SET recorded_at = ?, recorded_at_source = ?
          WHERE id = ?
        `).run(recordedAt, recordedAtSource, video.id);

        videosUpdated++;

        if (recordedAtSource === 'metadata') videosWithMetadata++;
        else if (recordedAtSource === 'filename') videosWithFilename++;
        else if (recordedAtSource === 'file_ctime') videosWithFileCtime++;
        else videosWithFallback++;

        logger.info(`Updated video ${video.id}: ${recordedAt} (${recordedAtSource})`);
      }
    } catch (error) {
      logger.error(`Failed to extract date for video ${video.id}`, {
        error: (error as Error).message,
        filepath: video.filepath,
      });
      failedVideos.push({
        videoId: video.id,
        error: (error as Error).message,
      });
    }
  }

  console.log(`\n✓ Updated ${videosUpdated} videos with recording dates:`);
  console.log(`  - From metadata: ${videosWithMetadata}`);
  console.log(`  - From filename: ${videosWithFilename}`);
  console.log(`  - From file ctime: ${videosWithFileCtime}`);
  console.log(`  - Fallback: ${videosWithFallback}`);

  if (failedVideos.length > 0) {
    console.log(`\n⚠️  ${failedVideos.length} videos could not be processed:`);
    failedVideos.forEach(f => console.log(`  - Video ${f.videoId}: ${f.error}`));
  }

  // Step 2: Recalculate sighting detected_at dates
  console.log('\nStep 2: Recalculating sighting dates...');

  const updateResult = db.prepare(`
    UPDATE sightings
    SET detected_at = datetime(
      videos.recorded_at,
      '+' || sightings.timestamp_in_video || ' seconds'
    )
    FROM videos
    WHERE sightings.video_id = videos.id
      AND videos.recorded_at IS NOT NULL
  `).run();

  console.log(`✓ Updated ${updateResult.changes} sightings with recalculated dates`);

  // Step 3: Recalculate bird profile first_seen and last_seen
  console.log('\nStep 3: Recalculating bird profile dates...');

  const birds = db.prepare('SELECT id FROM bird_profiles').all() as { id: number }[];

  let birdsUpdated = 0;
  for (const bird of birds) {
    const dateRange = db.prepare(`
      SELECT
        MIN(detected_at) as first_seen,
        MAX(detected_at) as last_seen
      FROM sightings
      WHERE bird_profile_id = ?
        AND detected_at IS NOT NULL
    `).get(bird.id) as { first_seen: string; last_seen: string } | undefined;

    if (dateRange?.first_seen && dateRange?.last_seen) {
      db.prepare(`
        UPDATE bird_profiles
        SET first_seen = ?,
            last_seen = ?
        WHERE id = ?
      `).run(dateRange.first_seen, dateRange.last_seen, bird.id);
      birdsUpdated++;
    }
  }

  console.log(`✓ Updated ${birdsUpdated} bird profiles with recalculated dates`);

  // Step 4: Recreate sightings table without DEFAULT CURRENT_TIMESTAMP
  console.log('\nStep 4: Removing DEFAULT CURRENT_TIMESTAMP from sightings table...');

  db.exec(`
    -- Create new table without DEFAULT on detected_at
    CREATE TABLE sightings_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      bird_profile_id INTEGER,
      frame_number INTEGER NOT NULL,
      timestamp_in_video FLOAT NOT NULL,
      species VARCHAR(100) NOT NULL,
      gender VARCHAR(20) CHECK(gender IN ('male', 'female', 'unknown', NULL)),
      confidence_score FLOAT NOT NULL,
      frame_path VARCHAR(500) NOT NULL,
      ai_analysis TEXT,
      is_matched BOOLEAN DEFAULT 0,
      match_confidence FLOAT,
      detected_at DATETIME NOT NULL,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY (bird_profile_id) REFERENCES bird_profiles(id) ON DELETE SET NULL
    );

    -- Copy data
    INSERT INTO sightings_new
    SELECT * FROM sightings;

    -- Drop old table
    DROP TABLE sightings;

    -- Rename new table
    ALTER TABLE sightings_new RENAME TO sightings;

    -- Recreate indexes
    CREATE INDEX idx_sightings_video_id ON sightings(video_id);
    CREATE INDEX idx_sightings_bird_profile_id ON sightings(bird_profile_id);
    CREATE INDEX idx_sightings_species ON sightings(species);
    CREATE INDEX idx_sightings_detected_at ON sightings(detected_at);
  `);

  console.log('✓ Sightings table schema updated');

  console.log('\n✅ Date recalculation migration completed successfully');
};

export const down = (db: Database.Database): void => {
  console.log('⚠️  This migration cannot be automatically rolled back');
  console.log('   Original detected_at values have been overwritten');
  console.log('   To rollback, restore from database backup');
  throw new Error('Migration 005 cannot be rolled back - restore from backup');
};

// Helper function to extract recording date from video
async function extractRecordingDate(
  filepath: string,
  filename: string
): Promise<{ recordedAt: string | null; recordedAtSource: 'metadata' | 'filename' | 'file_ctime' | 'fallback' }> {
  // Try metadata first
  const metadataDate = await getDateFromMetadata(filepath);
  if (metadataDate) {
    return {
      recordedAt: metadataDate.toISOString(),
      recordedAtSource: 'metadata'
    };
  }

  // Try filename
  const filenameDate = getDateFromFilename(filename);
  if (filenameDate) {
    return {
      recordedAt: filenameDate.toISOString(),
      recordedAtSource: 'filename'
    };
  }

  // Try file ctime
  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(filepath);
    const fileDate = stats.birthtime || stats.mtime;

    return {
      recordedAt: fileDate.toISOString(),
      recordedAtSource: 'file_ctime'
    };
  } catch (error) {
    logger.error('Failed to get file stats', { error: (error as Error).message });
  }

  // Fallback - return null to keep existing date
  return {
    recordedAt: null,
    recordedAtSource: 'fallback'
  };
}

// Extract date from video metadata using ffprobe
async function getDateFromMetadata(filepath: string): Promise<Date | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filepath, (err, metadata) => {
      if (err) {
        resolve(null);
        return;
      }

      const formatTags = metadata.format?.tags || {};
      const dateFields = [
        'creation_time',
        'date',
        'com.apple.quicktime.creationdate',
        'creation-time',
        'DATE',
        'CREATION_TIME',
      ];

      for (const field of dateFields) {
        const value = formatTags[field];
        if (value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              resolve(date);
              return;
            }
          } catch {
            // Continue trying other fields
          }
        }
      }

      // Check video stream tags
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (videoStream?.tags) {
        for (const field of dateFields) {
          const value = videoStream.tags[field];
          if (value) {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                resolve(date);
                return;
              }
            } catch {
              // Continue
            }
          }
        }
      }

      resolve(null);
    });
  });
}

// Extract date from filename pattern
function getDateFromFilename(filename: string): Date | null {
  // Pattern: birdcam_YYYYMMDD_HHMMSS.mp4
  const match = filename.match(/(\d{8})_(\d{6})/);
  if (match) {
    const dateStr = match[1];
    const timeStr = match[2];

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(timeStr.substring(0, 2));
    const minute = parseInt(timeStr.substring(2, 4));
    const second = parseInt(timeStr.substring(4, 6));

    const date = new Date(year, month, day, hour, minute, second);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}
