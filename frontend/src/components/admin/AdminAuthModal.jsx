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
  const [lastFailedPassword, setLastFailedPassword] = useState('')
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
      setLastFailedPassword('')
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
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setError('')
            return 0
          }
          return prev - 1
        })
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
            clearInterval(cdTimer)
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

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) return
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (lastFailedPassword && password === lastFailedPassword) {
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await onSubmit(password)
      setLastFailedPassword('')
      if (res?.requires2FA) {
        setOtpToken(res.token)
        setTimeLeft(60)
        setCooldown(30)
        setOtp(['', '', '', '', '', ''])
        setView('otp')
        setMessage('A 6-digit verification code has been dispatched.')
        sounds.playClick()
      }
    } catch (err) {
      setError(err.message || 'Incorrect password')
      setLastFailedPassword(password)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (timeLeft <= 0) return
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
    if (timeLeft <= 0) return
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    if (timeLeft <= 0) return
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
        setError(res.message || 'Invalid or expired verification code.')
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
    if ((timeLeft > 0 && !canResend) || isResending) return
    setIsResending(true)
    setError('')
    try {
      const res = await requestTelegramOtp()
      if (res.ok) {
        setOtpToken(res.token)
        setTimeLeft(60)
        setCooldown(30)
        setOtp(['', '', '', '', '', ''])
        setMessage('A fresh 6-digit code has been dispatched!')
        sounds.playClick()
        otpInputRefs.current[0]?.focus()
      } else {
        setError(res.message || 'Failed to resend code.')
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.')
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
      setMessage('Password reset successful! Logging in...')
      setTimeout(() => {
        setView('login')
        setMessage('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (!shouldRender) return null

  const isVisible = animationState === 'visible'

  let transformClass = 'translate-y-0 scale-100'
  if (animationState === 'hidden-top') {
    transformClass = '-translate-y-[100vh] scale-95'
  } else if (animationState === 'hidden-bottom') {
    transformClass = 'translate-y-[100vh] scale-95'
  }

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-x-hidden flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-500 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div
        className={`glass-shell w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 relative transition-transform duration-500 ease-in-out transform ${transformClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Left Back Icon (<) */}
        <button
          type="button"
          onClick={() => {
            if (view === 'otp' || view === 'forgot' || view === 'reset') {
              setView('login')
              setError('')
              setMessage('')
              sounds.playClick()
            } else {
              onClose()
            }
          }}
          className="absolute left-5 top-5 w-9 h-9 rounded-full theme-toggle-btn flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-all active:scale-90 shadow-sm z-10"
          aria-label="Back"
        >
          <ArrowLeft2 size={16} />
        </button>

        {view === 'login' && (
          <>
            <div className="flex flex-col items-center justify-center text-center pt-2 mb-6">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-125 pointer-events-none" />
                <img
                  src="https://img.icons8.com/3d-fluency/188/lock-2.png"
                  alt="Admin Access"
                  className="w-18 h-18 sm:w-20 sm:h-20 object-contain relative drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide text-[color:var(--app-text)]">
                Admin Login
              </h3>
              <p className="text-xs sm:text-sm text-[color:var(--app-muted)] mt-1 max-w-xs">
                Enter your admin password to open dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm">
                <span className="text-[color:var(--app-muted)] font-medium">Password</span>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleLogin(e)
                      }
                    }}
                    enterKeyHint="go"
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
                {(() => {
                  const isPasswordBlocked = !!(lastFailedPassword && password === lastFailedPassword);
                  return (
                    <button
                      type="submit"
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={isSubmitting || !password || isPasswordBlocked}
                      className={`w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-base transition-all ${
                        isPasswordBlocked
                          ? "opacity-30 cursor-not-allowed filter blur-[1px] pointer-events-none"
                          : "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      }`}
                    >
                      {isSubmitting ? 'Checking...' : 'Login'}
                    </button>
                  );
                })()}
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
            <div className="flex flex-col items-center justify-center text-center pt-2 mb-5">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-125 pointer-events-none" />
                <img
                  src="https://img.icons8.com/3d-fluency/188/shield.png"
                  alt="Security Verification"
                  className="w-18 h-18 sm:w-20 sm:h-20 object-contain relative drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide text-[color:var(--app-text)]">
                Verification
              </h3>
              <p className="text-xs sm:text-sm text-[color:var(--app-muted)] mt-1 max-w-xs">
                Enter the 6-digit verification code to proceed
              </p>
            </div>

            {/* Status message */}
            {timeLeft <= 0 ? (
              <p className="text-xs text-rose-500 font-medium text-center">
                Verification code has expired. Tap resend below.
              </p>
            ) : message ? (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 text-center">{message}</p>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleOtpVerify(otp.join(''))
              }}
              className="mt-4 space-y-4"
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
                    disabled={timeLeft <= 0 || isSubmitting}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border transition-all ${
                      timeLeft <= 0
                        ? 'opacity-35 cursor-not-allowed bg-slate-100/40 dark:bg-white/5 border-slate-200 dark:border-white/5 pointer-events-none'
                        : digit
                        ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-500 ring-2 ring-cyan-500/20'
                        : 'bg-[color:var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--app-text)]'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                  />
                ))}
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center justify-center text-xs px-1">
                  <span className={`font-mono text-sm tracking-widest font-bold ${timeLeft < 20 ? 'text-rose-500 animate-pulse' : 'text-cyan-600/80 dark:text-cyan-400/80'}`}>
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              )}

              {timeLeft > 0 && error && <p className="text-sm text-rose-500 text-center">{error}</p>}

              {timeLeft <= 0 ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full rounded-xl h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base disabled:opacity-50 cursor-pointer"
                >
                  {isResending ? 'Sending...' : 'Resend'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || otp.some((d) => d === '')}
                  className="w-full rounded-xl h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </button>
              )}
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
