import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiHeart } from "react-icons/fi";

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
        className={`relative w-full max-w-2xl h-[50vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
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
                      <p className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                        Anonymous
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
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
                      <span className="text-[10px] font-bold">{c.likes_count || 0}</span>
                      <FiHeart 
                        size={14} 
                        className={`transition-all ${likedComments?.includes(c.id) ? "fill-red-500" : "group-hover:fill-rose-400/20"}`} 
                      />
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-zinc-200 text-sm mt-0.5 break-words whitespace-normal">
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
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={submitComment} className="flex items-center gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add comment..."
              disabled={isSubmittingComment}
              className="flex-1 h-10 rounded-full px-4 text-sm bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-900 dark:text-white placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={isSubmittingComment || !commentText.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500 text-white disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 transition-colors shrink-0"
            >
              <svg className="w-4 h-4 translate-x-px translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}