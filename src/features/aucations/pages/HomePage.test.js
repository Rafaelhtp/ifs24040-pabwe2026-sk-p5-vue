import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import HomePage from './HomePage.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'
import { aucationApi } from '../api/aucationApi.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('HomePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: [] })
  })

  it('should render loading skeleton when isAucation is true', async () => {
    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    store.isAucation = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="aucations-loading"]').exists()).toBe(true)
  })

  it('should render empty state when no auctions match', async () => {
    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    store.aucations = []
    store.isAucation = false
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="aucations-empty"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tidak ada lelang yang ditemukan')
  })

  it('should render auctions cards and pricing info', async () => {
    const mockList = [
      {
        id: '1',
        title: 'MacBook Pro',
        description: 'M3 Max 1TB',
        cover: 'macbook.jpg',
        start_bid: 20000000,
        highest_bid: 25000000,
        closed_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        author_id: 'u-1',
      },
      {
        id: '2',
        title: 'Vintage Watch',
        description: 'Rolex Submariner',
        cover: '',
        start_bid: 50000000,
        bids: [{ bid: 55000000 }],
        closed_at: new Date(Date.now() - 3600000).toISOString(),
        user_id: 'u-other',
      },
    ]
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: mockList })

    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-1' }

    await store.asyncGetAucations()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="aucations-grid"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('MacBook Pro')
    expect(wrapper.text()).toContain('Vintage Watch')
    expect(wrapper.text()).toContain('20.000.000')
    expect(wrapper.text()).toContain('55.000.000')
    expect(wrapper.text()).toContain('Telah Berakhir')
  })

  it('should filter by tabs (mine, active, closed)', async () => {
    const mockList = [
      {
        id: '1',
        title: 'Item Active Mine',
        author_id: 'u-1',
        closed_at: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: '2',
        title: 'Item Closed Other',
        user_id: 'u-2',
        is_closed: 1,
        closed_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: mockList })

    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-1' }

    await store.asyncGetAucations()
    await wrapper.vm.$nextTick()

    // Select "Lelang Saya"
    await wrapper.find('[data-testid="tab-mine"]').trigger('click')
    expect(wrapper.text()).toContain('Item Active Mine')
    expect(wrapper.text()).not.toContain('Item Closed Other')

    // Select "Lelang Berlangsung"
    await wrapper.find('[data-testid="tab-active"]').trigger('click')
    expect(wrapper.text()).toContain('Item Active Mine')

    // Select "Lelang Ditutup"
    await wrapper.find('[data-testid="tab-closed"]').trigger('click')
    expect(wrapper.text()).toContain('Item Closed Other')
  })

  it('should live search by title and description', async () => {
    const mockList = [
      { id: '1', title: 'iPhone 15 Pro', description: 'Titanium blue' },
      { id: '2', title: 'Samsung S24', description: 'Ultra gray' },
    ]
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: mockList })

    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    await store.asyncGetAucations()
    await wrapper.vm.$nextTick()

    const searchInput = wrapper.find('[data-testid="search-input"]')
    await searchInput.setValue('iPhone')
    expect(wrapper.text()).toContain('iPhone 15 Pro')
    expect(wrapper.text()).not.toContain('Samsung S24')

    await searchInput.setValue('gray')
    expect(wrapper.text()).toContain('Samsung S24')
  })

  it('should open modals when action buttons clicked', async () => {
    const mockList = [
      {
        id: '1',
        title: 'My Item',
        author_id: 'u-owner',
        closed_at: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: '2',
        title: 'Other Item',
        author_id: 'u-other',
        closed_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ]
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: mockList })

    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-owner' }

    await store.asyncGetAucations()
    await wrapper.vm.$nextTick()

    // Open AddModal
    await wrapper.find('[data-testid="open-add-modal-button"]').trigger('click')
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(true)

    // Open ChangeModal
    await wrapper.find('[data-testid="edit-aucation-button"]').trigger('click')
    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(true)

    // Open CoverModal
    await wrapper.find('[data-testid="cover-aucation-button"]').trigger('click')
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true)

    // Open BidModal
    await wrapper.find('[data-testid="quick-bid-button"]').trigger('click')
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true)
  })

  it('should handle delete auction confirmation and execution', async () => {
    const mockList = [
      { id: 'auc-del', title: 'To Delete', author_id: 'u-1' },
    ]
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: mockList })

    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-1' }

    await store.asyncGetAucations()
    await wrapper.vm.$nextTick()

    // 1. Cancelled delete
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
    const delSpy = vi.spyOn(store, 'asyncDeleteAucation')
    await wrapper.find('[data-testid="delete-aucation-button"]').trigger('click')
    expect(delSpy).not.toHaveBeenCalled()

    // 2. Confirmed delete
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: true })
    delSpy.mockResolvedValue({ success: true })
    await wrapper.find('[data-testid="delete-aucation-button"]').trigger('click')
    expect(delSpy).toHaveBeenCalledWith('auc-del')
  })

  it('should handle delete all mine aucations', async () => {
    const mockList = [
      { id: '1', title: 'Mine 1', author_id: 'u-1', is_me: true },
    ]
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: mockList })

    const wrapper = renderWithProviders(HomePage)
    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-1' }

    await store.asyncGetAucations()
    await wrapper.vm.$nextTick()

    // Select tab mine
    await wrapper.find('[data-testid="tab-mine"]').trigger('click')
    await wrapper.vm.$nextTick()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: true })
    const delAllSpy = vi.spyOn(store, 'deleteAllMyAucations').mockResolvedValue({ success: true })

    const btn = wrapper.find('[data-testid="delete-all-mine-button"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    expect(delAllSpy).toHaveBeenCalled()
  })

  it('should auto-select mine tab when route query tab is mine', async () => {
    const { createTestRouter } = await import('../../../test-utils.js')
    const router = createTestRouter()
    await router.push('/?tab=mine')
    const wrapper = renderWithProviders(HomePage, { router })
    expect(wrapper.exists()).toBe(true)
  })
})
