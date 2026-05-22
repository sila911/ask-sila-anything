import { supabase } from './supabase'

const ADMIN_EMAIL = 'semsila.dev@gmail.com'

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
  await supabase.auth.signOut()
}

// Legacy functions kept for compatibility
export async function createEncryptedAdminToken() { return '' }
export async function validateEncryptedAdminToken() { return false }
