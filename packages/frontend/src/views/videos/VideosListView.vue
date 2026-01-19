<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Videos</h1>
          <v-btn color="primary" :to="{ name: 'video-upload' }">
            <v-icon>mdi-upload</v-icon> Upload Video
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-tabs v-model="selectedStatus" @update:model-value="handleStatusChange">
          <v-tab value="all">All</v-tab>
          <v-tab value="processing">Processing</v-tab>
          <v-tab value="completed">Completed</v-tab>
          <v-tab value="failed">Failed</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-row v-if="videosStore.loading" class="mt-4">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <v-row v-else-if="videosStore.videos.length" class="mt-4">
      <v-col
        v-for="video in videosStore.videos"
        :key="video.id"
        cols="12"
        md="6"
        lg="4"
      >
        <VideoCard :video="video" @delete="handleDelete" />
      </v-col>
    </v-row>

    <v-row v-else class="mt-4">
      <v-col cols="12">
        <EmptyState message="No videos found" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVideosStore } from '@/stores/videos.store';
import VideoCard from '@/components/videos/VideoCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const videosStore = useVideosStore();
const selectedStatus = ref<string>('all');

onMounted(() => {
  videosStore.fetchVideos();
});

function handleStatusChange(status: string) {
  videosStore.fetchVideos(status === 'all' ? undefined : status);
}

async function handleDelete(id: number) {
  if (confirm('Are you sure you want to delete this video?')) {
    await videosStore.deleteVideo(id);
  }
}
</script>
