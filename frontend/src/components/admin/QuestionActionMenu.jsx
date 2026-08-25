import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeSlash,
  Edit2,
  Trash,
  Magicpen,
  Copy,
  AttachSquare,
} from "iconsax-react";

export default function QuestionActionMenu({
  question,
  onViewDetails,
  onToggleVisibility,
  onTogglePin,
  onEdit,
  onAnswer,
  onDelete,
  onCopy,
  hideDetailsOption = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState("bottom");
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Adjust placement based on viewport
  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (windowHeight - rect.bottom < 280) {
        setMenuPlacement("top");
      } else {
        setMenuPlacement("bottom");
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleAction = (actionFn) => (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (actionFn) actionFn(question);
  };

  return (
    <div className="relative inline-block text-left">
      {/* 3-Dot Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isOpen
            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105 ring-2 ring-amber-400/40"
            : "bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95"
        }`}
        aria-label="Question actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {/* Floating Action Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{
              opacity: 0,
              scale: 0.92,
              y: menuPlacement === "top" ? 8 : -8,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: menuPlacement === "top" ? 8 : -8,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              right: 0,
              [menuPlacement === "top" ? "bottom" : "top"]: "100%",
              marginBottom: menuPlacement === "top" ? "8px" : undefined,
              marginTop: menuPlacement === "bottom" ? "8px" : undefined,
            }}
            className="z-50 w-52 rounded-2xl bg-[#0e1828]/95 dark:bg-[#0b1320]/95 backdrop-blur-xl border border-white/15 p-1.5 shadow-2xl shadow-black/60 focus:outline-none"
          >
            {/* Details */}
            {!hideDetailsOption && onViewDetails && (
              <button
                type="button"
                onClick={handleAction(onViewDetails)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 transition-all text-left group cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/25 transition-colors">
                  <Eye size={15} variant="Linear" />
                </span>
                <span>Details</span>
              </button>
            )}

            {/* Visibility Toggle (Make Private / Make Public) */}
            <button
              type="button"
              onClick={handleAction(() =>
                onToggleVisibility(question.id, !question.is_hidden)
              )}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 transition-all text-left group cursor-pointer"
            >
              {!question.is_hidden ? (
                <>
                  <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-500/25 transition-colors">
                    <EyeSlash size={15} variant="Linear" />
                  </span>
                  <span className="text-rose-300 group-hover:text-rose-200">Make Private</span>
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/25 transition-colors">
                    <Eye size={15} variant="Linear" />
                  </span>
                  <span className="text-cyan-300 group-hover:text-cyan-200">Make Public</span>
                </>
              )}
            </button>

            {/* Pin / Unpin */}
            <button
              type="button"
              onClick={handleAction(() =>
                onTogglePin(question.id, !question.is_pinned)
              )}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 transition-all text-left group cursor-pointer"
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  question.is_pinned
                    ? "bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30"
                    : "bg-slate-700/50 text-slate-300 group-hover:bg-slate-600/50"
                }`}
              >
                <AttachSquare size={15} variant="Linear" />
              </span>
              <span>{question.is_pinned ? "Unpin Question" : "Pin to Top"}</span>
            </button>

            {/* Answer / Create Design */}
            {onAnswer && (
              <button
                type="button"
                onClick={handleAction(onAnswer)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 transition-all text-left group cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/25 transition-colors">
                  <Magicpen size={15} variant="Linear" />
                </span>
                <span>Answer in Studio</span>
              </button>
            )}

            {/* Copy Question Text */}
            <button
              type="button"
              onClick={handleAction(onCopy)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 transition-all text-left group cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-slate-600/50 transition-colors">
                <Copy size={15} variant="Linear" />
              </span>
              <span>Copy Text</span>
            </button>

            {/* Edit Question */}
            <button
              type="button"
              onClick={handleAction(onEdit)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 transition-all text-left group cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500/25 transition-colors">
                <Edit2 size={15} variant="Linear" />
              </span>
              <span>Edit Question</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            {/* Delete Question */}
            <button
              type="button"
              onClick={handleAction(onDelete)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-all text-left group cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-500/25 transition-colors">
                <Trash size={15} variant="Linear" />
              </span>
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
