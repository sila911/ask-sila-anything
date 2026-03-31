import { sendTelegramQuestion } from '../../server/lib/telegram.js'

const getBody = (reqBody) => {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const body = getBody(req.body)
  const question = String(body.question || '').trim()

  if (!question) {
    return res.status(400).json({ message: 'Question is required.' })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return res.status(500).json({ message: 'Server is missing Telegram configuration.' })
  }

  const telegramResult = await sendTelegramQuestion({
    question,
    botToken,
    chatId,
    logger: console
  })

  if (!telegramResult.ok) {
    return res.status(telegramResult.status).json({ message: telegramResult.message })
  }

  return res.status(200).json({ ok: true })
}
