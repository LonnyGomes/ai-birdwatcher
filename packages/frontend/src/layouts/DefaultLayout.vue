<template>
  <v-layout class="default-layout">
    <NavigationDrawer v-model="drawer" />

    <AppBar @toggle-drawer="drawer = !drawer" />

    <v-main class="main-content">
      <div class="background-pattern"></div>
      <v-container fluid class="content-container">
        <router-view v-slot="{ Component, route }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavigationDrawer from '@/components/navigation/NavigationDrawer.vue';
import AppBar from '@/components/navigation/AppBar.vue';

const drawer = ref(true);
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
}

.main-content {
  position: relative;
}

/* Subtle background pattern */
.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(27, 67, 50, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(64, 145, 108, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(45, 106, 79, 0.02) 0%, transparent 40%);
}

.v-theme--dark .background-pattern {
  background-image:
    radial-gradient(circle at 20% 80%, rgba(64, 145, 108, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(116, 198, 157, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(82, 183, 136, 0.03) 0%, transparent 40%);
}

.content-container {
  position: relative;
  z-index: 1;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

@media (max-width: 600px) {
  .content-container {
    padding: 16px;
  }
}

/* Page transitions within layout */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .page-fade-enter-from,
  .page-fade-leave-to {
    transform: none;
  }
}
</style>
