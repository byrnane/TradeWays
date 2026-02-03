import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
    { path: '/auth', name: 'Auth', component: () => import('../views/AuthView.vue') },
    { path: '/auth/callback', name: 'AuthCallback', component: () => import('../views/AuthCallbackView.vue') },
    { path: '/calculators', name: 'Calculators', component: () => import('../views/CalculatorsView.vue') },
    { path: '/settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
  ]
})

export default router
