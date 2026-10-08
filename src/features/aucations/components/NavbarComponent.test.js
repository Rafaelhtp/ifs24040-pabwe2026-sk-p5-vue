import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import NavbarComponent from './NavbarComponent.vue'
import { useAuthStore } from '../../auth/states/authStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
  })

  it('should render brand and user info with fallback initial', async () => {
    const wrapper = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    authStore.user = { name: 'Alice', email: 'alice@delcom.org' }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Delcom Auction')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@delcom.org')
    expect(wrapper.text()).toContain('A')
  })

  it('should render user photo when available', async () => {
    const wrapper = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    authStore.user = { name: 'Bob', email: 'bob@test.com', photo: 'avatar.jpg' }
    await wrapper.vm.$nextTick()

    const img = wrapper.find('img[alt="Bob"]')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('avatar.jpg')
  })

  it('should emit toggle-sidebar event when hamburger button is clicked', async () => {
    const wrapper = renderWithProviders(NavbarComponent)
    const btn = wrapper.find('[data-testid="toggle-sidebar-button"]')
    await btn.trigger('click')

    expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
  })

  it('should not logout when confirm dialog is cancelled', async () => {
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
    const wrapper = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'asyncLogout')

    await wrapper.find('[data-testid="logout-button"]').trigger('click')
    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled()
    expect(logoutSpy).not.toHaveBeenCalled()
  })

  it('should perform logout and redirect when confirm dialog is accepted', async () => {
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: true })
    const pushMock = vi.fn()
    const routerMock = { push: pushMock }

    const wrapper = renderWithProviders(NavbarComponent, {
      global: {
        mocks: {
          $router: routerMock,
        },
      },
    })

    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'asyncLogout').mockResolvedValue({ success: true })

    await wrapper.find('[data-testid="logout-button"]').trigger('click')
    expect(logoutSpy).toHaveBeenCalled()
  })
})
