<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Sightings</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <SightingsFilter @filter="handleFilter" />
      </v-col>
    </v-row>

    <v-row v-if="sightingsStore.loading">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <v-row v-else-if="sightingsStore.sightings.length">
      <v-col
        v-for="sighting in sightingsStore.sightings"
        :key="sighting.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <SightingCard :sighting="sighting" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <EmptyState message="No sightings found" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSightingsStore } from '@/stores/sightings.store';
import SightingsFilter from '@/components/sightings/SightingsFilter.vue';
import SightingCard from '@/components/sightings/SightingCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const sightingsStore = useSightingsStore();

onMounted(() => {
  sightingsStore.fetchSightings();
});

function handleFilter(filters: any) {
  sightingsStore.fetchSightings(filters);
}
</script>
