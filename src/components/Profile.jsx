export default function Profile() {
  return (
    <div className="flex flex-col items-center text-center mb-5">
      <img
        src="/sila2.jpg"
        alt="Sila profile"
        className="w-24 h-24 rounded-full border border-white/30 mb-3"
      />

      <h1 className="text-2xl font-bold">Ask Sila Anything</h1>

      <p className="text-sm opacity-80 mt-1">
        Feel free to ask any question. Your message will be sent directly and privately.
      </p>

      <p className="text-xs opacity-70 mt-2 max-w-md">
        I'm Sila, a curious learner who enjoys technology, creativity, and meaningful conversations that
        help people grow together.
      </p>
    </div>
  )
}
