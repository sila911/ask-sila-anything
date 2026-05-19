import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { requestPasswordReset, submitPasswordReset } from '../lib/adminAccess'

export default function AdminAuthModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [view, setView] = useState('login') // 'login', 'forgot', 'reset'
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setNewPassword('')
      setShowPassword(false)
      setCode('')
      setError('')
      setMessage('')
      setIsSubmitting(false)
      setView('login')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const result = await onSubmit(password)
    if (!result.ok) {
      setError(result.message || 'Authentication failed.')
      setIsSubmitting(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const res = await requestPasswordReset()
      setMessage(res.message)
      setView('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const res = await submitPasswordReset(code, newPassword)
      setMessage(res.message)
      setTimeout(() => setView('login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'login' && (
          <>
            <h3 className="text-xl font-bold">Admin Login</h3>
            <p className="text-sm text-[color:var(--app-muted)] mt-1">Enter your admin password to open dashboard.</p>
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="text-[color:var(--app-muted)] font-medium">Password</span>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl pl-3 pr-10 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--app-muted)] hover:text-cyan-500"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Checking...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Forgot Password?
                </button>
                <button type="button" onClick={onClose} className="text-sm text-[color:var(--app-muted)]">
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}

        {view === 'forgot' && (
          <>
            <h3 className="text-xl font-bold">Forgot Password</h3>
            <p className="text-sm text-[color:var(--app-muted)] mt-1">A reset code will be sent to semsila.dev@gmail.com</p>
            <form onSubmit={handleForgot} className="mt-6 space-y-4">
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 bg-cyan-600 text-white font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-sm text-[color:var(--app-muted)]">
                Back to Login
              </button>
            </form>
          </>
        )}

        {view === 'reset' && (
          <>
            <h3 className="text-xl font-bold">Reset Password</h3>
            <p className="text-sm text-[color:var(--app-muted)] mt-1">Enter the 6-digit code from your email and your new password.</p>
            <form onSubmit={handleReset} className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="text-[color:var(--app-muted)] font-medium">6-Digit Code</span>
                <input
                  type="text"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] text-center tracking-widest text-lg font-bold"
                  placeholder="000000"
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="text-[color:var(--app-muted)] font-medium">New Password</span>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 w-full rounded-xl pl-3 pr-10 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--app-muted)] hover:text-cyan-500"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}
              {message && <p className="text-sm text-emerald-500 font-medium">{message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting...' : 'Update Password'}
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-sm text-[color:var(--app-muted)]">
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
