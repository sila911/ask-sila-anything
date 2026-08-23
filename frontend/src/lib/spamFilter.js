// Smart Rate Limiting & Anti-Spam / Toxicity Filter for Ask Sila

const RATE_LIMIT_KEY = 'ask_sila_submissions';
const MAX_SUBMISSIONS = 3;
const TIME_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Common toxic, abusive, and spam terms blocklist (English & common internet spam)
const BLOCKED_WORDS = [
  'nigger', 'nigga', 'faggot', 'chink', 'retard', 'kike',
  'kys', 'kill yourself', 'die bitch', 'bitch ass', 'slut', 'whore',
  'porn', 'porno', 'xxx', 'viagra', 'cialis', 'casino', 'betting', 'free crypto',
  'telegram.me/', 't.me/', 'bit.ly/', 'tinyurl.com/', 'whatsapp.com/',
  'hack', 'ddos', 'doxx', 'dox'
];

/**
 * Check if the current client is rate-limited.
 * @returns {{ allowed: boolean, remainingMinutes?: number, message?: string }}
 */
export function checkRateLimit() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { allowed: true };
    }
    const raw = window.localStorage.getItem(RATE_LIMIT_KEY);
    const submissions = raw ? JSON.parse(raw) : [];
    const now = Date.now();

    // Filter out submissions older than the window
    const recentSubmissions = submissions.filter((ts) => now - ts < TIME_WINDOW_MS);

    if (recentSubmissions.length >= MAX_SUBMISSIONS) {
      const oldestInWindow = recentSubmissions[0];
      const cooldownRemainingMs = TIME_WINDOW_MS - (now - oldestInWindow);
      const remainingMinutes = Math.max(1, Math.ceil(cooldownRemainingMs / 60000));
      return {
        allowed: false,
        remainingMinutes,
        message: `You've asked ${MAX_SUBMISSIONS} questions recently. Please slow down and try again in ~${remainingMinutes} min.`
      };
    }

    return { allowed: true };
  } catch (err) {
    console.warn('Rate limit check failed, allowing submission:', err);
    return { allowed: true };
  }
}

/**
 * Record a successful question submission timestamp.
 */
export function recordSubmission() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = window.localStorage.getItem(RATE_LIMIT_KEY);
    const submissions = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = submissions.filter((ts) => now - ts < TIME_WINDOW_MS);
    recent.push(now);
    window.localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
  } catch (err) {
    console.warn('Could not record submission timestamp:', err);
  }
}

/**
 * Validates text for spam, repetitive gibberish, minimum length, and blocked terms.
 * @param {string} text
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateQuestionText(text) {
  const clean = (text || '').trim();

  if (!clean || clean.length < 4) {
    return {
      isValid: false,
      error: 'Question is too short. Please ask something with at least 4 characters.'
    };
  }

  if (clean.length > 500) {
    return {
      isValid: false,
      error: 'Question is too long (max 500 characters).'
    };
  }

  // Check repetitive character spam (e.g. "aaaaaaa", "?????!!!!!", "..........")
  const repetitiveCharRegex = /(.)\1{6,}/i;
  if (repetitiveCharRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Please avoid repeated character spam.'
    };
  }

  // Check keyboard smash / single repeated word spam (e.g. "asdf asdf asdf asdf asdf")
  const words = clean.toLowerCase().split(/\s+/);
  if (words.length >= 4) {
    const uniqueWords = new Set(words);
    if (uniqueWords.size === 1) {
      return {
        isValid: false,
        error: 'Please ask a meaningful question instead of repeated words.'
      };
    }
  }

  // Check toxic or blocked words
  const lowerText = clean.toLowerCase();
  for (const blocked of BLOCKED_WORDS) {
    if (lowerText.includes(blocked)) {
      return {
        isValid: false,
        error: 'Your question contains flagged terms. Please keep it friendly and respectful.'
      };
    }
  }

  return { isValid: true };
}
