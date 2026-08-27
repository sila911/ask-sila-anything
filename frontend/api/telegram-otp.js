import crypto from "crypto";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { action, otp, token } = body || {};
    const secret =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.TELEGRAM_BOT_TOKEN ||
      "ask-sila-2fa-secret-salt";

    // ─────────────────────────────────────────────────────────────
    // Action 1: Send OTP to Telegram
    // ─────────────────────────────────────────────────────────────
    if (action === "send") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        console.error("Telegram credentials missing for 2FA OTP");
        return res.status(500).json({
          ok: false,
          message: "Telegram configuration error on server",
        });
      }

      // Generate 6-digit numeric PIN
      const generatedOtp = crypto.randomInt(100000, 1000000).toString();
      const expiresAt = Date.now() + 59 * 1000; // 60 seconds validity

      // Sign with HMAC
      const hmac = crypto
        .createHmac("sha256", secret)
        .update(`${generatedOtp}:${expiresAt}`)
        .digest("hex");
      const verificationToken = `${expiresAt}:${hmac}`;

      const messageText = `🔐 <b>Ask Sila — 2FA Verification </b>\n\n<code>${generatedOtp}</code>\n\n⏱️ Valid for <b>60s</b> only.`;

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const tgResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "HTML",
        }),
      });

      const tgData = await tgResponse.json();

      if (!tgResponse.ok || !tgData.ok) {
        console.error("Failed to send OTP to Telegram:", tgData);
        return res.status(500).json({
          ok: false,
          message:
            "Failed to deliver OTP to Telegram. Please check Telegram bot configuration.",
        });
      }

      return res.status(200).json({
        ok: true,
        token: verificationToken,
        expiresAt,
        message:
          "A 6-digit verification code has been sent to your Telegram bot.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Action 2: Verify OTP
    // ─────────────────────────────────────────────────────────────
    if (action === "verify") {
      if (!otp || !token) {
        return res.status(400).json({
          ok: false,
          message: "OTP code and verification token are required",
        });
      }

      const cleanOtp = String(otp).trim();
      const [expiresAtStr, providedHmac] = String(token).split(":");

      if (!expiresAtStr || !providedHmac) {
        return res
          .status(400)
          .json({ ok: false, message: "Invalid verification token format" });
      }

      const expiresAt = Number(expiresAtStr);
      if (Date.now() > expiresAt) {
        return res.status(400).json({
          ok: false,
          message: "Verification code has expired. Please request a new code.",
        });
      }

      const expectedHmac = crypto
        .createHmac("sha256", secret)
        .update(`${cleanOtp}:${expiresAtStr}`)
        .digest("hex");

      // Constant-time comparison
      const providedBuffer = Buffer.from(providedHmac, "hex");
      const expectedBuffer = Buffer.from(expectedHmac, "hex");

      if (
        providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
      ) {
        return res.status(400).json({
          ok: false,
          message: "Incorrect 6-digit verification code. Please try again.",
        });
      }

      return res.status(200).json({
        ok: true,
        verified: true,
        message: "2FA verification successful.",
      });
    }

    return res
      .status(400)
      .json({ ok: false, message: "Unknown action specified" });
  } catch (error) {
    console.error("Error in telegram-otp API handler:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error: " + (error?.message || error),
    });
  }
}
