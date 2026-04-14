import { useEffect, useMemo, useState } from 'react'
import { FiLink2, FiLogOut } from 'react-icons/fi'
import Header from './components/Header'
import Profile from './components/Profile'
import QuestionForm from './components/QuestionForm'
import NavTabs from './components/NavTabs'
import CreateDesignPage from './components/CreateDesignPage'
import LibraryPage from './components/LibraryPage'
import AdminDashboardPage from './components/AdminDashboardPage'
import AdminAuthModal from './components/AdminAuthModal'
import AdminToastCard from './components/AdminToastCard'
import Footer from './components/Footer'
import ThankYouModal from './components/ThankYouModal'
import {
  addEvent,
  createQuestion,
  getDesigns,
  getEvents,
  getQuestions,
  markQuestionAnswered,
  saveDesigns,
  saveQuestions,
} from './lib/storage'
import {
  createEncryptedAdminToken,
  hasAdminPassword,
  validateEncryptedAdminToken,
  verifyOrSetupPassword,
} from './lib/adminAccess'

export default function App() {
  const [viewMode, setViewMode] = useState('user')
  const [activeTab, setActiveTab] = useState('create')
  const [designs, setDesigns] = useState([])
  const [events, setEvents] = useState([])
  const [questions, setQuestions] = useState([])
  const [seedDesign, setSeedDesign] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [needsTokenValidation, setNeedsTokenValidation] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [linkMessage, setLinkMessage] = useState('')
  const [sessionPassword, setSessionPassword] = useState('')
  const [adminToast, setAdminToast] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nextDesigns, nextEvents, nextQuestions] = await Promise.all([
          getDesigns(),
          getEvents(),
          getQuestions(),
        ])
        setDesigns(nextDesigns)
        setEvents(nextEvents)
        setQuestions(nextQuestions)
      } catch (error) {
        console.error(error)
      }
    }

    loadData()

    const params = new URLSearchParams(window.location.search)
    const token = params.get('adminToken')
    if (token) {
      setAdminToken(token)
      setNeedsTokenValidation(true)
      setIsAdminModalOpen(true)
    }
  }, [])

  const orderedDesigns = useMemo(() => {
    return [...designs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [designs])

  const addDesign = async (design) => {
    const next = [design, ...designs]
    const persisted = await saveDesigns(next)
    setDesigns(persisted)
  }

  const showAdminToast = (title, detail = '', type = 'success') => {
    setAdminToast({
      id: crypto.randomUUID(),
      title,
      detail,
      type,
    })
  }

  useEffect(() => {
    if (!adminToast) return undefined
    const timer = setTimeout(() => setAdminToast(null), 2600)
    return () => clearTimeout(timer)
  }, [adminToast])

  const trackEvent = async (type, meta = {}) => {
    try {
      const nextEvents = await addEvent(type, meta)
      setEvents(nextEvents)
    } catch (error) {
      console.error(error)
    }
  }

  const submitUserQuestion = async (questionText) => {
    const nextQuestion = createQuestion(questionText)
    const next = [nextQuestion, ...questions]
    const persisted = await saveQuestions(next)
    setQuestions(persisted)
    trackEvent('question_submitted')
  }

  const markAnswered = async (questionId) => {
    const next = markQuestionAnswered(questions, questionId)
    const persisted = await saveQuestions(next)
    setQuestions(persisted)
    trackEvent('question_answered', { questionId })
    showAdminToast('Question marked answered', 'Question status updated in inbox.', 'info')
  }

  const removeDesign = async (id) => {
    try {
      const next = designs.filter((design) => design.id !== id)
      const persisted = await saveDesigns(next)
      setDesigns(persisted)
      trackEvent('design_deleted')
      showAdminToast('Deleted', 'Answer card removed from library.', 'info')
    } catch (error) {
      console.error(error)
      showAdminToast('Delete failed', 'Could not remove answer card from database.', 'error')
    }
  }

  const reuseDesign = (design) => {
    setSeedDesign(design)
    setActiveTab('create')
    trackEvent('design_reused', { id: design.id })
    showAdminToast('Loaded in editor', 'Answer card opened for update.', 'success')
  }

  const handleSuccess = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const openAdminModal = () => {
    setNeedsTokenValidation(Boolean(adminToken))
    setIsAdminModalOpen(true)
  }

  const handleAdminAuth = async (password) => {
    if (!password || password.length < 4) {
      return { ok: false, message: 'Password must be at least 4 characters.' }
    }

    if (needsTokenValidation) {
      const valid = await validateEncryptedAdminToken(adminToken, password)
      if (!valid) {
        return { ok: false, message: 'Invalid password or expired encrypted admin link.' }
      }
    }

    const verify = await verifyOrSetupPassword(password)
    if (!verify.ok) {
      return { ok: false, message: 'Wrong admin password.' }
    }

    setSessionPassword(password)
    setIsAdminUnlocked(true)
    setIsAdminModalOpen(false)
    setViewMode('admin')
    setActiveTab('admin')
    setNeedsTokenValidation(false)
    setAdminToken('')
    trackEvent('admin_login', { fromToken: needsTokenValidation })
    showAdminToast('Admin unlocked', 'Welcome back to admin workspace.', 'success')
    return { ok: true }
  }

  const createEncryptedAdminLink = async () => {
    if (!sessionPassword) {
      setLinkMessage('Login again before creating secure link.')
      return
    }

    const token = await createEncryptedAdminToken(sessionPassword, 180)
    const url = new URL(window.location.href)
    url.searchParams.set('adminToken', token)
    await navigator.clipboard.writeText(url.toString())
    setLinkMessage('Encrypted admin link copied (valid 3 hours).')
    trackEvent('admin_link_copied')
    showAdminToast('Encrypted link copied', 'Admin access link copied to clipboard.', 'success')
  }

  return (
    <div className="min-h-screen flex flex-col text-[color:var(--app-text)]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pb-6">
        {viewMode === 'user' && (
          <div className="glass-shell glass-shell--3d w-[92%] max-w-2xl rounded-[2rem] p-6 sm:p-8">
            <Profile />
            <QuestionForm onSuccess={handleSuccess} onSubmitQuestion={submitUserQuestion} />
          </div>
        )}

        {viewMode === 'admin' && isAdminUnlocked && (
          <div className="glass-shell glass-shell--3d w-[95%] max-w-6xl rounded-[2rem] p-5 sm:p-8">
            <div className="mb-4 flex items-center gap-2 flex-nowrap">
              <NavTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                showAdminTab={true}
                className="flex-1 min-w-0"
              />

              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminUnlocked(false)
                    setSessionPassword('')
                    setViewMode('user')
                    setActiveTab('create')
                  }}
                  className="inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-rose-300 text-rose-700 dark:text-rose-300"
                  title="Logout admin"
                  aria-label="Logout admin"
                >
                  <FiLogOut size={16} />
                </button>

                <button
                  type="button"
                  onClick={createEncryptedAdminLink}
                  className="inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  title="Copy encrypted admin link"
                  aria-label="Copy encrypted admin link"
                >
                  <FiLink2 size={16} />
                </button>
              </div>
            </div>

            {linkMessage && (
              <p className="mb-3 text-sm text-[color:var(--app-muted)]">{linkMessage}</p>
            )}

            {activeTab === 'create' && (
              <CreateDesignPage
                seedDesign={seedDesign}
                onSave={addDesign}
                onEvent={trackEvent}
                onNotify={showAdminToast}
                questions={questions}
                onQuestionAnswered={markAnswered}
              />
            )}

            {activeTab === 'library' && (
              <LibraryPage
                designs={orderedDesigns}
                onReuse={reuseDesign}
                onDelete={removeDesign}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboardPage
                designs={designs}
                events={events}
                questions={questions}
              />
            )}
          </div>
        )}
      </main>

      <Footer onSilaClick={openAdminModal} />

      <ThankYouModal isOpen={showModal} onClose={closeModal} />

      <AdminAuthModal
        isOpen={isAdminModalOpen}
        hasPassword={hasAdminPassword()}
        requiresToken={needsTokenValidation}
        onClose={() => setIsAdminModalOpen(false)}
        onSubmit={handleAdminAuth}
      />

      {viewMode === 'admin' && isAdminUnlocked && (
        <AdminToastCard
          toast={adminToast}
          onClose={() => setAdminToast(null)}
        />
      )}
    </div>
  )
}
