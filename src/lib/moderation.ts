/**
 * Content moderation filter for Golaghat Public Adda
 * Detects abusive language, phone numbers, scam words, and spam patterns
 */

// Banned or abusive terms across English, Assamese, and Hindi slang
const BANNED_PATTERNS = [
  /\b(scam|fraud|lottery|crypto|free\s*cash|hack)\b/i,
  /\b(kill|suicide|shoot|attack)\b/i,
  /\b(kela|hoga|bhodai|baal|suta|randi|chutiya|madarchod|bhosdike)\b/i,
];

// Phone number regex (Indian 10-digit mobile number patterns)
const PHONE_PATTERN = /(?:\+91[\-\s]?)?[6789]\d{9}/;

// Bank / Account / OTP patterns
const SENSITIVE_INFO_PATTERN = /\b(otp|cvv|password|passcode|debit\s*card|credit\s*card|pin\s*code|bank\s*ac|upi\s*pin)\b/i;

export interface ModerationCheckResult {
  isClean: boolean;
  flaggedReason?: string;
}

/**
 * Checks message text for sensitive PII (phone numbers, bank info),
 * prohibited keywords, or scam announcements.
 */
export function checkContentModeration(text: string): ModerationCheckResult {
  if (!text) {
    return { isClean: true };
  }

  // 1. Phone number check
  if (PHONE_PATTERN.test(text)) {
    return {
      isClean: false,
      flaggedReason: 'Phone numbers are not allowed in public adda for your safety.',
    };
  }

  // 2. Sensitive financial/password credentials
  if (SENSITIVE_INFO_PATTERN.test(text)) {
    return {
      isClean: false,
      flaggedReason: 'Sensitive bank or account information is strictly prohibited.',
    };
  }

  // 3. Abusive, harassing, or scam words
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isClean: false,
        flaggedReason: 'Message contains prohibited language or unverified promotional words.',
      };
    }
  }

  return { isClean: true };
}
