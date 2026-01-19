import apiClient from './api.service';

interface BirdsListParams {
  species?: string;
  limit?: number;
  offset?: number;
}

class BirdsService {
  async list(params?: BirdsListParams): Promise<any[]> {
    const response = await apiClient.get<{ birds: any[] }>('/api/birds', { params });
    return response.data.birds;
  }

  async getById(id: number): Promise<any> {
    const response = await apiClient.get<{ bird: any }>(`/api/birds/${id}`);
    return response.data.bird;
  }

  async getHistory(id: number): Promise<any[]> {
    const response = await apiClient.get<{ sightings: any[] }>(`/api/birds/${id}/history`);
    return response.data.sightings;
  }

  async getImages(id: number): Promise<any[]> {
    const response = await apiClient.get<{ images: any[] }>(`/api/birds/${id}/images`);
    return response.data.images;
  }

  async update(id: number, data: any): Promise<any> {
    const response = await apiClient.patch<{ bird: any }>(`/api/birds/${id}`, data);
    return response.data.bird;
  }

  async merge(sourceId: number, targetId: number): Promise<void> {
    await apiClient.post(`/api/birds/${sourceId}/merge/${targetId}`);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/birds/${id}`);
  }
}

export default new BirdsService();
