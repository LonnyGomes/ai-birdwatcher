<template>
  <v-card>
    <v-card-title>{{ video.filename }}</v-card-title>
    <v-card-subtitle>
      Uploaded {{ formatDate(video.created_at) }}
    </v-card-subtitle>
    <v-card-text>
      <ProcessingStatus :video="video" />

      <v-list density="compact" class="mt-2">
        <v-list-item v-if="video.duration_seconds">
          <v-list-item-title>Duration</v-list-item-title>
          <v-list-item-subtitle>
            {{ formatDuration(video.duration_seconds) }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="video.frame_count">
          <v-list-item-title>Frames</v-list-item-title>
          <v-list-item-subtitle>
            {{ video.frame_count }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-alert v-if="video.error_message" type="error" class="mt-2">
        {{ video.error_message }}
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-if="video.status === 'completed'"
        :to="{ name: 'sightings', query: { video_id: video.id } }"
        text
      >
        View Sightings
      </v-btn>
      <v-spacer />
      <v-btn icon="mdi-delete" color="error" @click="emit('delete', video.id)" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import ProcessingStatus from './ProcessingStatus.vue';
import { format } from 'date-fns';

defineProps<{
  video: any;
}>();

const emit = defineEmits<{
  delete: [id: number];
}>();

function formatDate(date: string) {
  return format(new Date(date), 'PPp');
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
</script>
