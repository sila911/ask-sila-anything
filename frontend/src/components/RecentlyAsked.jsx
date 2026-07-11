import React, { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Tag, Message, Eye, Send2, Lock, Check, ArrowDown2 } from "iconsax-react";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "./ShareModal";
import CommentModal from "./CommentModal";
import CoverBanner from "./CoverBanner";
import Profile from "./Profile";
import QuestionForm from "./QuestionForm";
import FAQSection from "./FAQSection";

const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Haha" },
  { type: "think", emoji: "🤔", label: "Hmm" },
  { type: "gasp", emoji: "😮", label: "Wow" },
  { type: "fire", emoji: "🔥", label: "Hot" }
];

function QuestionSEO({ question, answer }) {
  const title = question ? `"${question}" - Ask Sila` : "Ask Sila Anything";
  const description = answer 
    ? `Sila's answer: ${answer.substring(0, 150)}...` 
    : question 
      ? `Check out this question: "${question.substring(0, 150)}..."`
      : "Ask Sila anything and get the real answer for himsefl!";
  
  const structuredData = question ? {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": question,
      "text": question,
      "answerCount": answer ? 1 : 0,
      "acceptedAnswer": answer ? {
        "@type": "Answer",
        "text": answer,
        "upvoteCount": 1,
        "url": window.location.href
      } : undefined
    }
  } : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="twitter:card" content="summary_large_image" />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

function ExpandableText({ text, className = "", innerClassName = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const safeText = text || "";
  const lines = safeText.split('\n');
  const hasManyLines = lines.length > 8;
  const isTooLong = safeText.length > 450 || hasManyLines;

  if (!isTooLong) {
    return (
      <div className={`${className} ${innerClassName} whitespace-pre-wrap break-words`}>
        {safeText}
      </div>
    );
  }

  let displayText = safeText;
  if (!isExpanded) {
    if (hasManyLines) {
      const first8Lines = lines.slice(0, 8);
      const joined = first8Lines.join('\n');
      if (joined.length > 450) {
        displayText = joined.slice(0, 450).trim();
      } else {
        displayText = joined.trim();
      }
    } else {
      displayText = safeText.slice(0, 450).trim();
    }
  }

  return (
    <motion.div
      layout
      className={`${className} ${innerClassName} whitespace-pre-wrap break-words`}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {isExpanded ? (
        <>
          {safeText}{' '}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold text-xs inline ml-1 transition-colors focus:outline-none"
          >
            (show less)
          </button>
        </>
      ) : (
        <>
          {displayText}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold text-xs inline ml-1 transition-colors focus:outline-none"
          >
            ...see more
          </button>
        </>
      )}
    </motion.div>
  );
}

export function QuestionCard({ q, designs, comments, onAddComment, likedQuestions, handleLike, likedComments, handleLikeComment, handleView, timeAgo, isSingleView = false, isLocked = false, typingState, likedAnswers, handleLikeAnswer }) {
  const cardRef = useRef(null);
  const hasViewed = useRef(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);

  const handleTouchStart = () => {
    if (isLocked) return;
    timerRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLocked) return;
    const viewedQuestions = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
    if (viewedQuestions.includes(q.id)) {
      hasViewed.current = true;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasViewed.current) {
          hasViewed.current = true;
          handleView(q.id);
          const currentViewed = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
          if (!currentViewed.includes(q.id)) {
            localStorage.setItem('viewedQuestions', JSON.stringify([...currentViewed, q.id]));
          }
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, [q.id, handleView, isLocked]);

  const designWithAnswer = designs.find((d) => 
    d.questionId && d.questionId.toString().toLowerCase() === q.id.toString().toLowerCase()
  );
  
  const charCodeSum = q.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tagIndex = charCodeSum % 4;
  const tags = ["General", "Personal", "Ask Sila", "Curiosity"];
  
  const userReaction = likedQuestions && !Array.isArray(likedQuestions) ? likedQuestions[q.id] || null : (likedQuestions?.includes?.(q.id) ? "heart" : null);
  const isLiked = !!userReaction;

  const activeReactions = useMemo(() => {
    const counts = q.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
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
  }, [q.reactions]);

  const renderReactionIcon = () => {
    if (!isLiked) {
      return <Heart size={18} className="group-heart:fill-rose-400/20" />;
    }
    switch (userReaction) {
      case "heart":
        return <Heart size={18} className="fill-red-500 text-red-500" />;
      case "laugh":
        return <span className="text-lg leading-none">😂</span>;
      case "think":
        return <span className="text-lg leading-none">🤔</span>;
      case "gasp":
        return <span className="text-lg leading-none">😮</span>;
      case "fire":
        return <span className="text-lg leading-none">🔥</span>;
      default:
        return <Heart size={18} className="fill-red-500 text-red-500" />;
    }
  };

  const getReactionColorClass = () => {
    if (!isLiked) return "text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400";
    switch (userReaction) {
      case "heart": return "text-red-500";
      case "laugh": return "text-amber-500";
      case "think": return "text-indigo-400";
      case "gasp": return "text-cyan-500";
      case "fire": return "text-orange-500";
      default: return "text-red-500";
    }
  };

  const handleShare = (e) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const questionComments = useMemo(() => {
    return (comments || []).filter((c) => c.questionId === q.id);
  }, [comments, q.id]);

  return (
    <div
      ref={cardRef}
      key={q.id}
      className={`glass-shell glass-shell--3d w-full h-auto flex flex-col gap-3.5 p-3 sm:p-5 rounded-2xl text-slate-900 dark:text-white ${isSingleView ? 'shadow-2xl' : ''}`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Lock size={32} className="text-cyan-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Question Locked</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Ask Sila a question to reveal what others asked!</p>
            </div>
          </div>
        </div>
      )}

      <div className={isLocked ? "blur-md pointer-events-none select-none" : ""}>
        {isSingleView && <QuestionSEO question={q.question} answer={designWithAnswer?.answerText || designWithAnswer?.text} />}
        
        <div className="flex items-center justify-between mb-3">
          <Link 
            to={isLocked ? "#" : `/q/${q.id}`}
            className={`flex items-center gap-3 ${!isSingleView ? "hover:opacity-80 transition-opacity cursor-pointer" : "cursor-default"}`}
            title={!isSingleView ? "View detail page" : ""}
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-white shadow-lg border border-white/10">
              <span className="text-lg">👻</span>
            </div>
            <div>
              <p className="text-slate-800 dark:text-slate-100 font-medium hover:underline">Anonymous</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{timeAgo(q.createdAt)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {!isSingleView && q.is_pinned && (
              <img src="https://img.icons8.com/ios-filled/50/pin--v1.png" alt="Pinned" className="w-4 h-4 opacity-50 dark:invert" />
            )}
            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/50 border border-white/60 dark:bg-white/10 dark:border-white/20 text-cyan-700 dark:text-cyan-400 whitespace-nowrap font-bold shadow-sm backdrop-blur-sm">
              <span>{tags[tagIndex]}</span>
              <Tag size={12} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        <div className="w-full block break-words mb-1">
          <ExpandableText
            text={q.question}
            innerClassName="text-slate-950 dark:text-white text-sm md:text-base cause-semibold mt-2"
          />
        </div>

        {designWithAnswer && (designWithAnswer.answerText || designWithAnswer.text) && (
          <div className="glass-subpane w-full p-3 sm:p-4 rounded-xl border-l-2 border-l-cyan-500 flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src="/sila2.jpg" 
                  className="w-6 h-6 rounded-full object-cover border border-cyan-500/30" 
                  alt="Sila" 
                />
                <div>
                  <p className="font-semibold text-xs text-cyan-400 leading-tight">
                    Sila
                  </p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                    {timeAgo(designWithAnswer.updatedAt || designWithAnswer.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* Sila Answer Likes Reaction (Idea 2: Top-Right) */}
              <button
                onClick={() => !isLocked && handleLikeAnswer?.(q.id)}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors duration-200 group/reply-heart ${
                  likedAnswers?.includes(q.id)
                    ? "text-red-500" 
                    : "text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                }`}
              >
                <motion.div
                  key={likedAnswers?.includes(q.id) ? "liked-ans" : "unliked-ans"}
                  initial={likedAnswers?.includes(q.id) ? { scale: 0.85 } : { scale: 1 }}
                  animate={likedAnswers?.includes(q.id) ? { scale: [1, 1.4, 0.9, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
                  whileTap={{ scale: 0.8 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  <Heart 
                    size={16} 
                    className={`transition-all ${likedAnswers?.includes(q.id) ? "fill-red-500" : "group-reply-heart:fill-rose-400/20"}`} 
                  />
                </motion.div>
                <span>{q.answer_likes_count || 0}</span>
              </button>
            </div>
            <ExpandableText
              text={designWithAnswer.answerText || (designWithAnswer.text && designWithAnswer.text.includes('\nA: ') ? designWithAnswer.text.split('\nA: ')[1] : designWithAnswer.text)}
              className="pl-2 sm:pl-7"
              innerClassName="text-slate-800 dark:text-zinc-200 text-xs sm:text-sm mali-regular"
            />
          </div>
        )}

        {/* Live Typing State */}
        {!designWithAnswer && typingState && typingState.questionId === q.id && typingState.isTyping && (
          <div className="glass-subpane w-full p-3 sm:p-4 rounded-xl border-l-2 border-l-amber-500 bg-amber-500/5 flex flex-col gap-1.5 mt-1 transition-all duration-300">
            <div className="flex items-center gap-2">
              <img 
                src="/sila2.jpg" 
                className="w-6 h-6 rounded-full object-cover border border-amber-500/30 animate-[bounce_1.5s_infinite]" 
                alt="Sila" 
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-xs text-amber-600 dark:text-amber-400 leading-tight">
                    Sila is answering
                  </p>
                  <div className="flex gap-0.5 items-center">
                    <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  typing now
                </p>
              </div>
            </div>
            <div className="pl-2 sm:pl-7 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm mali-regular whitespace-pre-wrap break-words min-h-[1.5rem] relative mt-1">
              {typingState.text || (
                <span className="italic text-slate-400 dark:text-slate-500">Sila is thinking...</span>
              )}
              {typingState.text && (
                <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-amber-500 dark:bg-amber-400 animate-pulse align-middle">|</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-around">
          <div 
            className="relative"
            onMouseEnter={() => !isLocked && setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
          >
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-[-12px] mb-2 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-full px-3 py-2 flex items-center gap-2.5 shadow-xl border border-white/50 dark:border-white/10 z-30 whitespace-nowrap"
                >
                  {REACTION_TYPES.map((react) => (
                    <motion.button
                      key={react.type}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(q.id, react.type);
                        setShowPicker(false);
                      }}
                      whileHover={{ scale: 1.4, y: -5 }}
                      whileTap={{ scale: 0.85 }}
                      className="text-2xl leading-none transition-transform select-none"
                      title={react.label}
                    >
                      {react.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => !isLocked && handleLike(q.id, userReaction || "heart")}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-2 transition-colors duration-200 group/heart ${getReactionColorClass()}`}
            >
              <motion.div
                key={userReaction || "unliked"}
                initial={isLiked ? { scale: 0.85 } : { scale: 1 }}
                animate={isLiked ? { scale: [1, 1.45, 0.9, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
                whileTap={{ scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                {renderReactionIcon()}
              </motion.div>
              <div className="flex items-center gap-1">
                {activeReactions.length > 0 && (
                  <div className="flex -space-x-1.5 items-center mr-1 text-[11px] sm:text-xs">
                    {activeReactions.map((emoji, idx) => (
                      <span key={idx} className="z-[2] scale-100 select-none">
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
                <span className={`text-sm md:text-base font-semibold ${isLiked ? getReactionColorClass() : "text-slate-700 dark:text-slate-300"}`}>
                  {q.likes_count || 0}
                </span>
              </div>
            </button>
          </div>
          
          <button 
            onClick={() => !isLocked && setIsCommentModalOpen(true)}
            className={`flex items-center gap-2 transition-colors duration-200 group/comment ${
              isCommentModalOpen
                ? "text-cyan-500" 
                : "text-slate-600 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400"
            }`}
            title="View comments"
          >
            <Message size={18} className={isCommentModalOpen ? "fill-cyan-500/20" : ""} />
            <span className={`text-sm md:text-base font-semibold ${isCommentModalOpen ? "text-cyan-500" : "text-slate-700 dark:text-slate-300"}`}>
              {questionComments.length || 0}
            </span>
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-600 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors group/share"
          >
            <Send2 size={18} />
            <span className="text-sm md:text-base font-semibold"></span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <img src="https://img.icons8.com/ios-glyphs/50/visible.png" alt="Views" className="w-5 h-5 opacity-50 dark:invert" />
            <span className="text-sm font-semibold">{q.views_count || 0}</span>
          </div>
        </div>
      </div>
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={`${window.location.origin}/q/${q.id}`} 
        questionText={q.question} 
      />
      <CommentModal 
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        comments={questionComments}
        onAddComment={onAddComment}
        likedComments={likedComments}
        handleLikeComment={handleLikeComment}
        qId={q.id}
        timeAgo={timeAgo}
      />
    </div>
  );
}

export default function RecentlyAsked({ 
  questions, designs, comments, onAddComment, likedQuestions, handleLike, likedComments, handleLikeComment, handleView, timeAgo, 
  handleSuccess, submitUserQuestion, filterMode, setFilterMode, isFilterOpen, setIsFilterOpen, listRef,
  hasAskedQuestion, typingState, likedAnswers, handleLikeAnswer 
}) {
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      <QuestionSEO />
      <div className="glass-shell glass-shell--3d w-full rounded-[2rem] overflow-hidden">
        <CoverBanner />
        <div className="p-4 sm:p-8 pt-0 sm:pt-0">
          <Profile />
          <QuestionForm
            onSuccess={handleSuccess}
            onSubmitQuestion={submitUserQuestion}
          />
        </div>
      </div>

      {questions.length > 0 && (
        <div className="glass-shell !shadow-none w-full md:max-w-2xl mx-auto flex flex-col gap-4 p-2 sm:p-5 rounded-3xl overflow-visible">
          <div className="relative z-50 w-full flex items-center justify-between px-1 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Recently Asked
            </h2>
            
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center justify-between gap-2 bg-[color:var(--icon-chip)] text-[color:var(--app-text)] border border-[color:var(--card-border)] rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:bg-[color:var(--icon-chip-hover)]"
              >
                <span>
                  {filterMode === "all" && "All"}
                  {filterMode === "top" && "Top React"}
                  {filterMode === "top_views" && "Top Views"}
                  {filterMode === "oldest" && "Oldest"}
                </span>
                <ArrowDown2
                  className={`w-3 h-3 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                  size={12}
                />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    key="filter-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90]" 
                    onClick={() => setIsFilterOpen(false)}
                  />
                )}
                
                {isFilterOpen && (
                  <motion.div 
                    key="filter-dropdown"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="glass-shell absolute right-0 top-full mt-1.5 w-36 rounded-xl p-1 flex flex-col gap-0.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <button
                      onClick={() => {
                        setFilterMode("all");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "all" 
                          ? "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" 
                          : "text-[color:var(--app-text)] opacity-80 hover:opacity-100 hover:bg-[color:var(--icon-chip-hover)]"
                      }`}
                    >
                      <span>All</span>
                      {filterMode === "all" && <Check size={14} className="shrink-0" />}
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("top");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "top" 
                          ? "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" 
                          : "text-[color:var(--app-text)] opacity-80 hover:opacity-100 hover:bg-[color:var(--icon-chip-hover)]"
                      }`}
                    >
                      <span>Top React</span>
                      {filterMode === "top" && <Check size={14} className="shrink-0" />}
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("top_views");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "top_views" 
                          ? "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" 
                          : "text-[color:var(--app-text)] opacity-80 hover:opacity-100 hover:bg-[color:var(--icon-chip-hover)]"
                      }`}
                    >
                      <span>Top Views</span>
                      {filterMode === "top_views" && <Check size={14} className="shrink-0" />}
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("oldest");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "oldest" 
                          ? "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" 
                          : "text-[color:var(--app-text)] opacity-80 hover:opacity-100 hover:bg-[color:var(--icon-chip-hover)]"
                      }`}
                    >
                      <span>Oldest</span>
                      {filterMode === "oldest" && <Check size={14} className="shrink-0" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative z-10 w-full flex flex-col gap-4 p-2 sm:p-4 md:p-6 overflow-visible">
            {[...questions]
              .sort((a, b) => {
                if (filterMode === "all" && a.is_pinned !== b.is_pinned) {
                  return a.is_pinned ? -1 : 1;
                }
                if (filterMode === "top") {
                  return (b.likes_count || 0) - (a.likes_count || 0);
                }
                if (filterMode === "top_views") {
                  return (b.views_count || 0) - (a.views_count || 0);
                }
                if (filterMode === "oldest") {
                  return new Date(a.createdAt) - new Date(b.createdAt);
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
              })
              .map((q) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <QuestionCard
                    q={q}
                    designs={designs}
                    comments={comments}
                    onAddComment={onAddComment}
                    likedQuestions={likedQuestions}
                    handleLike={handleLike}
                    likedComments={likedComments}
                    handleLikeComment={handleLikeComment}
                    handleView={handleView}
                    timeAgo={timeAgo}
                    isLocked={!hasAskedQuestion}
                    typingState={typingState}
                    likedAnswers={likedAnswers}
                    handleLikeAnswer={handleLikeAnswer}
                  />
                </motion.div>
              ))}
          </div>
        </div>
      )}
      <FAQSection />
    </div>
  );
}