import apiClient from './api.service';

interface VideoListParams {
  status?: string;
  limit?: number;
  offset?: number;
}

class VideosService {
  async list(params?: VideoListParams): Promise<any> {
    const response = await apiClient.get<any>('/api/videos', { params });
    return response.data;
  }

  async getById(id: number): Promise<any> {
    const response = await apiClient.get<{ video: any }>(`/api/videos/${id}`);
    return response.data.video;
  }

  async upload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await apiClient.post<{ video: any }>('/api/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.video;
  }

  async getStatus(id: number): Promise<any> {
    const response = await apiClient.get<any>(`/api/videos/${id}/status`);
    return response.data;
  }

  async cancel(id: number): Promise<void> {
    await apiClient.post(`/api/videos/${id}/cancel`);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/videos/${id}`);
  }
}

export default new VideosService();
