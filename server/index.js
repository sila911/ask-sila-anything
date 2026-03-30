import dotenv from 'dotenv'
import express from 'express'
import https from 'node:https'

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

const TELEGRAM_TIMEOUT_MS = 12_000

const postTelegramMessageWithHttps = ({ botToken, chatId, text }) => {
  const payload = JSON.stringify({ chat_id: chatId, text })

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${botToken}/sendMessage`,
        method: 'POST',
        family: 4,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (response) => {
        let body = ''

        response.on('data', (chunk) => {
          body += chunk
        })

        response.on('end', () => {
          const status = response.statusCode || 500
          let parsedBody = {}

          try {
            parsedBody = body ? JSON.parse(body) : {}
          } catch {
            parsedBody = { raw: body }
          }

          resolve({ status, body: parsedBody })
        })
      }
    )

    req.setTimeout(TELEGRAM_TIMEOUT_MS, () => {
      req.destroy(new Error('Telegram request timed out.'))
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

const postTelegramMessageWithFetch = async ({ botToken, chatId, text }) => {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available in this Node runtime.')
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS)
  })

  const body = await response.json().catch(() => ({}))
  return { status: response.status, body }
}

const postTelegramMessage = async ({ botToken, chatId, text }) => {
  try {
    return await postTelegramMessageWithFetch({ botToken, chatId, text })
  } catch (fetchError) {
    console.warn('Fetch transport failed, falling back to HTTPS transport:', fetchError.message)
    return await postTelegramMessageWithHttps({ botToken, chatId, text })
  }
}

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

  const text = `Ask Sila Anything:\n\n${String(question).trim()}\n\n------------------\nSent via Web App`

  try {
    const telegramResponse = await postTelegramMessage({ botToken, chatId, text })

    if (telegramResponse.status < 200 || telegramResponse.status >= 300 || !telegramResponse.body?.ok) {
      const description = telegramResponse.body?.description || 'Telegram failed to accept the message.'
      console.error('Telegram API error:', telegramResponse.body)
      return res.status(502).json({ message: description })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Telegram request failed:', error)
    return res.status(502).json({ message: 'Telegram service is temporarily unreachable. Please try again.' })
  }
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
