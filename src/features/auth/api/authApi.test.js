import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi, login, register } from './authApi.js'
import * as apiHelper from '../../../helpers/apiHelper.js'

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should call fetchWithAuth with POST /auth/login and payload', async () => {
      const mockData = { token: 'sample-jwt-token' }
      vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({
        success: true,
        data: mockData,
      })

      const result = await login({ email: 'test@example.com', password: 'password123' })
      expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      })
      expect(result).toEqual(mockData)
    })

    it('should work via authApi.login object', async () => {
      const mockData = { token: 'obj-token' }
      vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({
        success: true,
        data: mockData,
      })

      const result = await authApi.login({ email: 'obj@example.com', password: 'secret' })
      expect(result).toEqual(mockData)
    })
  })

  describe('register', () => {
    it('should call fetchWithAuth with POST /auth/register and payload', async () => {
      const mockData = { user: { id: 'u-1', name: 'User' } }
      vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({
        success: true,
        data: mockData,
      })

      const result = await register({
        name: 'User',
        email: 'user@example.com',
        password: 'password123',
      })
      expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        body: {
          name: 'User',
          email: 'user@example.com',
          password: 'password123',
        },
      })
      expect(result).toEqual(mockData)
    })

    it('should work via authApi.register object', async () => {
      const mockData = { user: { id: 'u-2' } }
      vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({
        success: true,
        data: mockData,
      })

      const result = await authApi.register({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockData)
    })
  })
})
