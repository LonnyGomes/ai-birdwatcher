<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-btn :to="{ name: 'videos' }" text>
          <v-icon>mdi-arrow-left</v-icon> Back to Videos
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8" offset-md="2">
        <v-card>
          <v-card-title>Upload Video</v-card-title>
          <v-card-text>
            <VideoUploader @upload="handleUpload" :loading="videosStore.loading" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useVideosStore } from '@/stores/videos.store';
import VideoUploader from '@/components/videos/VideoUploader.vue';

const router = useRouter();
const videosStore = useVideosStore();

async function handleUpload(file: File) {
  try {
    await videosStore.uploadVideo(file);
    router.push({ name: 'videos' });
  } catch (error) {
    // Error already handled in store
  }
}
</script>
