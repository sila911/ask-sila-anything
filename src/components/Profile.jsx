export default function Profile() {
  return (
    <div className="flex flex-col items-center text-center mb-5">
      <img
        src="/sila2.jpg"
        alt="Sila profile"
        className="w-24 h-24 rounded-full border border-[color:var(--card-border)] mb-3"
      />

      <h1 className="text-2xl font-bold">Ask Sila Anything</h1>

      <p className="text-sm text-[color:var(--app-muted)] mt-1">
        Feel free to ask any question. Your message will be sent directly and privately.
      </p>

      <p className="text-xs text-[color:var(--app-muted)] mt-2 max-w-md">
        I'm Sila, a curious learner who enjoys technology, creativity, and meaningful conversations that
        help people grow together.
      </p>
    </div>
  )
}
