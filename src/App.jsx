import { useState, useEffect } from 'react'
import Header from './components/Header'
import Profile from './components/Profile'
import QuestionForm from './components/QuestionForm'
import Footer from './components/Footer'
import ThankYouModal from './components/ThankYouModal'

export default function App() {
  const [showModal, setShowModal] = useState(false)

  const handleSuccess = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <div className="min-h-screen flex flex-col text-[color:var(--app-text)]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-[90%] max-w-2xl bg-[color:var(--card-bg)] backdrop-blur-2xl border border-[color:var(--card-border)] rounded-3xl p-6 shadow-[0_10px_50px_rgba(5,20,35,0.16)] dark:shadow-[0_14px_56px_rgba(0,0,0,0.5)]">
          <Profile />
          <QuestionForm onSuccess={handleSuccess} />
        </div>
      </main>

      <Footer />

      <ThankYouModal isOpen={showModal} onClose={closeModal} />
    </div>
  )
}
