import { useNavigate } from "react-router-dom";
import { Home2, ArrowLeft2 } from "iconsax-react";
import { sounds } from "../utils/soundEffects";

export default function NotFound404Page() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in duration-300">
      <div className="glass-shell relative rounded-[2.5rem] p-6 sm:p-8 border border-white/20 text-center flex flex-col items-center justify-center">
        {/* Top-Left Back Icon (<) */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            navigate("/");
          }}
          className="absolute left-5 top-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full theme-toggle-btn flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-all active:scale-90 shadow-sm z-10"
          aria-label="Back to Home"
          title="Back to Home"
        >
          <ArrowLeft2 size={18} />
        </button>

        {/* Big 3D Icon on Top */}
        <div className="relative mb-4 mt-2 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-125 pointer-events-none" />
          <img
            src="https://img.icons8.com/3d-fluency/188/compass.png"
            alt="Page Not Found"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* H1 Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide text-[color:var(--app-text)]">
          PAGE NOT FOUND
        </h1>

        {/* Paragraph */}
        <p className="text-xs sm:text-sm text-[color:var(--app-muted)] mt-2 mb-6 max-w-xs leading-relaxed">
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        {/* Action Button (Home) */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            navigate("/");
          }}
          className="w-full h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base shadow-lg shadow-cyan-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home2 size={18} variant="Bold" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
}
