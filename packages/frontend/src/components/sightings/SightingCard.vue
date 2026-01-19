<template>
  <v-card :to="{ name: 'sighting-detail', params: { id: sighting.id } }">
    <v-img
      :src="`/api/files/${sighting.frame_path}`"
      height="200"
      cover
    >
      <template #placeholder>
        <v-row class="fill-height" align="center" justify="center">
          <v-progress-circular indeterminate />
        </v-row>
      </template>
    </v-img>
    <v-card-title>{{ sighting.species }}</v-card-title>
    <v-card-subtitle>
      {{ formatDate(sighting.detected_at) }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip v-if="sighting.bird_common_name" size="small" color="primary">
        {{ sighting.bird_common_name }}
      </v-chip>
      <v-chip size="small" class="ml-2">
        {{ Math.round(sighting.confidence_score * 100) }}% confidence
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

defineProps<{
  sighting: any;
}>();

function formatDate(date: string) {
  return format(new Date(date), 'PPp');
}
</script>
