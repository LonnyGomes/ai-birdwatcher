<template>
  <div class="loading-container">
    <div class="loading-content">
      <div class="spinner-wrapper">
        <v-progress-circular
          indeterminate
          color="primary"
          :size="size"
          :width="width"
          class="spinner"
        />
        <div class="spinner-glow"></div>
      </div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
    width?: number;
    message?: string;
  }>(),
  {
    size: 52,
    width: 4,
    message: '',
  }
);
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 32px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  position: relative;
  z-index: 1;
}

.spinner-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(64, 145, 108, 0.15) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}

.loading-message {
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
  text-align: center;
}
</style>
