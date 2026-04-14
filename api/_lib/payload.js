export function getBody(reqBody) {
  if (!reqBody) return {}

  if (typeof reqBody === 'string') {
    try {
      return JSON.parse(reqBody)
    } catch {
      return {}
    }
  }

  if (typeof reqBody === 'object') {
    return reqBody
  }

  return {}
}

export function asDate(value, fallback = new Date()) {
  if (!value) return fallback
  const next = new Date(value)
  return Number.isNaN(next.getTime()) ? fallback : next
}

export function asObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
}

export function normalizeQuestion(item) {
  return {
    id: String(item.id),
    question: String(item.question || ''),
    status: String(item.status || 'pending'),
    createdAt: asDate(item.createdAt),
    answeredAt: item.answeredAt ? asDate(item.answeredAt) : null,
  }
}

export function normalizeDesign(item) {
  return {
    id: String(item.id),
    questionId: item.questionId ? String(item.questionId) : null,
    questionText: item.questionText ? String(item.questionText) : null,
    answerText: item.answerText ? String(item.answerText) : null,
    text: String(item.text || ''),
    style: asObject(item.style, {}),
    imageDataUrl: String(item.imageDataUrl || ''),
    createdAt: asDate(item.createdAt),
    updatedAt: asDate(item.updatedAt),
    stats: asObject(item.stats, { copies: 0, downloads: 0, shares: 0 }),
  }
}

export function normalizeEvent(item) {
  return {
    id: String(item.id),
    type: String(item.type || 'legacy_event'),
    meta: asObject(item.meta, {}),
    createdAt: asDate(item.createdAt),
  }
}
