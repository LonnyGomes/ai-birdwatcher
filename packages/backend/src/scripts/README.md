# Backend Scripts

This directory contains utility scripts for managing the AI Bird Watcher system.

## reprocessVideos.ts

Reprocesses videos that completed processing but have zero sightings. This is useful when:
- The OpenAI API returned inconsistent results
- A bug in the bird identification logic was fixed
- Video processing failed silently

### Usage

**Dry run (preview which videos will be reprocessed):**
```bash
npm run reprocess-videos
```

**Reprocess all failed videos:**
```bash
npm run reprocess-videos -- --force
```

**Reprocess only recent videos (61-81):**
```bash
npm run reprocess-videos -- --recent --force
```

**Reprocess videos in a specific range:**
```bash
npm run reprocess-videos -- --min-id=70 --max-id=81 --force
```

### Options

- `--force` - Actually perform the reprocessing (without this, only shows preview)
- `--recent` - Only reprocess videos from the recent batch (IDs 61-81)
- `--min-id=N` - Only reprocess videos with ID >= N
- `--max-id=N` - Only reprocess videos with ID <= N

### What it does

1. Finds all completed videos with zero sightings (optionally filtered by ID range)
2. Deletes existing processing jobs and metrics for those videos
3. Resets video status to 'pending'
4. Creates new `bird_identification` jobs (skips frame extraction since frames already exist)
5. Jobs are processed by the job queue service when the backend is running

### Important Notes

- **Frames are preserved** - The script does NOT re-extract frames, it only re-runs bird identification
- **Backend must be running** - Jobs won't be processed unless the backend server is running
- **Processing takes time** - Each frame requires an OpenAI API call, so large batches may take a while
- **Cost implications** - Reprocessing uses OpenAI API credits

### Example Output

```
Videos to reprocess:
────────────────────────────────────────────────────────────────────────────────
  81. birdcam_20260123_165009.mp4 (created: 2026-01-25 16:14:33)
  80. birdcam_20260124_072805.mp4 (created: 2026-01-25 16:14:33)
  ...
────────────────────────────────────────────────────────────────────────────────

Reprocessing complete: 21 succeeded, 0 failed
```
