import { FiEdit2, FiTrash2 } from 'react-icons/fi'

function formatDate(value) {
  return new Date(value).toLocaleString()
}

export default function LibraryPage({ designs, onReuse, onDelete }) {
  if (!designs.length) {
    return (
      <section>
        <h2 className="text-xl font-bold">Library</h2>
        <p className="text-sm text-[color:var(--app-muted)] mt-1">
          Save your first design from the Create tab and it will show here.
        </p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-bold">Library ({designs.length})</h2>
      <p className="text-sm text-[color:var(--app-muted)] mt-1 mb-4">
        Re-open old designs, update style, and generate new versions.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {designs.map((design) => (
          <article key={design.id} className="rounded-2xl border border-[color:var(--card-border)] bg-white/40 dark:bg-slate-900/30 p-3">
            {design.imageDataUrl ? (
              <img src={design.imageDataUrl} alt="Saved design" className="rounded-xl border border-[color:var(--card-border)] mb-3" />
            ) : (
              <div className="h-40 rounded-xl border border-dashed border-[color:var(--input-border)] mb-3 flex items-center justify-center text-sm text-[color:var(--app-muted)]">
                No image generated
              </div>
            )}

            <p className="text-xs uppercase tracking-wide text-[color:var(--app-muted)]">Question</p>
            <p className="text-sm line-clamp-2">{design.questionText || '-'}</p>
            <p className="text-xs uppercase tracking-wide text-[color:var(--app-muted)] mt-2">Answer</p>
            <p className="text-sm line-clamp-3 min-h-[60px]">{design.answerText || design.text}</p>
            <p className="text-xs text-[color:var(--app-muted)] mt-2">Updated: {formatDate(design.updatedAt)}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <button
                type="button"
                onClick={() => onReuse(design)}
                className="rounded-lg px-3 py-2 bg-cyan-700 text-white inline-flex items-center justify-center gap-2"
              >
                <FiEdit2 size={14} /> Reuse
              </button>

              <button
                type="button"
                onClick={() => onDelete(design.id)}
                className="rounded-lg px-3 py-2 bg-rose-700 text-white inline-flex items-center justify-center gap-2"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
