import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import ChangeModal from './ChangeModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('ChangeModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should not render content when isOpen is false', () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: { isOpen: false, aucation: null },
    })
    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(false)
  })

  it('should render prefilled fields when isOpen is true and aucation prop provided', () => {
    const sampleAucation = {
      id: 'auc-1',
      title: 'iPad Pro M4',
      start_bid: 15000000,
      closed_at: '2026-11-20T10:00:00.000Z',
      description: 'iPad M4 Mulus',
    }

    const wrapper = renderWithProviders(ChangeModal, {
      props: { isOpen: true, aucation: sampleAucation },
    })

    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(true)
    const titleInput = wrapper.find('input#change-title')
    expect(titleInput.element.value).toBe('iPad Pro M4')
  })

  it('should emit close on close button click', async () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', title: 'Test', start_bid: 100, closed_at: '2026-11-20T10:00:00.000Z', description: 'desc' },
      },
    })

    await wrapper.find('[data-testid="close-change-modal"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should validate form and show error dialog when fields are empty', async () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        aucation: { id: 'auc-1', title: '', start_bid: 0, closed_at: '', description: '' },
      },
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Judul lelang wajib diisi')
    expect(wrapper.text()).toContain('Harga awal harus lebih dari Rp 0')
    expect(wrapper.text()).toContain('Waktu penutupan lelang wajib diisi')
    expect(wrapper.text()).toContain('Deskripsi lelang wajib diisi')
    expect(toolsHelper.showErrorDialog).toHaveBeenCalled()
  })

  it('should submit updated data successfully, emit success and close', async () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        aucation: {
          id: 'auc-1',
          title: 'Old Title',
          start_bid: 500000,
          closed_at: '2026-11-20T10:00:00.000Z',
          description: 'Old Description',
        },
      },
    })

    const store = useAucationsStore()
    vi.spyOn(store, 'asyncUpdateAucation').mockResolvedValue({ success: true, data: { id: 'auc-1' } })

    await wrapper.find('input#change-title').setValue('New Title')
    await wrapper.find('input#change-start-bid').setValue(600000)
    await wrapper.find('input#change-closed-at').setValue('2026-12-01T15:00')

    const editor = wrapper.findComponent({ name: 'MarkdownEditor' })
    if (editor.exists()) {
      editor.vm.$emit('update:modelValue', 'Updated Description Content')
    }

    await wrapper.find('form').trigger('submit.prevent')

    expect(store.asyncUpdateAucation).toHaveBeenCalledWith(
      'auc-1',
      expect.objectContaining({
        title: 'New Title',
        start_bid: 600000,
        description: 'Updated Description Content',
      })
    )
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not emit success if asyncUpdateAucation fails', async () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        aucation: {
          id: 'auc-1',
          title: 'Title',
          start_bid: 500000,
          closed_at: '2026-11-20T10:00:00.000Z',
          description: 'Desc',
        },
      },
    })

    const store = useAucationsStore()
    vi.spyOn(store, 'asyncUpdateAucation').mockResolvedValue({ success: false })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('success')).toBeFalsy()
  })
})
