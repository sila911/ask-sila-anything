import { useEffect, useState } from 'react'

export default function AdminAuthModal({
  isOpen,
  hasPassword,
  requiresToken,
  onClose,
  onSubmit,
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setError('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const title = hasPassword ? 'Admin Login' : 'Create Admin Password'
  const helper = hasPassword
    ? 'Enter your admin password to open dashboard.'
    : 'First time setup. This password will protect the admin page on this browser.'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await onSubmit(password)
    if (!result.ok) {
      setError(result.message || 'Authentication failed.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-[color:var(--app-muted)] mt-1">{helper}</p>
        {requiresToken && (
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-2">
            Encrypted admin link detected. Password is required to decrypt and continue.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">Password</span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)]"
              required
            />
          </label>

          {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose} className="rounded-xl py-2 border border-[color:var(--input-border)]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-50"
            >
              {isSubmitting ? 'Checking...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
