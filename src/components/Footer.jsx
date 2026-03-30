export default function Footer() {
  return (
    <footer className="bg-white/20 dark:bg-black/40 backdrop-blur-xl border-t border-white/20 p-4 text-center text-sm flex flex-col items-center gap-2">
      <span className="flex gap-4 text-lg">
        <span className="opacity-70">
          © 2026 Ask Sila Anything |
        </span>
        <a
          href="https://github.com/sila911"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 hover:opacity-100 transition"
        >
          <i className="fa-brands fa-github"></i>
        </a>

        <a
          href="https://www.linkedin.com/in/sila-sem-78b3872b8/"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 hover:text-blue-500 transition"
        >
          <i className="fa-brands fa-linkedin"></i>
        </a>

        <a
          href="https://www.instagram.com/siladc/"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 hover:text-pink-500 transition"
        >
          <i className="fa-brands fa-instagram"></i>
        </a>

        <a
          href="https://www.facebook.com/silaadc"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 hover:text-blue-600 transition"
        >
          <i className="fa-brands fa-facebook"></i>
        </a>
      </span>
    </footer>
  )
}
