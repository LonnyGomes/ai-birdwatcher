<template>
  <v-card>
    <v-card-title>Species Distribution</v-card-title>
    <v-card-text>
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      <LoadingSpinner v-else />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { useStatisticsStore } from '@/stores/statistics.store';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const statisticsStore = useStatisticsStore();

const chartData = computed(() => {
  if (!statisticsStore.speciesData.length) return null;

  return {
    labels: statisticsStore.speciesData.map(s => s.species),
    datasets: [
      {
        label: 'Sightings',
        data: statisticsStore.speciesData.map(s => s.sightings),
        backgroundColor: '#1976D2',
      },
      {
        label: 'Individuals',
        data: statisticsStore.speciesData.map(s => s.individuals),
        backgroundColor: '#4CAF50',
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};
</script>
