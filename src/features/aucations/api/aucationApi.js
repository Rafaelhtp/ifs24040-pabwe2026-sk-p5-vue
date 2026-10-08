import { fetchWithAuth } from '../../../helpers/apiHelper.js'

export async function getAucations(params = {}) {
  const response = await fetchWithAuth('/aucations', {
    params,
  })
  return response.data
}

export async function getAucationById(id) {
  const response = await fetchWithAuth(`/aucations/${id}`)
  return response.data
}

export async function createAucation({ title, description, start_bid, closed_at }) {
  const response = await fetchWithAuth('/aucations', {
    method: 'POST',
    body: {
      title,
      description,
      start_bid: Number(start_bid),
      closed_at,
    },
  })
  return response.data
}

export async function updateAucation(id, payload) {
  const body = { ...payload }
  if (body.start_bid !== undefined) {
    body.start_bid = Number(body.start_bid)
  }
  const response = await fetchWithAuth(`/aucations/${id}`, {
    method: 'PUT',
    body,
  })
  return response.data
}

export async function updateAucationCover(id, coverFile) {
  let body = coverFile
  if (!(coverFile instanceof FormData)) {
    const formData = new FormData()
    formData.append('cover', coverFile)
    body = formData
  }

  const response = await fetchWithAuth(`/aucations/${id}/cover`, {
    method: 'POST',
    body,
  })
  return response.data
}

export async function deleteAucation(id) {
  const response = await fetchWithAuth(`/aucations/${id}`, {
    method: 'DELETE',
  })
  return response.data
}

export async function createBid(id, { bid }) {
  const response = await fetchWithAuth(`/aucations/${id}/bids`, {
    method: 'POST',
    body: {
      bid: Number(bid),
    },
  })
  return response.data
}

export async function deleteBid(id) {
  const response = await fetchWithAuth(`/aucations/${id}/bids`, {
    method: 'DELETE',
  })
  return response.data
}

export async function deleteAllMyAucations() {
  const response = await fetchWithAuth('/aucations', {
    method: 'DELETE',
  })
  return response.data
}

export const aucationApi = {
  getAucations,
  getAucationById,
  createAucation,
  updateAucation,
  updateAucationCover,
  deleteAucation,
  createBid,
  deleteBid,
  deleteAllMyAucations,
}

export default aucationApi
