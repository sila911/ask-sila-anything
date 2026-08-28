import { useState, useMemo } from "react";
import QuestionDetailsModal from "./QuestionDetailsModal";
import EditQuestionModal from "./EditQuestionModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import DashboardStats from "./dashboard/DashboardStats";
import QuestionFilters from "./dashboard/QuestionFilters";
import QuestionTable from "./dashboard/QuestionTable";

export default function AdminDashboard({
  designs = [],
  events = [],
  questions = [],
  comments = [],
  onToggleVisibility,
  onTogglePin,
  onSoftDelete,
  onUpdateQuestion,
  onAnswerQuestion,
  showAdminToast,
}) {
  // Modal states
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, question: null });
  const [editModal, setEditModal] = useState({ isOpen: false, question: null });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    questionId: null,
    questionText: "",
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'answered' | 'pinned' | 'hidden'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'views' | 'likes'

  const total = designs.length;
  const rendered = designs.filter((d) => Boolean(d.imageDataUrl)).length;
  const totalQuestions = questions.length;
  const pendingQuestions = questions.filter((q) => q.status !== "answered").length;
  const answeredQuestions = questions.filter((q) => q.status === "answered").length;
  const pinnedQuestions = questions.filter((q) => q.is_pinned).length;
  const hiddenQuestions = questions.filter((q) => q.is_hidden).length;

  const totalCopies = events.filter((e) => e.type === "image_copied").length;
  const totalDownloads = events.filter((e) => e.type === "image_downloaded").length;
  const totalShareClicks = events.filter((e) => e.type === "share_opened").length;

  // Filter & sort questions
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by tab
    if (statusFilter === "pending") {
      result = result.filter((q) => q.status !== "answered");
    } else if (statusFilter === "answered") {
      result = result.filter((q) => q.status === "answered");
    } else if (statusFilter === "pinned") {
      result = result.filter((q) => Boolean(q.is_pinned));
    } else if (statusFilter === "hidden") {
      result = result.filter((q) => Boolean(q.is_hidden));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      result = result.filter(
        (q) =>
          q.question?.toLowerCase().includes(qLower) ||
          q.notify_handle?.toLowerCase().includes(qLower) ||
          q.id?.toString().includes(qLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "views") {
        return (b.views_count || 0) - (a.views_count || 0);
      }
      if (sortBy === "likes") {
        return (b.likes_count || 0) - (a.likes_count || 0);
      }
      return 0;
    });

    return result;
  }, [questions, statusFilter, searchQuery, sortBy]);

  const handleCopyText = (question) => {
    navigator.clipboard.writeText(question.question);
    if (showAdminToast) {
      showAdminToast("Copied to clipboard", "Question text copied.", "success");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.questionId) return;
    try {
      await onSoftDelete(deleteModal.questionId);
      setDeleteModal({ isOpen: false, questionId: null, questionText: "" });
      if (showAdminToast) {
        showAdminToast("Question Deleted", "Question moved to trash.", "info");
      }
    } catch (err) {
      if (showAdminToast) {
        showAdminToast("Error", err.message || "Failed to delete question.", "error");
      }
    }
  };

  return (
    <section className="space-y-6">
      {/* Top Metrics */}
      <div>
        <h2 className="text-xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide">
          Admin Dashboard
        </h2>
        <p className="text-sm text-[color:var(--app-muted)] mt-1 mb-4">
          Frontend analytics from saved local data and user actions.
        </p>

        <DashboardStats
          total={total}
          rendered={rendered}
          totalQuestions={totalQuestions}
          pendingQuestions={pendingQuestions}
          totalCopies={totalCopies}
          totalDownloads={totalDownloads}
          totalShareClicks={totalShareClicks}
        />
      </div>

      {/* Main Question Management Card */}
      <div className="rounded-3xl border border-[color:var(--card-border)] p-4 sm:p-6 bg-white/45 dark:bg-slate-900/40 backdrop-blur-md">
        <QuestionFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filteredCount={filteredQuestions.length}
          totalQuestions={totalQuestions}
          pendingCount={pendingQuestions}
          answeredCount={answeredQuestions}
          pinnedCount={pinnedQuestions}
          hiddenCount={hiddenQuestions}
        />

        <QuestionTable
          filteredQuestions={filteredQuestions}
          comments={comments}
          onOpenDetails={(question) => setDetailsModal({ isOpen: true, question })}
          onOpenEdit={(question) => setEditModal({ isOpen: true, question })}
          onOpenDelete={(info) =>
            setDeleteModal({
              isOpen: true,
              questionId: info.questionId,
              questionText: info.questionText,
            })
          }
          onToggleVisibility={onToggleVisibility}
          onTogglePin={onTogglePin}
          onAnswerQuestion={onAnswerQuestion}
          handleCopyText={handleCopyText}
          onResetFilters={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />
      </div>

      {/* Details Modal */}
      {detailsModal.isOpen && (
        <QuestionDetailsModal
          isOpen={detailsModal.isOpen}
          question={detailsModal.question}
          comments={comments.filter((c) => c.questionId === detailsModal.question?.id)}
          onClose={() => setDetailsModal({ isOpen: false, question: null })}
          onAnswer={(q) => {
            setDetailsModal({ isOpen: false, question: null });
            onAnswerQuestion(q);
          }}
          onToggleVisibility={onToggleVisibility}
          onTogglePin={onTogglePin}
        />
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <EditQuestionModal
          isOpen={editModal.isOpen}
          question={editModal.question}
          onClose={() => setEditModal({ isOpen: false, question: null })}
          onSave={async (updatedData) => {
            await onUpdateQuestion(editModal.question.id, updatedData);
            setEditModal({ isOpen: false, question: null });
            if (showAdminToast) {
              showAdminToast("Question Updated", "Changes have been saved.", "success");
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, questionId: null, questionText: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message={`Are you sure you want to delete "${deleteModal.questionText}"? This will move it to trash.`}
      />
    </section>
  );
}
