import apiClient from './api.service';
import type { StatisticsOverview, SpeciesData, TimelineData, HourlyActivityData } from '@/types/api.types';
import type { BirdProfile } from '@shared/types/bird.types';

interface TimelineParams {
  date_from?: string;
  date_to?: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
}

class StatisticsService {
  async getOverview(): Promise<StatisticsOverview> {
    const response = await apiClient.get<StatisticsOverview>('/api/statistics/overview');
    return response.data;
  }

  async getSpecies(): Promise<{ species: SpeciesData[]; total_species: number }> {
    const response = await apiClient.get('/api/statistics/species');
    return response.data;
  }

  async getTimeline(params?: TimelineParams): Promise<{ timeline: TimelineData[]; interval: string }> {
    const response = await apiClient.get('/api/statistics/timeline', { params });
    return response.data;
  }

  async getHourlyActivity(): Promise<{ hourly_activity: HourlyActivityData[]; peak_hours: number[] }> {
    const response = await apiClient.get('/api/statistics/hourly-activity');
    return response.data;
  }

  async getTopVisitors(limit?: number): Promise<{ top_visitors: BirdProfile[] }> {
    const response = await apiClient.get('/api/statistics/top-visitors', {
      params: { limit },
    });
    return response.data;
  }
}

export default new StatisticsService();
