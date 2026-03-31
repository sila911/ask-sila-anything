import https from 'node:https'

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

const postTelegramMessage = async ({ botToken, chatId, text, logger = console }) => {
  try {
    return await postTelegramMessageWithFetch({ botToken, chatId, text })
  } catch (fetchError) {
    logger.warn('Fetch transport failed, falling back to HTTPS transport:', fetchError.message)
    return await postTelegramMessageWithHttps({ botToken, chatId, text })
  }
}

export const sendTelegramQuestion = async ({ question, botToken, chatId, logger = console }) => {
  const text = `Ask Sila Anything:\n\n${question}\n\n------------------\nSent via Web App`

  try {
    const telegramResponse = await postTelegramMessage({ botToken, chatId, text, logger })

    if (telegramResponse.status < 200 || telegramResponse.status >= 300 || !telegramResponse.body?.ok) {
      const description = telegramResponse.body?.description || 'Telegram failed to accept the message.'
      logger.error('Telegram API error:', telegramResponse.body)
      return { ok: false, status: 502, message: description }
    }

    return { ok: true, status: 200 }
  } catch (error) {
    logger.error('Telegram request failed:', error)
    return {
      ok: false,
      status: 502,
      message: 'Telegram service is temporarily unreachable. Please try again.'
    }
  }
}
