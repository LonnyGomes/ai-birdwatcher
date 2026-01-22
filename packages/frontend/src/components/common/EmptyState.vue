<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <div class="icon-wrapper">
        <div class="icon-ring"></div>
        <v-icon :size="iconSize" class="empty-icon">
          {{ icon }}
        </v-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <div v-if="$slots.action" class="empty-action">
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    iconSize?: number;
    iconColor?: string;
    title?: string;
    message: string;
  }>(),
  {
    icon: 'mdi-bird',
    iconSize: 56,
    iconColor: 'primary',
    title: 'Nothing Here Yet',
  }
);
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-state-content {
  max-width: 400px;
  text-align: center;
}

.icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  margin-bottom: 28px;
}

.icon-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px dashed rgba(27, 67, 50, 0.2);
  animation: rotate 20s linear infinite;
}

.v-theme--dark .icon-ring {
  border-color: rgba(116, 198, 157, 0.2);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-wrapper::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.08) 0%, rgba(64, 145, 108, 0.08) 100%);
}

.v-theme--dark .icon-wrapper::before {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.12) 0%, rgba(116, 198, 157, 0.12) 100%);
}

.empty-icon {
  position: relative;
  z-index: 1;
  color: #1B4332;
  opacity: 0.6;
}

.v-theme--dark .empty-icon {
  color: #74C69D;
  opacity: 0.7;
}

.empty-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.35rem;
  margin-bottom: 10px;
  color: rgb(var(--v-theme-on-surface));
}

.empty-message {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.6;
  margin-bottom: 24px;
}

.empty-action {
  margin-top: 8px;
}
</style>
