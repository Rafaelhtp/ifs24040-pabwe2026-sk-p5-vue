import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia } from '../../../test-utils.js'
import AucationLayout from './AucationLayout.vue'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'

describe('AucationLayout', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should render navbar, sidebar and main content', () => {
    const wrapper = renderWithProviders(AucationLayout)
    expect(wrapper.findComponent({ name: 'NavbarComponent' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SidebarComponent' }).exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('should toggle sidebar when navbar emits toggle-sidebar', async () => {
    const wrapper = renderWithProviders(AucationLayout)
    const navbar = wrapper.findComponent({ name: 'NavbarComponent' })
    const sidebar = wrapper.findComponent({ name: 'SidebarComponent' })

    expect(sidebar.props('isOpen')).toBe(false)
    await navbar.vm.$emit('toggle-sidebar')
    expect(sidebar.props('isOpen')).toBe(true)

    await sidebar.vm.$emit('close')
    expect(sidebar.props('isOpen')).toBe(false)
  })

  it('should fetch user profile on mount if token is present and profile is not loaded', async () => {
    const pinia = createMockPinia({
      auth: { token: 'valid-token', user: null, isAuthLogin: false, isAuthRegister: false, isAuthLogout: false },
      users: { profile: null, users: [], user: null, isUsersLoading: false, isProfileLoading: false, isProfileUpdating: false, isPhotoUpdating: false, isPasswordUpdating: false },
    })

    const usersStore = useUsersStore(pinia)
    const getMeSpy = vi.spyOn(usersStore, 'asyncGetMe').mockResolvedValue({ success: true })

    renderWithProviders(AucationLayout, { pinia })
    expect(getMeSpy).toHaveBeenCalled()
  })
})
