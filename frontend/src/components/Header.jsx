import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun1, Coffee } from "iconsax-react";
import BuyMeCoffeeModal from "./BuyMeCoffeeModal";

export default function Header() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleThemeToggle = (e) => {
    const isAppearanceTransition = document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition) {
      const html = document.documentElement;
      html.classList.toggle("dark");
      const nextThemeIsDark = html.classList.contains("dark");
      setIsDark(nextThemeIsDark);
      localStorage.setItem("theme", nextThemeIsDark ? "dark" : "light");
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(async () => {
      flushSync(() => {
        const html = document.documentElement;
        html.classList.toggle("dark");
        const nextThemeIsDark = html.classList.contains("dark");
        setIsDark(nextThemeIsDark);
        localStorage.setItem("theme", nextThemeIsDark ? "dark" : "light");
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 400,
          easing: "ease-in",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <>
      <header className={`sticky top-0 z-[100] w-full flex justify-between items-center px-4 py-3 transition-all duration-300 ${
        scrolled 
          ? "border-b border-slate-200/30 dark:border-white/5 shadow-sm bg-transparent" 
          : "border-b border-transparent bg-transparent"
      }`}>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label="Story Studio home"
          className="theme-toggle-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--icon-chip)] border border-[color:var(--card-border)] text-[color:var(--app-text)] hover:bg-[color:var(--icon-chip-hover)] transition active:scale-95"
        >
          <img
            src="/silaNav.png"
            alt="Sila profile"
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm font-semibold tracking-wide">
            Sila
          </span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCoffeeModalOpen(true)}
            className="theme-toggle-btn inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 py-1.5 sm:px-4 bg-[color:var(--icon-chip)] border border-[color:var(--card-border)] text-[color:var(--app-text)] hover:bg-[color:var(--icon-chip-hover)] transition active:scale-95"
            aria-label="Buy me a coffee"
          >
            <Coffee size="20" variant="Linear" />
            <span className="hidden sm:inline text-sm font-semibold tracking-wide">
              Buy me a coffee
            </span>
          </button>

          <button
            onClick={handleThemeToggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="theme-toggle-btn inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--icon-chip)] border border-[color:var(--card-border)] text-[color:var(--app-text)] hover:bg-[color:var(--icon-chip-hover)] transition active:scale-95"
          >
            <span
              className={`theme-icon ${isDark ? "theme-icon--sun" : "theme-icon--moon"}`}
            >
              {isDark ? <Sun1 size={17} /> : <Moon size={18} />}
            </span>
          </button>
        </div>
      </header>
      <BuyMeCoffeeModal isOpen={isCoffeeModalOpen} onClose={() => setIsCoffeeModalOpen(false)} />
    </>
  );
}
