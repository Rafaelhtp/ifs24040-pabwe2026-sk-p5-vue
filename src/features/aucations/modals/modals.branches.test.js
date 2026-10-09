import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import AddModal from './AddModal.vue'
import BidModal from './BidModal.vue'
import ChangeCoverModal from './ChangeCoverModal.vue'
import ChangeModal from './ChangeModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('Modals - loading states & fallbacks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('AddModal shows loading label while creating', async () => {
    const wrapper = renderWithProviders(AddModal, { props: { isOpen: true } })
    expect(wrapper.text()).toContain('Terbitkan Lelang')
    useAucationsStore().isAucationAdd = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Membuat...')
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)
  })

  it('BidModal shows loading label while sending bid', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: { isOpen: true, aucation: { id: 'a1', start_bid: 1000 } },
    })
    expect(wrapper.text()).toContain('Kirim Tawaran')
    useAucationsStore().isBidAdd = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Mengirim...')
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)
  })

  it('BidModal handles null aucation when open', () => {
    const wrapper = renderWithProviders(BidModal, {
      props: { isOpen: true, aucation: null },
    })
    expect(wrapper.find('[data-testid="current-bid-display"]').text()).toContain('0')
  })

  it('BidModal treats invalid bid values in bids array as 0', () => {
    const wrapper = renderWithProviders(BidModal, {
      props: {
        isOpen: true,
        aucation: { id: 'a1', start_bid: 5000, bids: [{ bid: undefined }, { bid: 'abc' }] },
      },
    })
    // highest bid resolves to 0, so benchmark falls back to start_bid
    expect(wrapper.find('[data-testid="current-bid-display"]').text()).toContain('5.000')
  })

  it('BidModal increment falls back to benchmark when amount is empty', async () => {
    const wrapper = renderWithProviders(BidModal, {
      props: { isOpen: true, aucation: { id: 'a1', start_bid: 100000 } },
    })
    await wrapper.find('input[type="number"]').setValue('')
    const incBtn = wrapper.findAll('button').find((b) => b.text().includes('+10 Ribu'))
    await incBtn.trigger('click')
    expect(Number(wrapper.find('input[type="number"]').element.value)).toBe(110000)
  })

  it('ChangeCoverModal shows loading label while uploading', async () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: true, aucation: { id: 'a1', title: 'T' } },
    })
    expect(wrapper.text()).toContain('Unggah Cover')
    useAucationsStore().isAucationChangeCover = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Mengunggah...')
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)
  })

  it('ChangeModal shows loading label, emits close on Batal, tolerates invalid date', async () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        aucation: { id: 'a1', title: 'T', description: 'D', start_bid: 1000, closed_at: 'not-a-date' },
      },
    })
    expect(wrapper.find('input#change-closed-at, input[type="datetime-local"]').element.value).toBe('')

    useAucationsStore().isAucationChange = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Menyimpan...')
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)

    const cancel = wrapper.findAll('button').find((b) => b.text() === 'Batal')
    await cancel.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
