import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import LoginPage from './LoginPage.vue'
import RegisterPage from './RegisterPage.vue'
import { useAuthStore } from '../states/authStore.js'

describe('Auth pages - loading states', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('LoginPage shows loading label while logging in', async () => {
    const wrapper = renderWithProviders(LoginPage)
    expect(wrapper.find('#login-submit-button').text()).toBe('Masuk')
    useAuthStore().isAuthLogin = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#login-submit-button').text()).toContain('Memproses...')
    expect(wrapper.find('#login-submit-button span.animate-spin').exists()).toBe(true)
  })

  it('RegisterPage shows loading label while registering', async () => {
    const wrapper = renderWithProviders(RegisterPage)
    expect(wrapper.find('#register-submit-button').text()).toBe('Daftar')
    useAuthStore().isAuthRegister = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#register-submit-button').text()).toContain('Mendaftar...')
    expect(wrapper.find('#register-submit-button span.animate-spin').exists()).toBe(true)
  })
})
