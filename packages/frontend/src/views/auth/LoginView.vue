<template>
  <v-card>
    <v-card-title class="text-h5">
      AI Birdwatcher - Login
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="username"
          label="Username"
          prepend-icon="mdi-account"
          :rules="[rules.required]"
          required
        />
        <v-text-field
          v-model="password"
          label="Password"
          prepend-icon="mdi-lock"
          type="password"
          :rules="[rules.required]"
          required
        />
        <v-alert v-if="authStore.error" type="error" class="mt-3">
          {{ authStore.error }}
        </v-alert>
        <v-btn
          type="submit"
          color="primary"
          block
          :loading="authStore.loading"
          class="mt-4"
        >
          Login
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn text :to="{ name: 'register' }">
        Don't have an account? Register
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');

const rules = {
  required: (v: string) => !!v || 'Required',
};

async function handleLogin() {
  const success = await authStore.login({ username: username.value, password: password.value });
  if (success) {
    const redirect = route.query.redirect as string || '/dashboard';
    router.push(redirect);
  }
}
</script>
