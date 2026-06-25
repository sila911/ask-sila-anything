import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Send2, Refresh } from "iconsax-react";
import { motion } from "framer-motion";

export default function CommentModal({ isOpen, onClose, comments, onAddComment, likedComments = [], handleLikeComment, qId, timeAgo }) {
  const [commentText, setCommentText] = useState("");
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
      className={`fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
            {sortedComments.length > 0 ? sortedComments.map((c) => (
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
                    
                    <button 
                      onClick={() => handleLikeComment?.(c.id)}
                      className={`flex items-center gap-1 transition-colors duration-200 group/heart ${
                        likedComments?.includes(c.id)
                          ? "text-red-500" 
                          : "text-slate-400 hover:text-red-500"
                      }`}
                    >
                      <motion.div
                        key={likedComments?.includes(c.id) ? "liked" : "unliked"}
                        initial={likedComments?.includes(c.id) ? { scale: 0.85 } : { scale: 1 }}
                        animate={likedComments?.includes(c.id) ? { scale: [1, 1.45, 0.9, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
                        whileTap={{ scale: 0.8 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="flex items-center justify-center"
                      >
                        <Heart 
                          size={14} 
                          className={`transition-all ${likedComments?.includes(c.id) ? "fill-red-500" : "group-hover:fill-rose-400/20"}`} 
                        />
                      </motion.div>
                      <span className="text-[10px] font-bold">{c.likes_count || 0}</span>
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-zinc-200 text-sm mt-0.5 break-words whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              </div>
            )) : (
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