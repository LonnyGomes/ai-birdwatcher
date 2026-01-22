<template>
  <div class="dashboard-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <v-icon size="32" color="white">mdi-bird</v-icon>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">{{ greeting }}</h1>
          <p class="hero-subtitle">Monitor your bird watching activity and insights</p>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="decoration-circle decoration-circle--1"></div>
        <div class="decoration-circle decoration-circle--2"></div>
        <div class="decoration-circle decoration-circle--3"></div>
      </div>
    </div>

    <!-- Stats Section -->
    <section class="dashboard-section" v-if="statisticsStore.overview">
      <div class="section-header">
        <div class="section-icon">
          <v-icon size="18" color="primary">mdi-chart-box</v-icon>
        </div>
        <h2 class="section-title">Overview</h2>
      </div>

      <v-row class="stats-row">
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Videos"
            :value="statisticsStore.overview.videos.total"
            icon="mdi-video"
            color="forest"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Unique Birds"
            :value="statisticsStore.overview.birds.total_individuals"
            icon="mdi-bird"
            color="moss"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Sightings"
            :value="statisticsStore.overview.birds.total_sightings"
            icon="mdi-binoculars"
            color="earth"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Unique Species"
            :value="statisticsStore.overview.birds.unique_species"
            icon="mdi-format-list-bulleted-type"
            color="sunset"
          />
        </v-col>
      </v-row>
    </section>

    <!-- Charts Section -->
    <section class="dashboard-section">
      <div class="section-header">
        <div class="section-icon">
          <v-icon size="18" color="primary">mdi-chart-line</v-icon>
        </div>
        <h2 class="section-title">Analytics</h2>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <SpeciesChart />
        </v-col>
        <v-col cols="12" md="6">
          <HourlyActivityChart />
        </v-col>
      </v-row>
    </section>

    <!-- Activity Section -->
    <section class="dashboard-section">
      <div class="section-header">
        <div class="section-icon">
          <v-icon size="18" color="primary">mdi-clock-outline</v-icon>
        </div>
        <h2 class="section-title">Recent Activity</h2>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <RecentSightings />
        </v-col>
        <v-col cols="12" md="4">
          <TopVisitors />
        </v-col>
      </v-row>
    </section>

    <!-- Loading State -->
    <div v-if="statisticsStore.loading && !statisticsStore.overview" class="loading-container">
      <LoadingSpinner message="Loading dashboard..." />
    </div>

    <!-- Error State -->
    <v-alert
      v-if="statisticsStore.error"
      type="error"
      variant="tonal"
      class="error-alert"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">mdi-alert-circle</v-icon>
        <span>{{ statisticsStore.error }}</span>
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStatisticsStore } from '@/stores/statistics.store';
import { useAuthStore } from '@/stores/auth.store';
import StatsCard from '@/components/dashboard/StatsCard.vue';
import SpeciesChart from '@/components/dashboard/SpeciesChart.vue';
import HourlyActivityChart from '@/components/dashboard/HourlyActivityChart.vue';
import RecentSightings from '@/components/dashboard/RecentSightings.vue';
import TopVisitors from '@/components/dashboard/TopVisitors.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const statisticsStore = useStatisticsStore();
const authStore = useAuthStore();

const greeting = computed(() => {
  const hour = new Date().getHours();
  const name = authStore.user?.username || 'Birdwatcher';

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
});

onMounted(async () => {
  await Promise.all([
    statisticsStore.fetchOverview(),
    statisticsStore.fetchSpecies(),
    statisticsStore.fetchHourlyActivity(),
  ]);
});
</script>

<style scoped>
.dashboard-view {
  padding-bottom: 32px;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 40px 32px;
  margin: -24px -24px 32px -24px;
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%);
  border-radius: 0 0 32px 32px;
  overflow: hidden;
}

.v-theme--dark .hero-section {
  background: linear-gradient(135deg, #0D1B14 0%, #1A2F23 50%, #2D6A4F 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-icon {
    animation: none;
  }
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  color: white;
  margin-bottom: 4px;
  line-height: 1.2;
}

.hero-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* Decorative circles */
.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.decoration-circle--1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.decoration-circle--2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 20%;
}

.decoration-circle--3 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 40%;
}

/* Section Styling */
.dashboard-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-theme--dark .section-icon {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: rgb(var(--v-theme-on-surface));
}

/* Stats row animation */
.stats-row > * {
  animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.stats-row > *:nth-child(1) { animation-delay: 0ms; }
.stats-row > *:nth-child(2) { animation-delay: 100ms; }
.stats-row > *:nth-child(3) { animation-delay: 200ms; }
.stats-row > *:nth-child(4) { animation-delay: 300ms; }

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-row > * {
    animation: none;
    opacity: 1;
  }
}

/* Loading & Error states */
.loading-container {
  padding: 60px 20px;
}

.error-alert {
  margin-top: 24px;
  border-radius: 16px;
}

/* Responsive */
@media (max-width: 600px) {
  .hero-section {
    padding: 28px 20px;
    margin: -16px -16px 24px -16px;
    border-radius: 0 0 24px 24px;
  }

  .hero-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
  }

  .hero-title {
    font-size: 1.4rem;
  }

  .hero-subtitle {
    font-size: 0.85rem;
  }

  .decoration-circle--1 {
    width: 120px;
    height: 120px;
    top: -30px;
    right: -30px;
  }

  .decoration-circle--2,
  .decoration-circle--3 {
    display: none;
  }
}
</style>
