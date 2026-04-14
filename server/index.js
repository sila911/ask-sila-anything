import dotenv from 'dotenv'
import express from 'express'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'
import { sendTelegramQuestion } from './lib/telegram.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3001)
const adapter = new PrismaMariaDb(process.env.DATABASE_URL || '')
const prisma = new PrismaClient({ adapter })

app.use(express.json())

const ALLOWED_ORIGINS = new Set(['http://localhost:5173', 'http://localhost:5174'])

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  return next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

function asDate(value, fallback = new Date()) {
  if (!value) return fallback
  const next = new Date(value)
  return Number.isNaN(next.getTime()) ? fallback : next
}

function asObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
}

app.get('/api/questions', async (_req, res) => {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(questions)
})

app.put('/api/questions/replace', async (req, res) => {
  const { questions } = req.body || {}
  if (!Array.isArray(questions)) {
    return res.status(400).json({ message: 'questions must be an array.' })
  }

  const payload = questions.map((item) => ({
    id: String(item.id),
    question: String(item.question || ''),
    status: String(item.status || 'pending'),
    createdAt: asDate(item.createdAt),
    answeredAt: item.answeredAt ? asDate(item.answeredAt) : null,
  }))

  const nextQuestions = await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany()
    if (payload.length) {
      await tx.question.createMany({ data: payload })
    }
    return tx.question.findMany({ orderBy: { createdAt: 'desc' } })
  })

  return res.json(nextQuestions)
})

app.get('/api/designs', async (_req, res) => {
  const designs = await prisma.design.findMany({
    orderBy: { updatedAt: 'desc' },
  })
  res.json(designs)
})

app.put('/api/designs/replace', async (req, res) => {
  const { designs } = req.body || {}
  if (!Array.isArray(designs)) {
    return res.status(400).json({ message: 'designs must be an array.' })
  }

  const payload = designs.map((item) => ({
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
  }))

  const nextDesigns = await prisma.$transaction(async (tx) => {
    await tx.design.deleteMany()
    if (payload.length) {
      await tx.design.createMany({ data: payload })
    }
    return tx.design.findMany({ orderBy: { updatedAt: 'desc' } })
  })

  return res.json(nextDesigns)
})

app.get('/api/events', async (_req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(events)
})

app.post('/api/events', async (req, res) => {
  const { type, meta } = req.body || {}
  if (!type || !String(type).trim()) {
    return res.status(400).json({ message: 'Event type is required.' })
  }

  await prisma.event.create({
    data: {
      type: String(type).trim(),
      meta: meta || {},
    },
  })

  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return res.status(201).json(events)
})

app.post('/api/import/local-storage', async (req, res) => {
  const { questions, designs, events, force = false } = req.body || {}

  if (!Array.isArray(questions) || !Array.isArray(designs) || !Array.isArray(events)) {
    return res.status(400).json({ message: 'questions, designs, and events must be arrays.' })
  }

  const [questionCount, designCount, eventCount] = await Promise.all([
    prisma.question.count(),
    prisma.design.count(),
    prisma.event.count(),
  ])

  const existingCounts = {
    questions: questionCount,
    designs: designCount,
    events: eventCount,
  }

  const hasExistingData = questionCount > 0 || designCount > 0 || eventCount > 0

  if (hasExistingData && !force) {
    return res.json({
      imported: false,
      skipped: true,
      reason: 'database_not_empty',
      existingCounts,
    })
  }

  const questionPayload = questions.map((item) => ({
    id: String(item.id),
    question: String(item.question || ''),
    status: String(item.status || 'pending'),
    createdAt: asDate(item.createdAt),
    answeredAt: item.answeredAt ? asDate(item.answeredAt) : null,
  }))

  const designPayload = designs.map((item) => ({
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
  }))

  const eventPayload = events.map((item) => ({
    id: String(item.id),
    type: String(item.type || 'legacy_event'),
    meta: asObject(item.meta, {}),
    createdAt: asDate(item.createdAt),
  }))

  const createdCounts = await prisma.$transaction(async (tx) => {
    if (force && hasExistingData) {
      await tx.event.deleteMany()
      await tx.design.deleteMany()
      await tx.question.deleteMany()
    }

    const [questionsResult, designsResult, eventsResult] = await Promise.all([
      questionPayload.length
        ? tx.question.createMany({ data: questionPayload, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
      designPayload.length
        ? tx.design.createMany({ data: designPayload, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
      eventPayload.length
        ? tx.event.createMany({ data: eventPayload, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
    ])

    return {
      questions: questionsResult.count,
      designs: designsResult.count,
      events: eventsResult.count,
    }
  })

  return res.status(201).json({
    imported: true,
    createdCounts,
    existingCounts,
  })
})

app.post('/api/telegram/send', async (req, res) => {
  const { question } = req.body || {}

  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: 'Question is required.' })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return res.status(500).json({ message: 'Server is missing Telegram configuration.' })
  }

  const telegramResult = await sendTelegramQuestion({
    question: String(question).trim(),
    botToken,
    chatId,
    logger: console
  })

  if (!telegramResult.ok) {
    return res.status(telegramResult.status).json({ message: telegramResult.message })
  }

  return res.status(200).json({ ok: true })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error.' })
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
