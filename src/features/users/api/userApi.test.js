import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  userApi,
  getUsers,
  getMe,
  updateMe,
  updatePhoto,
  updatePassword,
} from './userApi.js'
import * as apiHelper from '../../../helpers/apiHelper.js'

describe('userApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should call GET /users', async () => {
    const mockData = { users: [{ id: '1', name: 'Alice' }] }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await getUsers()
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/users')
    expect(res).toEqual(mockData)

    const resObj = await userApi.getUsers()
    expect(resObj).toEqual(mockData)
  })

  it('should call GET /users/me', async () => {
    const mockData = { user: { id: '1', name: 'Alice' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await getMe()
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/users/me')
    expect(res).toEqual(mockData)

    const resObj = await userApi.getMe()
    expect(resObj).toEqual(mockData)
  })

  it('should call PUT /users/me with payload', async () => {
    const mockData = { user: { id: '1', name: 'Alice Updated' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await updateMe({ name: 'Alice Updated' })
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: { name: 'Alice Updated' },
    })
    expect(res).toEqual(mockData)

    const resObj = await userApi.updateMe({ name: 'Alice Updated' })
    expect(resObj).toEqual(mockData)
  })

  it('should call POST /users/me/photo with File or FormData', async () => {
    const mockData = { user: { id: '1', photo: 'avatar.jpg' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const mockFile = new File(['dummy'], 'profile.png', { type: 'image/png' })
    const res = await updatePhoto(mockFile)
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/users/me/photo', {
      method: 'POST',
      body: expect.any(FormData),
    })
    expect(res).toEqual(mockData)

    const mockFormData = new FormData()
    mockFormData.append('photo', mockFile)
    const res2 = await userApi.updatePhoto(mockFormData)
    expect(res2).toEqual(mockData)
  })

  it('should call PUT /users/me/password with payload', async () => {
    const mockData = { message: 'Password updated' }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const payload = { old_password: '123', new_password: '456' }
    const res = await updatePassword(payload)
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/users/me/password', {
      method: 'PUT',
      body: payload,
    })
    expect(res).toEqual(mockData)

    const resObj = await userApi.updatePassword(payload)
    expect(resObj).toEqual(mockData)
  })
})
