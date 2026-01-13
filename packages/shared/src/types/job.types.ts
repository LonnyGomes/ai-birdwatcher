export type JobType = 'frame_extraction' | 'bird_identification' | 'similarity_matching';
export type JobStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface ProcessingJob {
  id: number;
  video_id: number;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreateJobInput {
  video_id: number;
  job_type: JobType;
}

export interface UpdateJobInput {
  status?: JobStatus;
  progress?: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}
