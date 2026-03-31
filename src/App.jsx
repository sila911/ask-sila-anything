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
        <div className="glass-shell glass-shell--3d w-[92%] max-w-2xl rounded-[2rem] p-6 sm:p-8">
          <Profile />
          <QuestionForm onSuccess={handleSuccess} />
        </div>
      </main>

      <Footer />

      <ThankYouModal isOpen={showModal} onClose={closeModal} />
    </div>
  )
}
