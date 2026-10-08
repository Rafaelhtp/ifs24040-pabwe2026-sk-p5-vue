import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import RegisterPage from './RegisterPage.vue'
import { useAuthStore } from '../states/authStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue(true)
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should render all register form inputs', () => {
    const wrapper = renderWithProviders(RegisterPage)
    expect(wrapper.find('input#name').exists()).toBe(true)
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('input#confirmPassword').exists()).toBe(true)
  })

  it('should validate empty fields on submit', async () => {
    const wrapper = renderWithProviders(RegisterPage)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Nama lengkap wajib diisi')
    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
    expect(wrapper.text()).toContain('Konfirmasi kata sandi wajib diisi')
    expect(toolsHelper.showErrorDialog).toHaveBeenCalled()
  })

  it('should validate invalid name, email, password length, and password mismatch', async () => {
    const wrapper = renderWithProviders(RegisterPage)

    await wrapper.find('input#name').setValue('A')
    await wrapper.find('input#email').setValue('not-an-email')
    await wrapper.find('input#password').setValue('123')
    await wrapper.find('input#confirmPassword').setValue('1234')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Nama minimal 2 karakter')
    expect(wrapper.text()).toContain('Format email tidak valid')
    expect(wrapper.text()).toContain('Kata sandi minimal 6 karakter')
    expect(wrapper.text()).toContain('Konfirmasi kata sandi tidak cocok')
  })

  it('should submit successfully and redirect to /auth/login', async () => {
    const pushMock = vi.fn()
    const routerMock = {
      push: pushMock,
    }

    const wrapper = renderWithProviders(RegisterPage, {
      global: {
        mocks: {
          $router: routerMock,
        },
      },
    })

    const authStore = useAuthStore()
    vi.spyOn(authStore, 'asyncRegister').mockResolvedValue({ success: true })

    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#confirmPassword').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(authStore.asyncRegister).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
  })

  it('should not redirect if asyncRegister fails', async () => {
    const pushMock = vi.fn()
    const routerMock = {
      push: pushMock,
    }

    const wrapper = renderWithProviders(RegisterPage, {
      global: {
        mocks: {
          $router: routerMock,
        },
      },
    })

    const authStore = useAuthStore()
    vi.spyOn(authStore, 'asyncRegister').mockResolvedValue({ success: false })

    await wrapper.find('input#name').setValue('John Doe')
    await wrapper.find('input#email').setValue('john@example.com')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('input#confirmPassword').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(authStore.asyncRegister).toHaveBeenCalled()
    expect(toolsHelper.showSuccessDialog).not.toHaveBeenCalled()
  })
})
