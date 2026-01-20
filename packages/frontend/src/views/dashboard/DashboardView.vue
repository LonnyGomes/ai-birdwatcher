<template>
  <div>
    <!-- Header Section -->
    <div class="dashboard-header mb-8">
      <h1 class="text-h3 font-weight-bold mb-2">Dashboard</h1>
      <p class="text-subtitle-1 text-medium-emphasis">Monitor your bird watching activity and insights</p>
    </div>

    <!-- Stats Cards -->
    <v-row v-if="statisticsStore.overview" class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Total Videos"
          :value="statisticsStore.overview.videos.total"
          icon="mdi-video"
          color="primary"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Unique Birds"
          :value="statisticsStore.overview.birds.total_individuals"
          icon="mdi-bird"
          color="success"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Total Sightings"
          :value="statisticsStore.overview.birds.total_sightings"
          icon="mdi-binoculars"
          color="info"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="Unique Species"
          :value="statisticsStore.overview.birds.unique_species"
          icon="mdi-format-list-bulleted-type"
          color="warning"
        />
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <SpeciesChart />
      </v-col>
      <v-col cols="12" md="6">
        <HourlyActivityChart />
      </v-col>
    </v-row>

    <!-- Recent Activity Row -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <RecentSightings />
      </v-col>
      <v-col cols="12" md="4">
        <TopVisitors />
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="statisticsStore.loading && !statisticsStore.overview">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-if="statisticsStore.error">
      <v-col cols="12">
        <v-alert type="error">
          {{ statisticsStore.error }}
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useStatisticsStore } from '@/stores/statistics.store';
import StatsCard from '@/components/dashboard/StatsCard.vue';
import SpeciesChart from '@/components/dashboard/SpeciesChart.vue';
import HourlyActivityChart from '@/components/dashboard/HourlyActivityChart.vue';
import RecentSightings from '@/components/dashboard/RecentSightings.vue';
import TopVisitors from '@/components/dashboard/TopVisitors.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const statisticsStore = useStatisticsStore();

onMounted(async () => {
  await Promise.all([
    statisticsStore.fetchOverview(),
    statisticsStore.fetchSpecies(),
    statisticsStore.fetchHourlyActivity(),
  ]);
});
</script>
