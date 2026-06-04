import { useEffect, useMemo, useState, useRef } from "react";
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FiLink2, FiLogOut, FiUser, FiHeart, FiTag, FiMessageCircle, FiEye, FiShare2, FiCheck, FiArrowLeft, FiArrowRight, FiLock } from "react-icons/fi";
import { Routes, Route, useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "./lib/supabase";
import Header from "./components/Header";
import CoverBanner from "./components/CoverBanner";
import Profile from "./components/Profile";
import QuestionForm from "./components/QuestionForm";
import NavTabs from "./components/NavTabs";
import CreateDesignPage from "./components/CreateDesignPage";
import LibraryPage from "./components/LibraryPage";
import AdminDashboardPage from "./components/AdminDashboardPage";
import AdminAuthModal from "./components/AdminAuthModal";
import AdminToastCard from "./components/AdminToastCard";
import Footer from "./components/Footer";
import ThankYouModal from "./components/ThankYouModal";
import ShareModal from "./components/ShareModal";
import CommentModal from "./components/CommentModal";
import PullToRefresh from "./components/PullToRefresh";
import {
  addEvent,
  addQuestion,
  createQuestion,
  getDesigns,
  getEvents,
  getQuestions,
  likeQuestion,
  unlikeQuestion,
  incrementQuestionView,
  markQuestionAnswered,
  saveDesigns,
  saveQuestions,
  toggleQuestionVisibility,
  toggleQuestionPin,
  softDeleteQuestion,
  deleteDesign,
  getComments,
  addComment,
} from "./lib/storage";
import {
  createEncryptedAdminToken,
  hasAdminPassword,
  validateEncryptedAdminToken,
  verifyOrSetupPassword,
  logoutAdmin,
} from "./lib/adminAccess";

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function QuestionSEO({ question, answer }) {
  const title = question ? `"${question}" - Ask Sila` : "Ask Sila Story Studio";
  const description = answer 
    ? `Sila's answer: ${answer.substring(0, 150)}...` 
    : question 
      ? `Check out this question: "${question.substring(0, 150)}..."`
      : "Ask Sila anything and get styled answers for social media stories.";
  
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

function QuestionCard({ q, designs, comments, onAddComment, likedQuestions, handleLike, handleView, timeAgo, isSingleView = false, isLocked = false }) {
  const cardRef = useRef(null);
  const hasViewed = useRef(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useEffect(() => {
    if (isLocked) return;
    // Check if already viewed in this browser
    const viewedQuestions = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
    if (viewedQuestions.includes(q.id)) {
      hasViewed.current = true;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasViewed.current) {
          hasViewed.current = true;
          handleView(q.id);
          
          // Save to localStorage so it persists across refreshes
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
  // Deterministic pseudo-random values based on question ID
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

  const submitComment = async (e) => {
    if (isLocked) return;
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await onAddComment(q.id, commentText.trim());
    setCommentText("");
    setIsSubmittingComment(false);
  };

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
              <FiLock size={32} className="text-cyan-500" />
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
        
        {/* Header Row: User Avatar + Info (left), Tag (right) */}
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
              <FiTag size={12} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Question Body Text */}
        <div className="w-full block break-words whitespace-normal mb-1">
          <p className="text-slate-950 dark:text-white text-base md:text-lg font-semibold break-words mt-2">
            "{q.question}"
          </p>
        </div>

        {/* Nested Reply Block (Facebook Comment Style) */}
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
                  Sila replied:
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  {timeAgo(designWithAnswer.updatedAt || designWithAnswer.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-slate-800 dark:text-zinc-200 text-xs sm:text-sm pl-2 sm:pl-7 break-words whitespace-normal">
              {designWithAnswer.answerText || (designWithAnswer.text && designWithAnswer.text.includes('\nA: ') ? designWithAnswer.text.split('\nA: ')[1] : designWithAnswer.text)}
            </p>
          </div>
        )}

        {/* Card Footer Row: Interactions */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => !isLocked && handleLike(q.id)}
              className={`flex items-center gap-2 transition-colors duration-200 group/heart ${
                isLiked 
                  ? "text-red-500" 
                  : "text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
              }`}
            >
              <FiHeart 
                size={18} 
                className={`transition-all ${isLiked ? "fill-red-500" : "group-heart:fill-rose-400/20"}`} 
              />
              <span className={`text-sm md:text-base font-semibold ${isLiked ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
                {q.likes_count || 0}
              </span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-slate-600 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors group/share"
            >
              <FiShare2 size={18} />
              <span className="text-sm md:text-base font-semibold">Share</span>
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
              <FiMessageCircle size={18} className={isCommentModalOpen ? "fill-cyan-500/20" : ""} />
              <span className={`text-sm md:text-base font-semibold ${isCommentModalOpen ? "text-cyan-500" : "text-slate-700 dark:text-slate-300"}`}>
                {questionComments.length || 0}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <FiEye size={18} />
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
        qId={q.id}
        timeAgo={timeAgo}
      />
    </div>
  );
}

function SingleQuestionPage({ questions, designs, comments, onAddComment, likedQuestions, handleLike, handleView, timeAgo, hasAskedQuestion }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = questions.find(q => q.id.toString() === id);

  if (!question && questions.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-2xl font-bold">Question not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-cyan-500 text-white rounded-xl font-bold"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!question) return <div className="py-20 text-center">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-8">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors font-medium self-start px-2"
      >
        <FiArrowLeft /> Back to Feed
      </button>
      
      <QuestionCard 
        q={question}
        designs={designs}
        comments={comments}
        onAddComment={onAddComment}
        likedQuestions={likedQuestions}
        handleLike={handleLike}
        handleView={handleView}
        timeAgo={timeAgo}
        isSingleView={true}
        isLocked={!hasAskedQuestion}
      />

      <div className="mt-8 p-6 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">Want to ask something too?</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">You can ask Sila anything anonymously and get a styled answer for your stories!</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold transition-all"
        >
          Ask a Question
        </button>
      </div>
    </div>
  );
}

function HomePage({ 
  questions, designs, comments, onAddComment, likedQuestions, handleLike, handleView, timeAgo, 
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
                className="inline-flex items-center justify-between gap-2 bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200"
              >
                <span>
                  {filterMode === "all" && "All"}
                  {filterMode === "top" && "Top React"}
                  {filterMode === "oldest" && "Oldest"}
                </span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isFilterOpen && (
                <>
                  {/* Invisible Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-[90]" 
                    onClick={() => setIsFilterOpen(false)}
                  ></div>
                  
                  <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-[#1e293b]/95 dark:bg-black/90 border border-white/10 shadow-2xl p-1 flex flex-col gap-0.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        setFilterMode("all");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "all" 
                          ? "bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white" 
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("top");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "top" 
                          ? "bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white" 
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      Top React
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("oldest");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all font-medium ${
                        filterMode === "oldest" 
                          ? "bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white" 
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      Oldest
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div ref={listRef} className="relative z-10 w-full flex flex-col gap-4 p-2 sm:p-4 md:p-6 overflow-visible">
            {[...questions]
              .sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) {
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
                <QuestionCard
                  key={q.id}
                  q={q}
                  designs={designs}
                  comments={comments}
                  onAddComment={onAddComment}
                  likedQuestions={likedQuestions}
                  handleLike={handleLike}
                  handleView={handleView}
                  timeAgo={timeAgo}
                  isLocked={!hasAskedQuestion}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState("user");
  const [activeTab, setActiveTab] = useState("create");
  const [designs, setDesigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [comments, setComments] = useState([]);
  const [seedDesign, setSeedDesign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [needsTokenValidation, setNeedsTokenValidation] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [linkMessage, setLinkMessage] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [adminToast, setAdminToast] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(() => {
    try {
      return localStorage.getItem("hasAskedQuestion") === "true";
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [hasNewQuestions, setHasNewQuestions] = useState(false);
  const [likedQuestions, setLikedQuestions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedQuestions") || "[]");
    } catch {
      return [];
    }
  });

  const [listRef] = useAutoAnimate();
  const navigate = useNavigate();

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const [nextDesigns, nextEvents, nextQuestions, nextComments] = await Promise.all([
        getDesigns(),
        getEvents(),
        getQuestions(),
        getComments(),
      ]);
      setDesigns(nextDesigns);
      setEvents(nextEvents);
      setQuestions(nextQuestions);
      setComments(nextComments);
      setHasNewQuestions(false);
    } catch (error) {
      console.error(error);
      setFetchError("Failed to connect to database. Please check your internet.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAdminUnlocked(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAdminUnlocked(false);
        setViewMode("user");
        navigate('/');
      }
    });

    // Subscribe to new questions (Real-time)
    const channel = supabase
      .channel('public:questions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, () => {
        setHasNewQuestions(true);
      })
      .subscribe();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("adminToken");
    if (token) {
      setAdminToken(token);
      setNeedsTokenValidation(true);
      setIsAdminModalOpen(true);
    }

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const orderedDesigns = useMemo(() => {
    return [...designs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [designs]);

  const addDesign = async (design) => {
    const next = [design, ...designs];
    const persisted = await saveDesigns(next);
    setDesigns(persisted);
  };

  const showAdminToast = (title, detail = "", type = "success") => {
    setAdminToast({
      id: crypto.randomUUID(),
      title,
      detail,
      type,
    });
  };

  useEffect(() => {
    if (!adminToast) return undefined;
    const timer = setTimeout(() => setAdminToast(null), 2600);
    return () => clearTimeout(timer);
  }, [adminToast]);

  const trackEvent = async (type, meta = {}) => {
    try {
      const nextEvents = await addEvent(type, meta);
      setEvents(nextEvents);
    } catch (error) {
      console.error(error);
    }
  };

  const submitUserQuestion = async (questionText) => {
    try {
      const persisted = await addQuestion(questionText);
      setQuestions(persisted);
      trackEvent("question_submitted");
      
      // Mark as asked so the "Recently Asked" list can be shown
      setHasAskedQuestion(true);
      localStorage.setItem("hasAskedQuestion", "true");

      // Send Telegram notification
      fetch('/api/telegram-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText })
      }).catch(err => console.error("Failed to send Telegram notification:", err));

    } catch (error) {
      console.error(error);
      throw error; // Re-throw to be handled by the form component's try-catch
    }
  };

  const handleAddComment = async (questionId, text) => {
    try {
      const newComment = await addComment(questionId, text);
      setComments((prev) => [...prev, newComment]);
      trackEvent("comment_added", { questionId });
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleLike = async (id) => {
    const isCurrentlyLiked = likedQuestions.includes(id);

    // Optimistic Update
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              likes_count: isCurrentlyLiked
                ? Math.max(0, (q.likes_count || 0) - 1)
                : (q.likes_count || 0) + 1,
            }
          : q
      )
    );

    let nextLiked;
    if (isCurrentlyLiked) {
      nextLiked = likedQuestions.filter((lid) => lid !== id);
    } else {
      nextLiked = [...likedQuestions, id];
    }

    setLikedQuestions(nextLiked);
    localStorage.setItem("likedQuestions", JSON.stringify(nextLiked));

    try {
      const data = isCurrentlyLiked ? await unlikeQuestion(id) : await likeQuestion(id);
      // Sync with server count
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, likes_count: data.likes_count } : q))
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleView = async (id) => {
    try {
      const data = await incrementQuestionView(id);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, views_count: data.views_count } : q))
      );
    } catch (error) {
      console.error("Failed to increment view:", error);
    }
  };

  const handleToggleVisibility = async (id, isHidden) => {
    // Optimistic Update
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_hidden: isHidden } : q))
    );

    try {
      await toggleQuestionVisibility(id, isHidden);
      showAdminToast(
        isHidden ? "Question Hidden" : "Question Visible",
        `Visibility updated successfully.`,
        "info"
      );
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      // Revert optimistic update
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, is_hidden: !isHidden } : q))
      );
      showAdminToast("Update failed", error.message, "error");
    }
  };

  const handleTogglePin = async (id, isPinned) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_pinned: isPinned } : q))
    );

    try {
      await toggleQuestionPin(id, isPinned);
      showAdminToast(
        isPinned ? "Question Pinned" : "Question Unpinned",
        `Pin status updated successfully.`,
        "info"
      );
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, is_pinned: !isPinned } : q))
      );
      showAdminToast("Update failed", error.message, "error");
    }
  };

  const handleSoftDelete = async (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));

    try {
      await softDeleteQuestion(id);
      showAdminToast("Question Deleted", "The question has been moved to trash.", "info");
    } catch (error) {
      console.error("Failed to delete question:", error);
      loadData(true);
      showAdminToast("Delete failed", error.message, "error");
    }
  };

  const markAnswered = async (questionId) => {
    const next = markQuestionAnswered(questions, questionId);
    const persisted = await saveQuestions(next);
    setQuestions(persisted);
    trackEvent("question_answered", { questionId });
    showAdminToast(
      "Question marked answered",
      "Question status updated in inbox.",
      "info",
    );
  };

  const removeDesign = async (id) => {
    try {
      const persisted = await deleteDesign(id);
      setDesigns(persisted);
      trackEvent("design_deleted");
      showAdminToast("Deleted", "Answer card removed from library.", "info");
    } catch (error) {
      console.error(error);
      showAdminToast(
        "Delete failed",
        "Could not remove answer card from database.",
        "error",
      );
    }
  };

  const reuseDesign = (design) => {
    setSeedDesign(design);
    setActiveTab("create");
    trackEvent("design_reused", { id: design.id });
    showAdminToast(
      "Loaded in editor",
      "Answer card opened for update.",
      "success",
    );
  };

  const handleSuccess = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openAdminModal = () => {
    setNeedsTokenValidation(Boolean(adminToken));
    setIsAdminModalOpen(true);
  };

  const handleAdminAuth = async (password) => {
    if (!password || password.length < 4) {
      return { ok: false, message: "Password must be at least 4 characters." };
    }

    const verify = await verifyOrSetupPassword(password);
    if (!verify.ok) {
      return { ok: false, message: verify.message || "Wrong admin password." };
    }

    setIsAdminUnlocked(true);
    setIsAdminModalOpen(false);
    setViewMode("admin");
    setActiveTab("admin");
    setNeedsTokenValidation(false);
    setAdminToken("");
    navigate('/'); // Refresh to clear search params if any
    trackEvent("admin_login", { fromToken: needsTokenValidation });
    showAdminToast(
      "Admin unlocked",
      "Welcome back to admin workspace.",
      "success",
    );
    return { ok: true };
  };

  const publicQuestions = useMemo(() => {
    return questions.filter((q) => !q.is_hidden);
  }, [questions]);

  return (
    <div className="min-h-screen flex flex-col text-[color:var(--app-text)] relative">
      <Header />

      {/* Real-time Toast */}
      {hasNewQuestions && (
        <div className="fixed top-24 left-0 w-full z-[150] flex justify-center px-4 pointer-events-none">
          <button 
            onClick={() => loadData()}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-full shadow-2xl shadow-cyan-500/40 animate-in slide-in-from-top-10 duration-500 font-bold text-sm border border-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            New question asked! Click to refresh
          </button>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center px-2 sm:px-4 pb-6">
        <Routes>
          <Route path="/" element={
            viewMode === "user" ? (
              <PullToRefresh onRefresh={() => loadData(true)}>
                <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
                  <HomePage
                    questions={publicQuestions}
                    designs={designs}
                    comments={comments}
                    onAddComment={handleAddComment}
                    likedQuestions={likedQuestions}
                    handleLike={handleLike}
                    handleView={handleView}
                    timeAgo={timeAgo}
                    handleSuccess={handleSuccess}
                    submitUserQuestion={submitUserQuestion}
                    filterMode={filterMode}
                    setFilterMode={setFilterMode}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    listRef={listRef}
                    hasAskedQuestion={hasAskedQuestion}
                  />
                  
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 text-sm font-medium">Loading feed...</p>
                    </div>
                  )}

                  {fetchError && !isLoading && (
                    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center animate-in fade-in zoom-in duration-300">
                      <p className="text-rose-500 font-bold mb-1">Connection Error</p>
                      <p className="text-rose-400 text-sm mb-4">{fetchError}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}
                </div>
              </PullToRefresh>
            ) : (
              isAdminUnlocked && (
                <div className="glass-shell glass-shell--3d w-[95%] max-w-6xl rounded-[2rem] p-5 sm:p-8">
                  <div className="mb-4 flex items-center gap-2 flex-nowrap">
                    <NavTabs
                      activeTab={activeTab}
                      onChange={setActiveTab}
                      showAdminTab={true}
                      className="flex-1 min-w-0"
                    />

                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await logoutAdmin();
                          setIsAdminUnlocked(false);
                          setSessionPassword("");
                          setViewMode("user");
                          setActiveTab("create");
                          navigate('/');
                        }}
                        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-rose-300 text-rose-700 dark:text-rose-300"
                        title="Logout admin"
                        aria-label="Logout admin"
                      >
                        <FiLogOut size={16} />
                      </button>
                    </div>
                  </div>

                  {linkMessage && (
                    <p className="mb-3 text-sm text-[color:var(--app-muted)]">
                      {linkMessage}
                    </p>
                  )}

                  {activeTab === "create" && (
                    <CreateDesignPage
                      seedDesign={seedDesign}
                      onSave={addDesign}
                      onEvent={trackEvent}
                      onNotify={showAdminToast}
                      questions={questions}
                      onQuestionAnswered={markAnswered}
                    />
                  )}

                  {activeTab === "library" && (
                    <LibraryPage
                      designs={orderedDesigns}
                      onReuse={reuseDesign}
                      onDelete={removeDesign}
                    />
                  )}

                  {activeTab === "admin" && (
                    <AdminDashboardPage
                      designs={designs}
                      events={events}
                      questions={questions}
                      onToggleVisibility={handleToggleVisibility}
                      onTogglePin={handleTogglePin}
                      onSoftDelete={handleSoftDelete}
                    />
                  )}
                </div>
              )
            )
          } />
          
          <Route path="/q/:id" element={
           <SingleQuestionPage
             questions={publicQuestions}
             designs={designs}
             comments={comments}
             onAddComment={handleAddComment}
             likedQuestions={likedQuestions}
             handleLike={handleLike}
             handleView={handleView}
             timeAgo={timeAgo}
             hasAskedQuestion={hasAskedQuestion}
           />
          } />
        </Routes>
      </main>

      <Footer onSilaClick={openAdminModal} />

      <ThankYouModal isOpen={showModal} onClose={closeModal} />

      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSubmit={handleAdminAuth}
      />

      {viewMode === "admin" && isAdminUnlocked && (
        <AdminToastCard
          toast={adminToast}
          onClose={() => setAdminToast(null)}
        />
      )}
    </div>
  );
}
