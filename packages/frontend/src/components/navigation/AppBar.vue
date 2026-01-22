<template>
  <v-app-bar elevation="0" class="app-bar">
    <v-app-bar-nav-icon
      @click="emit('toggle-drawer')"
      class="nav-icon"
    />

    <v-app-bar-title class="app-title">
      <router-link :to="{ name: 'dashboard' }" class="brand-link">
        <div class="d-flex align-center">
          <div class="brand-icon-wrapper">
            <v-icon size="28" class="brand-icon">mdi-bird</v-icon>
          </div>
          <span class="brand-text">AI Birdwatcher</span>
        </div>
      </router-link>
    </v-app-bar-title>

    <v-spacer />

    <!-- Theme Toggle -->
    <template #append>
      <ThemeToggle class="mr-2" />

      <!-- User Menu -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            class="user-avatar-btn"
          >
            <div class="user-avatar-wrapper">
              <v-avatar color="primary" size="38" class="user-avatar">
                <span class="avatar-initials">{{ getUserInitials() }}</span>
              </v-avatar>
            </div>
          </v-btn>
        </template>
        <v-card class="user-menu-card" min-width="220">
          <div class="user-menu-header">
            <v-avatar color="primary" size="48" class="mb-2">
              <span class="text-h6">{{ getUserInitials() }}</span>
            </v-avatar>
            <div class="user-name">{{ authStore.user?.username }}</div>
            <div class="user-role">Birdwatcher</div>
          </div>
          <v-divider />
          <v-list density="compact" class="py-2">
            <v-list-item
              @click="handleLogout"
              prepend-icon="mdi-logout"
              class="logout-item"
            >
              <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>

    <!-- Gradient accent line -->
    <div class="accent-line"></div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';

const emit = defineEmits<{
  'toggle-drawer': [];
}>();

const authStore = useAuthStore();
const router = useRouter();

function getUserInitials(): string {
  const username = authStore.user?.username || 'U';
  return username.substring(0, 2).toUpperCase();
}

async function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<style scoped>
.app-bar {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: none !important;
  position: relative;
}

.v-theme--dark .app-bar {
  background: rgba(26, 47, 35, 0.9) !important;
}

.accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1B4332 0%, #40916C 40%, #E85D04 100%);
  opacity: 0.9;
}

.v-theme--dark .accent-line {
  background: linear-gradient(90deg, #40916C 0%, #74C69D 40%, #F48C06 100%);
}

.nav-icon {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.nav-icon:hover {
  transform: scale(1.1);
}

.app-title {
  user-select: none;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
  border-radius: 12px;
  margin-right: 12px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.v-theme--dark .brand-icon-wrapper {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.brand-link:hover .brand-icon-wrapper {
  transform: scale(1.05) rotate(-5deg);
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.15) 0%, rgba(64, 145, 108, 0.15) 100%);
}

.brand-icon {
  color: #1B4332;
  transition: transform 0.3s ease;
}

.v-theme--dark .brand-icon {
  color: #74C69D;
}

.brand-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.v-theme--dark .brand-text {
  background: linear-gradient(135deg, #74C69D 0%, #95D5B2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-avatar-btn {
  position: relative;
}

.user-avatar-wrapper {
  position: relative;
  padding: 3px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
}

.user-avatar-btn:hover .user-avatar-wrapper {
  background: linear-gradient(135deg, #1B4332, #E85D04);
}

.user-avatar {
  border: 2px solid transparent;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

.avatar-initials {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-menu-card {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(27, 67, 50, 0.15) !important;
}

.v-theme--dark .user-menu-card {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4) !important;
}

.user-menu-header {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.05) 0%, rgba(64, 145, 108, 0.05) 100%);
}

.v-theme--dark .user-menu-header {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.1) 0%, rgba(116, 198, 157, 0.1) 100%);
}

.user-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 2px;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logout-item {
  margin: 0 8px;
  border-radius: 8px;
}

.logout-item:hover {
  background: rgba(232, 93, 4, 0.1) !important;
}

.logout-item:hover :deep(.v-icon) {
  color: #E85D04;
}
</style>
