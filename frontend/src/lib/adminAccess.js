const ADMIN_HASH_KEY = 'sila-admin-password-hash-v1'

function bytesToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function deriveAesKey(password, saltBytes) {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 150000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(digest))
}

export function hasAdminPassword() {
  return Boolean(localStorage.getItem(ADMIN_HASH_KEY))
}

export async function verifyOrSetupPassword(password) {
  const nextHash = await hashPassword(password)
  const stored = localStorage.getItem(ADMIN_HASH_KEY)

  if (!stored) {
    localStorage.setItem(ADMIN_HASH_KEY, nextHash)
    return { ok: true, created: true }
  }

  return { ok: stored === nextHash, created: false }
}

export async function createEncryptedAdminToken(password, ttlMinutes = 120) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveAesKey(password, salt)

  const payload = {
    role: 'admin',
    exp: Date.now() + ttlMinutes * 60 * 1000,
  }

  const plain = new TextEncoder().encode(JSON.stringify(payload))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain)

  return [
    bytesToBase64(salt),
    bytesToBase64(iv),
    bytesToBase64(new Uint8Array(cipher)),
  ].join('.')
}

export async function validateEncryptedAdminToken(token, password) {
  try {
    const [saltB64, ivB64, cipherB64] = token.split('.')
    if (!saltB64 || !ivB64 || !cipherB64) return false

    const salt = base64ToBytes(saltB64)
    const iv = base64ToBytes(ivB64)
    const cipher = base64ToBytes(cipherB64)
    const key = await deriveAesKey(password, salt)

    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
    const payload = JSON.parse(new TextDecoder().decode(plain))

    return payload?.role === 'admin' && Number(payload?.exp || 0) > Date.now()
  } catch {
    return false
  }
}
