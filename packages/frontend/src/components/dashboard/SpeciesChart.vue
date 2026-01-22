<template>
  <v-card class="chart-card glass-card-prominent">
    <div class="card-header">
      <div class="header-icon">
        <v-icon size="20" color="primary">mdi-chart-bar</v-icon>
      </div>
      <span class="header-title">Species Distribution</span>
    </div>
    <v-card-text class="chart-container">
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
        backgroundColor: '#1B4332',
        hoverBackgroundColor: '#2D6A4F',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Individuals',
        data: statisticsStore.speciesData.map(s => s.individuals),
        backgroundColor: '#E85D04',
        hoverBackgroundColor: '#F48C06',
        borderRadius: 6,
        borderSkipped: false,
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
      labels: {
        font: {
          family: "'Poppins', sans-serif",
          weight: 500,
        },
        usePointStyle: true,
        pointStyle: 'rectRounded',
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(27, 67, 50, 0.9)',
      titleFont: {
        family: "'Poppins', sans-serif",
        weight: 600,
        size: 13,
      },
      bodyFont: {
        family: "'Poppins', sans-serif",
        size: 12,
      },
      cornerRadius: 12,
      padding: 12,
      boxPadding: 6,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(27, 67, 50, 0.06)',
      },
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
          size: 11,
        },
      },
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart' as const,
  },
};
</script>

<style scoped>
.chart-card {
  border-radius: 24px !important;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(27, 67, 50, 0.08);
}

.v-theme--dark .card-header {
  border-bottom-color: rgba(116, 198, 157, 0.1);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-theme--dark .header-icon {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.header-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.chart-container {
  padding: 20px 24px 24px;
}
</style>
