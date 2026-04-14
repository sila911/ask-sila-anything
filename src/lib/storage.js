async function requestJSON(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  if (!response.ok) {
    const message = (data && data.message) || `Request failed with status ${response.status}.`
    throw new Error(message)
  }

  return data
}

const LEGACY_KEYS = {
  designs: 'sila-story-designs-v1',
  events: 'sila-story-events-v1',
  questions: 'sila-user-questions-v1',
}

const LEGACY_MIGRATION_FLAG_KEY = 'sila-storage-migrated-to-db-v1'

function readLegacyJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function importLegacyLocalStorageOnce() {
  const alreadyMigrated = localStorage.getItem(LEGACY_MIGRATION_FLAG_KEY) === '1'
  if (alreadyMigrated) {
    return { imported: false, skipped: true, reason: 'already_migrated' }
  }

  const designs = readLegacyJSON(LEGACY_KEYS.designs)
  const events = readLegacyJSON(LEGACY_KEYS.events)
  const questions = readLegacyJSON(LEGACY_KEYS.questions)

  if (!designs.length && !events.length && !questions.length) {
    localStorage.setItem(LEGACY_MIGRATION_FLAG_KEY, '1')
    return { imported: false, skipped: true, reason: 'no_legacy_data' }
  }

  const result = await requestJSON('/api/import/local-storage', {
    method: 'POST',
    body: JSON.stringify({ designs, events, questions }),
  })

  if (result.imported || result.reason === 'database_not_empty') {
    localStorage.setItem(LEGACY_MIGRATION_FLAG_KEY, '1')
  }

  if (result.imported) {
    localStorage.removeItem(LEGACY_KEYS.designs)
    localStorage.removeItem(LEGACY_KEYS.events)
    localStorage.removeItem(LEGACY_KEYS.questions)
  }

  return result
}

export async function getDesigns() {
  return requestJSON('/api/designs')
}

export async function saveDesigns(designs) {
  return requestJSON('/api/designs/replace', {
    method: 'PUT',
    body: JSON.stringify({ designs }),
  })
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

export async function getQuestions() {
  return requestJSON('/api/questions')
}

export async function saveQuestions(questions) {
  return requestJSON('/api/questions/replace', {
    method: 'PUT',
    body: JSON.stringify({ questions }),
  })
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

export async function getEvents() {
  return requestJSON('/api/events')
}

export async function addEvent(type, meta = {}) {
  return requestJSON('/api/events', {
    method: 'POST',
    body: JSON.stringify({ type, meta }),
  })
}
