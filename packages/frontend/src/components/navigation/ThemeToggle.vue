<template>
  <v-switch
    v-model="isDark"
    hide-details
    label="Dark Mode"
    color="primary"
    density="compact"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = ref(theme.global.current.value.dark);

watch(isDark, (value) => {
  theme.global.name.value = value ? 'dark' : 'light';
  localStorage.setItem('theme', value ? 'dark' : 'light');
});

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  isDark.value = savedTheme === 'dark';
  theme.global.name.value = savedTheme;
}
</script>
