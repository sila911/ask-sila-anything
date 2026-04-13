import { FiClock, FiCopy, FiDownload, FiHelpCircle, FiImage, FiLayout, FiShare2 } from 'react-icons/fi'

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

export default function AdminDashboardPage({ designs, events, questions = [] }) {
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

  return (
    <section>
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
    Questions: FiHelpCircle,
    Pending: FiClock,
    Designs: FiLayout,
    Rendered: FiImage,
    Copies: FiCopy,
    Downloads: FiDownload,
    'Share Clicks': FiShare2,
  }
  const Icon = iconMap[title] || FiLayout

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
