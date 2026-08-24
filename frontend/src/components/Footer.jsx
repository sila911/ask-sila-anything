import { GitHubDark, GitHubLight, Instagram, Facebook, Telegram, Chrome } from 'developer-icons'

export default function Footer() {
  const year = new Date().getFullYear()

  const socialLinks = [
    {
      icon: <Chrome className="w-7 h-7" />,
      href: "https://ask-sila-anything.vercel.app",
      label: "Website",
      hover: "hover:bg-blue-500/15 hover:shadow-blue-500/20",
    },
    {
      icon: <Telegram className="w-7 h-7" />,
      href: "https://t.me/siladc",
      label: "Telegram",
      hover: "hover:bg-sky-500/15 hover:shadow-sky-500/20",
    },
    {
      icon: (
        <>
          <GitHubLight className="w-7 h-7 dark:hidden" />
          <GitHubDark className="w-7 h-7 hidden dark:block" />
        </>
      ),
      href: "https://github.com/sila911",
      label: "GitHub",
      hover: "hover:bg-slate-500/15 hover:shadow-slate-400/20",
    },
    {
      icon: <Instagram className="w-7 h-7" />,
      href: "https://www.instagram.com/siladc/",
      label: "Instagram",
      hover: "hover:bg-pink-500/15 hover:shadow-pink-500/20",
    },
    {
      icon: <Facebook className="w-7 h-7" />,
      href: "https://www.facebook.com/silaadc",
      label: "Facebook",
      hover: "hover:bg-blue-600/15 hover:shadow-blue-600/20",
    },
  ]

  return (
    <footer className="relative w-full mt-6">
      {/* Ambient glow orbs — outside card so they don't get clipped */}
      <div className="pointer-events-none absolute -top-10 left-1/4 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -top-8 right-1/4 w-48 h-24 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Glass card */}
      <div className="relative mx-4 mb-4 rounded-[2rem] bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_-2px_32px_rgba(0,0,0,0.07)] overflow-hidden">

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="relative z-10 px-6 py-8 flex flex-col items-center gap-6">

          {/* Brand */}
          <div className="text-center space-y-1.5">
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400"
              style={{ fontFamily: "'Racing Sans One', sans-serif" }}
            >
              Ask Sila Anything
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Ask me anything anonymously · Get styled answers · Drop reactions &amp; comments
            </p>
          </div>

          {/* Divider */}
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Social icons — no border, bigger */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon, href, label, hover }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={`group w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 dark:bg-white/[0.04] transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg ${hover}`}
              >
                <span className="w-7 h-7 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </span>
              </a>
            ))}
          </div>

          {/* Copyright — original style */}
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-wide">
            © {year} Ask Sila Anything. All rights reserved.
          </p>
        </div>

        {/* Watermark — clipped inside card, fully decorative, no blur on text */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-x-0 bottom-0 text-center font-extrabold leading-none tracking-widest overflow-hidden"
          style={{
            fontFamily: "'Racing Sans One', sans-serif",
            fontSize: 'clamp(2.5rem, 10vw, 6rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.04)',
            paddingBottom: '0.15em',
          }}
        >
          ASK SILA ANYTHING
        </div>
      </div>
    </footer>
  )
}
