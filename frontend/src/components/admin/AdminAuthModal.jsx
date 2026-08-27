import { useEffect, useState, useRef } from 'react'
import { Eye, EyeSlash, ShieldTick, Refresh2, ArrowLeft } from 'iconsax-react'
import {
  requestPasswordReset,
  submitPasswordReset,
  requestTelegramOtp,
  verifyTelegramOtp,
} from '../../lib/adminAccess'
import { sounds } from '../../utils/soundEffects'

export default function AdminAuthModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [view, setView] = useState('login') // 'login', 'otp', 'forgot', 'reset'
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2FA state
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpToken, setOtpToken] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [cooldown, setCooldown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const otpInputRefs = useRef([])

  const [animationState, setAnimationState] = useState('hidden-top') // 'hidden-top', 'visible', 'hidden-bottom'
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setView('login')
      setPassword('')
      setNewPassword('')
      setCode('')
      setOtp(['', '', '', '', '', ''])
      setError('')
      setMessage('')
      setShouldRender(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState('visible')
        })
      })
      return () => cancelAnimationFrame(frame)
    } else {
      setAnimationState('hidden-bottom')
      const timer = setTimeout(() => {
        setShouldRender(false)
        setAnimationState('hidden-top')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // OTP Countdown & Cooldown
  useEffect(() => {
    let timer
    if (view === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [view, timeLeft])

  useEffect(() => {
    let cdTimer
    if (view === 'otp' && cooldown > 0) {
      setCanResend(false)
      cdTimer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (cooldown === 0) {
      setCanResend(true)
    }
    return () => clearInterval(cdTimer)
  }, [view, cooldown])

  useEffect(() => {
    if (view === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 150)
    }
  }, [view])

  if (!shouldRender) return null

  const isVisible = animationState === 'visible'

  let transformClass = 'translate-y-0 scale-100'
  if (animationState === 'hidden-top') {
    transformClass = '-translate-y-[100vh] scale-95'
  } else if (animationState === 'hidden-bottom') {
    transformClass = 'translate-y-[100vh] scale-95'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const res = await onSubmit(password)
      if (res?.requires2FA) {
        setOtpToken(res.token)
        setTimeLeft(60)
        setCooldown(30)
        setOtp(['', '', '', '', '', ''])
        setView('otp')
        setMessage('A 6-digit PIN has been sent to your Telegram bot.')
        sounds.playClick()
      }
    } catch (err) {
      setError(err.message || 'Incorrect password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '')
    if (!cleanVal && value !== '') return

    sounds.playClick()
    const newOtp = [...otp]
    newOtp[index] = cleanVal ? cleanVal.slice(-1) : ''
    setOtp(newOtp)
    if (error) setError('')

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    if (cleanVal && newOtp.every((d) => d !== '')) {
      handleOtpVerify(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '')
    if (pasted.length >= 6) {
      const digits = pasted.slice(0, 6).split('')
      setOtp(digits)
      otpInputRefs.current[5]?.focus()
      sounds.playClick()
      handleOtpVerify(digits.join(''))
    }
  }

  const handleOtpVerify = async (fullCode) => {
    if (!fullCode || fullCode.length !== 6) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await verifyTelegramOtp(fullCode, otpToken)
      if (!res.ok) {
        setError(res.message || 'Invalid or expired OTP code.')
      } else {
        sounds.playSuccess()
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || isResending) return
    setIsResending(true)
    setError('')
    try {
      const res = await requestTelegramOtp()
      if (res.ok) {
        setOtpToken(res.token)
        setTimeLeft(60)
        setCooldown(30)
        setOtp(['', '', '', '', '', ''])
        setMessage('Fresh 6-digit PIN sent to Telegram bot!')
        sounds.playClick()
        otpInputRefs.current[0]?.focus()
      } else {
        setError(res.message || 'Failed to resend OTP.')
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setIsResending(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')
    try {
      await requestPasswordReset()
      setMessage('Reset request sent to email.')
      setView('reset')
    } catch (err) {
      setError(err.message || 'Failed to send reset code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')
    try {
      await submitPasswordReset(code, newPassword)
      setMessage('Password updated successfully. Logging in...')
      setTimeout(async () => {
        await onSubmit(newPassword)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-x-hidden flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-500 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div
        className={`glass-shell w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative transition-transform duration-500 ease-in-out transform ${transformClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'login' && (
          <>
            <h3 className="text-xl font-bold">Admin Login</h3>
            <p className="text-sm text-[color:var(--app-muted)] mt-1">Enter your admin password to start 2FA.</p>
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="text-[color:var(--app-muted)] font-medium">Password</span>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl pl-3 pr-10 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Checking...' : 'Continue to 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline text-center cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </>
        )}

        {view === 'otp' && (
          <>
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src="https://img.icons8.com/3d-fluency/94/telegram.png"
                alt="Telegram"
                className="w-7 h-7 object-contain"
              />
              <h3 className="text-xl font-bold flex items-center gap-1.5">
                Telegram 2FA
                <ShieldTick size={18} className="text-cyan-500" variant="Bold" />
              </h3>
            </div>
            <p className="text-sm text-[color:var(--app-muted)]">
              Enter the 6-digit PIN sent to your Telegram bot.
            </p>

            {message && (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">{message}</p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleOtpVerify(otp.join(''))
              }}
              className="mt-5 space-y-4"
            >
              <div className="flex justify-between gap-1.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border transition-all ${
                      digit
                        ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-500 ring-2 ring-cyan-500/20'
                        : 'bg-[color:var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--app-text)]'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[color:var(--app-muted)]">
                <span>Expires in: {formatTimer(timeLeft)}</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-50 disabled:no-underline font-medium cursor-pointer"
                >
                  <Refresh2 size={12} className={isResending ? 'animate-spin' : ''} />
                  {isResending ? 'Sending...' : canResend ? 'Resend' : `Resend (${cooldown}s)`}
                </button>
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting || otp.some((d) => d === '') || timeLeft <= 0}
                className="w-full rounded-xl h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Unlock'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('login')
                  setError('')
                  setMessage('')
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-[color:var(--app-muted)] cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back to Password
              </button>
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
                className="w-full rounded-xl h-11 bg-cyan-600 text-white font-bold disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-sm text-[color:var(--app-muted)] cursor-pointer">
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
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 w-full rounded-xl pl-3 pr-10 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}
              {message && <p className="text-sm text-emerald-500 font-medium">{message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Resetting...' : 'Update Password'}
              </button>
              <button type="button" onClick={() => setView('login')} className="w-full text-sm text-[color:var(--app-muted)] cursor-pointer">
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
