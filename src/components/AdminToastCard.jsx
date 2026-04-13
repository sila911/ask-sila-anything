import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

const ICON_MAP = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
}

const STYLE_MAP = {
  success: 'border-emerald-300/80 text-emerald-900 dark:text-emerald-100',
  error: 'border-rose-300/80 text-rose-900 dark:text-rose-100',
  info: 'border-cyan-300/80 text-cyan-900 dark:text-cyan-100',
}

export default function AdminToastCard({ toast, onClose }) {
  if (!toast) return null

  const Icon = ICON_MAP[toast.type] || FiInfo
  const style = STYLE_MAP[toast.type] || STYLE_MAP.info

  return (
    <div className="fixed right-4 top-4 z-[70] w-[92vw] max-w-sm animate-[toast-slide_220ms_ease-out]">
      <div className={`rounded-2xl border bg-[color:var(--card-bg)] backdrop-blur-2xl p-4 shadow-xl ${style}`}>
        <div className="flex items-start gap-3">
          <Icon size={18} className="mt-[2px] shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{toast.title}</p>
            {toast.detail ? (
              <p className="mt-1 text-xs text-[color:var(--app-muted)]">{toast.detail}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/45 dark:hover:bg-slate-800/45"
            aria-label="Close popup"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
