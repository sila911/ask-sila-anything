import { useState } from 'react'
import { FiLoader, FiSend, FiShuffle } from 'react-icons/fi'

const QUESTIONS = [
  "What motivates you every day?",
  "Be honest, did you think I was cute the first time you saw me?",
  "What is a 'red flag' in a partner that you secretly like? 🚩",
  "If we got married, who would win the arguments?",
  "What's your favorite way to spend a weekend?",
  "If you could travel anywhere in the world, where would you go?",
  "What advice would you give your younger self?",
  "Who is your crush right now?",
  "What is something people don't know about you?"
]

export default function QuestionForm({ onSuccess }) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleShuffle = () => {
    const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
    setQuestion(randomQuestion)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!question.trim()) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
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
