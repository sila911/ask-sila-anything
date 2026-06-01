import { useState } from 'react'
import { FiLoader, FiSend, FiShuffle } from 'react-icons/fi'

const QUESTIONS = [
  // --- Original & Core Prompts ---
  "What motivates you every day?",
  "Be honest, did you think I was cute the first time you saw me?",
  "What is a 'red flag' in a partner that you secretly like? 🚩",
  "If we got married, who would win the arguments?",
  "What's your favorite way to spend a weekend?",
  "What advice would you give your younger self?",
  "What is something people don't know about you?",

  // --- Tailored for Your Crush to Ask You ---
  "If you could take me anywhere in Phnom Penh for a perfect evening, where are we going? 🗺️",
  "What’s your absolute biggest dealbreaker in a relationship?",
  "Be honest: do I ever cross your mind when you're listening to music? 🎧",
  "If I challenged you to a chess match, would you let me win or show no mercy? ♟️",
  "What is one thing about my personality that caught your attention first?",
  "If you had to describe our vibe in three words, what would they be?",
  "Do you think you could keep up with me on a morning run, or would I have to slow down for you? 🏃‍♂️",
  "What’s a secret talent or hobby you have that you haven't shown me yet?",
  "If we were trapped in a room together with no internet, how would we pass the time? 🚫",
  "What is your favorite memory of us or something I said that stuck with you?",
  "Are you the type to fall fast and hard, or do you calculate every move like a game? 🧠",
  "If I asked you to build or customize something just for me, what would you make? 🛠️",
  "What's one question you've been wanting to ask me but were too shy to say out loud? 👀"
];

export default function QuestionForm({ onSuccess, onSubmitQuestion }) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleShuffle = () => {
    const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
    setQuestion(randomQuestion)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextQuestion = question.trim()
    if (!nextQuestion) return

    if (onSubmitQuestion) {
      setIsLoading(true)
      try {
        await onSubmitQuestion(nextQuestion)
        setQuestion('')
        onSuccess()
      } catch (error) {
        console.error(error)
        alert('Cannot save question now. Please try again.')
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/telegram-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: nextQuestion })
      })

      if (res.ok) {
        setQuestion('')
        onSuccess()
      } else {
        const contentType = res.headers.get('content-type') || ''
        let message = `Error sending message (${res.status}).`
        let serverMessage = ''

        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}))
          serverMessage = data.message || ''
        } else {
          const text = await res.text().catch(() => '')
          if (text) {
            serverMessage = text.slice(0, 160)
          }
        }

        if (serverMessage) {
          message = serverMessage
        } else if (res.status === 500) {
          message = 'API server error (500). For local development, run npm run dev to start backend + frontend.'
        }

        alert(message)
      }
    } catch (error) {
      console.error(error)
      alert('Cannot reach API server. Run npm run dev (it now starts backend + frontend).')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative group">
        <textarea
          id="question"
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows="6"
          placeholder="Ask Sila anything..."
          className="w-full rounded-3xl p-4 px-14 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none resize-none text-[color:var(--app-text)] placeholder-[color:var(--app-muted)] focus:ring-2 focus:ring-cyan-300/40 dark:focus:ring-cyan-500/35 transition-all"
        />

        <button
          type="button"
          onClick={handleShuffle}
          className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center rounded-full
             bg-white/90 dark:bg-slate-800/95 text-slate-700 dark:text-slate-100 border border-slate-300/85 dark:border-slate-500/70
             shadow-[0_8px_18px_rgba(15,23,42,0.2)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.45)]
             transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:scale-105"
          title="Random Question"
        >
          <FiShuffle size={16} />
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full
             bg-cyan-700 dark:bg-cyan-500 text-white dark:text-slate-950
             hover:scale-110 active:scale-90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <FiLoader size={16} className="animate-spin" />
          ) : (
            <FiSend size={15} className="translate-x-[-1px] translate-y-[1px]" />
          )}
        </button>
      </div>
    </form>
  )
}
