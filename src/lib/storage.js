const DESIGNS_KEY = 'sila-story-designs-v1'
const EVENTS_KEY = 'sila-story-events-v1'
const QUESTIONS_KEY = 'sila-user-questions-v1'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getDesigns() {
  return readJSON(DESIGNS_KEY, [])
}

export function saveDesigns(designs) {
  writeJSON(DESIGNS_KEY, designs)
}

export function createDesign({ text, style, imageDataUrl }) {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    text,
    style,
    imageDataUrl: imageDataUrl || '',
    createdAt: now,
    updatedAt: now,
    stats: {
      copies: 0,
      downloads: 0,
      shares: 0,
    },
  }
}

export function getQuestions() {
  return readJSON(QUESTIONS_KEY, [])
}

export function saveQuestions(questions) {
  writeJSON(QUESTIONS_KEY, questions)
}

export function createQuestion(question) {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    question,
    status: 'pending',
    createdAt: now,
    answeredAt: null,
  }
}

export function markQuestionAnswered(questions, questionId) {
  const now = new Date().toISOString()
  return questions.map((item) => {
    if (item.id !== questionId) return item
    return {
      ...item,
      status: 'answered',
      answeredAt: now,
    }
  })
}

export function getEvents() {
  return readJSON(EVENTS_KEY, [])
}

export function addEvent(type, meta = {}) {
  const next = [...getEvents(), {
    id: crypto.randomUUID(),
    type,
    meta,
    createdAt: new Date().toISOString(),
  }]
  writeJSON(EVENTS_KEY, next)
  return next
}
