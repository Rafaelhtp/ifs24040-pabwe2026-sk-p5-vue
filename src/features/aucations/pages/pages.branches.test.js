import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { renderWithProviders, createTestRouter, createMockPinia } from '../../../test-utils.js'
import DetailPage from './DetailPage.vue'
import HomePage from './HomePage.vue'
import AddModal from '../modals/AddModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import BidModal from '../modals/BidModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { aucationApi } from '../api/aucationApi.js'

// MarkdownViewer is lazy-loaded (defineAsyncComponent). Stub it here so the real
// module (and toast-ui) is only loaded by MarkdownViewer.test.js; otherwise it
// races with test teardown and makes coverage non-deterministic in CI.
vi.mock('../components/MarkdownViewer.vue', async () => {
  const { h } = await import('vue')
  return {
    __esModule: true,
    default: {
      name: 'MarkdownViewer',
      props: { content: { type: String, default: '' } },
      render() {
        return h('div', { 'data-testid': 'toast-ui-viewer' }, this.content)
      },
    },
  }
})

describe('DetailPage - modals & computed fallbacks', () => {
  let router
  beforeEach(async () => {
    vi.restoreAllMocks()
    createMockPinia()
    vi.spyOn(useAucationsStore(), 'asyncGetAucationById').mockResolvedValue({ success: true })
    router = createTestRouter()
    await router.push('/aucations/auc-1')
  })

  it('opens cover modal from button and closes every modal via close event', async () => {
    const wrapper = renderWithProviders(DetailPage, { router })
    const store = useAucationsStore()
    store.aucation = { id: 'auc-1', title: 'T', is_me: true, bids: [] }
    await flushPromises()

    const coverBtn = wrapper.findAll('button').find((b) => b.text().includes('Ganti Foto Sampul'))
    await coverBtn.trigger('click')
    expect(wrapper.findComponent(ChangeCoverModal).props('isOpen')).toBe(true)

    wrapper.findComponent(ChangeCoverModal).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(ChangeCoverModal).props('isOpen')).toBe(false)

    wrapper.findComponent(ChangeModal).vm.$emit('close')
    wrapper.findComponent(BidModal).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(ChangeModal).props('isOpen')).toBe(false)
    expect(wrapper.findComponent(BidModal).props('isOpen')).toBe(false)
  })

  it('computed values are safe when aucation is null', async () => {
    const wrapper = renderWithProviders(DetailPage, { router })
    const store = useAucationsStore()
    store.aucation = null
    await flushPromises()
    expect(wrapper.vm.isOwner).toBe(false)
    expect(wrapper.vm.isClosed).toBe(false)
    expect(wrapper.vm.bidHistory).toEqual([])
    expect(wrapper.vm.highestBidAmount).toBe(0)
    expect(wrapper.vm.currentUserId).toBe('')
    expect(wrapper.vm.hasMyBid).toBe(false)
  })

  it('isOwner / isClosed / highestBidAmount cover remaining branches', async () => {
    const wrapper = renderWithProviders(DetailPage, { router })
    const store = useAucationsStore()
    const auth = useAuthStore()

    store.aucation = { id: 'a', is_me: true }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isOwner).toBe(true)

    store.aucation = { id: 'a', start_bid: 1000 }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isOwner).toBe(false)
    expect(wrapper.vm.isClosed).toBe(false) // no is_closed and no closed_at
    expect(wrapper.vm.highestBidAmount).toBe(1000)

    store.aucation = { id: 'a' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.highestBidAmount).toBe(0) // no start_bid

    store.aucation = { id: 'a', highest_bid: 7000 }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.highestBidAmount).toBe(7000)

    auth.user = { id: 'u1' }
    store.aucation = { id: 'a', user_id: 'u1' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isOwner).toBe(true)
    store.aucation = { id: 'a', user_id: 'other' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isOwner).toBe(false)
  })

  it('uses profile id, bid user_id and index key fallbacks', async () => {
    const wrapper = renderWithProviders(DetailPage, { router })
    const store = useAucationsStore()
    useAuthStore().user = null
    useUsersStore().profile = { id: 'p1' }
    store.aucation = {
      id: 'a',
      author_id: 'p1',
      start_bid: 1000,
      bids: [
        { bid: 1500, user: { id: 'zzz' } }, // uses user?.id fallback
        { bid: 2000, user_id: 'p1' }, // no id -> key falls back to idx
      ],
    }
    await flushPromises()
    expect(wrapper.vm.currentUserId).toBe('p1')
    expect(wrapper.vm.isOwner).toBe(true)
    expect(wrapper.vm.hasMyBid).toBe(true)
    expect(wrapper.find('[data-testid="bid-history-list"]').exists()).toBe(true)
  })
})

describe('HomePage - modals & computed fallbacks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: [] })
  })

  it('closes every modal via close event', async () => {
    const wrapper = renderWithProviders(HomePage)
    await flushPromises()
    wrapper.vm.isAddModalOpen = true
    wrapper.vm.isChangeModalOpen = true
    wrapper.vm.isCoverModalOpen = true
    wrapper.vm.isBidModalOpen = true
    await wrapper.vm.$nextTick()

    for (const comp of [AddModal, ChangeModal, ChangeCoverModal, BidModal]) {
      wrapper.findComponent(comp).vm.$emit('close')
    }
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(AddModal).props('isOpen')).toBe(false)
    expect(wrapper.findComponent(ChangeModal).props('isOpen')).toBe(false)
    expect(wrapper.findComponent(ChangeCoverModal).props('isOpen')).toBe(false)
    expect(wrapper.findComponent(BidModal).props('isOpen')).toBe(false)
  })

  it('getHighestBid treats invalid bid as 0', async () => {
    const wrapper = renderWithProviders(HomePage)
    await flushPromises()
    expect(wrapper.vm.getHighestBid({ bids: [{ bid: undefined }, { bid: 5 }] })).toBe(5)
    expect(wrapper.vm.getHighestBid({ bids: [{ bid: 'x' }] })).toBe(0)
  })

  it('currentUserId falls back to profile id then empty string', async () => {
    const wrapper = renderWithProviders(HomePage)
    await flushPromises()
    useAuthStore().user = null
    useUsersStore().profile = null
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.currentUserId).toBe('')
    useUsersStore().profile = { id: 'p9' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.currentUserId).toBe('p9')
  })

  it('filteredAucations tolerates null aucations', async () => {
    const wrapper = renderWithProviders(HomePage)
    await flushPromises()
    useAucationsStore().aucations = null
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.filteredAucations).toEqual([])
  })
})
