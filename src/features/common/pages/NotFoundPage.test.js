import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import NotFoundPage from './NotFoundPage.vue'

describe('NotFoundPage', () => {
  it('should render 404 and back to home button', () => {
    const wrapper = renderWithProviders(NotFoundPage)
    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Halaman Tidak Ditemukan')
    expect(wrapper.find('[data-testid="back-home-button"]').exists()).toBe(true)
  })
})
