import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../../test-utils.js'
import AuthLayout from './AuthLayout.vue'

describe('AuthLayout', () => {
  it('should render the brand title and layout elements', () => {
    const wrapper = renderWithProviders(AuthLayout)
    expect(wrapper.text()).toContain('Delcom Auction')
    expect(wrapper.text()).toContain('Dapatkan Penawaran Terbaik')
  })
})
