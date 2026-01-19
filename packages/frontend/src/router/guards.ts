import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth to be initialized
  if (!authStore.initialized) {
    await authStore.fetchCurrentUser();
  }

  if (!authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
}

export async function guestGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth to be initialized
  if (!authStore.initialized) {
    await authStore.fetchCurrentUser();
  }

  if (authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
}
