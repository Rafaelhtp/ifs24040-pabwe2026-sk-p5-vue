import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  aucationApi,
  getAucations,
  getAucationById,
  createAucation,
  updateAucation,
  updateAucationCover,
  deleteAucation,
  createBid,
  deleteBid,
  deleteAllMyAucations,
} from './aucationApi.js'
import * as apiHelper from '../../../helpers/apiHelper.js'

describe('aucationApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should call GET /aucations with params', async () => {
    const mockData = { aucations: [] }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await getAucations({ is_me: 1, is_closed: 0 })
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations', {
      params: { is_me: 1, is_closed: 0 },
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.getAucations()
    expect(resObj).toEqual(mockData)
  })

  it('should call GET /aucations/:id', async () => {
    const mockData = { aucation: { id: 'auc-1' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await getAucationById('auc-1')
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations/auc-1')
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.getAucationById('auc-1')
    expect(resObj).toEqual(mockData)
  })

  it('should call POST /aucations', async () => {
    const mockData = { aucation: { id: 'auc-2' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const payload = {
      title: 'Item A',
      description: 'Desc',
      start_bid: '50000',
      closed_at: '2026-12-31T00:00:00Z',
    }
    const res = await createAucation(payload)
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations', {
      method: 'POST',
      body: {
        title: 'Item A',
        description: 'Desc',
        start_bid: 50000,
        closed_at: '2026-12-31T00:00:00Z',
      },
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.createAucation(payload)
    expect(resObj).toEqual(mockData)
  })

  it('should call PUT /aucations/:id', async () => {
    const mockData = { aucation: { id: 'auc-1' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const payload = { title: 'Updated Title', start_bid: '100000' }
    const res = await updateAucation('auc-1', payload)
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations/auc-1', {
      method: 'PUT',
      body: { title: 'Updated Title', start_bid: 100000 },
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.updateAucation('auc-1', { title: 'Only Title' })
    expect(resObj).toEqual(mockData)
  })

  it('should call POST /aucations/:id/cover with File or FormData', async () => {
    const mockData = { aucation: { id: 'auc-1', cover: 'cover.jpg' } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    const res = await updateAucationCover('auc-1', file)
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations/auc-1/cover', {
      method: 'POST',
      body: expect.any(FormData),
    })
    expect(res).toEqual(mockData)

    const formData = new FormData()
    formData.append('cover', file)
    const res2 = await aucationApi.updateAucationCover('auc-1', formData)
    expect(res2).toEqual(mockData)
  })

  it('should call DELETE /aucations/:id', async () => {
    const mockData = { message: 'Deleted' }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await deleteAucation('auc-1')
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations/auc-1', {
      method: 'DELETE',
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.deleteAucation('auc-1')
    expect(resObj).toEqual(mockData)
  })

  it('should call POST /aucations/:id/bids', async () => {
    const mockData = { bid: { id: 'b-1', bid: 60000 } }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await createBid('auc-1', { bid: '60000' })
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations/auc-1/bids', {
      method: 'POST',
      body: { bid: 60000 },
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.createBid('auc-1', { bid: 70000 })
    expect(resObj).toEqual(mockData)
  })

  it('should call DELETE /aucations/:id/bids', async () => {
    const mockData = { message: 'Bid cancelled' }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await deleteBid('auc-1')
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations/auc-1/bids', {
      method: 'DELETE',
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.deleteBid('auc-1')
    expect(resObj).toEqual(mockData)
  })

  it('should call DELETE /aucations (delete all mine)', async () => {
    const mockData = { message: 'All deleted' }
    vi.spyOn(apiHelper, 'fetchWithAuth').mockResolvedValue({ success: true, data: mockData })

    const res = await deleteAllMyAucations()
    expect(apiHelper.fetchWithAuth).toHaveBeenCalledWith('/aucations', {
      method: 'DELETE',
    })
    expect(res).toEqual(mockData)

    const resObj = await aucationApi.deleteAllMyAucations()
    expect(resObj).toEqual(mockData)
  })
})
