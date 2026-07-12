import { useState, useRef, useEffect } from 'react'
import { Shuffle, Send2, Refresh } from 'iconsax-react'
import { motion } from 'framer-motion'

const QUESTIONS = [
  // --- General & Core Prompts ---
  "What motivates you every day?",
  "What is the first thing you notice about someone when you meet them? 👁️",
  "What is a 'red flag' in a partner that you secretly like? 🚩",
  "What is the most important rule for resolving arguments in a relationship?",
  "What's your favorite way to spend a weekend?",
  "What advice would you give your younger self?",
  "What is something people don't know about you?",

  // --- General Relationship & Dating Prompts ---
  "What’s your absolute biggest dealbreaker in a relationship?",
  "What is your idea of a perfect, low-key date night? 🕯️",
  "Do you believe in love at first sight, or does it take time to build? 💘",
  "What is the best relationship advice you've ever received?",
  "How do you usually express affection in a relationship (love languages)? 💬",
  "Would you rather date someone who is exactly like you, or your complete opposite?",
  "What is something you think is underrated in a healthy relationship?",
  "What's a hobby or interest you would love to share with a partner? 🎨",
  "In your opinion, what is the key to maintaining a strong long-term relationship?",
  "Are you the type to fall fast and hard, or do you take things slow and steady? 🐢",
  "What is a green flag in a person that immediately makes them more attractive? 💚"
];

export default function QuestionForm({ onSuccess, onSubmitQuestion }) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const [isShuffling, setIsShuffling] = useState(false)
  const typingRef = useRef(null)

  // Clear typing animation timer on unmount
  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current)
      }
    }
  }, [])

  // Auto-cycling placeholder typing animation
  useEffect(() => {
    const texts = [
      "Ask Sila anything...",
      "Something in your mind to ask Sila?...",
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const currentText = texts[textIndex];
      
      if (isDeleting) {
        setPlaceholder(currentText.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setPlaceholder(currentText.substring(0, charIndex + 1));
        charIndex++;
      }

      let speed = isDeleting ? 30 : 60;

      if (!isDeleting && charIndex === currentText.length) {
        speed = 2200; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        speed = 400; // Pause before starting next text
      }

      timeoutId = setTimeout(type, speed);
    };

    type();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleShuffle = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current)
    }
    setIsShuffling(true)

    // Select a random question, making sure it's different if possible
    let randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
    if (randomQuestion === question && QUESTIONS.length > 1) {
      randomQuestion = QUESTIONS.find(q => q !== question) || randomQuestion
    }

    setQuestion('')
    let currentText = ''
    let charIndex = 0

    typingRef.current = setInterval(() => {
      if (charIndex < randomQuestion.length) {
        currentText += randomQuestion[charIndex]
        setQuestion(currentText)
        charIndex++
      } else {
        clearInterval(typingRef.current)
        typingRef.current = null
        setIsShuffling(false)
      }
    }, 18) // 18ms per character (typing speed)
  }

  const handleTextChange = (e) => {
    // If the user starts typing manually, stop the auto-typing effect immediately
    if (typingRef.current) {
      clearInterval(typingRef.current)
      typingRef.current = null
      setIsShuffling(false)
    }
    setQuestion(e.target.value)
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
          onChange={handleTextChange}
          rows="6"
          placeholder={placeholder}
          className="w-full rounded-3xl p-4 px-14 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none resize-none text-[color:var(--app-text)] placeholder-[color:var(--app-muted)] focus:ring-2 focus:ring-cyan-300/40 dark:focus:ring-cyan-500/35 focus:border-cyan-400 dark:focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all cause-medium"
        />

        <button
          type="button"
          onClick={handleShuffle}
          className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center rounded-full
             bg-white/90 dark:bg-slate-800/95 text-slate-700 dark:text-slate-100 border border-slate-300/85 dark:border-slate-500/70
             hover:scale-105 active:scale-95 transition-all duration-200"
          title="Random Question"
        >
          <motion.div
            animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Shuffle size={16} />
          </motion.div>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full
             bg-cyan-700 dark:bg-cyan-500 text-white dark:text-slate-950
             hover:scale-110 active:scale-90 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Refresh size={16} className="animate-spin" />
          ) : (
            <Send2 size={15} className="translate-x-[-1px] translate-y-[1px]" />
          )}
        </button>
      </div>
    </form>
  )
}
