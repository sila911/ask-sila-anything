import { useEffect, useState } from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'

export default function Header() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme === 'dark') {
      html.classList.add('dark')
      setIsDark(true)
    } else {
      html.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const handleThemeToggle = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    const nextThemeIsDark = html.classList.contains('dark')
    setIsDark(nextThemeIsDark)
    localStorage.setItem('theme', nextThemeIsDark ? 'dark' : 'light')
  }

  return (
    <header className="flex justify-between items-center p-4">
      <a
        href="" 
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Sila profile"
        className="theme-toggle-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--icon-chip)] border border-[color:var(--card-border)] text-[color:var(--app-text)] hover:bg-[color:var(--icon-chip-hover)] transition active:scale-95"
      >
        <img
          src="/sila2.jpg"
          alt="Sila profile"
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-sm font-semibold tracking-wide">Sila</span>
      </a>

      <button
        onClick={handleThemeToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="theme-toggle-btn inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--icon-chip)] border border-[color:var(--card-border)] text-[color:var(--app-text)] hover:bg-[color:var(--icon-chip-hover)] transition active:scale-95"
      >
        <span className={`theme-icon ${isDark ? 'theme-icon--sun' : 'theme-icon--moon'}`}>
          {isDark ? <FiSun size={17} /> : <FiMoon size={18} />}
        </span>
      </button>
    </header>
  )
}
