import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, Lock } from "iconsax-react";
import CreateDesign from "../components/admin/CreateDesign";
import Library from "../components/admin/Library";
import AdminDashboard from "../components/admin/AdminDashboard";

const TAB_VARIANTS = {
  enter: (dir) => ({ x: dir > 0 ? 150 : -150, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -150 : 150, opacity: 0 }),
};

const TAB_TRANSITION = {
  x: { type: "spring", stiffness: 350, damping: 30 },
  opacity: { duration: 0.15 },
};

export default function AdminPage({
  isAdminUnlocked,
  isAuthChecking,
  handleAdminAuth,
  activeTab,
  tabDirection,
  changeTabWithDirection,
  seedDesign,
  addDesign,
  trackEvent,
  showAdminToast,
  questions,
  markAnswered,
  designs,
  orderedDesigns,
  reuseDesign,
  removeDesign,
  events,
  handleToggleVisibility,
  handleTogglePin,
  handleSoftDelete,
  linkMessage,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setError("");
    const res = await handleAdminAuth(password);
    if (!res.ok) {
      setError(res.message || "Invalid admin password.");
    }
    setIsLoading(false);
  };

  if (isAuthChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-in fade-in">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Verifying admin session...</p>
      </div>
    );
  }

  if (!isAdminUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in duration-300">
        <div className="glass-shell rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center border border-cyan-500/30 shrink-0 shadow-inner">
              <Lock size={24} variant="Bold" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide leading-tight">
                ADMIN ACCESS
              </h2>
              <p className="text-xs text-[color:var(--app-muted)] mt-0.5">
                Enter password to unlock studio &amp; dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter admin password..."
                className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-medium px-1 animate-in fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Authenticating..." : "Unlock Admin Workspace"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-shell glass-shell--3d w-[95%] max-w-6xl rounded-[2rem] p-5 sm:p-8">
      {linkMessage && (
        <p className="mb-3 text-sm text-[color:var(--app-muted)]">{linkMessage}</p>
      )}

      <div className="relative overflow-hidden w-full min-h-[500px]">
        <AnimatePresence initial={false} custom={tabDirection} mode="wait">
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={TAB_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={TAB_TRANSITION}
            className="w-full"
          >
            {activeTab === "create" && (
              <CreateDesign
                seedDesign={seedDesign}
                onSave={addDesign}
                onEvent={trackEvent}
                onNotify={showAdminToast}
                questions={questions}
                onQuestionAnswered={markAnswered}
              />
            )}

            {activeTab === "library" && (
              <Library
                designs={orderedDesigns}
                onReuse={reuseDesign}
                onDelete={removeDesign}
              />
            )}

            {activeTab === "admin" && (
              <AdminDashboard
                designs={designs}
                events={events}
                questions={questions}
                onToggleVisibility={handleToggleVisibility}
                onTogglePin={handleTogglePin}
                onSoftDelete={handleSoftDelete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
