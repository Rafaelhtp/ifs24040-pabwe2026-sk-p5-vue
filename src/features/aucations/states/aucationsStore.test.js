import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAucationsStore } from './aucationsStore.js'
import { aucationApi } from '../api/aucationApi.js'
import * as toolsHelper from '../../../helpers/toolsHelper.js'

describe('aucationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue(true)
    vi.spyOn(toolsHelper, 'showErrorDialog').mockImplementation(() => {})
  })

  it('should initialize with default states and allow setters', () => {
    const store = useAucationsStore()
    expect(store.aucations).toEqual([])
    expect(store.aucation).toBeNull()
    expect(store.isAucation).toBe(false)
    expect(store.isAucationAdd).toBe(false)
    expect(store.isAucationAdded).toBe(false)

    store.setAucation({ id: 'auc-1' })
    expect(store.aucation).toEqual({ id: 'auc-1' })

    store.setAucations([{ id: 'auc-1' }])
    expect(store.aucations).toEqual([{ id: 'auc-1' }])
  })

  describe('asyncGetAucations', () => {
    it('should get aucations list from object with aucations prop', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'getAucations').mockResolvedValue({ aucations: [{ id: '1' }] })

      const res = await store.asyncGetAucations()
      expect(res.success).toBe(true)
      expect(store.aucations).toEqual([{ id: '1' }])
      expect(store.isAucation).toBe(false)
    })

    it('should get aucations list from raw array or null', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'getAucations').mockResolvedValue([{ id: '2' }])

      let res = await store.asyncGetAucations()
      expect(res.success).toBe(true)
      expect(store.aucations).toEqual([{ id: '2' }])

      vi.spyOn(aucationApi, 'getAucations').mockResolvedValue(null)
      res = await store.asyncGetAucations()
      expect(store.aucations).toEqual([])
    })

    it('should handle error in asyncGetAucations', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'getAucations').mockRejectedValue(new Error('Network error'))

      const res = await store.asyncGetAucations()
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Network error')
      expect(store.isAucation).toBe(false)
    })
  })

  describe('asyncGetAucationById', () => {
    it('should get single aucation detail', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'getAucationById').mockResolvedValue({ aucation: { id: 'auc-1', title: 'Car' } })

      const res = await store.asyncGetAucationById('auc-1')
      expect(res.success).toBe(true)
      expect(store.aucation).toEqual({ id: 'auc-1', title: 'Car' })
      expect(store.isAucation).toBe(false)
    })

    it('should get single aucation from raw object', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'getAucationById').mockResolvedValue({ id: 'auc-2', title: 'Bike' })

      const res = await store.asyncGetAucationById('auc-2')
      expect(res.success).toBe(true)
      expect(store.aucation).toEqual({ id: 'auc-2', title: 'Bike' })
    })

    it('should handle error in asyncGetAucationById', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'getAucationById').mockRejectedValue(new Error('Not found'))

      const res = await store.asyncGetAucationById('unknown')
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Not found')
      expect(store.isAucation).toBe(false)
    })
  })

  describe('asyncCreateAucation', () => {
    it('should create aucation successfully', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'createAucation').mockResolvedValue({ id: 'auc-new' })

      const res = await store.asyncCreateAucation({ title: 'New' })
      expect(res.success).toBe(true)
      expect(store.isAucationAdded).toBe(true)
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isAucationAdd).toBe(false)
    })

    it('should handle create aucation error', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'createAucation').mockRejectedValue(new Error('Validation failed'))

      const res = await store.asyncCreateAucation({})
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validation failed')
      expect(store.isAucationAdd).toBe(false)
    })
  })

  describe('asyncUpdateAucation', () => {
    it('should update aucation successfully and update current aucation state', async () => {
      const store = useAucationsStore()
      store.aucation = { id: 'auc-1', title: 'Old Title' }
      vi.spyOn(aucationApi, 'updateAucation').mockResolvedValue({ aucation: { id: 'auc-1', title: 'New Title' } })

      const res = await store.asyncUpdateAucation('auc-1', { title: 'New Title' })
      expect(res.success).toBe(true)
      expect(store.isAucationChanged).toBe(true)
      expect(store.aucation.title).toBe('New Title')
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isAucationChange).toBe(false)
    })

    it('should update aucation with raw payload fallback', async () => {
      const store = useAucationsStore()
      store.aucation = { id: 'auc-1', title: 'Old' }
      vi.spyOn(aucationApi, 'updateAucation').mockResolvedValue(null)

      const res = await store.asyncUpdateAucation('auc-1', { title: 'Direct' })
      expect(res.success).toBe(true)
      expect(store.aucation.title).toBe('Direct')
    })

    it('should update aucation when store.aucation is null or has different id', async () => {
      const store = useAucationsStore()
      store.aucation = null
      vi.spyOn(aucationApi, 'updateAucation').mockResolvedValue({ id: 'auc-2' })

      const res = await store.asyncUpdateAucation('auc-2', {})
      expect(res.success).toBe(true)
      expect(store.aucation).toBeNull()
    })

    it('should handle update aucation error', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'updateAucation').mockRejectedValue(new Error('Update failed'))

      const res = await store.asyncUpdateAucation('auc-1', {})
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Update failed')
      expect(store.isAucationChange).toBe(false)
    })
  })

  describe('asyncUpdateAucationCover', () => {
    it('should update cover successfully', async () => {
      const store = useAucationsStore()
      store.aucation = { id: 'auc-1', cover: 'old.jpg' }
      vi.spyOn(aucationApi, 'updateAucationCover').mockResolvedValue({ aucation: { cover: 'new.jpg' } })

      const file = new File([''], 'new.jpg')
      const res = await store.asyncUpdateAucationCover('auc-1', file)
      expect(res.success).toBe(true)
      expect(store.isAucationChangedCover).toBe(true)
      expect(store.aucation.cover).toBe('new.jpg')
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isAucationChangeCover).toBe(false)
    })

    it('should update cover from cover property in response', async () => {
      const store = useAucationsStore()
      store.aucation = { id: 'auc-1', cover: 'old.jpg' }
      vi.spyOn(aucationApi, 'updateAucationCover').mockResolvedValue({ cover: 'cover2.jpg' })

      const file = new File([''], 'cover2.jpg')
      const res = await store.asyncUpdateAucationCover('auc-1', file)
      expect(res.success).toBe(true)
      expect(store.aucation.cover).toBe('cover2.jpg')
    })

    it('should handle cover update when store.aucation is null or response lacks cover', async () => {
      const store = useAucationsStore()
      store.aucation = null
      vi.spyOn(aucationApi, 'updateAucationCover').mockResolvedValue({})

      const file = new File([''], 'cover3.jpg')
      const res = await store.asyncUpdateAucationCover('auc-1', file)
      expect(res.success).toBe(true)
      expect(store.aucation).toBeNull()
    })

    it('should handle cover update error', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'updateAucationCover').mockRejectedValue(new Error('Cover too large'))

      const file = new File([''], 'large.jpg')
      const res = await store.asyncUpdateAucationCover('auc-1', file)
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Cover too large')
      expect(store.isAucationChangeCover).toBe(false)
    })
  })

  describe('asyncDeleteAucation', () => {
    it('should delete aucation and filter it out from store', async () => {
      const store = useAucationsStore()
      store.aucations = [{ id: 'auc-1' }, { id: 'auc-2' }]
      store.aucation = { id: 'auc-1' }
      vi.spyOn(aucationApi, 'deleteAucation').mockResolvedValue({ message: 'Deleted' })

      const res = await store.asyncDeleteAucation('auc-1')
      expect(res.success).toBe(true)
      expect(store.isAucationDeleted).toBe(true)
      expect(store.aucations).toEqual([{ id: 'auc-2' }])
      expect(store.aucation).toBeNull()
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isAucationDelete).toBe(false)
    })

    it('should delete aucation when store.aucation has different id or is null', async () => {
      const store = useAucationsStore()
      store.aucations = [{ id: 'auc-1' }]
      store.aucation = { id: 'auc-other' }
      vi.spyOn(aucationApi, 'deleteAucation').mockResolvedValue({ message: 'Deleted' })

      const res = await store.asyncDeleteAucation('auc-1')
      expect(res.success).toBe(true)
      expect(store.aucation).toEqual({ id: 'auc-other' })
    })

    it('should handle delete aucation error', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'deleteAucation').mockRejectedValue(new Error('Cannot delete'))

      const res = await store.asyncDeleteAucation('auc-1')
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Cannot delete')
      expect(store.isAucationDelete).toBe(false)
    })
  })

  describe('asyncCreateBid and asyncDeleteBid', () => {
    it('should create bid and refresh detail', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'createBid').mockResolvedValue({ bid: { id: 'b-1' } })
      const getDetailSpy = vi.spyOn(store, 'asyncGetAucationById').mockResolvedValue({ success: true })

      const res = await store.asyncCreateBid('auc-1', { bid: 10000 })
      expect(res.success).toBe(true)
      expect(store.isBidAdded).toBe(true)
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(getDetailSpy).toHaveBeenCalledWith('auc-1')
      expect(store.isBidAdd).toBe(false)
    })

    it('should handle create bid error', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'createBid').mockRejectedValue(new Error('Bid too low'))

      const res = await store.asyncCreateBid('auc-1', { bid: 1000 })
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Bid too low')
      expect(store.isBidAdd).toBe(false)
    })

    it('should delete bid and refresh detail', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'deleteBid').mockResolvedValue({ message: 'Deleted' })
      const getDetailSpy = vi.spyOn(store, 'asyncGetAucationById').mockResolvedValue({ success: true })

      const res = await store.asyncDeleteBid('auc-1')
      expect(res.success).toBe(true)
      expect(store.isBidDeleted).toBe(true)
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(getDetailSpy).toHaveBeenCalledWith('auc-1')
      expect(store.isBidDelete).toBe(false)
    })

    it('should handle delete bid error', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'deleteBid').mockRejectedValue(new Error('Cannot delete bid'))

      const res = await store.asyncDeleteBid('auc-1')
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Cannot delete bid')
      expect(store.isBidDelete).toBe(false)
    })
  })

  describe('deleteAllMyAucations', () => {
    it('should delete all my aucations successfully', async () => {
      const store = useAucationsStore()
      store.aucations = [{ id: '1' }, { id: '2' }]
      vi.spyOn(aucationApi, 'deleteAllMyAucations').mockResolvedValue({ message: 'All deleted' })

      const res = await store.deleteAllMyAucations()
      expect(res.success).toBe(true)
      expect(store.isAucationDeletedAll).toBe(true)
      expect(store.aucations).toEqual([])
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
      expect(store.isAucationDeleteAll).toBe(false)
    })

    it('should handle error in deleteAllMyAucations', async () => {
      const store = useAucationsStore()
      vi.spyOn(aucationApi, 'deleteAllMyAucations').mockRejectedValue(new Error('Failed to delete all'))

      const res = await store.deleteAllMyAucations()
      expect(res.success).toBe(false)
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Failed to delete all')
      expect(store.isAucationDeleteAll).toBe(false)
    })
  })
})
