import {
  Clock,
  Notification,
  TickCircle,
  Eye,
  EyeSlash,
  Heart,
  MessageText,
  AttachSquare,
  SearchNormal1,
} from "iconsax-react";
import QuestionActionMenu from "../QuestionActionMenu";

export default function QuestionTable({
  filteredQuestions,
  comments,
  onOpenDetails,
  onOpenEdit,
  onOpenDelete,
  onToggleVisibility,
  onTogglePin,
  onAnswerQuestion,
  handleCopyText,
  onResetFilters,
  searchQuery,
  statusFilter,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-white/60 dark:bg-black/25 shadow-inner">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[color:var(--app-muted)] border-b border-[color:var(--card-border)] bg-slate-50/60 dark:bg-white/5 font-semibold">
              <th className="px-4 py-3.5 min-w-[280px]">Question &amp; Metadata</th>
              <th className="px-3 py-3.5 w-28 text-center">Status</th>
              <th className="px-3 py-3.5 w-28 text-center">Visibility</th>
              <th className="px-3 py-3.5 w-28 text-center hidden md:table-cell">Engagement</th>
              <th className="px-3 py-3.5 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--card-border)]">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => {
                const questionComments = comments.filter((c) => c.questionId === q.id);
                return (
                  <tr
                    key={q.id}
                    className={`transition-colors group hover:bg-slate-50/50 dark:hover:bg-white/5 ${
                      q.is_pinned ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.05]" : ""
                    }`}
                  >
                    {/* Question Content & Meta */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2.5">
                        {q.is_pinned && (
                          <span
                            className="mt-0.5 p-1 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/25 shrink-0"
                            title="Pinned Question"
                          >
                            <AttachSquare size={13} variant="Bold" />
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-medium text-slate-800 dark:text-slate-100 cause-regular line-clamp-2 leading-relaxed cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            onClick={() => onOpenDetails(q)}
                            title={q.question}
                          >
                            {q.question}
                          </p>

                          {/* Metadata Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-[color:var(--app-muted)] font-medium flex items-center gap-1">
                              <Clock size={11} className="text-cyan-500 shrink-0" />
                              {new Date(q.createdAt).toLocaleDateString()} at{" "}
                              {new Date(q.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {q.notify_handle && (
                              <a
                                href={`https://t.me/${q.notify_handle.replace(/^@/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                                title="Open Telegram handle"
                              >
                                <Notification size={11} className="shrink-0" />
                                <span className="truncate max-w-[120px]">{q.notify_handle}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          q.status === "answered"
                            ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                        }`}
                      >
                        <TickCircle size={12} variant="Bold" />
                        {q.status}
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          !q.is_hidden
                            ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                        }`}
                      >
                        {!q.is_hidden ? (
                          <>
                            <Eye size={12} />
                            Public
                          </>
                        ) : (
                          <>
                            <EyeSlash size={12} />
                            Private
                          </>
                        )}
                      </span>
                    </td>

                    {/* Engagement Stats */}
                    <td className="px-3 py-3.5 text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-2.5 text-xs text-[color:var(--app-muted)]">
                        <span className="inline-flex items-center gap-1" title="Views">
                          <Eye size={13} className="text-cyan-500" />
                          {q.views_count || 0}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Likes">
                          <Heart size={13} className="text-rose-500" />
                          {q.likes_count || 0}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Comments">
                          <MessageText size={13} className="text-slate-400" />
                          {questionComments.length}
                        </span>
                      </div>
                    </td>

                    {/* Actions (3-dot Menu) */}
                    <td className="px-3 py-3.5 text-center">
                      <div className="flex justify-center">
                        <QuestionActionMenu
                          question={q}
                          onViewDetails={onOpenDetails}
                          onToggleVisibility={onToggleVisibility}
                          onTogglePin={onTogglePin}
                          onEdit={onOpenEdit}
                          onAnswer={onAnswerQuestion}
                          onDelete={(question) =>
                            onOpenDelete({
                              questionId: question.id,
                              questionText: question.question,
                            })
                          }
                          onCopy={handleCopyText}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      <SearchNormal1 size={22} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No questions match criteria
                    </p>
                    <p className="text-xs text-[color:var(--app-muted)]">
                      Try adjusting search query or selecting a different filter tab.
                    </p>
                    {(searchQuery || statusFilter !== "all") && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-2 px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-500/20 transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
