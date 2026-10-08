import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'

import AuthLayout from './features/auth/layouts/AuthLayout.vue'
import LoginPage from './features/auth/pages/LoginPage.vue'
import RegisterPage from './features/auth/pages/RegisterPage.vue'

import AucationLayout from './features/aucations/layouts/AucationLayout.vue'
import HomePage from './features/aucations/pages/HomePage.vue'
import DetailPage from './features/aucations/pages/DetailPage.vue'
import UsersPage from './features/users/pages/UsersPage.vue'
import ProfilePage from './features/users/pages/ProfilePage.vue'

import NotFoundPage from './features/common/pages/NotFoundPage.vue'

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
    component: AucationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomePage },
      { path: 'aucations/:aucationId', name: 'aucation-detail', component: DetailPage },
      { path: 'users', name: 'users', component: UsersPage },
      { path: 'profile', name: 'profile', component: ProfilePage },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
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
