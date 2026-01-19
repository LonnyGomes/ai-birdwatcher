<template>
  <v-card>
    <v-card-title class="text-h5">
      AI Birdwatcher - Register
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleRegister">
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
          Register
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn text :to="{ name: 'login' }">
        Already have an account? Login
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');

const rules = {
  required: (v: string) => !!v || 'Required',
};

async function handleRegister() {
  const success = await authStore.register({ username: username.value, password: password.value });
  if (success) {
    router.push('/dashboard');
  }
}
</script>
