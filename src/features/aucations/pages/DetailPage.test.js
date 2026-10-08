import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createTestRouter } from '../../../test-utils.js'
import DetailPage from './DetailPage.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('DetailPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
  })

  it('should render loading state when isAucation is true and no aucation', async () => {
    const router = createTestRouter()
    await router.push('/aucations/auc-1')
    const wrapper = renderWithProviders(DetailPage, { router })

    const store = useAucationsStore()
    store.isAucation = true
    store.aucation = null
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="detail-loading"]').exists()).toBe(true)
  })

  it('should render not found state when aucation is null and not loading', async () => {
    const router = createTestRouter()
    await router.push('/aucations/auc-not-found')
    const wrapper = renderWithProviders(DetailPage, { router })

    const store = useAucationsStore()
    store.isAucation = false
    store.aucation = null
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="detail-not-found"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Lelang Tidak Ditemukan')
  })

  it('should render auction details, cover, description, and bid history', async () => {
    const router = createTestRouter()
    await router.push('/aucations/auc-1')
    const wrapper = renderWithProviders(DetailPage, { router })

    const store = useAucationsStore()
    store.aucation = {
      id: 'auc-1',
      title: 'Luxury Watch',
      description: 'Rolex Daytona',
      cover: 'https://example.com/watch.jpg',
      start_bid: 100000000,
      closed_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
      bids: [
        { id: 'b1', bid: 110000000, user: { name: 'Bidder A' }, created_at: new Date().toISOString() },
        { id: 'b2', bid: 120000000, user: { name: 'Bidder B' }, created_at: new Date().toISOString() },
      ],
      user_id: 'u-other',
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="detail-content"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Luxury Watch')
    expect(wrapper.text()).toContain('120.000.000')
    expect(wrapper.find('[data-testid="large-cover-img"]').attributes('src')).toBe('https://example.com/watch.jpg')
    expect(wrapper.find('[data-testid="bid-history-list"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Bidder B')
    expect(wrapper.text()).toContain('Tertinggi')
  })

  it('should handle owner controls (edit, cover, delete)', async () => {
    const router = createTestRouter()
    await router.push('/aucations/auc-1')
    const wrapper = renderWithProviders(DetailPage, { router })

    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-owner' }

    store.aucation = {
      id: 'auc-1',
      title: 'My Laptop',
      start_bid: 1000,
      author_id: 'u-owner',
      closed_at: new Date(Date.now() + 86400000).toISOString(),
    }
    await wrapper.vm.$nextTick()

    // Owner edit button
    const editBtn = wrapper.find('[data-testid="owner-edit-btn"]')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')
    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(true)

    // Owner cover button
    const coverBtn = wrapper.find('[data-testid="owner-cover-btn"]')
    expect(coverBtn.exists()).toBe(true)
    await coverBtn.trigger('click')
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true)

    // Owner delete button (cancel)
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
    const delSpy = vi.spyOn(store, 'asyncDeleteAucation')
    await wrapper.find('[data-testid="owner-delete-btn"]').trigger('click')
    expect(delSpy).not.toHaveBeenCalled()

    // Owner delete button (confirm)
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: true })
    delSpy.mockResolvedValue({ success: true })
    await wrapper.find('[data-testid="owner-delete-btn"]').trigger('click')
    expect(delSpy).toHaveBeenCalledWith('auc-1')
  })

  it('should handle non-owner place bid and cancel bid actions', async () => {
    const router = createTestRouter()
    await router.push('/aucations/auc-2')
    const wrapper = renderWithProviders(DetailPage, { router })

    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-bidder' }

    store.aucation = {
      id: 'auc-2',
      title: 'Camera',
      start_bid: 5000,
      author_id: 'u-other',
      closed_at: new Date(Date.now() + 86400000).toISOString(),
      bids: [
        { id: 'b-me', bid: 6000, user_id: 'u-bidder' },
      ],
    }
    await wrapper.vm.$nextTick()

    // Place bid button opens BidModal
    const placeBidBtn = wrapper.find('[data-testid="place-bid-button"]')
    expect(placeBidBtn.exists()).toBe(true)
    await placeBidBtn.trigger('click')
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(true)

    // Cancel bid button (cancelled)
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: false })
    const cancelBidSpy = vi.spyOn(store, 'asyncDeleteBid')
    const cancelBidBtn = wrapper.find('[data-testid="cancel-bid-button"]')
    expect(cancelBidBtn.exists()).toBe(true)
    await cancelBidBtn.trigger('click')
    expect(cancelBidSpy).not.toHaveBeenCalled()

    // Cancel bid button (confirmed)
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue({ isConfirmed: true })
    cancelBidSpy.mockResolvedValue({ success: true })
    await cancelBidBtn.trigger('click')
    expect(cancelBidSpy).toHaveBeenCalledWith('auc-2')
  })

  it('should handle auction without closed_at or bids and user_id owner check', async () => {
    const router = createTestRouter()
    await router.push('/aucations/auc-3')
    const wrapper = renderWithProviders(DetailPage, { router })

    const store = useAucationsStore()
    const authStore = useAuthStore()
    authStore.user = { id: 'u-creator' }

    store.aucation = {
      id: 'auc-3',
      title: 'No Closed At Item',
      start_bid: 1000,
      user_id: 'u-creator',
      closed_at: null,
      bids: null,
    }
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No Closed At Item')
  })
})
