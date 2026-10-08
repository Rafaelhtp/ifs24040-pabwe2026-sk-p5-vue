import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import BidModal from './BidModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('BidModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should not render when isOpen is false', () => {
    const wrapper = renderWithProviders(BidModal, {
      props: { isOpen: false, aucation: null },
    })
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false)
  })

  it('should render benchmark bid from highest_bid or bids array or start_bid', async () => {
    // 1. start_bid only
    const wrapper1 = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', start_bid: 100000 },
      },
    })
    expect(wrapper1.find('[data-testid="current-bid-display"]').text()).toContain('100.000')

    // 2. bids array
    const wrapper2 = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: {
          id: 'auc-2',
          start_bid: 100000,
          bids: [{ bid: 150000 }, { bid: 200000 }],
        },
      },
    })
    expect(wrapper2.find('[data-testid="current-bid-display"]').text()).toContain('200.000')

    // 3. highest_bid property
    const wrapper3 = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-3', start_bid: 100000, highest_bid: 250000 },
      },
    })
    expect(wrapper3.find('[data-testid="current-bid-display"]').text()).toContain('250.000')
  })

  it('should increment bid amount via quick increment buttons', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', start_bid: 100000 },
      },
    })

    const buttons = wrapper.findAll('button[type="button"]')
    // increment buttons
    const inc10k = buttons.find((b) => b.text().includes('+10'))
    const inc50k = buttons.find((b) => b.text().includes('+50'))
    const inc100k = buttons.find((b) => b.text().includes('+100'))

    const initialVal = Number(wrapper.find('input#bid-input').element.value)

    await inc10k.trigger('click')
    expect(Number(wrapper.find('input#bid-input').element.value)).toBe(initialVal + 10000)

    await inc50k.trigger('click')
    expect(Number(wrapper.find('input#bid-input').element.value)).toBe(initialVal + 10000 + 50000)

    await inc100k.trigger('click')
    expect(Number(wrapper.find('input#bid-input').element.value)).toBe(initialVal + 10000 + 50000 + 100000)
  })

  it('should emit close on close button click', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', start_bid: 100000 },
      },
    })

    await wrapper.find('[data-testid="close-bid-modal"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should validate bid amount is positive and higher than benchmark', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', start_bid: 100000 },
      },
    })

    const input = wrapper.find('input#bid-input')

    // Empty or 0
    await input.setValue(0)
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Nominal tawaran wajib diisi dan harus lebih dari 0')
    expect(toolsHelper.showErrorDialog).toHaveBeenCalled()

    // Less or equal to start_bid
    await input.setValue(100000)
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Tawaran harus lebih tinggi dari')
  })

  it('should submit valid bid successfully and emit success and close', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', start_bid: 100000 },
      },
    })

    const store = useAucationsStore()
    vi.spyOn(store, 'asyncCreateBid').mockResolvedValue({ success: true, data: { id: 'bid-1' } })

    const input = wrapper.find('input#bid-input')
    await input.setValue(150000)
    await wrapper.find('form').trigger('submit.prevent')

    expect(store.asyncCreateBid).toHaveBeenCalledWith('auc-1', { bid: 150000 })
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not emit success if asyncCreateBid fails', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', start_bid: 100000 },
      },
    })

    const store = useAucationsStore()
    vi.spyOn(store, 'asyncCreateBid').mockResolvedValue({ success: false })

    const input = wrapper.find('input#bid-input')
    await input.setValue(150000)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('success')).toBeFalsy()
  })
})
