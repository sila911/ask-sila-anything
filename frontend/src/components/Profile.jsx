export default function Profile() {
  return (
    <div className="flex flex-col items-center text-center mb-5">
      <img
        src="/sila4.jpg"
        alt="Sila profile"
        className="w-24 h-24 rounded-full object-cover border-4 border-solid border-white dark:border-slate-900 mb-3 -mt-12 relative z-10"
      />

      <h1 className="text-2xl font-bold">Ask Sila Anything</h1>

      <p className="text-sm text-[color:var(--app-muted)] mt-1">
        Feel free to ask any question. Your message will be sent directly and privately.
      </p>
    </div>
  )
}
