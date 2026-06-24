import { useState } from 'react'
import { Clock, Copy, DocumentDownload, InfoCircle, Image, Category, Share, Eye, EyeSlash, Trash } from 'iconsax-react'
import DeleteConfirmModal from './DeleteConfirmModal'

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

export default function AdminDashboardPage({ designs, events, questions = [], onToggleVisibility, onTogglePin, onSoftDelete }) {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, questionId: null, questionText: "" });
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

  const sortedQuestions = [...questions].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <section className="space-y-6">
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

      <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-5 bg-white/45 dark:bg-slate-900/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <InfoCircle className="text-cyan-500" />
          Manage Questions
        </h3>
        
        <div className="overflow-hidden rounded-xl border border-[color:var(--card-border)] bg-white/50 dark:bg-black/20">
          
          {/* Mobile View: Card Layout */}
          <div className="sm:hidden flex flex-col divide-y divide-[color:var(--card-border)]">
            {sortedQuestions.length > 0 ? sortedQuestions.map((q) => (
              <div key={`mobile-${q.id}`} className="p-4 flex flex-col gap-3 hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <p className="line-clamp-3 text-slate-700 dark:text-slate-200 text-sm cause-medium mb-2" title={q.question}>
                    {q.question}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      q.status === 'answered' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {q.status}
                    </span>
                    <span className="text-[10px] text-[color:var(--app-muted)] font-medium">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1 pt-3 border-t border-[color:var(--card-border)]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTogglePin && onTogglePin(q.id, !q.is_pinned)}
                      className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                        q.is_pinned 
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                      title={q.is_pinned ? "Unpin" : "Pin"}
                    >
                      <img src="https://img.icons8.com/ios-filled/50/pin--v1.png" alt="Pin" className={`w-4 h-4 ${q.is_pinned ? 'invert-[0.3] sepia-[1] saturate-[5] hue-rotate-[10deg]' : 'opacity-50 dark:invert'}`} />
                    </button>

                    <button
                      onClick={() => onToggleVisibility(q.id, !q.is_hidden)}
                      className={`flex items-center justify-center h-8 px-3 gap-1.5 rounded-lg text-xs font-bold transition-colors ${
                        !q.is_hidden 
                          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {!q.is_hidden ? <><Eye size={14} /> Visible</> : <><EyeSlash size={14} /> Hidden</>}
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteModal({ isOpen: true, questionId: q.id, questionText: q.question })}
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-sm text-[color:var(--app-muted)]">
                No questions found.
              </div>
            )}
          </div>

          {/* Desktop View: Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[color:var(--app-muted)] border-b border-[color:var(--card-border)] bg-slate-50/50 dark:bg-white/5">
                  <th className="px-4 py-3 font-medium">Question</th>
                  <th className="px-4 py-3 font-medium w-20 text-center">Pin</th>
                  <th className="px-4 py-3 font-medium w-32 text-center">Visibility</th>
                  <th className="px-4 py-3 font-medium w-16 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--card-border)]">
                {sortedQuestions.length > 0 ? sortedQuestions.map((q) => (
                  <tr key={`desktop-${q.id}`} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="line-clamp-2 text-slate-700 dark:text-slate-200 cause-regular" title={q.question}>
                        {q.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          q.status === 'answered' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}>
                          {q.status}
                        </span>
                        <span className="text-[10px] text-[color:var(--app-muted)] font-medium">
                          {new Date(q.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onTogglePin && onTogglePin(q.id, !q.is_pinned)}
                        className={`p-2 rounded-xl transition-colors ${
                          q.is_pinned 
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-300'
                        }`}
                        title={q.is_pinned ? "Unpin Question" : "Pin Question"}
                      >
                        <img src="https://img.icons8.com/ios-filled/50/pin--v1.png" alt="Pin" className={`w-4 h-4 ${q.is_pinned ? 'invert-[0.3] sepia-[1] saturate-[5] hue-rotate-[10deg]' : 'opacity-50 dark:invert'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => onToggleVisibility(q.id, !q.is_hidden)}
                          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            !q.is_hidden ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={q.is_hidden ? "Show Question" : "Hide Question"}
                        >
                          <span className="sr-only">Toggle Visibility</span>
                          <span
                            className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              !q.is_hidden ? 'translate-x-8' : 'translate-x-1'
                            }`}
                          >
                            {!q.is_hidden ? (
                              <Eye size={12} className="text-cyan-700" />
                            ) : (
                              <EyeSlash size={12} className="text-slate-400" />
                            )}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, questionId: q.id, questionText: q.question })}
                        className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                        title="Delete Question"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-[color:var(--app-muted)]">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        questionText={deleteModal.questionText}
        onConfirm={() => onSoftDelete && onSoftDelete(deleteModal.questionId)}
      />

      <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-4 bg-white/45 dark:bg-slate-900/30">
          <h3 className="font-semibold mb-3">Events Last 7 Days</h3>
          <div className="space-y-2">
            {days.length ? days.map(([day, count]) => (
              <div key={day} className="grid grid-cols-[52px_1fr_28px] sm:grid-cols-[90px_1fr_40px] items-center gap-2 text-xs sm:text-sm">
                <span className="text-[color:var(--app-muted)]">{day.slice(5)}</span>
                <div className="h-2.5 rounded-full bg-slate-300/40 dark:bg-slate-700/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-600"
                    style={{ width: `${(count / maxDayCount) * 100}%` }}
                  />
                </div>
                <span className="text-right">{count}</span>
              </div>
            )) : (
              <p className="text-sm text-[color:var(--app-muted)]">No event data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-4 bg-white/45 dark:bg-slate-900/30">
          <h3 className="font-semibold mb-3">Top Fonts</h3>
          <ul className="space-y-2 text-sm">
            {topFonts.length ? topFonts.map(([font, count]) => (
              <li key={font} className="flex items-center justify-between rounded-lg bg-white/65 dark:bg-slate-800/70 px-3 py-2 min-w-0">
                <span style={{ fontFamily: font }}>{font}</span>
                <strong>{count}</strong>
              </li>
            )) : (
              <li className="text-[color:var(--app-muted)]">No style data yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-[color:var(--card-border)] p-3 sm:p-4 bg-white/45 dark:bg-slate-900/30 lg:col-span-2">
          <h3 className="font-semibold mb-3">Recent Events</h3>

          <div className="sm:hidden space-y-2">
            {recentEvents.length ? recentEvents.map((event) => (
              <article key={event.id} className="rounded-lg border border-[color:var(--card-border)] bg-white/60 dark:bg-slate-800/55 p-2.5">
                <p className="text-xs text-[color:var(--app-muted)] truncate">{new Date(event.createdAt).toLocaleString()}</p>
                <p className="text-sm font-semibold mt-1 break-words">{event.type}</p>
                <p className="text-xs mt-1 text-[color:var(--app-muted)] break-words">
                  {Object.keys(event.meta || {}).length ? JSON.stringify(event.meta) : '-'}
                </p>
              </article>
            )) : (
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
                {recentEvents.length ? recentEvents.map((event) => (
                  <tr key={event.id} className="border-t border-[color:var(--card-border)]">
                    <td className="py-2 pr-2 whitespace-nowrap overflow-hidden text-ellipsis">{new Date(event.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-2 break-words">{event.type}</td>
                    <td className="py-2 break-words">{Object.keys(event.meta || {}).length ? JSON.stringify(event.meta) : '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-3 text-[color:var(--app-muted)]" colSpan={3}>No analytics events yet.</td>
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
    <article className={`relative overflow-hidden rounded-xl border border-[color:var(--card-border)] bg-white/50 dark:bg-slate-900/35 p-3 ${centered ? 'text-center' : ''} ${className}`}>
      <Icon
        size={42}
        className="pointer-events-none absolute right-2 top-2 text-slate-400/20 dark:text-slate-100/12"
        aria-hidden="true"
      />
      <p className="text-xs uppercase tracking-wide text-[color:var(--app-muted)] whitespace-nowrap">{title}</p>
      <p className="text-2xl font-bold mt-1 text-center">{value}</p>
    </article>
  )
}
