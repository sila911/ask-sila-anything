import { useState, useMemo } from 'react'
import {
  Clock,
  Copy,
  DocumentDownload,
  InfoCircle,
  Image,
  Category,
  Share,
  Eye,
  EyeSlash,
  Trash,
  Notification,
  SearchNormal1,
  Filter,
  TickCircle,
  Heart,
  MessageText,
  AttachSquare,
  CloseCircle,
  Edit2,
  Magicpen,
} from 'iconsax-react'
import QuestionActionMenu from './QuestionActionMenu'
import QuestionDetailsModal from './QuestionDetailsModal'
import EditQuestionModal from './EditQuestionModal'
import DeleteConfirmModal from '../modals/DeleteConfirmModal'

function groupEventsByDay(events) {
  const map = new Map()

  for (const event of events) {
    const day = event.createdAt.slice(0, 10)
    map.set(day, (map.get(day) || 0) + 1)
  }

  const rows = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  return rows.slice(-7)
}

function getTopFonts(designs) {
  const score = new Map()
  for (const d of designs) {
    const font = d.style?.fontFamily || 'Unknown'
    score.set(font, (score.get(font) || 0) + 1)
  }

  return [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
}

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
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, question: null })
  const [editModal, setEditModal] = useState({ isOpen: false, question: null })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, questionId: null, questionText: "" })

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // 'all' | 'pending' | 'answered' | 'pinned' | 'hidden'
  const [sortBy, setSortBy] = useState("newest") // 'newest' | 'oldest' | 'views' | 'likes'

  const total = designs.length
  const rendered = designs.filter((d) => Boolean(d.imageDataUrl)).length
  const totalQuestions = questions.length
  const pendingQuestions = questions.filter((q) => q.status !== 'answered').length
  const totalCopies = events.filter((e) => e.type === 'image_copied').length
  const totalDownloads = events.filter((e) => e.type === 'image_downloaded').length
  const totalShareClicks = events.filter((e) => e.type === 'share_opened').length

  const days = groupEventsByDay(events)
  const maxDayCount = Math.max(1, ...days.map(([, count]) => count))
  const topFonts = getTopFonts(designs)
  const recentEvents = [...events].slice(-8).reverse()

  // Filter & sort questions
  const filteredQuestions = useMemo(() => {
    let result = [...questions]

    // Filter by tab
    if (statusFilter === 'pending') {
      result = result.filter((q) => q.status !== 'answered')
    } else if (statusFilter === 'answered') {
      result = result.filter((q) => q.status === 'answered')
    } else if (statusFilter === 'pinned') {
      result = result.filter((q) => Boolean(q.is_pinned))
    } else if (statusFilter === 'hidden') {
      result = result.filter((q) => Boolean(q.is_hidden))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim()
      result = result.filter(
        (q) =>
          q.question?.toLowerCase().includes(qLower) ||
          q.notify_handle?.toLowerCase().includes(qLower) ||
          q.id?.toString().includes(qLower)
      )
    }

    // Sort
    result.sort((a, b) => {
      // Pinned items stay at top when sorting by newest
      if (sortBy === 'newest') {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (sortBy === 'views') {
        return (b.views_count || 0) - (a.views_count || 0)
      }
      if (sortBy === 'likes') {
        return (b.likes_count || 0) - (a.likes_count || 0)
      }
      return 0
    })

    return result
  }, [questions, statusFilter, searchQuery, sortBy])

  const handleCopyText = (question) => {
    navigator.clipboard.writeText(question.question)
    if (showAdminToast) {
      showAdminToast("Copied to clipboard", "Question text copied.", "success")
    }
  }

  return (
    <section className="space-y-6">
      {/* Top Metrics */}
      <div>
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-sm text-[color:var(--app-muted)] mt-1 mb-4">
          Frontend analytics from saved local data and user actions.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
          <Metric title="Questions" value={totalQuestions} />
          <Metric title="Pending" value={pendingQuestions} />
          <Metric title="Designs" value={total} />
          <Metric title="Rendered" value={rendered} />
          <Metric title="Copies" value={totalCopies} />
          <Metric title="Downloads" value={totalDownloads} />
          <Metric
            title="Share Clicks"
            value={totalShareClicks}
            className="col-start-2 sm:col-start-2 sm:col-span-2 lg:col-start-auto lg:col-span-1"
            centered
          />
        </div>
      </div>

      {/* Redesigned Manage Questions Section */}
      <div className="rounded-3xl border border-[color:var(--card-border)] p-4 sm:p-6 bg-white/45 dark:bg-slate-900/40 backdrop-blur-md shadow-xl">
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
                  {filteredQuestions.length} of {totalQuestions}
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
              { id: 'all', label: 'All', count: totalQuestions },
              { id: 'pending', label: 'Pending', count: pendingQuestions },
              {
                id: 'answered',
                label: 'Answered',
                count: questions.filter((q) => q.status === 'answered').length,
              },
              {
                id: 'pinned',
                label: 'Pinned',
                count: questions.filter((q) => q.is_pinned).length,
              },
              {
                id: 'hidden',
                label: 'Private',
                count: questions.filter((q) => q.is_hidden).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[color:var(--app-muted)] font-medium hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>
          </div>
        </div>

        {/* Questions Data Table */}
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
                    const questionComments = comments.filter((c) => c.questionId === q.id)
                    return (
                      <tr
                        key={q.id}
                        className={`transition-colors group hover:bg-slate-50/50 dark:hover:bg-white/5 ${
                          q.is_pinned ? 'bg-amber-500/[0.03] dark:bg-amber-500/[0.05]' : ''
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
                                onClick={() => setDetailsModal({ isOpen: true, question: q })}
                                title={q.question}
                              >
                                {q.question}
                              </p>

                              {/* Metadata Badges */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-[color:var(--app-muted)] font-medium flex items-center gap-1">
                                  <Clock size={11} className="text-cyan-500 shrink-0" />
                                  {new Date(q.createdAt).toLocaleDateString()} at{' '}
                                  {new Date(q.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>

                                {q.notify_handle && (
                                  <a
                                    href={`https://t.me/${q.notify_handle.replace(/^@/, '')}`}
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
                              q.status === 'answered'
                                ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
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
                                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
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
                              onViewDetails={(question) =>
                                setDetailsModal({ isOpen: true, question })
                              }
                              onToggleVisibility={onToggleVisibility}
                              onTogglePin={onTogglePin}
                              onEdit={(question) =>
                                setEditModal({ isOpen: true, question })
                              }
                              onAnswer={onAnswerQuestion}
                              onDelete={(question) =>
                                setDeleteModal({
                                  isOpen: true,
                                  questionId: question.id,
                                  questionText: question.question,
                                })
                              }
                              onCopy={handleCopyText}
                            />
                          </div>
                        </td>
                      </tr>
                    )
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
                        {(searchQuery || statusFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("")
                              setStatusFilter("all")
                            }}
                            className="mt-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            Reset filters
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
      </div>

      {/* Full-Screen Question Details View: [< Question Details] */}
      <QuestionDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, question: null })}
        question={detailsModal.question}
        comments={comments}
        onToggleVisibility={onToggleVisibility}
        onTogglePin={onTogglePin}
        onEdit={(question) => {
          setDetailsModal({ isOpen: false, question: null })
          setEditModal({ isOpen: true, question })
        }}
        onAnswer={(question) => {
          setDetailsModal({ isOpen: false, question: null })
          if (onAnswerQuestion) onAnswerQuestion(question)
        }}
        onDelete={(question) => {
          setDetailsModal({ isOpen: false, question: null })
          setDeleteModal({
            isOpen: true,
            questionId: question.id,
            questionText: question.question,
          })
        }}
        showAdminToast={showAdminToast}
      />

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, question: null })}
        question={editModal.question}
        onSave={onUpdateQuestion}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        questionText={deleteModal.questionText}
        onConfirm={() => onSoftDelete && onSoftDelete(deleteModal.questionId)}
      />

      {/* Analytics Sections */}
      <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-4 bg-white/45 dark:bg-slate-900/30">
          <h3 className="font-semibold mb-3">Events Last 7 Days</h3>
          <div className="space-y-2">
            {days.length ? (
              days.map(([day, count]) => (
                <div
                  key={day}
                  className="grid grid-cols-[52px_1fr_28px] sm:grid-cols-[90px_1fr_40px] items-center gap-2 text-xs sm:text-sm"
                >
                  <span className="text-[color:var(--app-muted)]">{day.slice(5)}</span>
                  <div className="h-2.5 rounded-full bg-slate-300/40 dark:bg-slate-700/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-600"
                      style={{ width: `${(count / maxDayCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-right">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--app-muted)]">No event data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-4 bg-white/45 dark:bg-slate-900/30">
          <h3 className="font-semibold mb-3">Top Fonts</h3>
          <ul className="space-y-2 text-sm">
            {topFonts.length ? (
              topFonts.map(([font, count]) => (
                <li
                  key={font}
                  className="flex items-center justify-between rounded-lg bg-white/65 dark:bg-slate-800/70 px-3 py-2 min-w-0"
                >
                  <span style={{ fontFamily: font }}>{font}</span>
                  <strong>{count}</strong>
                </li>
              ))
            ) : (
              <li className="text-[color:var(--app-muted)]">No style data yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-4 bg-white/45 dark:bg-slate-900/30 lg:col-span-2">
          <h3 className="font-semibold mb-3">Recent Events</h3>

          <div className="sm:hidden space-y-2">
            {recentEvents.length ? (
              recentEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-lg border border-[color:var(--card-border)] bg-white/60 dark:bg-slate-800/55 p-2.5"
                >
                  <p className="text-xs text-[color:var(--app-muted)] truncate">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold mt-1 break-words">{event.type}</p>
                  <p className="text-xs mt-1 text-[color:var(--app-muted)] break-words">
                    {Object.keys(event.meta || {}).length ? JSON.stringify(event.meta) : '-'}
                  </p>
                </article>
              ))
            ) : (
              <p className="py-3 text-sm text-[color:var(--app-muted)]">No analytics events yet.</p>
            )}
          </div>

          <div className="hidden sm:block overflow-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-[color:var(--app-muted)]">
                  <th className="py-2 w-[38%]">Time</th>
                  <th className="py-2 w-[26%]">Event</th>
                  <th className="py-2 w-[36%]">Meta</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.length ? (
                  recentEvents.map((event) => (
                    <tr key={event.id} className="border-t border-[color:var(--card-border)]">
                      <td className="py-2 pr-2 whitespace-nowrap overflow-hidden text-ellipsis">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-2 break-words">{event.type}</td>
                      <td className="py-2 break-words">
                        {Object.keys(event.meta || {}).length ? JSON.stringify(event.meta) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-[color:var(--app-muted)]" colSpan={3}>
                      No analytics events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({ title, value, className = '', centered = false }) {
  const iconMap = {
    Questions: InfoCircle,
    Pending: Clock,
    Designs: Category,
    Rendered: Image,
    Copies: Copy,
    Downloads: DocumentDownload,
    'Share Clicks': Share,
  }
  const Icon = iconMap[title] || Category

  return (
    <article
      className={`relative overflow-hidden rounded-xl border border-[color:var(--card-border)] bg-white/50 dark:bg-slate-900/35 p-3 ${
        centered ? 'text-center' : ''
      } ${className}`}
    >
      <Icon
        size={42}
        className="pointer-events-none absolute right-2 top-2 text-slate-400/20 dark:text-slate-100/12"
        aria-hidden="true"
      />
      <p className="text-xs uppercase tracking-wide text-[color:var(--app-muted)] whitespace-nowrap">
        {title}
      </p>
      <p className="text-2xl font-bold mt-1 text-center">{value}</p>
    </article>
  )
}
