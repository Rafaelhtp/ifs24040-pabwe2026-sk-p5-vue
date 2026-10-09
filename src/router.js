import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'

// Halaman auth di-import statis (bukan lazy) supaya halaman login tidak
// menunggu rantai request: main.js -> chunk layout -> chunk login.
import AuthLayout from './features/auth/layouts/AuthLayout.vue'
import LoginPage from './features/auth/pages/LoginPage.vue'
import RegisterPage from './features/auth/pages/RegisterPage.vue'

export const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      { path: 'login', name: 'login', component: LoginPage },
      { path: 'register', name: 'register', component: RegisterPage },
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