import { paths } from '../config/environment.js';
import path from 'path';

/**
 * Convert an absolute or already-relative frame path to a relative path.
 * Relative format: `{videoId}/frame_0001.jpg` (relative to paths.frames)
 *
 * Idempotent: if already relative, returns as-is.
 */
export function toRelativeFramePath(framePath: string): string {
  const marker = 'frames/';
  const idx = framePath.indexOf(marker);
  if (idx !== -1) {
    return framePath.substring(idx + marker.length);
  }
  // Already relative (no 'frames/' prefix found with a leading path)
  return framePath;
}

/**
 * Convert a relative frame path to an absolute path using paths.frames.
 * Absolute format: `/media/data/frames/{videoId}/frame_0001.jpg`
 *
 * Idempotent: if already absolute, returns as-is.
 */
export function toAbsoluteFramePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.join(paths.frames, relativePath);
}

/**
 * Convert an absolute or already-relative upload path to a relative path.
 * Relative format: `bird_video_123.mp4` (relative to paths.uploads)
 *
 * Idempotent: if already relative, returns as-is.
 */
export function toRelativeUploadPath(uploadPath: string): string {
  const marker = 'uploads/';
  const idx = uploadPath.indexOf(marker);
  if (idx !== -1) {
    return uploadPath.substring(idx + marker.length);
  }
  // Already relative
  return uploadPath;
}

/**
 * Convert a relative upload path to an absolute path using paths.uploads.
 * Absolute format: `/media/data/uploads/bird_video_123.mp4`
 *
 * Idempotent: if already absolute, returns as-is.
 */
export function toAbsoluteUploadPath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.join(paths.uploads, relativePath);
}
