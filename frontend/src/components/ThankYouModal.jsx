import { useEffect, useState } from 'react'
import { TickCircle } from 'iconsax-react'

export default function ThankYouModal({ isOpen, onClose }) {
  const [animationState, setAnimationState] = useState('hidden-top') // 'hidden-top', 'visible', 'hidden-bottom'
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
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
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

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
      className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500 ${
        isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-[color:var(--card-bg)] backdrop-blur-2xl border border-[color:var(--card-border)] rounded-3xl p-6 text-center w-[85%] max-w-sm transition-transform duration-500 ease-in-out transform ${transformClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl text-emerald-500 dark:text-emerald-400 mb-3">
          <TickCircle className="mx-auto" />
        </div>

        <h2 className="text-lg font-semibold mb-1">
          Thank you for your question!
        </h2>

        <p className="text-sm text-[color:var(--app-muted)]">
          Your question has been sent!<br />
          Sila will reply to it here on the platform soon. 💙
        </p>
      </div>
    </div>
  )
}
