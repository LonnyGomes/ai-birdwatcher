import { defineStore } from 'pinia';
import { ref } from 'vue';
import statisticsService from '@/services/statistics.service';
import type { StatisticsOverview, SpeciesData, TimelineData, HourlyActivityData } from '@/types/api.types';

export const useStatisticsStore = defineStore('statistics', () => {
  const overview = ref<StatisticsOverview | null>(null);
  const speciesData = ref<SpeciesData[]>([]);
  const timelineData = ref<TimelineData[]>([]);
  const hourlyActivity = ref<HourlyActivityData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOverview() {
    loading.value = true;
    error.value = null;
    try {
      overview.value = await statisticsService.getOverview();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch overview';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSpecies() {
    loading.value = true;
    error.value = null;
    try {
      const response = await statisticsService.getSpecies();
      speciesData.value = response.species;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch species data';
    } finally {
      loading.value = false;
    }
  }

  async function fetchTimeline(params?: { date_from?: string; date_to?: string; interval?: 'hour' | 'day' | 'week' | 'month' }) {
    loading.value = true;
    error.value = null;
    try {
      const response = await statisticsService.getTimeline(params);
      timelineData.value = response.timeline;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch timeline';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHourlyActivity() {
    loading.value = true;
    error.value = null;
    try {
      const response = await statisticsService.getHourlyActivity();
      hourlyActivity.value = response.hourly_activity;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch hourly activity';
    } finally {
      loading.value = false;
    }
  }

  return {
    overview,
    speciesData,
    timelineData,
    hourlyActivity,
    loading,
    error,
    fetchOverview,
    fetchSpecies,
    fetchTimeline,
    fetchHourlyActivity,
  };
});
