<template>
  <v-card>
    <v-card-title>Recent Sightings</v-card-title>
    <v-list v-if="statisticsStore.overview?.recent_sightings?.length">
      <v-list-item
        v-for="sighting in statisticsStore.overview.recent_sightings"
        :key="sighting.id"
        :to="{ name: 'sighting-detail', params: { id: sighting.id } }"
      >
        <template #prepend>
          <v-avatar>
            <v-img
              v-if="sighting.frame_path"
              :src="`/api/files/${sighting.frame_path}`"
              alt="Bird"
            />
            <v-icon v-else>mdi-bird</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title>{{ sighting.species }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ formatDate(sighting.detected_at) }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <EmptyState v-else message="No recent sightings" />
  </v-card>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics.store';
import EmptyState from '@/components/common/EmptyState.vue';
import { format } from 'date-fns';

const statisticsStore = useStatisticsStore();

function formatDate(date: string) {
  return format(new Date(date), 'PPp');
}
</script>
