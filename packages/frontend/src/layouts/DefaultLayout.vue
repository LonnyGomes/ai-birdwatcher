<template>
  <v-layout>
    <NavigationDrawer v-model="drawer" />

    <AppBar @toggle-drawer="drawer = !drawer" />

    <v-main>
      <v-container fluid>
        <router-view />
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
