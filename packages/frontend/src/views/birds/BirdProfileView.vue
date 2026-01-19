<template>
  <div v-if="birdsStore.currentBird">
    <v-row>
      <v-col cols="12">
        <v-btn :to="{ name: 'birds' }" text>
          <v-icon>mdi-arrow-left</v-icon> Back to Directory
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <BirdHeader :bird="birdsStore.currentBird" />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <VisitHistory :history="birdsStore.birdHistory" />
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Profile Information</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>First Seen</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(birdsStore.currentBird.first_seen) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Last Seen</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(birdsStore.currentBird.last_seen) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Total Visits</v-list-item-title>
                <v-list-item-subtitle>
                  {{ birdsStore.currentBird.total_visits }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="birdsStore.currentBird.primary_gender">
                <v-list-item-title>Gender</v-list-item-title>
                <v-list-item-subtitle>
                  {{ birdsStore.currentBird.primary_gender }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
  <LoadingSpinner v-else-if="birdsStore.loading" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBirdsStore } from '@/stores/birds.store';
import BirdHeader from '@/components/birds/BirdHeader.vue';
import VisitHistory from '@/components/birds/VisitHistory.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { format } from 'date-fns';

const route = useRoute();
const birdsStore = useBirdsStore();

onMounted(() => {
  const id = parseInt(route.params.id as string);
  birdsStore.fetchBirdById(id);
});

function formatDate(date: string) {
  return format(new Date(date), 'PP');
}
</script>
