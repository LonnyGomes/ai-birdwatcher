import type Database from 'better-sqlite3';

/**
 * Migration 006: Convert Absolute Paths to Relative Paths
 *
 * Converts all stored absolute filesystem paths to relative paths so the
 * database is portable across environments (Docker, different hosts, etc.).
 *
 * - sightings.frame_path: extract after 'frames/' → e.g. '7/frame_0001.jpg'
 * - bird_profiles.representative_image_path: same
 * - bird_representative_images.image_path: same
 * - videos.filepath: extract after 'uploads/' → e.g. 'bird_video_123.mp4'
 */

export const up = (db: Database.Database): void => {
  console.log('Converting absolute paths to relative paths...');

  // sightings.frame_path: extract after 'frames/'
  const sightingsResult = db.prepare(`
    UPDATE sightings SET frame_path = SUBSTR(frame_path, INSTR(frame_path, 'frames/') + 7)
    WHERE INSTR(frame_path, 'frames/') > 0
  `).run();
  console.log(`  Updated ${sightingsResult.changes} sighting frame paths`);

  // bird_profiles.representative_image_path: extract after 'frames/'
  const birdsResult = db.prepare(`
    UPDATE bird_profiles SET representative_image_path = SUBSTR(representative_image_path, INSTR(representative_image_path, 'frames/') + 7)
    WHERE representative_image_path IS NOT NULL AND INSTR(representative_image_path, 'frames/') > 0
  `).run();
  console.log(`  Updated ${birdsResult.changes} bird profile representative image paths`);

  // bird_representative_images.image_path: extract after 'frames/'
  const repImagesResult = db.prepare(`
    UPDATE bird_representative_images SET image_path = SUBSTR(image_path, INSTR(image_path, 'frames/') + 7)
    WHERE INSTR(image_path, 'frames/') > 0
  `).run();
  console.log(`  Updated ${repImagesResult.changes} bird representative image paths`);

  // videos.filepath: extract after 'uploads/'
  const videosResult = db.prepare(`
    UPDATE videos SET filepath = SUBSTR(filepath, INSTR(filepath, 'uploads/') + 8)
    WHERE INSTR(filepath, 'uploads/') > 0
  `).run();
  console.log(`  Updated ${videosResult.changes} video file paths`);

  console.log('Path conversion complete');
};

export const down = (_db: Database.Database): void => {
  // Cannot reliably reconstruct original absolute paths since they vary per environment.
  // The relative paths are still functional — the application resolves them at runtime.
  console.log('Warning: down migration for relative paths is a no-op.');
  console.log('Relative paths remain in the database; the application handles them correctly.');
};
