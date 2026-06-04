import { useEffect, useMemo, useState, useRef } from "react";
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
                  <RecentlyAsked
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
