import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getAccessToken, putAccessToken, fetchWithAuth } from './apiHelper.js'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getAccessToken and putAccessToken', () => {
    it('should return empty string when token is not set', () => {
      expect(getAccessToken()).toBe('')
    })

    it('should store and retrieve token', () => {
      putAccessToken('my-secret-token')
      expect(getAccessToken()).toBe('my-secret-token')
      expect(localStorage.getItem('accessToken')).toBe('my-secret-token')
      expect(localStorage.getItem('token')).toBe('my-secret-token')
    })

    it('should fallback to "token" key if accessToken is missing', () => {
      localStorage.setItem('token', 'fallback-token')
      expect(getAccessToken()).toBe('fallback-token')
    })

    it('should remove token when putAccessToken is called with falsy value', () => {
      putAccessToken('test-token')
      expect(getAccessToken()).toBe('test-token')
      putAccessToken(null)
      expect(getAccessToken()).toBe('')
      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should handle undefined localStorage safely', () => {
      const originalStorage = globalThis.localStorage
      // @ts-ignore
      delete globalThis.localStorage

      expect(getAccessToken()).toBe('')
      expect(() => putAccessToken('token')).not.toThrow()

      globalThis.localStorage = originalStorage
    })
  })

  describe('fetchWithAuth', () => {
    it('should fetch with relative path using baseUrl and include token if present', async () => {
      putAccessToken('auth-token-123')

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true, data: { result: 'ok' } }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const res = await fetchWithAuth('/test-endpoint')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token-123',
          }),
        })
      )
      expect(res).toEqual({ success: true, data: { result: 'ok' } })
    })

    it('should fetch with absolute url directly', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await fetchWithAuth('https://api.external.com/items')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.external.com/items',
        expect.any(Object)
      )
    })

    it('should append params to url query string and ignore falsy params', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await fetchWithAuth('http://example.com/items', {
        params: {
          page: 1,
          search: 'laptop',
          filter: '',
          empty: null,
          notDef: undefined,
        },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://example.com/items?page=1&search=laptop',
        expect.any(Object)
      )
    })

    it('should serialize object body to JSON and set Content-Type', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const bodyObj = { name: 'Item 1' }
      await fetchWithAuth('/items', {
        method: 'POST',
        body: bodyObj,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(bodyObj),
        })
      )
    })

    it('should not alter FormData body and not overwrite existing Content-Type', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const formData = new FormData()
      formData.append('file', 'test')

      await fetchWithAuth('/upload', {
        method: 'POST',
        body: formData,
      })

      const callArgs = global.fetch.mock.calls[0][1]
      expect(callArgs.body).toBe(formData)
      expect(callArgs.headers['Content-Type']).toBeUndefined()
    })

    it('should not overwrite existing Authorization header', async () => {
      putAccessToken('stored-token')
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await fetchWithAuth('/test', {
        headers: {
          Authorization: 'Bearer custom-token',
        },
      })

      const callArgs = global.fetch.mock.calls[0][1]
      expect(callArgs.headers.Authorization).toBe('Bearer custom-token')
    })

    it('should throw error when response.ok is false', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(fetchWithAuth('/login')).rejects.toThrow('Invalid credentials')
    })

    it('should fallback to statusText or default message on error when json parsing fails or lacks message', async () => {
      const mockResponse1 = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: vi.fn().mockRejectedValue(new Error('JSON Parse error')),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse1)

      await expect(fetchWithAuth('/error')).rejects.toThrow('Server Error')

      const mockResponse2 = {
        ok: false,
        status: 500,
        statusText: '',
        json: vi.fn().mockResolvedValue({}),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse2)

      await expect(fetchWithAuth('/error-default')).rejects.toThrow('Terjadi kesalahan pada permintaan')
    })

    it('should work without leading slash in relative url and without DELCOM_BASEURL', async () => {
      const originalBase = globalThis.DELCOM_BASEURL
      delete globalThis.DELCOM_BASEURL

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await fetchWithAuth('no-leading-slash')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://open-api.delcom.org/api/v1/no-leading-slash',
        expect.any(Object)
      )

      globalThis.DELCOM_BASEURL = originalBase
    })
  })
})
