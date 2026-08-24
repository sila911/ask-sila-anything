import { useEffect } from "react";
import PullToRefresh from "../components/PullToRefresh";
import RecentlyAsked from "../components/RecentlyAsked";

export default function HomePage({
  publicQuestions,
  designs,
  comments,
  onAddComment,
  likedQuestions,
  handleLike,
  likedComments,
  handleLikeComment,
  handleView,
  timeAgo,
  handleSuccess,
  submitUserQuestion,
  filterMode,
  setFilterMode,
  isFilterOpen,
  setIsFilterOpen,
  hasAskedQuestion,
  typingState,
  likedAnswers,
  handleLikeAnswer,
  isLoading,
  fetchError,
  loadData,
}) {
  // Restore scroll position when returning to Home page
  useEffect(() => {
    const savedPos = sessionStorage.getItem("home_scroll_pos");
    if (savedPos) {
      const top = parseInt(savedPos, 10);
      if (!isNaN(top) && top > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top, behavior: "instant" });
        });
      }
    }

    const handleScroll = () => {
      sessionStorage.setItem("home_scroll_pos", window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <PullToRefresh onRefresh={() => loadData(true)}>
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
        <RecentlyAsked
          questions={publicQuestions}
          designs={designs}
          comments={comments}
          onAddComment={onAddComment}
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
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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
  );
}
