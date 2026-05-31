import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa'

export default function Footer({ onSilaClick }) {
  return (
    <footer className="mt-24 sm:mt-28 bg-[color:var(--card-bg)] backdrop-blur-xl border-t border-[color:var(--card-border)] p-4 text-center text-sm flex flex-col items-center gap-2">
      <span className="flex gap-3 text-lg items-center">
        <span className="text-[color:var(--app-muted)] text-sm">
          © 2026 Ask{' '}
          <button
            type="button"
            onClick={onSilaClick}
            className="appearance-none bg-transparent border-0 p-0 m-0 text-inherit font-inherit cursor-default no-underline focus:outline-none"
            aria-label="Open admin access"
          >
            Sila
          </button>{' '}
          Anything |
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

        <a
          href="https://acledabank.com.kh/acleda?payment_data=qWY5B2SAUfIhLblxzOtfu45tm4QZydtR8ste17vNItjT3Chxy1uq2e1VifDvybGWoX8Md+nprYtJNaV2/goNF2hYO52Bv9AprFiSGN6OqxO2yg4RP2jReNqNssWZ+QE7O65BbuNH2o6b8t3mBcqXBjIaqihYWpVThtY8hw/mDS1tNqRWNqDUhPee+iISOuavOO6/wAZ16a/Gdnh+ovIdCw==&key=khqr"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[color:var(--icon-chip)] hover:bg-[color:var(--icon-chip-hover)] transition overflow-hidden p-0.5"
          aria-label="Pay with Acleda"
        >
          <img 
            src="https://www.acledabank.com.kh/kh/assets/image/logo_acleda.png" 
            alt="Acleda" 
            className="w-full h-full object-contain rounded-full bg-white" 
          />
        </a>
      </span>
    </footer>
  )
}
