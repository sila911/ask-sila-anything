import { useState } from 'react'

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

const BOT_TOKEN = '7522747677:AAFf5uSN3ULEK24c_870o9G-mVLBuZbS_R8'
const CHAT_ID = '1543040976'

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
      const message = `Ask Sila Anything:\n\n${question}\n\n------------------\nSent via Web App`

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
      })

      if (res.ok) {
        setQuestion('')
        onSuccess()
      } else {
        alert('Error sending message. Please try again.')
      }
    } catch (error) {
      console.error(error)
      alert('Network Error. Please check your internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative group">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows="6"
          placeholder="Ask Sila anything..."
          className="w-full rounded-3xl p-4 px-14 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 focus:outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-white/40 transition-all"
        />

        <button
          type="button"
          onClick={handleShuffle}
          className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center rounded-full
             text-gray-600 dark:text-gray-300 transition-all duration-200
             hover:bg-white/50 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
          title="Random Question"
        >
          <i className="fa-solid fa-shuffle"></i>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full
             bg-gray-900 dark:bg-white text-white dark:text-black
             hover:scale-110 active:scale-90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className={`fa-solid ${isLoading ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'} text-sm translate-x-[-1px] translate-y-[1px]`}></i>
        </button>
      </div>
    </form>
  )
}
