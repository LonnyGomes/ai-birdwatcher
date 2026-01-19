<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Birds Directory</h1>
      </v-col>
    </v-row>

    <v-row v-if="birdsStore.loading">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <BirdGrid v-else-if="birdsStore.birds.length" :birds="birdsStore.birds" />

    <v-row v-else>
      <v-col cols="12">
        <EmptyState message="No birds tracked yet" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBirdsStore } from '@/stores/birds.store';
import BirdGrid from '@/components/birds/BirdGrid.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const birdsStore = useBirdsStore();

onMounted(() => {
  birdsStore.fetchBirds();
});
</script>
