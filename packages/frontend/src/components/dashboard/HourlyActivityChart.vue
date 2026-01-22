<template>
  <v-card class="chart-card glass-card-prominent">
    <div class="card-header">
      <div class="header-icon">
        <v-icon size="20" color="accent">mdi-chart-timeline-variant</v-icon>
      </div>
      <span class="header-title">24-Hour Activity Pattern</span>
    </div>
    <v-card-text class="chart-container">
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
  Filler,
} from 'chart.js';
import { useStatisticsStore } from '@/stores/statistics.store';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const statisticsStore = useStatisticsStore();

const chartData = computed(() => {
  if (!statisticsStore.hourlyActivity.length) return null;

  return {
    labels: statisticsStore.hourlyActivity.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'Sightings',
        data: statisticsStore.hourlyActivity.map(h => h.count),
        borderColor: '#E85D04',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(232, 93, 4, 0.3)');
          gradient.addColorStop(1, 'rgba(232, 93, 4, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#E85D04',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
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
    tooltip: {
      backgroundColor: 'rgba(232, 93, 4, 0.9)',
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
      displayColors: false,
      callbacks: {
        title: (items: any) => `${items[0].label}`,
        label: (item: any) => `${item.raw} sightings`,
      },
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
          size: 10,
        },
        maxRotation: 0,
        callback: function(this: any, value: any, index: number) {
          // Show every 3rd label
          return index % 3 === 0 ? this.getLabelForValue(value) : '';
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
      beginAtZero: true,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  animation: {
    duration: 1200,
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
  background: linear-gradient(135deg, rgba(232, 93, 4, 0.1) 0%, rgba(250, 163, 7, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-theme--dark .header-icon {
  background: linear-gradient(135deg, rgba(244, 140, 6, 0.15) 0%, rgba(250, 163, 7, 0.15) 100%);
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
