import { ref } from 'vue'

export function useInput(defaultValue = '') {
  const value = ref(defaultValue)

  const onChange = (eventOrValue) => {
    if (eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue) {
      value.value = eventOrValue.target.value
    } else {
      value.value = eventOrValue
    }
  }

  const setValue = (newValue) => {
    value.value = newValue
  }

  return [value, onChange, setValue]
}
