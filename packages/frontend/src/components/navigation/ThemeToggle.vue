<template>
  <div class="theme-toggle" @click="toggleTheme">
    <div class="toggle-track" :class="{ 'is-dark': isDark }">
      <div class="toggle-icons">
        <v-icon size="14" class="sun-icon" :class="{ active: !isDark }">mdi-white-balance-sunny</v-icon>
        <v-icon size="14" class="moon-icon" :class="{ active: isDark }">mdi-moon-waning-crescent</v-icon>
      </div>
      <div class="toggle-thumb" :class="{ 'is-dark': isDark }">
        <v-icon size="12" class="thumb-icon">
          {{ isDark ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny' }}
        </v-icon>
      </div>
    </div>
    <span class="toggle-label">{{ isDark ? 'Dark' : 'Light' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = ref(theme.global.current.value.dark);

function toggleTheme() {
  isDark.value = !isDark.value;
}

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

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.toggle-track {
  position: relative;
  width: 52px;
  height: 28px;
  background: linear-gradient(135deg, #FFE5D9 0%, #FAA307 100%);
  border-radius: 14px;
  padding: 3px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-track.is-dark {
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
}

.toggle-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.sun-icon {
  color: #E85D04;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.sun-icon.active {
  opacity: 1;
}

.moon-icon {
  color: #95D5B2;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.moon-icon.active {
  opacity: 1;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toggle-thumb.is-dark {
  left: calc(100% - 25px);
  background: #0D1B14;
}

.thumb-icon {
  color: #E85D04;
  transition: color 0.3s ease;
}

.toggle-thumb.is-dark .thumb-icon {
  color: #95D5B2;
}

.toggle-label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  min-width: 36px;
}

/* Hover effect */
.theme-toggle:hover .toggle-track {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(64, 145, 108, 0.15);
}

.theme-toggle:hover .toggle-thumb {
  transform: scale(1.05);
}
</style>
