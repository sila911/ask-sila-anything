/**
 * AI Answer Assistant (Google Gemini / Tone Engine)
 * Helps Sila draft styled answers to anonymous questions.
 */

export const AI_TONE_PRESETS = [
  {
    id: "witty",
    label: "Witty & Fun 🎭",
    description: "Playful, funny, clever one-liners",
    promptInstruction: "Answer with playful humor, wit, and charming sarcasm. Keep it lighthearted and memorable."
  },
  {
    id: "thoughtful",
    label: "Deep & Thoughtful 🧠",
    description: "Empathetic, mature, and insightful",
    promptInstruction: "Answer with genuine depth, wisdom, and warm empathy. Provide a mature, thoughtful perspective."
  },
  {
    id: "punchy",
    label: "Short & Punchy ⚡",
    description: "Crisp 1-2 sentence statement",
    promptInstruction: "Answer in just 1 or 2 punchy, powerful, concise sentences. Direct to the point."
  },
  {
    id: "friendly",
    label: "Warm & Friendly 🇰🇭",
    description: "Casual, supportive, personal tone",
    promptInstruction: "Answer like a close supportive friend talking over coffee. Relaxed, warm, and authentic."
  }
];

export async function generateAnswerDrafts({ question, toneId = "witty", customApiKey = "" }) {
  const selectedTone = AI_TONE_PRESETS.find(t => t.id === toneId) || AI_TONE_PRESETS[0];
  const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";

  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt = `You are helping a popular creator named Sila answer questions from his community on his anonymous Q&A platform 'Ask Sila Anything'.
Question asked by an anonymous follower: "${question}"

Tone/Style requested: ${selectedTone.label} - ${selectedTone.promptInstruction}

Generate 3 distinct, creative answer options.
Format your output as a strict JSON array of 3 strings:
["Option 1 answer text", "Option 2 answer text", "Option 3 answer text"]
Do not include markdown codeblocks or any other text, only the raw JSON array. Keep each answer under 280 characters so it fits nicely on a story card.`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 600,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { success: true, drafts: parsed.slice(0, 3) };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart tone templates:", err);
    }
  }

  // Smart tone fallback templates when API key is not configured or offline
  const fallbacks = {
    witty: [
      `Honestly? That's a secret between me and my Wi-Fi router. But let's just say coffee is involved! ☕`,
      `Plot twist: I didn't choose the question, the question chose me. 10/10 curiosity though! ✨`,
      `Bold of you to assume I have a plan for this. We're winging it with style! 😎`
    ],
    thoughtful: [
      `At the end of the day, it's all about staying true to what gives you peace. Everything else is just noise. 🌿`,
      `Growth rarely happens inside our comfort zone. Every question like this is a good reminder to reflect. ✨`,
      `Some things take time to make sense of. Trust the process and keep moving forward step by step. 💫`
    ],
    punchy: [
      `Keep it simple, stay curious, and never compromise on good coffee. ⚡`,
      `Actions speak louder than promises. Always. 🔥`,
      `Focus on what matters, filter out the rest. 🚀`
    ],
    friendly: [
      `Thanks for asking! Really appreciate you dropping this question — sending you good energy today! 💫`,
      `Honestly loved this question! Keep asking, you guys always have the most interesting thoughts. 🫶`,
      `Always happy to share my thoughts with you all. Hope this brings a little smile to your day! 😊`
    ]
  };

  return {
    success: true,
    isFallback: true,
    drafts: fallbacks[toneId] || fallbacks.witty
  };
}
