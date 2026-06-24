import React, { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Tag, MessageCircle, Eye, Send2, Lock, Check, ArrowDown2 } from "iconsax-react";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "./ShareModal";
import CommentModal from "./CommentModal";
import CoverBanner from "./CoverBanner";
import Profile from "./Profile";
import QuestionForm from "./QuestionForm";
import FAQSection from "./FAQSection";

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
            ...(see more)
          </button>
        </>
      )}
    </motion.div>
  );
}

export function QuestionCard({ q, designs, comments, onAddComment, likedQuestions, handleLike, likedComments, handleLikeComment, handleView, timeAgo, isSingleView = false, isLocked = false }) {
  const cardRef = useRef(null);
  const hasViewed = useRef(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

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
  const isLiked = likedQuestions.includes(q.id);

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
      className={`relative w-full h-auto flex flex-col gap-3.5 p-3 sm:p-5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white backdrop-blur-md overflow-hidden ${isSingleView ? 'shadow-2xl' : ''}`}
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
            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-400 whitespace-nowrap font-bold">
              <span>{tags[tagIndex]}</span>
              <Tag size={12} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        <div className="w-full block break-words mb-1">
          <ExpandableText
            text={`"${q.question}"`}
            innerClassName="text-slate-950 dark:text-white text-base md:text-lg font-semibold mt-2"
          />
        </div>

        {designWithAnswer && (designWithAnswer.answerText || designWithAnswer.text) && (
          <div className="w-full p-3 sm:p-4 rounded-xl bg-slate-100 border-l-2 border-cyan-500 flex flex-col gap-1.5 mt-1 dark:bg-black/20">
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
            <ExpandableText
              text={designWithAnswer.answerText || (designWithAnswer.text && designWithAnswer.text.includes('\nA: ') ? designWithAnswer.text.split('\nA: ')[1] : designWithAnswer.text)}
              className="pl-2 sm:pl-7"
              innerClassName="text-slate-800 dark:text-zinc-200 text-xs sm:text-sm mali-regular"
            />
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-around">
          <button 
            onClick={() => !isLocked && handleLike(q.id)}
            className={`flex items-center gap-2 transition-colors duration-200 group/heart ${
              isLiked 
                ? "text-red-500" 
                : "text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
            }`}
          >
            <Heart 
              size={18} 
              className={`transition-all ${isLiked ? "fill-red-500" : "group-heart:fill-rose-400/20"}`} 
            />
            <span className={`text-sm md:text-base font-semibold ${isLiked ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
              {q.likes_count || 0}
            </span>
          </button>
          
          <button 
            onClick={() => !isLocked && setIsCommentModalOpen(true)}
            className={`flex items-center gap-2 transition-colors duration-200 group/comment ${
              isCommentModalOpen
                ? "text-cyan-500" 
                : "text-slate-600 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400"
            }`}
            title="View comments"
          >
            <MessageCircle size={18} className={isCommentModalOpen ? "fill-cyan-500/20" : ""} />
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
  hasAskedQuestion 
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
        <div className="w-full md:max-w-2xl mx-auto flex flex-col gap-4 p-2 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-visible">
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
                    className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-[color:var(--card-border)] shadow-2xl p-1 flex flex-col gap-0.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
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