import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import AddModal from './AddModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('AddModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should not render content when isOpen is false', () => {
    const wrapper = renderWithProviders(AddModal, {
      props: { isOpen: false },
    })
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false)
  })

  it('should render content and emit close on cancel/close button', async () => {
    const wrapper = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(true)

    await wrapper.find('[data-testid="close-add-modal"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should validate form and show error dialog when fields are empty', async () => {
    const wrapper = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Judul lelang wajib diisi')
    expect(wrapper.text()).toContain('Harga awal harus lebih dari Rp 0')
    expect(wrapper.text()).toContain('Waktu penutupan lelang wajib diisi')
    expect(wrapper.text()).toContain('Deskripsi lelang wajib diisi')
    expect(toolsHelper.showErrorDialog).toHaveBeenCalled()
  })

  it('should submit successfully, emit success and close', async () => {
    const wrapper = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })
    const store = useAucationsStore()
    vi.spyOn(store, 'asyncCreateAucation').mockResolvedValue({ success: true, data: { id: 'new-1' } })

    await wrapper.find('input#add-title').setValue('Vintage Camera')
    await wrapper.find('input#add-start-bid').setValue(500000)
    await wrapper.find('input#add-closed-at').setValue('2026-12-31T23:59')

    // Find MarkdownEditor component and emit update:modelValue
    const editor = wrapper.findComponent({ name: 'MarkdownEditor' })
    if (editor.exists()) {
      editor.vm.$emit('update:modelValue', 'Kamera antik dalam kondisi mulus.')
    }

    await wrapper.find('form').trigger('submit.prevent')

    expect(store.asyncCreateAucation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Vintage Camera',
        start_bid: 500000,
        description: 'Kamera antik dalam kondisi mulus.',
      })
    )
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not emit success if asyncCreateAucation fails', async () => {
    const wrapper = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })
    const store = useAucationsStore()
    vi.spyOn(store, 'asyncCreateAucation').mockResolvedValue({ success: false })

    await wrapper.find('input#add-title').setValue('Vintage Camera')
    await wrapper.find('input#add-start-bid').setValue(500000)
    await wrapper.find('input#add-closed-at').setValue('2026-12-31T23:59')
    const editor = wrapper.findComponent({ name: 'MarkdownEditor' })
    if (editor.exists()) {
      editor.vm.$emit('update:modelValue', 'Kamera antik')
    }

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('success')).toBeFalsy()
  })
})
