<template>
  <div class="register-view">
    <!-- Mobile brand (hidden on desktop) -->
    <div class="mobile-brand">
      <div class="brand-icon">
        <v-icon size="28" color="white">mdi-bird</v-icon>
      </div>
      <h1 class="brand-name">AI Birdwatcher</h1>
    </div>

    <v-card class="register-card glass-card-prominent">
      <div class="card-header">
        <h2 class="card-title">Create Account</h2>
        <p class="card-subtitle">Join to start tracking your bird visitors</p>
      </div>

      <v-form @submit.prevent="handleRegister" class="register-form">
        <div class="form-fields">
          <div class="field-wrapper">
            <label class="field-label">Username</label>
            <v-text-field
              v-model="username"
              placeholder="Choose a username"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required, rules.minLength]"
              hide-details="auto"
              class="nature-input"
            />
          </div>

          <div class="field-wrapper">
            <label class="field-label">Password</label>
            <v-text-field
              v-model="password"
              placeholder="Create a password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required, rules.minLength]"
              hide-details="auto"
              class="nature-input"
            />
          </div>

          <div class="field-wrapper">
            <label class="field-label">Confirm Password</label>
            <v-text-field
              v-model="confirmPassword"
              placeholder="Confirm your password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.required, rules.passwordMatch]"
              hide-details="auto"
              class="nature-input"
            />
          </div>
        </div>

        <v-alert
          v-if="authStore.error"
          type="error"
          variant="tonal"
          class="error-alert"
        >
          {{ authStore.error }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="authStore.loading"
          :disabled="!isFormValid"
          class="submit-btn"
        >
          <v-icon start>mdi-account-plus</v-icon>
          Create Account
        </v-btn>
      </v-form>

      <div class="card-footer">
        <span class="footer-text">Already have an account?</span>
        <router-link :to="{ name: 'login' }" class="footer-link">
          Sign In
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);

const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (v: string) => v.length >= 3 || 'Must be at least 3 characters',
  passwordMatch: (v: string) => v === password.value || 'Passwords do not match',
};

const isFormValid = computed(() => {
  return (
    username.value.length >= 3 &&
    password.value.length >= 3 &&
    password.value === confirmPassword.value
  );
});

async function handleRegister() {
  if (!isFormValid.value) return;

  const success = await authStore.register({ username: username.value, password: password.value });
  if (success) {
    router.push('/dashboard');
  }
}
</script>

<style scoped>
.register-view {
  width: 100%;
}

/* Mobile Brand */
.mobile-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

@media (min-width: 960px) {
  .mobile-brand {
    display: none;
  }
}

.mobile-brand .brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.mobile-brand .brand-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
}

/* Card */
.register-card {
  border-radius: 24px !important;
  padding: 36px;
  animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .register-card {
    animation: none;
  }
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 1.75rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1B4332 0%, #40916C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.v-theme--dark .card-title {
  background: linear-gradient(135deg, #74C69D 0%, #52B788 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  opacity: 0.6;
}

/* Form */
.register-form {
  margin-bottom: 24px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.field-wrapper {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  margin-bottom: 8px;
}

.nature-input :deep(.v-field) {
  border-radius: 12px;
}

.nature-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
}

.v-theme--dark .nature-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.15);
}

.error-alert {
  margin-bottom: 20px;
  border-radius: 12px;
}

.submit-btn {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 14px;
  height: 52px;
}

/* Footer */
.card-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(27, 67, 50, 0.08);
}

.v-theme--dark .card-footer {
  border-top-color: rgba(116, 198, 157, 0.1);
}

.footer-text {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  opacity: 0.6;
  margin-right: 6px;
}

.footer-link {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1B4332;
  text-decoration: none;
  transition: color 0.2s ease;
}

.v-theme--dark .footer-link {
  color: #74C69D;
}

.footer-link:hover {
  color: #40916C;
}

.v-theme--dark .footer-link:hover {
  color: #52B788;
}

/* Responsive */
@media (max-width: 600px) {
  .register-card {
    padding: 28px 24px;
  }

  .card-title {
    font-size: 1.5rem;
  }
}
</style>
