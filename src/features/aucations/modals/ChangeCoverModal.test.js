import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import ChangeCoverModal from './ChangeCoverModal.vue'
import { useAucationsStore } from '../states/aucationsStore.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('ChangeCoverModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('should not render when isOpen is false', () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: false, aucationId: '1' },
    })
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false)
  })

  it('should render and show currentCover when no new file is chosen', () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: {
        isOpen: true,
        aucationId: 'auc-1',
        currentCover: 'https://example.com/cover.jpg',
      },
    })

    const previewImg = wrapper.find('[data-testid="cover-preview"]')
    expect(previewImg.exists()).toBe(true)
    expect(previewImg.attributes('src')).toBe('https://example.com/cover.jpg')
  })

  it('should handle live preview when file is selected', async () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: true, aucationId: 'auc-1' },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const mockFile = new File(['image'], 'test.png', { type: 'image/png' })

    // Change with no file
    Object.defineProperty(fileInput.element, 'files', {
      value: [],
      writable: true,
      configurable: true,
    })
    await fileInput.trigger('change')
    expect(global.URL.createObjectURL).not.toHaveBeenCalled()

    // Change with file
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: true,
    })
    await fileInput.trigger('change')

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile)
    const previewImg = wrapper.find('[data-testid="cover-preview"]')
    expect(previewImg.attributes('src')).toBe('blob:mock-url')

    // Change with second file
    const secondFile = new File(['image2'], 'test2.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', {
      value: [secondFile],
      writable: true,
      configurable: true,
    })
    await fileInput.trigger('change')
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should emit close on close button and revoke blob url', async () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: true, aucationId: 'auc-1' },
    })

    const fileInput = wrapper.find('input[type="file"]')
    const mockFile = new File(['image'], 'test.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: true,
    })
    await fileInput.trigger('change')

    await wrapper.find('[data-testid="close-cover-modal"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should validate file presence on submit', async () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: true, aucationId: 'auc-1' },
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Silakan pilih berkas gambar terlebih dahulu')
    expect(toolsHelper.showErrorDialog).toHaveBeenCalled()
  })

  it('should submit successfully with selected file and emit success and close', async () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: true, aucationId: 'auc-1' },
    })

    const store = useAucationsStore()
    vi.spyOn(store, 'asyncUpdateAucationCover').mockResolvedValue({ success: true, data: { cover: 'new.jpg' } })

    const fileInput = wrapper.find('input[type="file"]')
    const mockFile = new File(['image'], 'test.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: true,
    })
    await fileInput.trigger('change')

    await wrapper.find('form').trigger('submit.prevent')

    expect(store.asyncUpdateAucationCover).toHaveBeenCalledWith('auc-1', mockFile)
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not emit success if asyncUpdateAucationCover fails', async () => {
    const wrapper = renderWithProviders(ChangeCoverModal, {
      props: { isOpen: true, aucationId: 'auc-1' },
    })

    const store = useAucationsStore()
    vi.spyOn(store, 'asyncUpdateAucationCover').mockResolvedValue({ success: false })

    const fileInput = wrapper.find('input[type="file"]')
    const mockFile = new File(['image'], 'test.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: true,
    })
    await fileInput.trigger('change')

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('success')).toBeFalsy()
  })
})
