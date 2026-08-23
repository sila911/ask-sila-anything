function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { question, questionId, notifyHandle } = req.body;

  if (!question) {
    return res.status(400).json({ message: 'Question is required' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials missing in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const safeQuestion = escapeHtml(question);
  const cleanId = questionId ? escapeHtml(questionId) : null;
  const cleanHandle = notifyHandle 
    ? `@${escapeHtml(String(notifyHandle).trim().replace(/^@+/, ''))}` 
    : null;

  let text = `🌟 <b>New Question on Ask Sila</b>:\n\n"${safeQuestion}"`;

  if (cleanHandle) {
    text += `\n\n🔔 <b>Notify</b>: ${cleanHandle}`;
  }

  if (cleanId) {
    text += `\n🆔 <b>Code</b>: <code>${cleanId}</code>`;
    text += `\n\n💬 <b>Reply instantly:</b>\n<i>Reply to this message OR tap command below:</i>\n<code>/reply ${cleanId} </code>`;
  } else {
    text += `\n\n💬 <i>Reply directly to this message to publish your answer!</i>`;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      throw new Error(`Telegram API responded with ${response.status}: ${data.description || ''}`);
    }

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}
