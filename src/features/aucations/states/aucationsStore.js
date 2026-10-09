import { defineStore } from 'pinia'
import { aucationApi } from '../api/aucationApi.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

export const useAucationsStore = defineStore('aucations', {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucation: false,

    isAucationAdd: false,
    isAucationAdded: false,

    isAucationChange: false,
    isAucationChanged: false,

    isAucationChangeCover: false,
    isAucationChangedCover: false,

    isAucationDelete: false,
    isAucationDeleted: false,

    isBidAdd: false,
    isBidAdded: false,

    isBidDelete: false,
    isBidDeleted: false,

    isAucationDeleteAll: false,
    isAucationDeletedAll: false,
  }),

  actions: {
    setAucation(aucation) {
      this.aucation = aucation
    },

    setAucations(aucations) {
      this.aucations = aucations
    },

    async asyncGetAucations(params = {}) {
      this.isAucation = true
      let result
      try {
        const data = await aucationApi.getAucations(params)
        const fallbackList = Array.isArray(data) ? data : []
        const list = data?.aucations || fallbackList
        this.aucations = list
        result = { success: true, data: list }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucation = false
      }
      return result
    },

    async asyncGetAucationById(id) {
      this.isAucation = true
      let result
      try {
        const data = await aucationApi.getAucationById(id)
        const detail = data?.aucation || data
        this.aucation = detail
        result = { success: true, data: detail }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucation = false
      }
      return result
    },

    async asyncCreateAucation(payload) {
      this.isAucationAdd = true
      this.isAucationAdded = false
      let result
      try {
        const data = await aucationApi.createAucation(payload)
        this.isAucationAdded = true
        showSuccessDialog('Lelang berhasil dibuat!', 'Berhasil')
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucationAdd = false
      }
      return result
    },

    async asyncUpdateAucation(id, payload) {
      this.isAucationChange = true
      this.isAucationChanged = false
      let result
      try {
        const data = await aucationApi.updateAucation(id, payload)
        this.isAucationChanged = true
        const updated = data?.aucation || data || payload
        if (this.aucation && this.aucation.id === id) {
          this.aucation = { ...this.aucation, ...updated }
        }
        showSuccessDialog('Lelang berhasil diperbarui!', 'Berhasil')
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucationChange = false
      }
      return result
    },

    async asyncUpdateAucationCover(id, coverFile) {
      this.isAucationChangeCover = true
      this.isAucationChangedCover = false
      let result
      try {
        const data = await aucationApi.updateAucationCover(id, coverFile)
        this.isAucationChangedCover = true
        const coverUrl = data?.aucation?.cover || data?.cover || null
        if (this.aucation && this.aucation.id === id && coverUrl) {
          this.aucation.cover = coverUrl
        }
        showSuccessDialog('Foto cover berhasil diperbarui!', 'Berhasil')
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucationChangeCover = false
      }
      return result
    },

    async asyncDeleteAucation(id) {
      this.isAucationDelete = true
      this.isAucationDeleted = false
      let result
      try {
        const data = await aucationApi.deleteAucation(id)
        this.isAucationDeleted = true
        this.aucations = this.aucations.filter((a) => a.id !== id)
        if (this.aucation && this.aucation.id === id) {
          this.aucation = null
        }
        showSuccessDialog('Lelang berhasil dihapus!', 'Berhasil')
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucationDelete = false
      }
      return result
    },

    async asyncCreateBid(id, payload) {
      this.isBidAdd = true
      this.isBidAdded = false
      let result
      try {
        const data = await aucationApi.createBid(id, payload)
        this.isBidAdded = true
        showSuccessDialog('Penawaran berhasil diajukan!', 'Berhasil')
        await this.asyncGetAucationById(id)
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isBidAdd = false
      }
      return result
    },

    async asyncDeleteBid(id) {
      this.isBidDelete = true
      this.isBidDeleted = false
      let result
      try {
        const data = await aucationApi.deleteBid(id)
        this.isBidDeleted = true
        showSuccessDialog('Penawaran berhasil ditarik!', 'Berhasil')
        await this.asyncGetAucationById(id)
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isBidDelete = false
      }
      return result
    },

    async deleteAllMyAucations() {
      this.isAucationDeleteAll = true
      this.isAucationDeletedAll = false
      let result
      try {
        const data = await aucationApi.deleteAllMyAucations()
        this.isAucationDeletedAll = true
        this.aucations = []
        showSuccessDialog('Semua lelang Anda berhasil dihapus!', 'Berhasil')
        result = { success: true, data }
      } catch (error) {
        showErrorDialog(error.message)
        result = { success: false, message: error.message }
      } finally {
        this.isAucationDeleteAll = false
      }
      return result
    },
  },
})
