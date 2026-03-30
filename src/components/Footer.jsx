import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-[color:var(--card-bg)] backdrop-blur-xl border-t border-[color:var(--card-border)] p-4 text-center text-sm flex flex-col items-center gap-2">
      <span className="flex gap-3 text-lg items-center">
        <span className="text-[color:var(--app-muted)] text-sm">
          © 2026 Ask Sila Anything |
        </span>
        <a
          href="https://github.com/sila911"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[color:var(--icon-chip)] text-[color:var(--app-text)] hover:bg-[color:var(--icon-chip-hover)] transition"
          aria-label="GitHub"
        >
          <FaGithub size={16} />
        </a>

        <a
          href="https://www.linkedin.com/in/sila-sem-78b3872b8/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[color:var(--icon-chip)] text-[color:var(--app-text)] hover:text-blue-500 hover:bg-[color:var(--icon-chip-hover)] transition"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn size={16} />
        </a>

        <a
          href="https://www.instagram.com/siladc/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[color:var(--icon-chip)] text-[color:var(--app-text)] hover:text-pink-500 hover:bg-[color:var(--icon-chip-hover)] transition"
          aria-label="Instagram"
        >
          <FaInstagram size={16} />
        </a>

        <a
          href="https://www.facebook.com/silaadc"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[color:var(--icon-chip)] text-[color:var(--app-text)] hover:text-blue-600 hover:bg-[color:var(--icon-chip-hover)] transition"
          aria-label="Facebook"
        >
          <FaFacebookF size={15} />
        </a>
      </span>
    </footer>
  )
}
