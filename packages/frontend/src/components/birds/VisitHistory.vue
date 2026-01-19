<template>
  <v-card>
    <v-card-title>Visit History</v-card-title>
    <v-card-text>
      <v-timeline v-if="history.length" density="compact" side="end">
        <v-timeline-item
          v-for="sighting in history"
          :key="sighting.id"
          dot-color="primary"
          size="small"
        >
          <template #opposite>
            {{ formatDate(sighting.detected_at) }}
          </template>
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-img
                  :src="`/api/files/${sighting.frame_path}`"
                  width="100"
                  height="100"
                  cover
                  class="mr-4"
                />
                <div>
                  <div class="font-weight-bold">{{ sighting.species }}</div>
                  <div class="text-caption">
                    Confidence: {{ Math.round(sighting.confidence_score * 100) }}%
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
      <EmptyState v-else message="No visit history" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue';
import { format } from 'date-fns';

defineProps<{
  history: any[];
}>();

function formatDate(date: string) {
  return format(new Date(date), 'PPp');
}
</script>
