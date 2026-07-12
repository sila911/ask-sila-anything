import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Routes, Route, useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "./lib/supabase";
import Header from "./components/Header";
import CoverBanner from "./components/CoverBanner";
import Profile from "./components/Profile";
import QuestionForm from "./components/QuestionForm";
import NavTabs from "./components/NavTabs";
import { DockTabs } from "./components/ui/dock-tabs";
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
import RecentlyAsked, { QuestionCard } from "./components/RecentlyAsked";
import ReactionExplosion from "./components/ReactionExplosion";
import {
  addEvent,
  addQuestion,
  createQuestion,
  getDesigns,
  getEvents,
  getQuestions,
  likeQuestion,
  unlikeQuestion,
  reactToQuestion,
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
  likeComment,
  unlikeComment,
  likeAnswer,
  unlikeAnswer,
  reactToAnswer,
  reactToComment,
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

  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30.44);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"}`;
  }

  const diffInYears = Math.floor(diffInDays / 365.25);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"}`;
}

function SingleQuestionPage({ questions, designs, comments, onAddComment, likedQuestions, handleLike, likedComments, handleLikeComment, handleView, timeAgo, hasAskedQuestion, typingState, likedAnswers, handleLikeAnswer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = questions.find(q => q.number?.toString() === id || q.id.toString() === id);

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
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pt-2 pb-8">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors font-medium self-start"
      >
        <FiArrowLeft size="18" /> Back
      </button>
      
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

export default function App() {
  const [viewMode, setViewMode] = useState("user");
  const [activeTab, setActiveTab] = useState("create");
  const [tabDirection, setTabDirection] = useState(0);

  const changeTabWithDirection = (newTab) => {
    if (newTab === activeTab) return;
    const TABS_ORDER = ["create", "library", "admin"];
    const prevIndex = TABS_ORDER.indexOf(activeTab);
    const newIndex = TABS_ORDER.indexOf(newTab);
    if (prevIndex !== -1 && newIndex !== -1) {
      setTabDirection(newIndex > prevIndex ? 1 : -1);
    } else {
      setTabDirection(0);
    }
    setActiveTab(newTab);
  };
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
      const stored = localStorage.getItem("likedQuestions");
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const obj = {};
        parsed.forEach((id) => {
          obj[id] = "heart";
        });
        return obj;
      }
      return parsed || {};
    } catch {
      return {};
    }
  });
  const [likedComments, setLikedComments] = useState(() => {
    try {
      const stored = localStorage.getItem("likedComments");
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const obj = {};
        parsed.forEach((id) => {
          obj[id] = "heart";
        });
        return obj;
      }
      return parsed || {};
    } catch {
      return {};
    }
  });
  const [likedAnswers, setLikedAnswers] = useState(() => {
    try {
      const stored = localStorage.getItem("likedAnswers");
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const obj = {};
        parsed.forEach((id) => {
          obj[id] = "heart";
        });
        return obj;
      }
      return parsed || {};
    } catch {
      return {};
    }
  });

  const [typingState, setTypingState] = useState({ questionId: null, text: "", isTyping: false });

  useEffect(() => {
    const typingChannel = supabase
      .channel('sila-typing')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingState(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, []);

  const [listRef] = useAutoAnimate();
  const navigate = useNavigate();
  const likingInProgress = useRef(new Set());

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

      // Sync liked status from server if provided
      if (nextQuestions && Array.isArray(nextQuestions)) {
        const serverLikedIds = nextQuestions
          .filter((q) => q.is_liked)
          .map((q) => q.id);
        if (serverLikedIds.length > 0) {
          const nextLiked = { ...likedQuestions };
          serverLikedIds.forEach((id) => {
            if (!nextLiked[id]) nextLiked[id] = "heart";
          });
          setLikedQuestions(nextLiked);
          localStorage.setItem("likedQuestions", JSON.stringify(nextLiked));
        }
      }
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
        setViewMode("admin");
      } else if (event === 'SIGNED_OUT') {
        setIsAdminUnlocked(false);
        setViewMode("user");
        navigate('/');
      }
    });

    // Subscribe to changes (Real-time)
    const channel = supabase
      .channel('public_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, () => {
        setHasNewQuestions(true);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comments' }, (payload) => {
        setComments((prev) => prev.map(c => c.id === payload.new.id ? payload.new : c));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
        setComments((prev) => {
          if (prev.some(c => c.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
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

  const handleLike = async (id, reactionType = "heart") => {
    if (likingInProgress.current.has(id)) return;
    likingInProgress.current.add(id);

    const prevReaction = likedQuestions[id] || null;
    const isRemoving = prevReaction === reactionType;

    const actualNewReaction = isRemoving ? null : reactionType;

    // Optimistic Update: Update likedQuestions state object
    const nextLiked = { ...likedQuestions };
    if (isRemoving) {
      delete nextLiked[id];
    } else {
      nextLiked[id] = reactionType;
    }

    setLikedQuestions(nextLiked);
    localStorage.setItem("likedQuestions", JSON.stringify(nextLiked));

    // Optimistic Update: Update questions likes_count and reactions object
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        let reactions = q.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
        // Clone reactions to prevent state mutation
        reactions = { ...reactions };

        let likes_count = q.likes_count || 0;

        // Decrement previous
        if (prevReaction && reactions[prevReaction] !== undefined) {
          reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          likes_count = Math.max(0, likes_count - 1);
        }

        // Increment new
        if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
          reactions[actualNewReaction] = (reactions[actualNewReaction] || 0) + 1;
          likes_count = likes_count + 1;
        }

        return {
          ...q,
          reactions,
          likes_count,
        };
      })
    );

    try {
      const data = await reactToQuestion(id, actualNewReaction, prevReaction);
      // Sync with server count and server reactions object
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, likes_count: data.likes_count, reactions: data.reactions } : q))
      );
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      // Revert optimistic update
      setLikedQuestions(likedQuestions);
      localStorage.setItem("likedQuestions", JSON.stringify(likedQuestions));
      
      // Revert questions list
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;

          let reactions = q.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
          reactions = { ...reactions };
          let likes_count = q.likes_count || 0;

          // Revert new
          if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
            reactions[actualNewReaction] = Math.max(0, reactions[actualNewReaction] - 1);
            likes_count = Math.max(0, likes_count - 1);
          }

          // Revert old
          if (prevReaction && reactions[prevReaction] !== undefined) {
            reactions[prevReaction] = (reactions[prevReaction] || 0) + 1;
            likes_count = likes_count + 1;
          }

          return {
            ...q,
            reactions,
            likes_count,
          };
        })
      );
    } finally {
      likingInProgress.current.delete(id);
    }
  };

  const handleLikeComment = async (id, reactionType = "heart") => {
    const prevReaction = likedComments[id] || null;
    const isRemoving = prevReaction === reactionType;

    const actualNewReaction = isRemoving ? null : reactionType;

    // Optimistic Update: Update likedComments state object
    const nextLiked = { ...likedComments };
    if (isRemoving) {
      delete nextLiked[id];
    } else {
      nextLiked[id] = reactionType;
    }

    setLikedComments(nextLiked);
    localStorage.setItem("likedComments", JSON.stringify(nextLiked));

    // Optimistic Update: Update comments likes_count and reactions object
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        let reactions = c.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
        reactions = { ...reactions };
        let likes_count = c.likes_count || 0;

        // Decrement previous
        if (prevReaction && reactions[prevReaction] !== undefined) {
          reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          likes_count = Math.max(0, likes_count - 1);
        }

        // Increment new
        if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
          reactions[actualNewReaction] = (reactions[actualNewReaction] || 0) + 1;
          likes_count = likes_count + 1;
        }

        return {
          ...c,
          reactions,
          likes_count,
        };
      })
    );

    try {
      const data = await reactToComment(id, actualNewReaction, prevReaction);
      // Sync with server count and server reactions object
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes_count: data.likes_count, reactions: data.reactions } : c))
      );
    } catch (error) {
      console.error("Failed to toggle comment reaction:", error);
      // Revert optimistic update
      setLikedComments(likedComments);
      localStorage.setItem("likedComments", JSON.stringify(likedComments));

      // Revert comments list
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;

          let reactions = c.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
          reactions = { ...reactions };
          let likes_count = c.likes_count || 0;

          // Revert new
          if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
            reactions[actualNewReaction] = Math.max(0, reactions[actualNewReaction] - 1);
            likes_count = Math.max(0, likes_count - 1);
          }

          // Revert old
          if (prevReaction && reactions[prevReaction] !== undefined) {
            reactions[prevReaction] = (reactions[prevReaction] || 0) + 1;
            likes_count = likes_count + 1;
          }

          return {
            ...c,
            reactions,
            likes_count,
          };
        })
      );
    }
  };

  const handleLikeAnswer = async (id, reactionType = "heart") => {
    if (likingInProgress.current.has(`answer-${id}`)) return;
    likingInProgress.current.add(`answer-${id}`);

    const prevReaction = likedAnswers[id] || null;
    const isRemoving = prevReaction === reactionType;

    const actualNewReaction = isRemoving ? null : reactionType;

    // Optimistic Update: Update likedAnswers state object
    const nextLiked = { ...likedAnswers };
    if (isRemoving) {
      delete nextLiked[id];
    } else {
      nextLiked[id] = reactionType;
    }

    setLikedAnswers(nextLiked);
    localStorage.setItem("likedAnswers", JSON.stringify(nextLiked));

    // Optimistic Update: Update questions answer_likes_count and answer_reactions object
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        let reactions = q.answer_reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
        reactions = { ...reactions };
        let answer_likes_count = q.answer_likes_count || 0;

        // Decrement previous
        if (prevReaction && reactions[prevReaction] !== undefined) {
          reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          answer_likes_count = Math.max(0, answer_likes_count - 1);
        }

        // Increment new
        if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
          reactions[actualNewReaction] = (reactions[actualNewReaction] || 0) + 1;
          answer_likes_count = answer_likes_count + 1;
        }

        return {
          ...q,
          answer_reactions: reactions,
          answer_likes_count,
        };
      })
    );

    try {
      const data = await reactToAnswer(id, actualNewReaction, prevReaction);
      // Sync with server count
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, answer_likes_count: data.answer_likes_count, answer_reactions: data.answer_reactions } : q))
      );
    } catch (error) {
      console.error("Failed to toggle answer reaction:", error);
      // Revert optimistic update
      setLikedAnswers(likedAnswers);
      localStorage.setItem("likedAnswers", JSON.stringify(likedAnswers));

      // Revert questions list
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;

          let reactions = q.answer_reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
          reactions = { ...reactions };
          let answer_likes_count = q.answer_likes_count || 0;

          // Revert new
          if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
            reactions[actualNewReaction] = Math.max(0, reactions[actualNewReaction] - 1);
            answer_likes_count = Math.max(0, answer_likes_count - 1);
          }

          // Revert old
          if (prevReaction && reactions[prevReaction] !== undefined) {
            reactions[prevReaction] = (reactions[prevReaction] || 0) + 1;
            answer_likes_count = answer_likes_count + 1;
          }

          return {
            ...q,
            answer_reactions: reactions,
            answer_likes_count,
          };
        })
      );
    } finally {
      likingInProgress.current.delete(`answer-${id}`);
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
    changeTabWithDirection("create");
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
    changeTabWithDirection("create");
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

      <main className={`flex-1 flex items-center justify-center px-2 sm:px-4 ${viewMode === "admin" && isAdminUnlocked ? "pb-28" : "pb-6"}`}>
        <Routes>
          <Route path="/" element={
            viewMode === "user" ? (
              <PullToRefresh onRefresh={() => loadData(true)}>
                <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
                  <RecentlyAsked
                    questions={publicQuestions}
                    designs={designs}
                    comments={comments}
                    onAddComment={handleAddComment}
                    likedQuestions={likedQuestions}
                    handleLike={handleLike}
                    likedComments={likedComments}
                    handleLikeComment={handleLikeComment}
                    handleView={handleView}
                    timeAgo={timeAgo}
                    handleSuccess={handleSuccess}
                    submitUserQuestion={submitUserQuestion}
                    filterMode={filterMode}
                    setFilterMode={setFilterMode}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    hasAskedQuestion={hasAskedQuestion}
                    typingState={typingState}
                    likedAnswers={likedAnswers}
                    handleLikeAnswer={handleLikeAnswer}
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


                  {linkMessage && (
                    <p className="mb-3 text-sm text-[color:var(--app-muted)]">
                      {linkMessage}
                    </p>
                  )}

                  <div className="relative overflow-hidden w-full min-h-[500px]">
                    <AnimatePresence initial={false} custom={tabDirection} mode="wait">
                      <motion.div
                        key={activeTab}
                        custom={tabDirection}
                        variants={{
                          enter: (dir) => ({
                            x: dir > 0 ? 150 : -150,
                            opacity: 0
                          }),
                          center: {
                            x: 0,
                            opacity: 1
                          },
                          exit: (dir) => ({
                            x: dir > 0 ? -150 : 150,
                            opacity: 0
                          })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 350, damping: 30 },
                          opacity: { duration: 0.15 }
                        }}
                        className="w-full"
                      >
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
                      </motion.div>
                    </AnimatePresence>
                  </div>
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
             likedComments={likedComments}
             handleLikeComment={handleLikeComment}
             handleView={handleView}
             timeAgo={timeAgo}
             hasAskedQuestion={hasAskedQuestion}
             typingState={typingState}
             likedAnswers={likedAnswers}
             handleLikeAnswer={handleLikeAnswer}
           />
          } />
        </Routes>
      </main>

      {!(viewMode === "admin" && isAdminUnlocked) && <Footer onSilaClick={openAdminModal} />}

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

      {viewMode === "admin" && isAdminUnlocked && (
        <DockTabs
          activeTab={activeTab}
          onChange={changeTabWithDirection}
          onLogout={async () => {
            await logoutAdmin();
            setIsAdminUnlocked(false);
            setSessionPassword("");
            setViewMode("user");
            changeTabWithDirection("create");
            navigate('/');
          }}
        />
      )}
      <ReactionExplosion />
    </div>
  );
}
