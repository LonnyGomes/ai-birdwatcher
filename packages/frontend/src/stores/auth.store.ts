import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/auth.service';
import type { UserSafe } from '@shared/types/user.types';
import type { LoginCredentials, RegisterData } from '@/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserSafe | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem('auth_token', response.token);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.register(data);
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem('auth_token', response.token);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) {
      initialized.value = true;
      return;
    }
    try {
      user.value = await authService.getCurrentUser();
    } catch (err) {
      // Token invalid, clear auth
      logout();
    } finally {
      initialized.value = true;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  return {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser,
  };
});
