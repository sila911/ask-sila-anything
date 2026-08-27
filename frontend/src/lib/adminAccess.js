import { supabase } from './supabase'

const ADMIN_EMAIL = 'semsila.dev@gmail.com'
const TWO_FACTOR_KEY = 'sila_admin_2fa_verified'

export function is2FAVerified() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(TWO_FACTOR_KEY) === 'true'
}

export function set2FAVerified(verified = true) {
  if (typeof window === 'undefined') return
  if (verified) {
    sessionStorage.setItem(TWO_FACTOR_KEY, 'true')
  } else {
    sessionStorage.removeItem(TWO_FACTOR_KEY)
  }
}

export function clear2FAVerified() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(TWO_FACTOR_KEY)
}

export function hasAdminPassword() {
  // Check if there is an active session
  return !!supabase.auth.getSession()
}

export async function verifyOrSetupPassword(password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: password,
    })

    if (error) {
      return { ok: false, message: error.message }
    }

    if (data.session) {
      return { ok: true, created: false }
    }
  } catch (error) {
    return { ok: false, message: error.message }
  }
  return { ok: false, message: 'Login failed.' }
}

export async function requestTelegramOtp() {
  try {
    const res = await fetch('/api/telegram-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send' }),
    })
    const data = await res.json()
    if (!res.ok || !data.ok) {
      return { ok: false, message: data.message || 'Failed to send OTP to Telegram.' }
    }
    return {
      ok: true,
      token: data.token,
      expiresAt: data.expiresAt,
      message: data.message || 'Verification code sent to Telegram.',
    }
  } catch (error) {
    console.error('Error requesting Telegram OTP:', error)
    return { ok: false, message: 'Network error sending OTP. Please try again.' }
  }
}

export async function verifyTelegramOtp(otp, token) {
  try {
    const res = await fetch('/api/telegram-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        otp: String(otp).trim(),
        token: token,
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.ok) {
      return { ok: false, message: data.message || 'Invalid or expired OTP code.' }
    }
    set2FAVerified(true)
    return { ok: true, message: data.message || '2FA verified successfully.' }
  } catch (error) {
    console.error('Error verifying Telegram OTP:', error)
    return { ok: false, message: 'Network error verifying OTP. Please try again.' }
  }
}

export async function requestPasswordReset() {
  const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
    redirectTo: window.location.origin + '/reset-password',
  })
  
  if (error) throw new Error(error.message)
  return { message: 'Reset link sent to email.' }
}

export async function submitPasswordReset(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw new Error(error.message)
  return { message: 'Password updated successfully.' }
}

export async function logoutAdmin() {
  clear2FAVerified()
  await supabase.auth.signOut()
}

// Legacy functions kept for compatibility
export async function createEncryptedAdminToken() { return '' }
export async function validateEncryptedAdminToken() { return false }
