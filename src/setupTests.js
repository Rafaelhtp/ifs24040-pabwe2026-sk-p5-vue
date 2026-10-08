import '@testing-library/jest-dom'

// Mock localStorage for Node 26 / jsdom compatibility
const store = new Map()
const localStorageMock = {
  getItem: (key) => store.get(String(key)) ?? null,
  setItem: (key, val) => store.set(String(key), String(val)),
  removeItem: (key) => store.delete(String(key)),
  clear: () => store.clear(),
  get length() {
    return store.size
  },
  key: (i) => Array.from(store.keys())[i] ?? null,
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  })

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })

  // Mock window.scrollTo
  window.scrollTo = () => {}
}

if (typeof document !== 'undefined') {
  document.elementFromPoint = () => null
}
