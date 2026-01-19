<template>
  <div v-if="sightingsStore.currentSighting">
    <v-row>
      <v-col cols="12">
        <v-btn :to="{ name: 'sightings' }" text>
          <v-icon>mdi-arrow-left</v-icon> Back to Sightings
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-img
            :src="`/api/files/${sightingsStore.currentSighting.frame_path}`"
            contain
            max-height="600"
          />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>{{ sightingsStore.currentSighting.species }}</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Detected At</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(sightingsStore.currentSighting.detected_at) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Confidence</v-list-item-title>
                <v-list-item-subtitle>
                  {{ Math.round(sightingsStore.currentSighting.confidence_score * 100) }}%
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="sightingsStore.currentSighting.bird_common_name">
                <v-list-item-title>Bird Profile</v-list-item-title>
                <v-list-item-subtitle>
                  <router-link
                    v-if="sightingsStore.currentSighting.bird_profile_id"
                    :to="{ name: 'bird-profile', params: { id: sightingsStore.currentSighting.bird_profile_id } }"
                  >
                    {{ sightingsStore.currentSighting.bird_common_name }}
                  </router-link>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="sightingsStore.currentSighting.gender">
                <v-list-item-title>Gender</v-list-item-title>
                <v-list-item-subtitle>
                  {{ sightingsStore.currentSighting.gender }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card v-if="sightingsStore.currentSighting.ai_analysis" class="mt-4">
          <v-card-title>AI Analysis</v-card-title>
          <v-card-text>
            {{ sightingsStore.currentSighting.ai_analysis }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
  <LoadingSpinner v-else-if="sightingsStore.loading" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSightingsStore } from '@/stores/sightings.store';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { format } from 'date-fns';

const route = useRoute();
const sightingsStore = useSightingsStore();

onMounted(() => {
  const id = parseInt(route.params.id as string);
  sightingsStore.fetchSightingById(id);
});

function formatDate(date: string) {
  return format(new Date(date), 'PPpp');
}
</script>
