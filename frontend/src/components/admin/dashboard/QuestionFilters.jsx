import {
  InfoCircle,
  SearchNormal1,
  CloseCircle,
  Filter,
} from "iconsax-react";

export default function QuestionFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  filteredCount,
  totalQuestions,
  pendingCount,
  answeredCount,
  pinnedCount,
  hiddenCount,
}) {
  return (
    <>
      {/* Header with Title & Quick Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[color:var(--card-border)] mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center border border-cyan-500/30 shrink-0 shadow-inner">
            <InfoCircle size={22} variant="Bold" />
          </div>
          <div>
            <h3 className="font-bold text-lg font-['Racing_Sans_One',sans-serif] tracking-wide flex items-center gap-2">
              Manage Questions
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 font-sans font-semibold">
                {filteredCount} of {totalQuestions}
              </span>
            </h3>
            <p className="text-xs text-[color:var(--app-muted)]">
              Moderation, answer shortcuts, details &amp; action menu
            </p>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px] sm:w-72">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchNormal1 size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or @telegram..."
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <CloseCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/40 dark:bg-black/25 border border-[color:var(--card-border)]">
          {[
            { id: "all", label: "All", count: totalQuestions },
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "answered", label: "Answered", count: answeredCount },
            { id: "pinned", label: "Pinned", count: pinnedCount },
            { id: "hidden", label: "Private", count: hiddenCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>
    </>
  );
}
