function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function wrapText(ctx, text, maxWidth) {
  const words = text.trim().split(/\s+/)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const width = ctx.measureText(candidate).width
    if (width <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
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

export function renderTextToImage(text, style) {
  const aspectRatio = style.aspectRatio || "9:16"
  let width = 1080
  let height = 1920
  let panelMarginX = 70
  let panelMarginY = 140
  let footerOffset = 98
  let questionMaxLines = 4
  let answerMaxLines = 7
  let questionStartYOffset = 120
  let dateYOffset = 58
  let dividerPaddingTop = 38
  let dividerPaddingBottom = 54

  if (aspectRatio === "1:1") {
    width = 1080
    height = 1080
    panelMarginX = 60
    panelMarginY = 80
    footerOffset = 60
    questionMaxLines = 3
    answerMaxLines = 5
    questionStartYOffset = 90
    dateYOffset = 42
    dividerPaddingTop = 26
    dividerPaddingBottom = 38
  } else if (aspectRatio === "16:9") {
    width = 1920
    height = 1080
    panelMarginX = 140
    panelMarginY = 100
    footerOffset = 70
    questionMaxLines = 3
    answerMaxLines = 5
    questionStartYOffset = 100
    dateYOffset = 46
    dividerPaddingTop = 30
    dividerPaddingBottom = 44
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const bgColor = style.bgColor || '#102a43'
  const accentColor = style.accentColor || '#2cb1bc'
  const panelColor = style.panelColor || 'rgba(255,255,255,0.12)'
  const textColor = style.textColor || '#f0f4f8'
  const frameColor = style.frameColor || '#ffffff'
  const frameWidth = Number(style.frameWidth || 0)
  const frameRadius = Number(style.frameRadius || 48)
  const questionFontSize = Number(style.questionFontSize || 42)
  const answerFontSize = Number(style.answerFontSize || 62)
  const fontFamily = style.fontFamily || 'Georgia'
  const align = style.align || 'center'

  const questionText = typeof text === 'object' ? text.question || '' : String(text || '')
  const answerText = typeof text === 'object' ? text.answer || '' : ''
  const askedAt = typeof text === 'object' ? text.askedAt || '' : ''

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, bgColor)
  gradient.addColorStop(1, accentColor)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const panelX = panelMarginX
  const panelY = panelMarginY
  const panelWidth = width - (panelMarginX * 2)
  const panelHeight = height - (panelMarginY * 2)

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, frameRadius)
  ctx.fillStyle = panelColor
  ctx.fill()

  if (frameWidth > 0) {
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, frameRadius)
    ctx.lineWidth = frameWidth
    ctx.strokeStyle = frameColor
    ctx.stroke()
  }

  const contentX = align === 'left' ? panelX + 72 : align === 'right' ? panelX + panelWidth - 72 : width / 2
  const maxTextWidth = panelWidth - 140

  ctx.fillStyle = textColor
  ctx.textAlign = align

  // Draw question timestamp in the top-right corner of the card.
  if (askedAt) {
    const dateLabel = formatAskedAt(askedAt)
    ctx.font = `500 28px ${fontFamily}`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(dateLabel, panelX + panelWidth - 70, panelY + dateYOffset)
    ctx.fillStyle = textColor
    ctx.textAlign = align
  }

  ctx.font = `700 ${questionFontSize}px ${fontFamily}`
  ctx.textBaseline = 'top'
  const questionLines = wrapText(ctx, questionText || 'Question', maxTextWidth)
  const questionLineHeight = questionFontSize * 1.22
  let y = panelY + questionStartYOffset
  for (const line of questionLines.slice(0, questionMaxLines)) {
    ctx.fillText(line, contentX, y)
    y += questionLineHeight
  }

  y += dividerPaddingTop
  const dividerLeft = panelX + 70
  const dividerRight = panelX + panelWidth - 70
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(dividerLeft, y)
  ctx.lineTo(dividerRight, y)
  ctx.stroke()

  y += dividerPaddingBottom
  ctx.font = `700 ${answerFontSize}px ${fontFamily}`
  const answerLines = wrapText(ctx, answerText || 'Answer goes here...', maxTextWidth)
  const answerLineHeight = answerFontSize * 1.2
  for (const line of answerLines.slice(0, answerMaxLines)) {
    ctx.fillText(line, contentX, y)
    y += answerLineHeight
  }

  ctx.font = '500 38px Georgia'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.textAlign = 'center'
  ctx.fillText('Created with Ask Sila Story Studio', width / 2, height - footerOffset)

  return canvas.toDataURL('image/png')
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}
