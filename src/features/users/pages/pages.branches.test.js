import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { renderWithProviders, createMockPinia } from '../../../test-utils.js'
import ProfilePage from './ProfilePage.vue'
import UsersPage from './UsersPage.vue'
import { useUsersStore } from '../states/usersStore.js'
import { userApi } from '../api/userApi.js'

describe('ProfilePage - fallbacks & loading labels', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    createMockPinia()
    const store = useUsersStore()
    vi.spyOn(store, 'asyncGetMe').mockResolvedValue({ success: true })
  })

  it('falls back to empty inputs when profile has no name/email', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    useUsersStore().profile = { id: 'u1' }
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input[type="email"]').element.value).toBe('')
  })

  it('shows saving labels for profile and password updates', async () => {
    const wrapper = renderWithProviders(ProfilePage)
    const store = useUsersStore()
    store.profile = { name: 'A', email: 'a@a.com' }
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Simpan Profil')
    expect(wrapper.text()).toContain('Perbarui Kata Sandi')

    store.isProfileUpdating = true
    store.isPasswordUpdating = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Menyimpan...')
    expect(wrapper.text()).not.toContain('Simpan Profil')
    expect(wrapper.text()).not.toContain('Perbarui Kata Sandi')
  })
})

describe('UsersPage - avatar fallback', () => {
  it('uses avatar when photo is missing', async () => {
    vi.restoreAllMocks()
    vi.spyOn(userApi, 'getUsers').mockResolvedValue({ users: [] })
    const wrapper = renderWithProviders(UsersPage)
    await flushPromises()
    useUsersStore().users = [{ id: '9', name: 'Avatar User', email: 'x@x.com', avatar: 'avatar.png' }]
    await wrapper.vm.$nextTick()
    expect(wrapper.find('img[src="avatar.png"]').exists()).toBe(true)
  })
})
