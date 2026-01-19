export interface ProcessingMetrics {
  id: number;
  video_id: number;
  job_id: number | null;
  total_frames: number;
  skipped_low_quality_duplicate: number;
  skipped_no_birds: number;
  created_at: string;
}

export interface CreateProcessingMetricsInput {
  video_id: number;
  job_id?: number | null;
  total_frames: number;
  skipped_low_quality_duplicate: number;
  skipped_no_birds: number;
}
