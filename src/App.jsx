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
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-[90%] max-w-2xl bg-white/20 dark:bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6">
          <Profile />
          <QuestionForm onSuccess={handleSuccess} />
        </div>
      </main>

      <Footer />

      <ThankYouModal isOpen={showModal} onClose={closeModal} />
    </div>
  )
}
