import {
  Edit,
  Notification,
  ArrowDown2,
  SearchNormal1,
  Check,
} from "iconsax-react";

export default function QuestionSelector({
  dropdownRef,
  isDropdownOpen,
  setIsDropdownOpen,
  selectedQuestion,
  selectedQuestionId,
  setSelectedQuestionId,
  searchTerm,
  setSearchTerm,
  filteredQuestions,
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1.5 ml-1">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[color:var(--app-muted)] flex items-center gap-1.5">
          <Edit size={12} className="text-cyan-400" /> Question
        </span>
        {selectedQuestion?.notify_handle && (
          <a
            href={`https://t.me/${selectedQuestion.notify_handle.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
          >
            <Notification size={12} />
            <span>Notify: {selectedQuestion.notify_handle} ↗</span>
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between w-full h-11 px-3.5 rounded-2xl bg-white/5 dark:bg-black/20 border border-slate-200/50 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left group shadow-inner cursor-pointer"
      >
        <div className="truncate text-xs sm:text-sm font-medium pr-2 flex items-center gap-2">
          {selectedQuestion ? (
            <>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  selectedQuestion.status === "answered"
                    ? "bg-emerald-400"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="truncate">{selectedQuestion.question}</span>
            </>
          ) : (
            <span className="text-slate-400">Select a community question...</span>
          )}
        </div>
        <ArrowDown2
          className={`shrink-0 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          size={14}
        />
      </button>

      {/* Question Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <SearchNormal1
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/5 text-xs outline-none text-slate-200 placeholder:text-slate-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setIsDropdownOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full p-2.5 text-left hover:bg-white/5 flex flex-col gap-1 transition-colors cursor-pointer ${
                    selectedQuestionId === q.id ? "bg-cyan-500/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        q.status === "answered"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {q.status}
                    </span>
                    {selectedQuestionId === q.id && (
                      <Check className="text-cyan-400" size={12} />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{q.question}</p>
                </button>
              ))
            ) : (
              <p className="p-4 text-xs text-center text-slate-400">No questions found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
