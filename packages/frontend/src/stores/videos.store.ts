import { defineStore } from 'pinia';
import { ref } from 'vue';
import videosService from '@/services/videos.service';

export const useVideosStore = defineStore('videos', () => {
  const videos = ref<any[]>([]);
  const currentVideo = ref<any | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchVideos(status?: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await videosService.list({ status });
      videos.value = response.videos;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch videos';
    } finally {
      loading.value = false;
    }
  }

  async function fetchVideoById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentVideo.value = await videosService.getById(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch video';
    } finally {
      loading.value = false;
    }
  }

  async function uploadVideo(file: File) {
    loading.value = true;
    error.value = null;
    try {
      const video = await videosService.upload(file);
      videos.value.unshift(video);
      return video;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload video';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteVideo(id: number) {
    try {
      await videosService.delete(id);
      videos.value = videos.value.filter(v => v.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete video';
      throw err;
    }
  }

  return {
    videos,
    currentVideo,
    loading,
    error,
    fetchVideos,
    fetchVideoById,
    uploadVideo,
    deleteVideo,
  };
});
