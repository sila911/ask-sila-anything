import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft2,
  Notification,
  TickCircle,
  Clock,
  Eye,
  EyeSlash,
  AttachSquare,
} from "iconsax-react";

export default function EditQuestionModal({
  isOpen,
  onClose,
  question,
  onSave,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    notify_handle: "",
    status: "pending",
    is_pinned: false,
    is_hidden: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && question) {
      setFormData({
        question: question.question || "",
        notify_handle: question.notify_handle || "",
        status: question.status || "pending",
        is_pinned: Boolean(question.is_pinned),
        is_hidden: Boolean(question.is_hidden),
      });
      setError("");
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, question]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!shouldRender || !question) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      setError("Question text cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const updates = {
        question: formData.question.trim(),
        notify_handle: formData.notify_handle.trim() || null,
        status: formData.status,
        is_pinned: formData.is_pinned,
        is_hidden: formData.is_hidden,
        ...(formData.status === "answered" && !question.answeredAt
          ? { answeredAt: new Date().toISOString() }
          : {}),
      };

      const res = await onSave(question.id, updates);
      if (res && res.ok === false) {
        setError(res.error?.message || "Failed to update question.");
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[210] bg-[#0c1626] dark:bg-[#070e18] flex flex-col w-full h-full min-h-screen overflow-y-auto text-slate-100 transition-all duration-300 ease-out ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
      }`}
    >
      {/* Full-Screen Top Navigation Bar: [< Edit Question] */}
      <header className="sticky top-0 z-20 w-full bg-[#0c1626]/90 dark:bg-[#070e18]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-slate-100 hover:text-cyan-400 transition-colors group cursor-pointer"
          aria-label="Back"
        >
          <span className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft2 size={18} className="transition-transform group-hover:-translate-x-0.5" />
          </span>
          <h1 className="text-base sm:text-lg font-bold font-['Racing_Sans_One',sans-serif] tracking-wide">
            Edit Question
          </h1>
        </button>
      </header>

      {/* Main Full-Screen Form Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Question Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={formData.question}
              onChange={(e) => {
                setFormData({ ...formData, question: e.target.value });
                if (error) setError("");
              }}
              placeholder="Enter question text..."
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/15 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-100 placeholder:text-slate-500 resize-y min-h-[140px] cause-medium leading-relaxed"
              required
            />
          </div>

          {/* Telegram Handle */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Telegram Notification Handle
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Notification size={18} />
              </span>
              <input
                type="text"
                value={formData.notify_handle}
                onChange={(e) =>
                  setFormData({ ...formData, notify_handle: e.target.value })
                }
                placeholder="@username (optional)"
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Optional username to notify user on Telegram when their question is answered.
            </p>
          </div>

          {/* Status Selection */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Question Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "pending" })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  formData.status === "pending"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/10"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                <Clock size={16} />
                <span>Pending</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "answered" })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  formData.status === "answered"
                    ? "bg-green-500/20 text-green-400 border-green-500/50 shadow-lg shadow-green-500/10"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                <TickCircle size={16} />
                <span>Answered</span>
              </button>
            </div>
          </div>

          {/* Pin & Visibility Toggles */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Visibility Toggle */}
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    !formData.is_hidden
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {!formData.is_hidden ? <Eye size={20} /> : <EyeSlash size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    {!formData.is_hidden ? "Public Visibility" : "Private (Hidden)"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {!formData.is_hidden ? "Visible on feed" : "Hidden from feed"}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={!formData.is_hidden}
                onChange={(e) =>
                  setFormData({ ...formData, is_hidden: !e.target.checked })
                }
                className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500 cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Pin Toggle */}
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    formData.is_pinned
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-slate-700/40 text-slate-400"
                  }`}
                >
                  <AttachSquare size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    {formData.is_pinned ? "Pinned to Top" : "Standard Order"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formData.is_pinned ? "Shown at the top" : "Normal ordering"}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={formData.is_pinned}
                onChange={(e) =>
                  setFormData({ ...formData, is_pinned: e.target.checked })
                }
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium px-2 animate-in fade-in">
              {error}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.question.trim()}
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <TickCircle size={17} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>,
    document.body
  );
}
