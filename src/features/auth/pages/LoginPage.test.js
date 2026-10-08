import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import LoginPage from './LoginPage.vue'
import { useAuthStore } from '../states/authStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue(true)
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should render form fields correctly', () => {
    const wrapper = renderWithProviders(LoginPage)
    expect(wrapper.find('input#login-email-input').exists()).toBe(true)
    expect(wrapper.find('input#login-password-input').exists()).toBe(true)
    expect(wrapper.find('button#login-submit-button').exists()).toBe(true)
    expect(wrapper.find('button#login-submit-button').text()).toContain('Masuk')
  })

  it('should show validation error when fields are empty', async () => {
    const wrapper = renderWithProviders(LoginPage)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      'Silakan periksa kembali formulir yang Anda isi',
      'Form Tidak Valid'
    )
  })

  it('should show validation error for invalid email and short password', async () => {
    const wrapper = renderWithProviders(LoginPage)

    const emailInput = wrapper.find('input#login-email-input')
    await emailInput.setValue('invalid-email')

    const passwordInput = wrapper.find('input#login-password-input')
    await passwordInput.setValue('123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Format email tidak valid')
    expect(wrapper.text()).toContain('Kata sandi minimal 6 karakter')
  })

  it('should call asyncLogin and redirect on successful submission', async () => {
    const pushMock = vi.fn()
    const routerMock = {
      push: pushMock,
      currentRoute: { value: { path: '/auth/login' } },
    }

    const wrapper = renderWithProviders(LoginPage, {
      global: {
        mocks: {
          $router: routerMock,
        },
      },
    })

    const authStore = useAuthStore()
    vi.spyOn(authStore, 'asyncLogin').mockResolvedValue({ success: true })

    await wrapper.find('input#login-email-input').setValue('user@example.com')
    await wrapper.find('input#login-password-input').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(authStore.asyncLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
  })

  it('should not redirect if asyncLogin fails', async () => {
    const pushMock = vi.fn()
    const routerMock = {
      push: pushMock,
    }

    const wrapper = renderWithProviders(LoginPage, {
      global: {
        mocks: {
          $router: routerMock,
        },
      },
    })

    const authStore = useAuthStore()
    vi.spyOn(authStore, 'asyncLogin').mockResolvedValue({ success: false })

    await wrapper.find('input#login-email-input').setValue('user@example.com')
    await wrapper.find('input#login-password-input').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(authStore.asyncLogin).toHaveBeenCalled()
    expect(toolsHelper.showSuccessDialog).not.toHaveBeenCalled()
  })
})
