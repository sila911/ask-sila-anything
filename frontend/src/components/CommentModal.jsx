import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Send2, Refresh } from "iconsax-react";
import { motion, AnimatePresence } from "framer-motion";

const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Haha" },
  { type: "think", emoji: "🤔", label: "Hmm" },
  { type: "gasp", emoji: "😮", label: "Wow" },
  { type: "fire", emoji: "🔥", label: "Hot" }
];

export default function CommentModal({ isOpen, onClose, comments, onAddComment, likedComments = {}, handleLikeComment, qId, timeAgo }) {
  const [commentText, setCommentText] = useState("");
  const [activePickerCommentId, setActivePickerCommentId] = useState(null);
  const touchTimerRef = useRef(null);

  const handleCommentTouchStart = (commentId) => {
    touchTimerRef.current = setTimeout(() => {
      setActivePickerCommentId(commentId);
    }, 400);
  };

  const handleCommentTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await onAddComment(qId, commentText.trim());
    setCommentText("");
    setIsSubmittingComment(false);
  };

  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] overflow-x-hidden flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div 
        className={`glass-shell relative w-full max-w-2xl h-[50vh] flex flex-col rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TikTok style drag indicator / header */}
        <div className="w-full flex flex-col items-center justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mb-3" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </h2>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-4 mt-2">
            {sortedComments.length > 0 ? sortedComments.map((c) => {
              const userReaction = likedComments && !Array.isArray(likedComments) ? likedComments[c.id] || null : (likedComments?.includes?.(c.id) ? "heart" : null);
              const isLiked = !!userReaction;

              const activeReactions = (() => {
                const counts = c.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
                return Object.entries(counts)
                  .filter(([type, count]) => (count || 0) > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type]) => {
                    switch (type) {
                      case "heart": return "❤️";
                      case "laugh": return "😂";
                      case "think": return "🤔";
                      case "gasp": return "😮";
                      case "fire": return "🔥";
                      default: return "❤️";
                    }
                  })
                  .slice(0, 3);
              })();

              const renderReactionIcon = () => {
                if (!isLiked) {
                  return <Heart size={14} className="group-hover:fill-rose-400/20" />;
                }
                switch (userReaction) {
                  case "heart":
                    return <Heart size={14} className="fill-red-500 text-red-500" />;
                  case "laugh":
                    return <span className="text-xs leading-none">😂</span>;
                  case "think":
                    return <span className="text-xs leading-none">🤔</span>;
                  case "gasp":
                    return <span className="text-xs leading-none">😮</span>;
                  case "fire":
                    return <span className="text-xs leading-none">🔥</span>;
                  default:
                    return <Heart size={14} className="fill-red-500 text-red-500" />;
                }
              };

              const getReactionColorClass = () => {
                if (!isLiked) return "text-slate-400 hover:text-red-500 dark:hover:text-red-400";
                switch (userReaction) {
                  case "heart": return "text-red-500";
                  case "laugh": return "text-amber-500";
                  case "think": return "text-indigo-400";
                  case "gasp": return "text-cyan-500";
                  case "fire": return "text-orange-500";
                  default: return "text-red-500";
                }
              };

              return (
                <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-slate-500 dark:text-slate-400 text-sm">
                    👻
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                          Anonymous
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      
                      <div 
                        className="relative"
                        onMouseEnter={() => setActivePickerCommentId(c.id)}
                        onMouseLeave={() => setActivePickerCommentId(null)}
                      >
                        <AnimatePresence>
                          {activePickerCommentId === c.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.9 }}
                              transition={{ duration: 0.15 }}
                              className="absolute bottom-full right-0 mb-1.5 bg-white/35 dark:bg-slate-900/40 backdrop-blur-xl rounded-full px-2 py-1 flex items-center gap-2 shadow-xl border border-white/50 dark:border-white/10 z-30 whitespace-nowrap"
                            >
                              {REACTION_TYPES.map((react) => (
                                <motion.button
                                  key={react.type}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLikeComment?.(c.id, react.type);
                                    setActivePickerCommentId(null);
                                  }}
                                  whileHover={{ scale: 1.35, y: -3 }}
                                  whileTap={{ scale: 0.85 }}
                                  className="text-xl leading-none transition-transform select-none"
                                  title={react.label}
                                >
                                  {react.emoji}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button 
                          onClick={() => handleLikeComment?.(c.id, userReaction || "heart")}
                          onTouchStart={() => handleCommentTouchStart(c.id)}
                          onTouchEnd={handleCommentTouchEnd}
                          className={`flex items-center gap-1.5 transition-colors duration-200 group/heart ${getReactionColorClass()}`}
                        >
                          <motion.div
                            key={userReaction || "unliked-cmt"}
                            initial={isLiked ? { scale: 0.85 } : { scale: 1 }}
                            animate={isLiked ? { scale: [1, 1.45, 0.9, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
                            whileTap={{ scale: 0.8 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="flex items-center justify-center"
                          >
                            {renderReactionIcon()}
                          </motion.div>
                          <div className="flex items-center gap-0.5">
                            {activeReactions.length > 0 && (
                              <div className="flex -space-x-1 items-center mr-0.5 text-[8px]">
                                {activeReactions.map((emoji, idx) => (
                                  <span key={idx} className="z-[2] scale-100 select-none">
                                    {emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="text-[10px] font-bold">{c.likes_count || 0}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  <p className="text-slate-800 dark:text-zinc-200 text-sm mt-0.5 break-words whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              </div>
            );
            }) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
                <p className="text-sm">No comments yet.</p>
                <p className="text-xs mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

        {/* Comment Input Footer */}
        <div className="shrink-0 p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-transparent">
          <form onSubmit={submitComment} className="flex items-center gap-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add comment..."
              disabled={isSubmittingComment}
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              className="flex-1 min-h-[40px] max-h-[120px] rounded-2xl px-4 py-2.5 text-sm bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-900 dark:text-white placeholder:text-slate-500 transition-all resize-none overflow-y-auto"
            />
            <button 
              type="submit" 
              disabled={isSubmittingComment || !commentText.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500 text-white hover:scale-110 active:scale-90 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 shrink-0"
            >
              {isSubmittingComment ? (
                <Refresh size={16} className="animate-spin" />
              ) : (
                <Send2 size={15} className="translate-x-[-1px] translate-y-[1px]" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}