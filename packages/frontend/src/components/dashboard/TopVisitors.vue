<template>
  <v-card>
    <v-card-title>Top Visitors</v-card-title>
    <v-list v-if="statisticsStore.overview?.top_visitors?.length">
      <v-list-item
        v-for="bird in statisticsStore.overview.top_visitors"
        :key="bird.id"
        :to="{ name: 'bird-profile', params: { id: bird.id } }"
      >
        <template #prepend>
          <v-avatar>
            <v-img
              v-if="bird.representative_image_path"
              :src="`/api/files/${bird.representative_image_path}`"
              alt="Bird"
            />
            <v-icon v-else>mdi-bird</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title>{{ bird.common_name || bird.species }}</v-list-item-title>
        <v-list-item-subtitle>{{ bird.total_visits }} visits</v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <EmptyState v-else message="No bird visits yet" />
  </v-card>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics.store';
import EmptyState from '@/components/common/EmptyState.vue';

const statisticsStore = useStatisticsStore();
</script>
