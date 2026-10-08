import { describe, it, expect } from 'vitest'
import { renderWithProviders } from './test-utils.js'
import App from './App.vue'

describe('App', () => {
  it('should render App and RouterView component properly', () => {
    const wrapper = renderWithProviders(App)
    expect(wrapper.exists()).toBe(true)
  })
})
