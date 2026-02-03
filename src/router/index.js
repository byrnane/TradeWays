import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
    { path: '/auth', name: 'Auth', component: () => import('../views/AuthView.vue') },
    { path: '/auth/callback', name: 'AuthCallback', component: () => import('../views/AuthCallbackView.vue') },
    { path: '/calculators', name: 'Calculators', component: () => import('../views/CalculatorsView.vue') },
    { path: '/settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
    { path: '/profiles', name: 'Profiles', component: () => import('../views/ProfilesView.vue') },
  ]
})

export default router
