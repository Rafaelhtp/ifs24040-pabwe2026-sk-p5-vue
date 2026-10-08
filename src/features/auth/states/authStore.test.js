import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore.js'
import { authApi } from '../api/authApi.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'
import * as apiHelper from '../../../helpers/apiHelper.js'

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should initialize with default states', () => {
    const store = useAuthStore()
    expect(store.isAuthLogin).toBe(false)
    expect(store.isAuthRegister).toBe(false)
    expect(store.isAuthLogout).toBe(false)
    expect(store.user).toBeNull()
  })

  it('should setUser and setToken properly', () => {
    const store = useAuthStore()
    const putTokenSpy = vi.spyOn(apiHelper, 'putAccessToken')

    store.setUser({ id: 'u-1', name: 'Delcom User' })
    expect(store.user).toEqual({ id: 'u-1', name: 'Delcom User' })

    store.setToken('new-token-123')
    expect(store.token).toBe('new-token-123')
    expect(putTokenSpy).toHaveBeenCalledWith('new-token-123')
  })

  describe('asyncLogin', () => {
    it('should login successfully with object containing token and user', async () => {
      const store = useAuthStore()
      const mockData = {
        token: 'login-token-xyz',
        user: { id: 'u-10', name: 'John Doe' },
      }
      vi.spyOn(authApi, 'login').mockResolvedValue(mockData)
      const putTokenSpy = vi.spyOn(apiHelper, 'putAccessToken')

      const res = await store.asyncLogin({ email: 'test@delcom.org', password: 'secret' })
      expect(res.success).toBe(true)
      expect(res.data).toEqual(mockData)
      expect(store.token).toBe('login-token-xyz')
      expect(store.user).toEqual({ id: 'u-10', name: 'John Doe' })
      expect(putTokenSpy).toHaveBeenCalledWith('login-token-xyz')
      expect(store.isAuthLogin).toBe(false)
    })

    it('should login successfully with string token and without user', async () => {
      const store = useAuthStore()
      vi.spyOn(authApi, 'login').mockResolvedValue('direct-string-token')

      const res = await store.asyncLogin({ email: 'test@delcom.org', password: 'secret' })
      expect(res.success).toBe(true)
      expect(store.token).toBe('direct-string-token')
      expect(store.isAuthLogin).toBe(false)
    })

    it('should login successfully with empty object and default empty token', async () => {
      const store = useAuthStore()
      vi.spyOn(authApi, 'login').mockResolvedValue({})

      const res = await store.asyncLogin({ email: 'test@delcom.org', password: 'secret' })
      expect(res.success).toBe(true)
      expect(store.token).toBe('')
    })

    it('should handle login error gracefully', async () => {
      const store = useAuthStore()
      vi.spyOn(authApi, 'login').mockRejectedValue(new Error('Invalid email or password'))

      const res = await store.asyncLogin({ email: 'wrong@delcom.org', password: 'bad' })
      expect(res.success).toBe(false)
      expect(res.message).toBe('Invalid email or password')
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Invalid email or password')
      expect(store.isAuthLogin).toBe(false)
    })
  })

  describe('asyncRegister', () => {
    it('should register successfully', async () => {
      const store = useAuthStore()
      const mockData = { user: { id: 'u-20', name: 'Newbie' } }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockData)

      const res = await store.asyncRegister({
        name: 'Newbie',
        email: 'new@delcom.org',
        password: 'pass',
      })
      expect(res.success).toBe(true)
      expect(res.data).toEqual(mockData)
      expect(store.isAuthRegister).toBe(false)
    })

    it('should handle register error gracefully', async () => {
      const store = useAuthStore()
      vi.spyOn(authApi, 'register').mockRejectedValue(new Error('Email already registered'))

      const res = await store.asyncRegister({
        name: 'Newbie',
        email: 'exists@delcom.org',
        password: 'pass',
      })
      expect(res.success).toBe(false)
      expect(res.message).toBe('Email already registered')
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Email already registered')
      expect(store.isAuthRegister).toBe(false)
    })
  })

  describe('asyncLogout', () => {
    it('should clear token and user on logout', async () => {
      const store = useAuthStore()
      store.token = 'existing-token'
      store.user = { id: '1' }
      const putTokenSpy = vi.spyOn(apiHelper, 'putAccessToken')

      const res = await store.asyncLogout()
      expect(res.success).toBe(true)
      expect(store.token).toBe('')
      expect(store.user).toBeNull()
      expect(putTokenSpy).toHaveBeenCalledWith('')
      expect(store.isAuthLogout).toBe(false)
    })
  })
})
