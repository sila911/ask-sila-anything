import Toast from './ui/Toast'

export default function AdminToastCard({ toast, onClose }) {
  if (!toast) return null
  return <Toast toast={toast} onClose={onClose} duration={6000} />
}
