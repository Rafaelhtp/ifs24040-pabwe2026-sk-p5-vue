import { describe, it, expect } from 'vitest'
import { renderWithProviders, createTestRouter } from '../../../test-utils.js'
import SidebarComponent from './SidebarComponent.vue'

describe('SidebarComponent', () => {
  it('should render navigation links', () => {
    const wrapper = renderWithProviders(SidebarComponent, {
      props: { isOpen: false },
    })

    expect(wrapper.text()).toContain('Dashboard Lelang')
    expect(wrapper.text()).toContain('Lelang Saya')
    expect(wrapper.text()).toContain('Daftar Pengguna')
    expect(wrapper.text()).toContain('Profil Saya')
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false)
  })

  it('should render mobile backdrop when isOpen is true and emit close on click', async () => {
    const wrapper = renderWithProviders(SidebarComponent, {
      props: { isOpen: true },
    })

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]')
    expect(backdrop.exists()).toBe(true)

    await backdrop.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close on close button click and on link clicks', async () => {
    const wrapper = renderWithProviders(SidebarComponent, {
      props: { isOpen: true },
    })

    const closeBtn = wrapper.find('[data-testid="close-sidebar-button"]')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()

    const links = wrapper.findAll('a')
    for (const link of links) {
      await link.trigger('click')
    }
    expect(wrapper.emitted('close').length).toBeGreaterThanOrEqual(4)
  })

  it('should compute active tab correctly based on route', async () => {
    const router = createTestRouter()
    await router.push('/?tab=mine')
    const wrapper = renderWithProviders(SidebarComponent, {
      props: { isOpen: false },
      router,
    })
    expect(wrapper.text()).toContain('Lelang Saya')
  })

  it('should compute active users and profile route correctly', async () => {
    const routerUsers = createTestRouter()
    await routerUsers.push('/users')
    const wrapperUsers = renderWithProviders(SidebarComponent, {
      router: routerUsers,
    })
    expect(wrapperUsers.text()).toContain('Daftar Pengguna')

    const routerProfile = createTestRouter()
    await routerProfile.push('/profile')
    const wrapperProfile = renderWithProviders(SidebarComponent, {
      router: routerProfile,
    })
    expect(wrapperProfile.text()).toContain('Profil Saya')
  })
})
