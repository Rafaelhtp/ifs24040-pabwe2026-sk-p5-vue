import { fetchWithAuth } from '../../../helpers/apiHelper.js'

export async function getUsers() {
  const response = await fetchWithAuth('/users')
  return response.data
}

export async function getMe() {
  const response = await fetchWithAuth('/users/me')
  return response.data
}

export async function updateMe(payload) {
  const response = await fetchWithAuth('/users/me', {
    method: 'PUT',
    body: payload,
  })
  return response.data
}

export async function updatePhoto(photoFile) {
  let body = photoFile
  if (!(photoFile instanceof FormData)) {
    const formData = new FormData()
    formData.append('photo', photoFile)
    body = formData
  }

  const response = await fetchWithAuth('/users/me/photo', {
    method: 'POST',
    body,
  })
  return response.data
}

export async function updatePassword(payload) {
  const response = await fetchWithAuth('/users/me/password', {
    method: 'PUT',
    body: payload,
  })
  return response.data
}

export const userApi = {
  getUsers,
  getMe,
  updateMe,
  updatePhoto,
  updatePassword,
}

export default userApi
