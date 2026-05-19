import { useEffect, useMemo, useState } from "react";
import { FiLink2, FiLogOut } from "react-icons/fi";
import Header from "./components/Header";
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
  markQuestionAnswered,
  saveDesigns,
  saveQuestions,
} from "./lib/storage";
import {
  createEncryptedAdminToken,
  hasAdminPassword,
  validateEncryptedAdminToken,
  verifyOrSetupPassword,
} from "./lib/adminAccess";

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

    const params = new URLSearchParams(window.location.search);
    const token = params.get("adminToken");
    if (token) {
      setAdminToken(token);
      setNeedsTokenValidation(true);
      setIsAdminModalOpen(true);
    }
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
            <div className="glass-shell glass-shell--3d w-full rounded-[2rem] p-6 sm:p-8">
              <Profile />
              <QuestionForm
                onSuccess={handleSuccess}
                onSubmitQuestion={submitUserQuestion}
              />
            </div>

            {questions.length > 0 && (
              <div className="glass-shell glass-shell--3d w-full rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  Recently Asked
                </h2>
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all group"
                    >
                      <p className="text-[color:var(--app-text)] leading-relaxed mb-2">
                        {q.question}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[color:var(--app-muted)]">
                        <span>
                          {new Date(q.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
                  onClick={() => {
                    setIsAdminUnlocked(false);
                    setSessionPassword("");
                    setViewMode("user");
                    setActiveTab("create");
                    localStorage.removeItem("sila-admin-token");
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
