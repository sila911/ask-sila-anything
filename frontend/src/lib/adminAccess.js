const ADMIN_TOKEN_KEY = 'sila-admin-token'
const ADMIN_EMAIL = 'semsila.dev@gmail.com'

async function requestJSON(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    ...options
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Auth request failed.')
  }
  return data
}

export function hasAdminPassword() {
  // Now we check for a session token instead of just a local hash
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
}

export async function verifyOrSetupPassword(password) {
  try {
    const data = await requestJSON('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: ADMIN_EMAIL, password })
    })

    if (data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      return { ok: true, created: false }
    }
  } catch (error) {
    return { ok: false, message: error.message }
  }
  return { ok: false }
}

export async function requestPasswordReset() {
  return requestJSON('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL })
  })
}

export async function submitPasswordReset(code, newPassword) {
  return requestJSON('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      code,
      password: newPassword,
      password_confirmation: newPassword
    })
  })
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

// Legacy functions kept for compatibility during transition if needed
export async function createEncryptedAdminToken() { return '' }
export async function validateEncryptedAdminToken() { return false }
