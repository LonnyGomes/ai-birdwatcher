import { defineStore } from 'pinia';
import { ref } from 'vue';
import birdsService from '@/services/birds.service';

export const useBirdsStore = defineStore('birds', () => {
  const birds = ref<any[]>([]);
  const currentBird = ref<any | null>(null);
  const birdHistory = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBirds(params?: any) {
    loading.value = true;
    error.value = null;
    try {
      birds.value = await birdsService.list(params);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch birds';
    } finally {
      loading.value = false;
    }
  }

  async function fetchBirdById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentBird.value = await birdsService.getById(id);
      birdHistory.value = await birdsService.getHistory(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch bird';
    } finally {
      loading.value = false;
    }
  }

  async function updateBird(id: number, data: any) {
    try {
      currentBird.value = await birdsService.update(id, data);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update bird';
      throw err;
    }
  }

  async function deleteBird(id: number) {
    try {
      await birdsService.delete(id);
      birds.value = birds.value.filter(b => b.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete bird';
      throw err;
    }
  }

  return {
    birds,
    currentBird,
    birdHistory,
    loading,
    error,
    fetchBirds,
    fetchBirdById,
    updateBird,
    deleteBird,
  };
});
