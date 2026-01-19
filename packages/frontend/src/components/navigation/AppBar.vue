<template>
  <v-app-bar elevation="0" border>
    <v-app-bar-nav-icon @click="emit('toggle-drawer')" />

    <v-app-bar-title>
      AI Birdwatcher
    </v-app-bar-title>

    <v-spacer />

    <v-menu>
      <template #activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>{{ authStore.user?.username }}</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item @click="handleLogout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

const emit = defineEmits<{
  'toggle-drawer': [];
}>();

const authStore = useAuthStore();
const router = useRouter();

async function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>
