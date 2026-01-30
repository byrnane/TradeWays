import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
    { path: '/auth', name: 'Auth', component: () => import('../views/AuthView.vue') },
    { path: '/auth/callback', name: 'AuthCallback', component: () => import('../views/AuthCallbackView.vue') },
    { path: '/market', name: 'Market', component: () => import('../views/MarketView.vue') },
  ]
})

export default router
