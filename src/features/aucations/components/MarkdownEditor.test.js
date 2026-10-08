import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import MarkdownEditor from './MarkdownEditor.vue'
import Editor from '@toast-ui/editor'

let mockChangeCallback = null
const mockSetMarkdown = vi.fn()
const mockGetMarkdown = vi.fn().mockReturnValue('Initial markdown')
const mockDestroy = vi.fn()

vi.mock('@toast-ui/editor', () => {
  const MockEditor = vi.fn().mockImplementation(function (options) {
    if (options && options.events && options.events.change) {
      mockChangeCallback = options.events.change
    }
    return {
      getMarkdown: mockGetMarkdown,
      setMarkdown: mockSetMarkdown,
      destroy: mockDestroy,
    }
  })
  MockEditor.factory = vi.fn()
  return {
    default: MockEditor,
  }
})

describe('MarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangeCallback = null
  })

  it('should initialize Editor instance on mount', () => {
    const wrapper = renderWithProviders(MarkdownEditor, {
      props: {
        modelValue: 'Hello world',
        height: '400px',
      },
    })

    expect(Editor).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: 'Hello world',
        height: '400px',
      })
    )
    expect(wrapper.find('[data-testid="toast-ui-editor"]').exists()).toBe(true)
  })

  it('should emit update:modelValue when editor content changes', () => {
    const wrapper = renderWithProviders(MarkdownEditor, {
      props: { modelValue: 'Text' },
    })

    expect(mockChangeCallback).toBeTruthy()
    mockGetMarkdown.mockReturnValue('Updated text')
    mockChangeCallback()

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Updated text'])
  })

  it('should update editor content when modelValue prop changes', async () => {
    const wrapper = renderWithProviders(MarkdownEditor, {
      props: { modelValue: 'Text 1' },
    })

    mockGetMarkdown.mockReturnValue('Text 1')
    await wrapper.setProps({ modelValue: 'Text 2' })

    expect(mockSetMarkdown).toHaveBeenCalledWith('Text 2')
  })

  it('should destroy editor instance on unmount', () => {
    const wrapper = renderWithProviders(MarkdownEditor, {
      props: { modelValue: 'Text' },
    })

    wrapper.unmount()
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('should handle constructor error gracefully', () => {
    vi.mocked(Editor).mockImplementationOnce(() => {
      throw new Error('Editor init error')
    })

    expect(() => {
      renderWithProviders(MarkdownEditor)
    }).not.toThrow()
  })
})
