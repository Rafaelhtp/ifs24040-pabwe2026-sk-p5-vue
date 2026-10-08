import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from './usersStore.js'
import { userApi } from '../api/userApi.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('usersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue(true)
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should initialize with default states and allow setUser / setProfile', () => {
    const store = useUsersStore()
    expect(store.users).toEqual([])
    expect(store.user).toBeNull()
    expect(store.profile).toBeNull()

    store.setUser({ id: '1' })
    expect(store.user).toEqual({ id: '1' })

    store.setProfile({ id: 'me' })
    expect(store.profile).toEqual({ id: 'me' })
  })

  describe('asyncGetUsers', () => {
    it('should fetch users list when response has users property', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'getUsers').mockResolvedValue({ users: [{ id: '1' }] })

      const res = await store.asyncGetUsers()
      expect(res.success).toBe(true)
      expect(store.users).toEqual([{ id: '1' }])
      expect(store.isUsersLoading).toBe(false)
    })

    it('should fetch users list when response is array directly or empty', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'getUsers').mockResolvedValue([{ id: '2' }])

      let res = await store.asyncGetUsers()
      expect(res.success).toBe(true)
      expect(store.users).toEqual([{ id: '2' }])

      vi.spyOn(userApi, 'getUsers').mockResolvedValue(null)
      res = await store.asyncGetUsers()
      expect(store.users).toEqual([])
    })

    it('should handle error when fetching users', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'getUsers').mockRejectedValue(new Error('Failed to load users'))

      const res = await store.asyncGetUsers()
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Failed to load users')
      expect(store.isUsersLoading).toBe(false)
    })
  })

  describe('asyncGetMe', () => {
    it('should get authenticated user profile', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'getMe').mockResolvedValue({ user: { id: 'me', name: 'Delcom User' } })

      const res = await store.asyncGetMe()
      expect(res.success).toBe(true)
      expect(store.profile).toEqual({ id: 'me', name: 'Delcom User' })
      expect(store.isProfileLoading).toBe(false)
    })

    it('should get profile when response is directly the user object', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'getMe').mockResolvedValue({ id: 'me-direct' })

      const res = await store.asyncGetMe()
      expect(res.success).toBe(true)
      expect(store.profile).toEqual({ id: 'me-direct' })
    })

    it('should handle error in asyncGetMe', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'getMe').mockRejectedValue(new Error('Session expired'))

      const res = await store.asyncGetMe()
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Session expired')
      expect(store.isProfileLoading).toBe(false)
    })
  })

  describe('asyncUpdateMe', () => {
    it('should update profile and show success dialog', async () => {
      const store = useUsersStore()
      store.profile = { id: '1', name: 'Old' }
      vi.spyOn(userApi, 'updateMe').mockResolvedValue({ user: { id: '1', name: 'New' } })

      const res = await store.asyncUpdateMe({ name: 'New' })
      expect(res.success).toBe(true)
      expect(store.profile.name).toBe('New')
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isProfileUpdating).toBe(false)
    })

    it('should update profile using fallback merge if response has no user property', async () => {
      const store = useUsersStore()
      store.profile = { id: '1', name: 'Old', email: 'old@test.com' }
      vi.spyOn(userApi, 'updateMe').mockResolvedValue({})

      const res = await store.asyncUpdateMe({ name: 'Updated' })
      expect(res.success).toBe(true)
      expect(store.profile.name).toBe('Updated')
    })

    it('should handle error in asyncUpdateMe', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'updateMe').mockRejectedValue(new Error('Update failed'))

      const res = await store.asyncUpdateMe({ name: 'Fail' })
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Update failed')
      expect(store.isProfileUpdating).toBe(false)
    })
  })

  describe('asyncUpdatePhoto', () => {
    it('should upload photo successfully', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'updatePhoto').mockResolvedValue({ user: { id: '1', photo: 'photo.jpg' } })

      const file = new File([''], 'photo.jpg')
      const res = await store.asyncUpdatePhoto(file)
      expect(res.success).toBe(true)
      expect(store.profile).toEqual({ id: '1', photo: 'photo.jpg' })
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isPhotoUpdating).toBe(false)
    })

    it('should fallback photo update when response has no user property', async () => {
      const store = useUsersStore()
      store.profile = { id: '1' }
      vi.spyOn(userApi, 'updatePhoto').mockResolvedValue(null)

      const file = new File([''], 'photo.jpg')
      const res = await store.asyncUpdatePhoto(file)
      expect(res.success).toBe(true)
    })

    it('should handle error in asyncUpdatePhoto', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'updatePhoto').mockRejectedValue(new Error('Photo size too large'))

      const file = new File([''], 'large.jpg')
      const res = await store.asyncUpdatePhoto(file)
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Photo size too large')
      expect(store.isPhotoUpdating).toBe(false)
    })
  })

  describe('asyncUpdatePassword', () => {
    it('should update password successfully', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'updatePassword').mockResolvedValue({ message: 'Success' })

      const res = await store.asyncUpdatePassword({ old_password: '1', new_password: '2' })
      expect(res.success).toBe(true)
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isPasswordUpdating).toBe(false)
    })

    it('should handle error in asyncUpdatePassword', async () => {
      const store = useUsersStore()
      vi.spyOn(userApi, 'updatePassword').mockRejectedValue(new Error('Wrong old password'))

      const res = await store.asyncUpdatePassword({ old_password: 'wrong', new_password: '2' })
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Wrong old password')
      expect(store.isPasswordUpdating).toBe(false)
    })
  })
})
