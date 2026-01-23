export type VideoSource = 'upload' | 'camera';
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type RecordedAtSource = 'metadata' | 'file_ctime' | 'filename' | 'fallback';

export interface Video {
  id: number;
  filename: string;
  filepath: string;
  source: VideoSource;
  duration_seconds: number | null;
  frame_count: number | null;
  status: VideoStatus;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
  recorded_at: string | null;
  recorded_at_source: RecordedAtSource | null;
}

export interface CreateVideoInput {
  filename: string;
  filepath: string;
  source: VideoSource;
  duration_seconds?: number;
  frame_count?: number;
  recorded_at?: string;
  recorded_at_source?: RecordedAtSource;
}

export interface UpdateVideoInput {
  status?: VideoStatus;
  duration_seconds?: number;
  frame_count?: number;
  error_message?: string;
  processed_at?: string;
  recorded_at?: string;
  recorded_at_source?: RecordedAtSource;
}
