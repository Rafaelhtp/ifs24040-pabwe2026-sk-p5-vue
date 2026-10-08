import { defineStore } from 'pinia'
import { authApi } from '../api/authApi.js'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper.js'
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    token: getAccessToken(),
    user: null,
  }),

  actions: {
    setUser(user) {
      this.user = user
    },

    setToken(token) {
      this.token = token
      putAccessToken(token)
    },

    async asyncLogin({ email, password }) {
      this.isAuthLogin = true
      try {
        const data = await authApi.login({ email, password })
        const token = data?.token || (typeof data === 'string' ? data : '')
        this.token = token
        putAccessToken(token)
        if (data?.user) {
          this.user = data.user
        }
        return { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        return { success: false, message: error.message }
      } finally {
        this.isAuthLogin = false
      }
    },

    async asyncRegister({ name, email, password }) {
      this.isAuthRegister = true
      try {
        const data = await authApi.register({ name, email, password })
        return { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        return { success: false, message: error.message }
      } finally {
        this.isAuthRegister = false
      }
    },

    async asyncLogout() {
      this.isAuthLogout = true
      try {
        this.token = ''
        this.user = null
        putAccessToken('')
        return { success: true }
      } finally {
        this.isAuthLogout = false
      }
    },
  },
})
