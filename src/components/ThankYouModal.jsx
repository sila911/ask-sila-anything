import { FiCheckCircle } from 'react-icons/fi'

export default function ThankYouModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--card-bg)] backdrop-blur-2xl border border-[color:var(--card-border)] rounded-3xl p-6 text-center w-[85%] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl text-emerald-500 dark:text-emerald-400 mb-3">
          <FiCheckCircle className="mx-auto" />
        </div>

        <h2 className="text-lg font-semibold mb-1">
          Thank you for your question!
        </h2>

        <p className="text-sm text-[color:var(--app-muted)]">
          Sila will reply to you on <b>Instagram</b> soon.<br />
          Please stay connected 💙
        </p>
      </div>
    </div>
  )
}
