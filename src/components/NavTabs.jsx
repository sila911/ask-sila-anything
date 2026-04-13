const TABS = [
  { id: 'create', label: 'Create' },
  { id: 'library', label: 'Library' },
]

export default function NavTabs({ activeTab, onChange, showAdminTab = false, className = '' }) {
  const tabs = showAdminTab ? [...TABS, { id: 'admin', label: 'Admin' }] : TABS

  return (
    <div className={`grid gap-1.5 sm:gap-2 rounded-2xl bg-[color:var(--icon-chip)] p-1.5 sm:p-2 border border-[color:var(--card-border)] ${showAdminTab ? 'grid-cols-3' : 'grid-cols-2'} ${className}`}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition ${
              active
                ? 'bg-white/90 dark:bg-slate-100 text-slate-900 shadow'
                : 'text-[color:var(--app-muted)] hover:bg-white/40 dark:hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
