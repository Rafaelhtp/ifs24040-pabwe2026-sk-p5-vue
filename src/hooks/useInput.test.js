import { describe, it, expect } from 'vitest'
import { useInput } from './useInput.js'

describe('useInput', () => {
  it('should initialize with default value', () => {
    const [value] = useInput('initial')
    expect(value.value).toBe('initial')
  })

  it('should initialize with empty string by default', () => {
    const [value] = useInput()
    expect(value.value).toBe('')
  })

  it('should update value via onChange with DOM input event', () => {
    const [value, onChange] = useInput()
    onChange({ target: { value: 'from-event' } })
    expect(value.value).toBe('from-event')
  })

  it('should update value via onChange with raw value', () => {
    const [value, onChange] = useInput()
    onChange('raw-value')
    expect(value.value).toBe('raw-value')
  })

  it('should update value via setValue directly', () => {
    const [value, , setValue] = useInput()
    setValue('direct-value')
    expect(value.value).toBe('direct-value')
  })
})
