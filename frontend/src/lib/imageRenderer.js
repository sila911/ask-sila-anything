import QRCode from 'qrcode';

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

async function drawQRCode(ctx, url, x, y, size, style) {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const img = new Image();
    img.src = qrDataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const bgPadding = 12;
    const bgSize = size + bgPadding * 2;
    const bgX = x - bgPadding;
    const bgY = y - bgPadding;
    const bgRadius = 18;

    ctx.save();
    // Draw rounded background rectangle
    drawRoundedRect(ctx, bgX, bgY, bgSize, bgSize, bgRadius);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Draw QR code image
    ctx.drawImage(img, x, y, size, size);

    // Draw label above QR code
    ctx.save();
    ctx.fillStyle = style.textColor || '#ffffff';
    ctx.font = `600 22px ${style.fontFamily || 'Mali'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = 0.8;
    ctx.fillText('Scan ask Sila', x + size / 2, bgY - 12);
    ctx.restore();
  } catch (err) {
    console.error('Failed to draw QR code:', err);
  }
}

function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n')
  const lines = []

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/)
    if (words.length === 1 && words[0] === '') {
      lines.push('') // Preserve empty line
      continue
    }

    let current = ''
    for (const word of words) {
      if (!word) continue
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
  }
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

async function loadBackgroundImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawCoverImage(ctx, img, canvasWidth, canvasHeight) {
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;
  let renderWidth, renderHeight, offsetX, offsetY;

  if (imgRatio > canvasRatio) {
    renderHeight = canvasHeight;
    renderWidth = canvasHeight * imgRatio;
    offsetX = (canvasWidth - renderWidth) / 2;
    offsetY = 0;
  } else {
    renderWidth = canvasWidth;
    renderHeight = canvasWidth / imgRatio;
    offsetX = 0;
    offsetY = (canvasHeight - renderHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
}

export async function renderTextToImage(text, style) {
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

  const preset = style.preset || 'classic'
  const bgColor = style.bgColor || '#102a43'
  const accentColor = style.accentColor || '#2cb1bc'
  const panelColor = style.panelColor || 'rgba(255,255,255,0.12)'
  const textColor = style.textColor || '#f0f4f8'
  const frameColor = style.frameColor || '#ffffff'
  const frameWidth = Number(style.frameWidth || 0)
  const frameRadius = Number(style.frameRadius || 48)
  const questionFontSize = Number(style.questionFontSize || 42)
  const answerFontSize = Number(style.answerFontSize || 62)
  const fontFamily = style.fontFamily || 'Mali'
  const align = style.align || 'center'
  const bgImageUrl = style.bgImageUrl || null

  const questionText = typeof text === 'object' ? text.question || '' : String(text || '')
  const answerText = typeof text === 'object' ? text.answer || '' : ''
  const askedAt = typeof text === 'object' ? text.askedAt || '' : ''

  // 1. Draw Background (Custom Image or Preset Gradient)
  const customBgImg = bgImageUrl ? await loadBackgroundImage(bgImageUrl) : null

  if (customBgImg) {
    drawCoverImage(ctx, customBgImg, width, height)
    // Dark blur tint overlay for photo readability
    ctx.fillStyle = 'rgba(10, 15, 29, 0.65)'
    ctx.fillRect(0, 0, width, height)
  } else if (preset === 'aurora') {
    const auroraGrad = ctx.createLinearGradient(0, 0, width, height)
    auroraGrad.addColorStop(0, '#0f172a')
    auroraGrad.addColorStop(0.4, '#1e1b4b')
    auroraGrad.addColorStop(0.7, '#0284c7')
    auroraGrad.addColorStop(1, '#06b6d4')
    ctx.fillStyle = auroraGrad
    ctx.fillRect(0, 0, width, height)
  } else if (preset === 'cyberpunk') {
    const cyberGrad = ctx.createLinearGradient(0, 0, width, height)
    cyberGrad.addColorStop(0, '#0a0618')
    cyberGrad.addColorStop(0.5, '#190a36')
    cyberGrad.addColorStop(1, '#001a2e')
    ctx.fillStyle = cyberGrad
    ctx.fillRect(0, 0, width, height)
  } else if (preset === 'receipt') {
    const receiptGrad = ctx.createLinearGradient(0, 0, width, height)
    receiptGrad.addColorStop(0, '#18181b')
    receiptGrad.addColorStop(1, '#27272a')
    ctx.fillStyle = receiptGrad
    ctx.fillRect(0, 0, width, height)
  } else {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, bgColor)
    gradient.addColorStop(1, accentColor)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  const panelX = panelMarginX
  const panelY = panelMarginY
  const panelWidth = width - (panelMarginX * 2)
  const panelHeight = height - (panelMarginY * 2)

  // 2. Draw Panel
  ctx.save()
  if (preset === 'cyberpunk') {
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 30
  } else if (preset === 'aurora') {
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)'
    ctx.shadowBlur = 25
  }

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, frameRadius)
  ctx.fillStyle = panelColor
  ctx.fill()
  ctx.restore()

  if (frameWidth > 0) {
    ctx.save()
    if (preset === 'cyberpunk') {
      ctx.shadowColor = '#ff007f'
      ctx.shadowBlur = 20
    }
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, frameRadius)
    ctx.lineWidth = frameWidth
    ctx.strokeStyle = frameColor
    ctx.stroke()
    ctx.restore()
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
    ctx.fillStyle = preset === 'receipt' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'
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

  ctx.save()
  if (preset === 'receipt') {
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.setLineDash([16, 12])
  } else if (preset === 'cyberpunk') {
    ctx.strokeStyle = '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 10
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  }
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(dividerLeft, y)
  ctx.lineTo(dividerRight, y)
  ctx.stroke()
  ctx.restore()

  y += dividerPaddingBottom
  ctx.font = `700 ${answerFontSize}px ${fontFamily}`
  const answerLines = wrapText(ctx, answerText || 'Answer goes here...', maxTextWidth)
  const answerLineHeight = answerFontSize * 1.2
  for (const line of answerLines.slice(0, answerMaxLines)) {
    ctx.fillText(line, contentX, y)
    y += answerLineHeight
  }

  if (style.showQRCode && text.url) {
    let qrSize = 130;
    let offset = 48;
    if (aspectRatio === "1:1") {
      qrSize = 110;
      offset = 36;
    } else if (aspectRatio === "16:9") {
      qrSize = 120;
      offset = 48;
    }
    const qrX = panelX + panelWidth - qrSize - offset;
    const qrY = panelY + panelHeight - qrSize - offset;
    await drawQRCode(ctx, text.url, qrX, qrY, qrSize, style);
  }

  ctx.font = '500 38px Mali'
  ctx.fillStyle = preset === 'receipt' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)'
  ctx.textAlign = 'center'
  ctx.fillText('Created with Ask Sila Story Studio', width / 2, height - footerOffset)

  return canvas.toDataURL('image/png')
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}
