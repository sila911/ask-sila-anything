import { useEffect } from 'react'

export default function Header() {
  useEffect(() => {
    const html = document.documentElement
    if (localStorage.getItem('theme') === 'dark') {
      html.classList.add('dark')
    }
  }, [])

  const handleThemeToggle = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light')
  }

  return (
    <header className="flex justify-between items-center p-4">
      <span className="font-semibold">AMA</span>

      <button
        onClick={handleThemeToggle}
        className="px-4 py-2 rounded-full bg-white/30 dark:bg-black/40 backdrop-blur-xl border border-white/20 transition active:scale-95"
      >
        <i className="fa-solid fa-moon"></i>
      </button>
    </header>
  )
}
