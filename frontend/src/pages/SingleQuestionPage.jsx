import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import { Heart, Send2, Refresh, Message } from "iconsax-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionCard } from "../components/RecentlyAsked";

// ─── Reaction helpers ─────────────────────────────────────────────────────────
const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Haha" },
  { type: "think", emoji: "🤔", label: "Hmm" },
  { type: "gasp", emoji: "😮", label: "Wow" },
  { type: "fire", emoji: "🔥", label: "Hot" },
];

const triggerEmojiBurst = (e, emoji) => {
  const x = e.clientX || (e.currentTarget?.getBoundingClientRect().left ?? 0);
  const y = e.clientY || (e.currentTarget?.getBoundingClientRect().top ?? 0);
  window.dispatchEvent(new CustomEvent("trigger-emoji-burst", { detail: { x, y, emoji } }));
};

// ─── Inline Comment Item ──────────────────────────────────────────────────────
function CommentItem({ c, timeAgo, likedComments, handleLikeComment }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const userReaction =
    likedComments && !Array.isArray(likedComments)
      ? likedComments[c.id] || null
      : likedComments?.includes?.(c.id) ? "heart" : null;
  const isLiked = !!userReaction;

  const totalReactions = Object.values(c.reactions || {}).reduce((a, b) => a + (b || 0), 0);
  const topEmojis = Object.entries(c.reactions || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => ({ heart: "❤️", laugh: "😂", think: "🤔", gasp: "😮", fire: "🔥" }[type] ?? "❤️"));

  const reactionIcon = () => {
    if (!isLiked) return <Heart size={14} />;
    const map = { heart: <Heart size={14} className="fill-red-500 text-red-500" />, laugh: <span className="text-xs">😂</span>, think: <span className="text-xs">🤔</span>, gasp: <span className="text-xs">😮</span>, fire: <span className="text-xs">🔥</span> };
    return map[userReaction] ?? <Heart size={14} className="fill-red-500 text-red-500" />;
  };

  const reactionColor = () => {
    if (!isLiked) return "text-slate-400 hover:text-rose-500";
    const map = { heart: "text-rose-500", laugh: "text-amber-500", think: "text-indigo-400", gasp: "text-cyan-500", fire: "text-orange-500" };
    return map[userReaction] ?? "text-rose-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 group"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-sm">
        👻
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Anonymous</span>
            <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
          </div>

          {/* Reaction button + picker */}
          <div
            className="relative"
            onMouseEnter={() => setPickerOpen(true)}
            onMouseLeave={() => setPickerOpen(false)}
          >
            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-1/2 -translate-y-1/2 right-full mr-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg z-20 whitespace-nowrap"
                >
                  {REACTION_TYPES.map((r) => (
                    <motion.button
                      key={r.type}
                      whileHover={{ scale: 1.4, y: -3 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        triggerEmojiBurst(e, r.emoji);
                        handleLikeComment?.(c.id, r.type);
                        setPickerOpen(false);
                      }}
                      className="text-lg leading-none select-none"
                      title={r.label}
                    >
                      {r.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={(e) => {
                triggerEmojiBurst(e, userReaction ? ({ heart: "❤️", laugh: "😂", think: "🤔", gasp: "😮", fire: "🔥" }[userReaction]) : "❤️");
                handleLikeComment?.(c.id, userReaction || "heart");
              }}
              className={`flex items-center gap-1 transition-colors duration-200 ${reactionColor()}`}
            >
              <motion.span
                key={userReaction ?? "none"}
                animate={isLiked ? { scale: [1, 1.5, 0.9, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex items-center"
              >
                {reactionIcon()}
              </motion.span>
              {topEmojis.length > 0 && (
                <span className="text-[9px] leading-none flex gap-px">{topEmojis.join("")}</span>
              )}
              <span className="text-[10px] font-bold">{totalReactions || 0}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-800 dark:text-zinc-200 break-words whitespace-pre-wrap leading-relaxed">
          {c.text}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Inline Comments Section ──────────────────────────────────────────────────
function InlineComments({ qId, comments, onAddComment, likedComments, handleLikeComment, timeAgo }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const qComments = [...((comments || []).filter((c) => c.questionId === qId))]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await onAddComment(qId, text.trim());
    setText("");
    setSubmitting(false);
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Message size={18} className="text-cyan-500" />
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          Comments
        </h2>
        <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
          {qComments.length}
        </span>
      </div>

      {/* Input */}
      <div className="glass-shell rounded-2xl p-3 mb-6 flex items-end gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-sm">
          👻
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={1}
            disabled={submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="flex-1 min-h-[36px] max-h-[120px] resize-none bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none leading-relaxed pt-1"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 active:scale-90 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {submitting ? (
              <Refresh size={14} className="animate-spin" />
            ) : (
              <Send2 size={14} />
            )}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex flex-col gap-5">
        <AnimatePresence initial={false}>
          {qComments.length > 0 ? (
            qComments.map((c) => (
              <CommentItem
                key={c.id}
                c={c}
                timeAgo={timeAgo}
                likedComments={likedComments}
                handleLikeComment={handleLikeComment}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-10 gap-2 text-slate-400 dark:text-slate-500"
            >
              <span className="text-3xl">💬</span>
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs">Be the first to share your thoughts!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SingleQuestionPage({
  questions,
  designs,
  comments,
  onAddComment,
  likedQuestions,
  handleLike,
  likedComments,
  handleLikeComment,
  handleView,
  timeAgo,
  hasAskedQuestion,
  typingState,
  likedAnswers,
  handleLikeAnswer,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  const question = questions.find(
    (q) => q.number?.toString() === id || q.id.toString() === id
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!question && questions.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">🔍</span>
        <h2 className="text-2xl font-bold">Question not found</h2>
        <p className="text-slate-500 text-sm">It may have been removed or the link is invalid.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold transition-all cursor-pointer"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <Refresh size={28} className="animate-spin" />
        <p className="text-sm">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pt-2 pb-12 px-0">

      {/* ── 1. Back Button Wrapper ── */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all font-semibold text-sm backdrop-blur-xl cursor-pointer shadow-sm active:scale-95"
        >
          <FiArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-cyan-500/10 border border-slate-200/80 dark:border-white/10 hover:border-cyan-500/30 text-slate-700 dark:text-slate-200 hover:text-cyan-500 transition-all font-semibold text-xs backdrop-blur-xl cursor-pointer shadow-sm active:scale-95"
        >
          <FiShare2 size={15} />
          <span>{copied ? "Link copied!" : "Share Question"}</span>
        </button>
      </div>

      {/* ── 2. Question through Comments Section Wrapper ── */}
      <div className="w-full flex flex-col gap-6 p-4 sm:p-6 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10 backdrop-blur-2xl shadow-xl">
        {/* Question Card */}
        <QuestionCard
          q={question}
          designs={designs}
          comments={comments}
          onAddComment={onAddComment}
          likedQuestions={likedQuestions}
          handleLike={handleLike}
          likedComments={likedComments}
          handleLikeComment={handleLikeComment}
          handleView={handleView}
          timeAgo={timeAgo}
          isSingleView={true}
          isLocked={!hasAskedQuestion}
          typingState={typingState}
          likedAnswers={likedAnswers}
          handleLikeAnswer={handleLikeAnswer}
        />

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 dark:via-white/15 to-transparent" />

        {/* Comments Section */}
        <InlineComments
          qId={question.id}
          comments={comments}
          onAddComment={onAddComment}
          likedComments={likedComments}
          handleLikeComment={handleLikeComment}
          timeAgo={timeAgo}
        />
      </div>

      {/* ── 3. CTA Banner ── */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-pink-500/10 border border-cyan-500/20 backdrop-blur-md text-center">
        <p className="text-2xl mb-2">🙋</p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Got something to ask?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
          Ask Sila anything anonymously and get a styled personal answer!
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          Ask a Question →
        </button>
      </div>
    </div>
  );
}
