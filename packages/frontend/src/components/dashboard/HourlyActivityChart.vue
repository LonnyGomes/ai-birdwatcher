<template>
  <v-card>
    <v-card-title>24-Hour Activity Pattern</v-card-title>
    <v-card-text>
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <LoadingSpinner v-else />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';
import { useStatisticsStore } from '@/stores/statistics.store';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const statisticsStore = useStatisticsStore();

const chartData = computed(() => {
  if (!statisticsStore.hourlyActivity.length) return null;

  return {
    labels: statisticsStore.hourlyActivity.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'Sightings',
        data: statisticsStore.hourlyActivity.map(h => h.count),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};
</script>
