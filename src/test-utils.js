import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

export function createMockPinia(initialState = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  if (initialState && typeof initialState === 'object') {
    pinia.state.value = { ...initialState }
  }
  return pinia
}

export function createTestRouter(routes = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes.length > 0 ? routes : [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/auth/login', component: { template: '<div>Login</div>' } },
      { path: '/auth/register', component: { template: '<div>Register</div>' } },
      { path: '/aucations/:aucationId', component: { template: '<div>Detail</div>' } },
      { path: '/users', component: { template: '<div>Users</div>' } },
      { path: '/profile', component: { template: '<div>Profile</div>' } },
      { path: '/:pathMatch(.*)*', component: { template: '<div>NotFound</div>' } },
    ],
  })
}

export function renderWithProviders(Component, options = {}) {
  const {
    initialState,
    routes,
    pinia = createMockPinia(initialState),
    router = createTestRouter(routes),
    props = {},
    slots = {},
    global = {},
    ...rest
  } = options

  const mergedGlobal = {
    ...global,
    plugins: [pinia, router, ...(global.plugins || [])],
    stubs: {
      RouterLink: {
        template: '<a :href="to"><slot /></a>',
        props: ['to'],
      },
      RouterView: {
        template: '<div><slot /></div>',
      },
      ...(global.stubs || {}),
    },
  }

  return mount(Component, {
    props,
    slots,
    global: mergedGlobal,
    ...rest,
  })
}
