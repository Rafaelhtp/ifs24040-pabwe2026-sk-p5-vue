import { fetchWithAuth } from '../../../helpers/apiHelper.js'

export async function login({ email, password }) {
  const response = await fetchWithAuth('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  return response.data
}

export async function register({ name, email, password }) {
  const response = await fetchWithAuth('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
  return response.data
}

export const authApi = {
  login,
  register,
}

export default authApi
