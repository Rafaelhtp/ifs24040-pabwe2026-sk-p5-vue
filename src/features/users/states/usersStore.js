import { defineStore } from 'pinia'
import { userApi } from '../api/userApi.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'
import { useAuthStore } from '../../auth/states/authStore.js'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    user: null,
    profile: null,
    isUsersLoading: false,
    isProfileLoading: false,
    isProfileUpdating: false,
    isPhotoUpdating: false,
    isPasswordUpdating: false,
  }),

  actions: {
    setUser(user) {
      this.user = user
    },

    setProfile(profile) {
      this.profile = profile
    },

    async asyncGetUsers() {
      this.isUsersLoading = true
      let result
      try {
        const data = await userApi.getUsers()
        const usersList = (data && data.users) ? data.users : (Array.isArray(data) ? data : [])
        this.users = usersList
        result = { success: true, data: usersList }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isUsersLoading = false
      }
      return result
    },

    async asyncGetMe() {
      this.isProfileLoading = true
      let result
      try {
        const data = await userApi.getMe()
        const userObj = (data && data.user) ? data.user : data
        this.profile = userObj
        const authStore = useAuthStore()
        authStore.setUser(userObj)
        result = { success: true, data: userObj }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isProfileLoading = false
      }
      return result
    },

    async asyncUpdateMe(payload) {
      this.isProfileUpdating = true
      let result
      try {
        const data = await userApi.updateMe(payload)
        const updated = (data && data.user) ? data.user : { ...this.profile, ...payload }
        this.profile = updated
        const authStore = useAuthStore()
        authStore.setUser(updated)
        showSuccessDialog('Profil berhasil diperbarui!', 'Berhasil')
        result = { success: true, data: updated }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isProfileUpdating = false
      }
      return result
    },

    async asyncUpdatePhoto(photoFile) {
      this.isPhotoUpdating = true
      let result
      try {
        const data = await userApi.updatePhoto(photoFile)
        const updated = (data && data.user) ? data.user : (data || this.profile)
        this.profile = updated
        const authStore = useAuthStore()
        authStore.setUser(updated)
        showSuccessDialog('Foto profil berhasil diperbarui!', 'Berhasil')
        result = { success: true, data: updated }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isPhotoUpdating = false
      }
      return result
    },

    async asyncUpdatePassword(payload) {
      this.isPasswordUpdating = true
      let result
      try {
        const data = await userApi.updatePassword(payload)
        showSuccessDialog('Kata sandi berhasil diperbarui!', 'Berhasil')
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isPasswordUpdating = false
      }
      return result
    },
  },
})
