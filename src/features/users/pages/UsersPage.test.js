import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import UsersPage from './UsersPage.vue'
import { useUsersStore } from '../states/usersStore.js'
import { userApi } from '../api/userApi.js'

describe('UsersPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(userApi, 'getUsers').mockResolvedValue({ users: [] })
  })

  it('should fetch users on mount and render users list', async () => {
    const mockUsers = [
      { id: '1', name: 'Alice Smith', email: 'alice@example.com', photo: 'alice.jpg' },
      { id: '2', name: 'Bob Jones', email: 'bob@example.com' },
      { id: '3', name: '', email: 'no-name@example.com' },
    ]
    vi.spyOn(userApi, 'getUsers').mockResolvedValue({ users: mockUsers })

    const wrapper = renderWithProviders(UsersPage)
    const store = useUsersStore()
    await store.asyncGetUsers()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Daftar Pengguna')
    expect(wrapper.text()).toContain('Alice Smith')
    expect(wrapper.text()).toContain('Bob Jones')
    expect(wrapper.find('[data-testid="users-grid"]').exists()).toBe(true)
  })

  it('should display loading skeleton when isUsersLoading is true', async () => {
    const wrapper = renderWithProviders(UsersPage)
    const store = useUsersStore()
    store.isUsersLoading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(true)
  })

  it('should display empty state when user list is empty', async () => {
    const wrapper = renderWithProviders(UsersPage)
    const store = useUsersStore()
    store.users = []
    store.isUsersLoading = false
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tidak ada pengguna ditemukan')
  })

  it('should filter users by search query', async () => {
    const mockUsers = [
      { id: '1', name: 'Alice Walker', email: 'alice@test.com' },
      { id: '2', name: 'Bob Dylan', email: 'bob@music.com' },
    ]
    vi.spyOn(userApi, 'getUsers').mockResolvedValue({ users: mockUsers })

    const wrapper = renderWithProviders(UsersPage)
    const store = useUsersStore()
    await store.asyncGetUsers()
    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('Dylan')

    expect(wrapper.text()).toContain('Bob Dylan')
    expect(wrapper.text()).not.toContain('Alice Walker')

    await searchInput.setValue('alice@test.com')
    expect(wrapper.text()).toContain('Alice Walker')
  })
})
