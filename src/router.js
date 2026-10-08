import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'

export const routes = [
  {
    path: '/auth',
    component: () => import('./features/auth/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      { path: 'login', name: 'login', component: () => import('./features/auth/pages/LoginPage.vue') },
      { path: 'register', name: 'register', component: () => import('./features/auth/pages/RegisterPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('./features/aucations/layouts/AucationLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: () => import('./features/aucations/pages/HomePage.vue') },
      { path: 'aucations/:aucationId', name: 'aucation-detail', component: () => import('./features/aucations/pages/DetailPage.vue') },
      { path: 'users', name: 'users', component: () => import('./features/users/pages/UsersPage.vue') },
      { path: 'profile', name: 'profile', component: () => import('./features/users/pages/ProfilePage.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./features/common/pages/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = getAccessToken()
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const isGuestOnly = to.matched.some((record) => record.meta?.guestOnly)

  if (requiresAuth && !token) {
    next({ path: '/auth/login' })
  } else if (isGuestOnly && token) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
