const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken() {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('token') || ''
}

export function putAccessToken(token) {
  if (typeof localStorage === 'undefined') return
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem('token')
  }
}

export async function fetchWithAuth(url, options = {}) {
  const baseUrl = typeof DELCOM_BASEURL !== 'undefined' ? DELCOM_BASEURL : 'https://open-api.delcom.org/api/v1'
  let fullUrl = url.startsWith('http://') || url.startsWith('https://') 
    ? url 
    : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`

  if (options.params && typeof options.params === 'object') {
    const urlObj = new URL(fullUrl)
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        urlObj.searchParams.append(key, String(val))
      }
    })
    fullUrl = urlObj.toString()
  }

  const headers = { ...(options.headers || {}) }
  const token = getAccessToken()
  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  let body = options.body
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }
    body = JSON.stringify(body)
  }

  const { params, ...customOptions } = options
  const response = await fetch(fullUrl, {
    ...customOptions,
    headers,
    body,
  })

  let responseJson = {}
  try {
    responseJson = await response.json()
  } catch {
    responseJson = {}
  }

  if (!response.ok || responseJson.success === false) {
    const message = responseJson.message || response.statusText || 'Terjadi kesalahan pada permintaan'
    throw new Error(message)
  }

  return responseJson
}
