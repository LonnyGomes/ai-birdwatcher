import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, guestGuard } from './guards';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      beforeEnter: authGuard,
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'sightings',
          name: 'sightings',
          component: () => import('@/views/sightings/SightingsListView.vue'),
        },
        {
          path: 'sightings/:id',
          name: 'sighting-detail',
          component: () => import('@/views/sightings/SightingDetailView.vue'),
        },
        {
          path: 'birds',
          name: 'birds',
          component: () => import('@/views/birds/BirdsDirectoryView.vue'),
        },
        {
          path: 'birds/:id',
          name: 'bird-profile',
          component: () => import('@/views/birds/BirdProfileView.vue'),
        },
        {
          path: 'videos',
          name: 'videos',
          component: () => import('@/views/videos/VideosListView.vue'),
        },
        {
          path: 'videos/upload',
          name: 'video-upload',
          component: () => import('@/views/videos/VideoUploadView.vue'),
        },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      beforeEnter: guestGuard,
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
