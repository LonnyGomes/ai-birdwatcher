import apiClient from './api.service';

interface SightingsListParams {
  video_id?: number;
  bird_profile_id?: number;
  species?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

class SightingsService {
  async list(params?: SightingsListParams): Promise<any[]> {
    const response = await apiClient.get<{ sightings: any[] }>('/api/sightings', { params });
    return response.data.sightings;
  }

  async getById(id: number): Promise<any> {
    const response = await apiClient.get<{ sighting: any }>(`/api/sightings/${id}`);
    return response.data.sighting;
  }

  async getByVideoId(videoId: number): Promise<any[]> {
    const response = await apiClient.get<{ sightings: any[] }>(`/api/sightings/video/${videoId}`);
    return response.data.sightings;
  }
}

export default new SightingsService();
