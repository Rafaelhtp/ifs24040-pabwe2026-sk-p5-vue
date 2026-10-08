import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import MarkdownViewer from './MarkdownViewer.vue'
import Editor from '@toast-ui/editor'

const mockSetMarkdown = vi.fn()
const mockDestroy = vi.fn()

vi.mock('@toast-ui/editor', () => {
  const MockEditor = vi.fn()
  MockEditor.factory = vi.fn().mockImplementation(() => ({
    setMarkdown: mockSetMarkdown,
    destroy: mockDestroy,
  }))
  return {
    default: MockEditor,
  }
})

describe('MarkdownViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize Viewer instance via Editor.factory on mount', () => {
    const wrapper = renderWithProviders(MarkdownViewer, {
      props: {
        content: '# Test Title\nParagraph here.',
      },
    })

    expect(Editor.factory).toHaveBeenCalledWith(
      expect.objectContaining({
        viewer: true,
        initialValue: '# Test Title\nParagraph here.',
      })
    )
    expect(wrapper.find('[data-testid="toast-ui-viewer"]').exists()).toBe(true)
  })

  it('should update content when content prop changes', async () => {
    const wrapper = renderWithProviders(MarkdownViewer, {
      props: { content: 'Content 1' },
    })

    await wrapper.setProps({ content: 'Content 2' })
    expect(mockSetMarkdown).toHaveBeenCalledWith('Content 2')
  })

  it('should destroy viewer instance on unmount', () => {
    const wrapper = renderWithProviders(MarkdownViewer, {
      props: { content: 'Content' },
    })

    wrapper.unmount()
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('should handle factory error gracefully', () => {
    vi.mocked(Editor.factory).mockImplementationOnce(() => {
      throw new Error('Viewer factory error')
    })

    expect(() => {
      renderWithProviders(MarkdownViewer)
    }).not.toThrow()
  })
})
