import { useEffect, useMemo, useState } from 'react'
import { FiCopy, FiDownload, FiImage, FiInstagram, FiSave, FiShare2 } from 'react-icons/fi'
import { FaFacebookF } from 'react-icons/fa'
import { dataUrlToBlob, renderTextToImage } from '../lib/imageRenderer'
import { createDesign } from '../lib/storage'

const FONT_OPTIONS = ['Georgia', 'Verdana', 'Trebuchet MS', 'Times New Roman', 'Arial']

const defaultStyle = {
  bgColor: '#102a43',
  accentColor: '#2cb1bc',
  panelColor: 'rgba(255,255,255,0.13)',
  textColor: '#f0f4f8',
  frameColor: '#ffffff',
  frameWidth: 16,
  frameRadius: 48,
  questionFontSize: 42,
  answerFontSize: 62,
  fontFamily: 'Georgia',
  align: 'center',
}

function formatAskedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  }).format(date)

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  return `${datePart} | ${timePart}`
}

export default function CreateDesignPage({
  seedDesign,
  onSave,
  onEvent,
  onNotify,
  questions,
  onQuestionAnswered,
}) {
  const [selectedQuestionId, setSelectedQuestionId] = useState('')
  const [answer, setAnswer] = useState('')
  const [style, setStyle] = useState(defaultStyle)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [message, setMessage] = useState('')

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [questions])

  useEffect(() => {
    const pending = sortedQuestions.find((q) => q.status !== 'answered')
    if (!selectedQuestionId && pending) {
      setSelectedQuestionId(pending.id)
    }
  }, [sortedQuestions, selectedQuestionId])

  useEffect(() => {
    if (!seedDesign) return
    setStyle({ ...defaultStyle, ...(seedDesign.style || {}) })
    setImageDataUrl(seedDesign.imageDataUrl || '')
    setAnswer(seedDesign.answerText || '')
    if (seedDesign.questionId) {
      setSelectedQuestionId(seedDesign.questionId)
    }
  }, [seedDesign])

  const selectedQuestion = sortedQuestions.find((q) => q.id === selectedQuestionId)

  const previewStyle = useMemo(() => ({
    background: `linear-gradient(160deg, ${style.bgColor}, ${style.accentColor})`,
    color: style.textColor,
    fontFamily: style.fontFamily,
    textAlign: style.align,
    border: `${Number(style.frameWidth || 0)}px solid ${style.frameColor}`,
    borderRadius: `${Number(style.frameRadius || 0)}px`,
  }), [style])

  const setField = (name, value) => {
    setStyle((prev) => ({ ...prev, [name]: value }))
  }

  const generateImage = () => {
    if (!selectedQuestion?.question) {
      setMessage('Select a user question first.')
      return
    }

    const nextDataUrl = renderTextToImage(
      {
        question: selectedQuestion.question,
        answer,
        askedAt: selectedQuestion.createdAt,
      },
      style,
    )
    setImageDataUrl(nextDataUrl)
    setMessage('Image generated with user question + your answer.')
    onEvent('image_rendered', { fontFamily: style.fontFamily })
    onNotify?.('Image generated', 'Question and answer story preview is ready.', 'success')
  }

  const saveDesign = async () => {
    if (!selectedQuestion?.question) {
      setMessage('Select a question first.')
      return
    }

    const combinedText = `Q: ${selectedQuestion.question}\nA: ${answer}`
    const design = createDesign({ text: combinedText, style, imageDataUrl })
    design.questionId = selectedQuestion.id
    design.questionText = selectedQuestion.question
    design.answerText = answer

    try {
      await onSave(design)

      if (answer.trim()) {
        await onQuestionAnswered(selectedQuestion.id)
      }

      setMessage('Saved. This question is marked as answered.')
      onEvent('design_saved', { hasImage: Boolean(imageDataUrl) })
      onNotify?.('Saved', 'Answer card saved to library.', 'success')
    } catch (error) {
      console.error(error)
      setMessage('Save failed. Check your API and MySQL connection.')
      onNotify?.('Save failed', 'Could not save answer card to database.', 'error')
    }
  }

  const copyImage = async () => {
    if (!imageDataUrl) {
      setMessage('Generate an image first.')
      return
    }

    try {
      const blob = await dataUrlToBlob(imageDataUrl)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setMessage('Copied image to clipboard. You can paste into story editor.')
      onEvent('image_copied')
      onNotify?.('Copied', 'Image copied to clipboard.', 'success')
    } catch {
      setMessage('Copy failed in this browser. Use Download instead.')
      onEvent('image_copy_failed')
      onNotify?.('Copy failed', 'Browser blocked image clipboard. Use download.', 'error')
    }
  }

  const downloadImage = () => {
    if (!imageDataUrl) {
      setMessage('Generate an image first.')
      return
    }

    const a = document.createElement('a')
    a.href = imageDataUrl
    a.download = `answer-${Date.now()}.png`
    a.click()
    onEvent('image_downloaded')
    onNotify?.('Downloaded', 'Image file saved.', 'success')
  }

  const openPlatform = (platform) => {
    const map = {
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/stories/create/',
    }

    window.open(map[platform], '_blank', 'noopener,noreferrer')
    setMessage(`Opened ${platform}. Paste or upload your generated image.`)
    onEvent('share_opened', { platform })
    onNotify?.('Share opened', `Ready to post on ${platform}.`, 'info')
  }

  return (
    <section>
      <h2 className="text-xl font-bold">Answer Creator</h2>
      <p className="text-sm text-[color:var(--app-muted)] mt-1 mb-4">
        Pick a user question, write answer, style the image, then generate and share.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">User Question</span>
            <select
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)]"
            >
              {!sortedQuestions.length && <option value="">No questions yet</option>}
              {sortedQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  [{q.status}] {q.question.slice(0, 70)}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-[color:var(--input-border)] p-3 bg-white/40 dark:bg-slate-900/30">
            <p className="text-xs uppercase tracking-wide text-[color:var(--app-muted)]">Question (Read only)</p>
            <p className="mt-1 text-sm">{selectedQuestion?.question || 'No question selected yet.'}</p>
          </div>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">Admin Answer</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-2xl p-4 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              placeholder="Write your answer here..."
            />
          </label>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Background</span>
              <input type="color" value={style.bgColor} onChange={(e) => setField('bgColor', e.target.value)} className="h-10 w-full rounded-lg" />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Accent</span>
              <input type="color" value={style.accentColor} onChange={(e) => setField('accentColor', e.target.value)} className="h-10 w-full rounded-lg" />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Text</span>
              <input type="color" value={style.textColor} onChange={(e) => setField('textColor', e.target.value)} className="h-10 w-full rounded-lg" />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Panel</span>
              <input
                type="text"
                value={style.panelColor}
                onChange={(e) => setField('panelColor', e.target.value)}
                className="h-10 w-full rounded-lg px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)]"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Frame Color</span>
              <input type="color" value={style.frameColor} onChange={(e) => setField('frameColor', e.target.value)} className="h-10 w-full rounded-lg" />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Font</span>
              <select
                value={style.fontFamily}
                onChange={(e) => setField('fontFamily', e.target.value)}
                className="h-10 w-full rounded-lg px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)]"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">Question size ({style.questionFontSize}px)</span>
            <input
              type="range"
              min="28"
              max="56"
              value={style.questionFontSize}
              onChange={(e) => setField('questionFontSize', Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">Answer size ({style.answerFontSize}px)</span>
            <input
              type="range"
              min="36"
              max="88"
              value={style.answerFontSize}
              onChange={(e) => setField('answerFontSize', Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">Frame width ({style.frameWidth}px)</span>
            <input
              type="range"
              min="0"
              max="36"
              value={style.frameWidth}
              onChange={(e) => setField('frameWidth', Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">Frame radius ({style.frameRadius}px)</span>
            <input
              type="range"
              min="0"
              max="80"
              value={style.frameRadius}
              onChange={(e) => setField('frameRadius', Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button type="button" onClick={generateImage} className="rounded-xl px-3 py-2 bg-cyan-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2">
              <FiImage size={15} /> Generate
            </button>
            <button type="button" onClick={saveDesign} className="rounded-xl px-3 py-2 bg-slate-800 text-white hover:opacity-90 inline-flex items-center justify-center gap-2 dark:bg-slate-100 dark:text-slate-900">
              <FiSave size={15} /> Save
            </button>
            <button type="button" onClick={copyImage} className="rounded-xl px-3 py-2 bg-emerald-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2">
              <FiCopy size={15} /> Copy
            </button>
            <button type="button" onClick={downloadImage} className="rounded-xl px-3 py-2 bg-indigo-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2">
              <FiDownload size={15} /> Download
            </button>
            <button type="button" onClick={() => openPlatform('instagram')} className="rounded-xl px-3 py-2 bg-pink-600 text-white hover:opacity-90 inline-flex items-center justify-center gap-2">
              <FiInstagram size={15} /> IG Story
            </button>
            <button type="button" onClick={() => openPlatform('facebook')} className="rounded-xl px-3 py-2 bg-blue-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2">
              <FaFacebookF size={13} /> FB Story
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-[430px] rounded-3xl border border-[color:var(--card-border)] p-6 overflow-hidden" style={previewStyle}>
            <div className="h-full rounded-2xl px-5 py-7 flex flex-col gap-4" style={{ background: style.panelColor }}>
              {selectedQuestion?.createdAt && (
                <p className="text-right text-xs opacity-90">
                  {formatAskedAt(selectedQuestion.createdAt)}
                </p>
              )}

              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.12em] opacity-80">Question</p>
                <p
                  className="whitespace-pre-wrap leading-[1.25] mt-1"
                  style={{ fontSize: `${Math.max(16, style.questionFontSize / 2.5)}px` }}
                >
                  {selectedQuestion?.question || 'User question will appear here.'}
                </p>
              </div>

              <div className="h-px bg-white/45" />

              <div className="flex-1">
                <p className="text-[0.72rem] uppercase tracking-[0.12em] opacity-80">Answer</p>
                <p
                  className="whitespace-pre-wrap leading-[1.2] mt-1"
                  style={{ fontSize: `${Math.max(18, style.answerFontSize / 2.2)}px` }}
                >
                  {answer || 'Admin answer appears below the question.'}
                </p>
              </div>
            </div>
          </div>

          {imageDataUrl ? (
            <img src={imageDataUrl} alt="Generated answer story" className="w-full rounded-2xl border border-[color:var(--card-border)]" />
          ) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--input-border)] p-5 text-sm text-[color:var(--app-muted)]">
              Generated image will appear here.
            </div>
          )}

          {message && (
            <p className="text-sm text-[color:var(--app-muted)] inline-flex items-center gap-2">
              <FiShare2 size={14} /> {message}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
