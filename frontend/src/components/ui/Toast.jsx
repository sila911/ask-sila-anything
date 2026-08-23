import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Danger, TickCircle, InfoCircle, Warning2, CloseCircle } from 'iconsax-react'
import { motion, AnimatePresence } from 'framer-motion'

const ICON_MAP = {
  success: TickCircle,
  error: Danger,
  warning: Warning2,
  info: InfoCircle,
}

const THEME_MAP = {
  error: {
    bg: 'bg-gradient-to-r from-[#ff1e38] via-[#ff2b42] to-[#ff3b52]',
    border: 'border-white/30',
    shadow: 'shadow-[0_12px_40px_rgba(255,43,66,0.65)]',
    iconBg: 'bg-white/20 border-white/40',
  },
  warning: {
    bg: 'bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#f59e0b]',
    border: 'border-white/30',
    shadow: 'shadow-[0_12px_40px_rgba(245,158,11,0.65)]',
    iconBg: 'bg-white/20 border-white/40',
  },
  success: {
    bg: 'bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981]',
    border: 'border-white/30',
    shadow: 'shadow-[0_12px_40px_rgba(16,185,129,0.65)]',
    iconBg: 'bg-white/20 border-white/40',
  },
  info: {
    bg: 'bg-gradient-to-r from-[#06b6d4] via-[#0284c7] to-[#06b6d4]',
    border: 'border-white/30',
    shadow: 'shadow-[0_12px_40px_rgba(6,182,212,0.65)]',
    iconBg: 'bg-white/20 border-white/40',
  },
}

export default function Toast({ toast, onClose, duration = 6000 }) {
  const [mounted, setMounted] = useState(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => {
      onCloseRef.current?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [toast?.message || toast?.detail || toast?.title || (toast ? 'active' : null), duration])

  if (!mounted || typeof document === 'undefined') return null

  const theme = toast ? (THEME_MAP[toast.type] || THEME_MAP.error) : THEME_MAP.error
  const Icon = toast ? (ICON_MAP[toast.type] || Danger) : Danger

  return createPortal(
    <div
      className="fixed top-3 sm:top-5 inset-x-0 mx-auto z-[99999999] w-[94vw] max-w-md pointer-events-none flex justify-center px-2"
      style={{ position: 'fixed', zIndex: 99999999 }}
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.message || toast.title || 'active-toast'}
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto relative w-full rounded-2xl sm:rounded-3xl pl-3.5 pr-9 py-3 sm:pl-4 sm:pr-10 sm:py-3.5 border backdrop-blur-2xl ${theme.bg} ${theme.border} ${theme.shadow}`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Left Circular Alert Icon */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shrink-0 shadow-inner ${theme.iconBg}`}
              >
                <Icon size={16} className="text-white" variant="Bold" />
              </div>

              {/* Message Text */}
              <div className="flex-1 min-w-0 text-white">
                {toast.title && (
                  <p className="text-xs sm:text-sm font-bold tracking-wide leading-tight font-['Racing_Sans_One',sans-serif]">
                    {toast.title}
                  </p>
                )}
                <p
                  className={`text-xs sm:text-sm text-white font-bold leading-snug break-words ${
                    toast.title ? 'mt-0.5 opacity-95 text-[11px] sm:text-xs font-medium' : ''
                  }`}
                >
                  {toast.detail || toast.message}
                </p>
              </div>
            </div>

            {/* Pinned Top-Right Corner Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-1.5 right-2 sm:top-2 sm:right-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 hover:bg-white/35 active:scale-90 border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm z-20"
              aria-label="Close notification"
            >
              <CloseCircle size={13} variant="Bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  )
}
