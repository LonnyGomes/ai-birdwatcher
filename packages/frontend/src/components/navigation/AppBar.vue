<template>
  <v-app-bar elevation="1" class="app-bar">
    <v-app-bar-nav-icon @click="emit('toggle-drawer')" />

    <v-app-bar-title class="app-title">
      <div class="d-flex align-center">
        <v-icon size="32" color="primary" class="mr-2">mdi-bird</v-icon>
        <span class="text-h6 font-weight-bold">AI Birdwatcher</span>
      </div>
    </v-app-bar-title>

    <v-spacer />

    <!-- Theme Toggle -->
    <template #append>
      <ThemeToggle />

      <!-- User Menu -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            class="ml-2"
          >
            <v-avatar color="primary" size="36">
              <span class="text-button">{{ getUserInitials() }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list min-width="200">
          <v-list-item>
            <v-list-item-title class="font-weight-bold">
              {{ authStore.user?.username }}
            </v-list-item-title>
            <v-list-item-subtitle>User Account</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="my-2" />
          <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
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
  backdrop-filter: blur(10px);
}

.app-title {
  user-select: none;
}
</style>
