import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloseCircle, DirectboxNotif, ExportSquare } from "iconsax-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // Check dismissed timestamp (don't re-show if dismissed within 7 days)
    const dismissedTime = localStorage.getItem("pwa_dismissed_time");
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const isIosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Delay prompt on iOS for friendly experience
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa_dismissed_time", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-[140] max-w-md mx-auto"
      >
        <div className="glass-shell rounded-3xl p-4 shadow-2xl border border-cyan-500/30 backdrop-blur-2xl flex items-center justify-between gap-3 relative overflow-hidden bg-white/80 dark:bg-slate-900/80">
          {/* Ambient cyan glow */}
          <div className="absolute -left-10 -top-10 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* App Icon + Text */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/silaNav.png"
              alt="Ask Sila"
              className="w-11 h-11 rounded-2xl object-cover shadow-md border border-white/20 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Install Ask Sila App
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Add to your home screen for quick access!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <CloseCircle size={18} />
            </button>
          </div>
        </div>

        {/* iOS Guide Modal Drawer */}
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 glass-shell rounded-2xl p-4 border border-cyan-500/30 backdrop-blur-2xl shadow-xl text-xs space-y-2 bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>How to install on iPhone / iPad:</span>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span>1. Tap the</span>
                <ExportSquare size={14} className="text-cyan-500" />
                <span className="font-semibold">Share button</span>
                <span>in Safari bar</span>
              </li>
              <li>
                2. Scroll down and tap <span className="font-semibold text-cyan-500">"Add to Home Screen"</span>
              </li>
              <li>3. Tap <span className="font-semibold">"Add"</span> in the top right corner</li>
            </ol>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
