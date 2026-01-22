<template>
  <v-navigation-drawer
    v-model="model"
    permanent
    class="nav-drawer"
  >
    <div class="nav-content">
      <v-list class="nav-list" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          :prepend-icon="item.icon"
          :title="item.title"
          class="nav-item"
          rounded="lg"
        >
          <template #prepend>
            <v-icon :icon="item.icon" class="nav-icon" />
          </template>
        </v-list-item>
      </v-list>
    </div>

    <template #append>
      <div class="nav-footer">
        <v-divider class="mb-3" />
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
        <div class="footer-branding">
          <v-icon size="16" class="mr-1" style="opacity: 0.4">mdi-leaf</v-icon>
          <span class="footer-text">Nature Mode</span>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ThemeToggle from './ThemeToggle.vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const model = ref(props.modelValue);

const navItems = [
  { name: 'dashboard', icon: 'mdi-view-dashboard-outline', title: 'Dashboard' },
  { name: 'sightings', icon: 'mdi-bird', title: 'Sightings' },
  { name: 'birds', icon: 'mdi-book-open-page-variant-outline', title: 'Birds Directory' },
  { name: 'videos', icon: 'mdi-video-outline', title: 'Videos' },
];

watch(() => props.modelValue, (val) => {
  model.value = val;
});

watch(model, (val) => {
  emit('update:modelValue', val);
});
</script>

<style scoped>
.nav-drawer {
  background: rgba(248, 246, 243, 0.95) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid rgba(27, 67, 50, 0.08) !important;
}

.v-theme--dark .nav-drawer {
  background: rgba(26, 47, 35, 0.95) !important;
  border-right: 1px solid rgba(116, 198, 157, 0.1) !important;
}

.nav-content {
  padding: 12px 8px;
}

.nav-list {
  background: transparent !important;
}

.nav-item {
  margin: 4px 0;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(180deg, #1B4332 0%, #40916C 100%);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
}

.v-theme--dark .nav-item::before {
  background: linear-gradient(180deg, #40916C 0%, #74C69D 100%);
}

.nav-item:hover {
  background: rgba(27, 67, 50, 0.06) !important;
}

.v-theme--dark .nav-item:hover {
  background: rgba(116, 198, 157, 0.08) !important;
}

.nav-item.v-list-item--active {
  background: rgba(27, 67, 50, 0.1) !important;
}

.v-theme--dark .nav-item.v-list-item--active {
  background: rgba(116, 198, 157, 0.12) !important;
}

.nav-item.v-list-item--active::before {
  height: 24px;
}

.nav-icon {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), color 0.3s ease;
  opacity: 0.7;
}

.nav-item:hover .nav-icon {
  transform: scale(1.15);
  opacity: 1;
  color: rgb(var(--v-theme-primary));
}

.nav-item.v-list-item--active .nav-icon {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
}

.nav-item :deep(.v-list-item-title) {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.nav-item:hover :deep(.v-list-item-title) {
  color: rgb(var(--v-theme-primary));
}

.nav-item.v-list-item--active :deep(.v-list-item-title) {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.nav-footer {
  padding: 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(27, 67, 50, 0.03) 100%);
}

.v-theme--dark .nav-footer {
  background: linear-gradient(180deg, transparent 0%, rgba(116, 198, 157, 0.03) 100%);
}

.theme-toggle-wrapper {
  padding: 8px 12px;
  background: rgba(27, 67, 50, 0.04);
  border-radius: 12px;
  margin-bottom: 12px;
}

.v-theme--dark .theme-toggle-wrapper {
  background: rgba(116, 198, 157, 0.06);
}

.footer-branding {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.footer-text {
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.4;
}
</style>
