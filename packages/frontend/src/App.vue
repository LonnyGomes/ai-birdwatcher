<template>
  <v-app class="app-root">
    <router-view v-slot="{ Component, route }">
      <transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </v-app>
</template>

<script setup lang="ts">
// Auth initialization is handled by router guards
</script>

<style>
/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Scale fade transition */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active,
  .scale-fade-enter-active,
  .scale-fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .slide-left-enter-from,
  .slide-left-leave-to,
  .slide-right-enter-from,
  .slide-right-leave-to,
  .scale-fade-enter-from,
  .scale-fade-leave-to {
    transform: none;
  }
}

/* Global app styling */
.app-root {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Smooth scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(27, 67, 50, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(27, 67, 50, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(27, 67, 50, 0.3);
}

.v-theme--dark ::-webkit-scrollbar-track {
  background: rgba(116, 198, 157, 0.05);
}

.v-theme--dark ::-webkit-scrollbar-thumb {
  background: rgba(116, 198, 157, 0.2);
}

.v-theme--dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(116, 198, 157, 0.3);
}

/* Selection color */
::selection {
  background: rgba(27, 67, 50, 0.2);
  color: inherit;
}

.v-theme--dark ::selection {
  background: rgba(116, 198, 157, 0.3);
}
</style>
