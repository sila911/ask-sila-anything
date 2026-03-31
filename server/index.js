import dotenv from 'dotenv'
import express from 'express'
import { sendTelegramQuestion } from './lib/telegram.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(express.json())

const ALLOWED_ORIGINS = new Set(['http://localhost:5173', 'http://localhost:5174'])

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  return next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
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

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
