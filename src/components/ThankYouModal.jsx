export default function ThankYouModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white/30 dark:bg-black/50 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 text-center w-[85%] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl text-green-400 mb-3">
          <i className="fa-solid fa-circle-check"></i>
        </div>

        <h2 className="text-lg font-semibold mb-1">
          Thank you for your question!
        </h2>

        <p className="text-sm opacity-80">
          Sila will reply to you on <b>Instagram</b> soon.<br />
          Please stay connected 💙
        </p>
      </div>
    </div>
  )
}
