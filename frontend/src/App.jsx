import { useEffect, useMemo, useState } from "react";
import { FiLink2, FiLogOut, FiUser, FiHeart, FiTag, FiMessageCircle } from "react-icons/fi";
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
import {
  addEvent,
  addQuestion,
  createQuestion,
  getDesigns,
  getEvents,
  getQuestions,
  likeQuestion,
  unlikeQuestion,
  markQuestionAnswered,
  saveDesigns,
  saveQuestions,
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

export default function App() {
  const [viewMode, setViewMode] = useState("user");
  const [activeTab, setActiveTab] = useState("create");
  const [designs, setDesigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [questions, setQuestions] = useState([]);
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
  const [likedQuestions, setLikedQuestions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedQuestions") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nextDesigns, nextEvents, nextQuestions] = await Promise.all([
          getDesigns(),
          getEvents(),
          getQuestions(),
        ]);
        setDesigns(nextDesigns);
        setEvents(nextEvents);
        setQuestions(nextQuestions);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAdminUnlocked(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAdminUnlocked(false);
        setViewMode("user");
      }
    });

    const params = new URLSearchParams(window.location.search);
    const token = params.get("adminToken");
    if (token) {
      setAdminToken(token);
      setNeedsTokenValidation(true);
      setIsAdminModalOpen(true);
    }

    return () => {
      subscription.unsubscribe();
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
    } catch (error) {
      console.error(error);
      throw error; // Re-throw to be handled by the form component's try-catch
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
      const next = designs.filter((design) => design.id !== id);
      const persisted = await saveDesigns(next);
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
    trackEvent("admin_login", { fromToken: needsTokenValidation });
    showAdminToast(
      "Admin unlocked",
      "Welcome back to admin workspace.",
      "success",
    );
    return { ok: true };
  };

  const createEncryptedAdminLink = async () => {
    // This feature is now deprecated as we use session tokens, 
    // but I'll keep the button for now or it can be removed later.
    showAdminToast("Feature disabled", "Session tokens are handled by the server.", "info");
  };

  return (
    <div className="min-h-screen flex flex-col text-[color:var(--app-text)]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pb-6">
        {viewMode === "user" && (
          <div className="flex flex-col gap-8 w-[92%] max-w-2xl">
            <div className="glass-shell glass-shell--3d w-full rounded-[2rem] overflow-hidden">
              <CoverBanner />
              <div className="p-6 sm:p-8 pt-0 sm:pt-0">
                <Profile />
                <QuestionForm
                  onSuccess={handleSuccess}
                  onSubmitQuestion={submitUserQuestion}
                />
              </div>
            </div>

            {questions.length > 0 && (
              <div className="w-full md:max-w-2xl mx-auto flex flex-col gap-4 p-3.5 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-visible">
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

                <div className="relative z-10 w-full flex flex-col gap-4 p-2 sm:p-4 md:p-6 overflow-visible">
                  {[...questions]
                    .sort((a, b) => {
                      if (filterMode === "top") {
                        return (b.likes_count || 0) - (a.likes_count || 0);
                      }
                      if (filterMode === "oldest") {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                      }
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    })
                    .map((q) => {
                      const designWithAnswer = designs.find((d) => 
                        d.questionId && d.questionId.toString().toLowerCase() === q.id.toString().toLowerCase()
                      );
                      // Deterministic pseudo-random values based on question ID
                      const charCodeSum = q.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const tagIndex = charCodeSum % 4;
                      const tags = ["General", "Personal", "Ask Sila", "Curiosity"];
                      const isLiked = likedQuestions.includes(q.id);

                      return (
                        <div
                          key={q.id}
                          className="relative w-full h-auto flex flex-col gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white backdrop-blur-md"
                        >
                          {/* Header Row: User Avatar + Info (left), Tag (right) */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-white shadow-lg border border-white/10">
                                <span className="text-lg">👻</span>
                              </div>
                              <div>
                                <p className="text-slate-800 dark:text-slate-100 font-medium">Anonymous</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">{timeAgo(q.createdAt)}</p>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-400 whitespace-nowrap font-bold">
                              <span>{tags[tagIndex]}</span>
                              <FiTag size={12} className="stroke-[2.5]" />
                            </div>
                          </div>

                          {/* Question Body Text */}
                          <div className="w-full block break-words whitespace-normal mb-1">
                            <p className="text-slate-950 dark:text-white text-sm md:text-base font-semibold break-words mt-2">
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
                                <p className="font-semibold text-xs text-cyan-400">
                                  Sila replied:
                                </p>
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
                                onClick={() => handleLike(q.id)}
                                className={`flex items-center gap-1.5 transition-colors duration-200 group/heart ${
                                  isLiked 
                                    ? "text-red-500" 
                                    : "text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                                }`}
                              >
                                <FiHeart 
                                  size={14} 
                                  className={`transition-all ${isLiked ? "fill-red-500" : "group-hover/heart:fill-rose-400/20"}`} 
                                />
                                <span className={`text-xs md:text-sm font-medium ${isLiked ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
                                  {q.likes_count || 0}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "admin" && isAdminUnlocked && (
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
              />
            )}
          </div>
        )}
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
