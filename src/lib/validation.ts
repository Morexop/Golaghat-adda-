export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates public nickname
 * Length: 2 to 24 characters
 * Allowed characters: letters, numbers, spaces, underscores, hyphens
 */
export function validateNickname(nickname: string): ValidationResult {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Nickname cannot be empty.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Nickname must be at least 2 characters.' };
  }
  if (trimmed.length > 24) {
    return { isValid: false, error: 'Nickname must be 24 characters or less.' };
  }
  const regex = /^[a-zA-Z0-9_\- ]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, error: 'Nickname can only contain letters, numbers, spaces, and hyphens.' };
  }
  return { isValid: true };
}

/**
 * Validates comment/reply text content
 * Length: 1 to 500 characters
 */
export function validateCommentText(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Message cannot be empty.' };
  }
  if (trimmed.length > 500) {
    return { isValid: false, error: `Message is too long (${trimmed.length}/500 characters).` };
  }
  return { isValid: true };
}

/**
 * In-memory cooldown manager (20 seconds between posts)
 */
const lastPostTimestamps: Map<string, number> = new Map();
const recentPostHashes: Map<string, { hash: string; timestamp: number }> = new Map();

export const POSTING_COOLDOWN_SECONDS = 20;

export function checkPostingCooldown(uid: string): { canPost: boolean; remainingSeconds: number } {
  const now = Date.now();
  const lastTime = lastPostTimestamps.get(uid);

  if (!lastTime) {
    return { canPost: true, remainingSeconds: 0 };
  }

  const elapsed = (now - lastTime) / 1000;
  if (elapsed < POSTING_COOLDOWN_SECONDS) {
    return { canPost: false, remainingSeconds: Math.ceil(POSTING_COOLDOWN_SECONDS - elapsed) };
  }

  return { canPost: true, remainingSeconds: 0 };
}

export function recordPostTimestamp(uid: string, text: string): void {
  const now = Date.now();
  lastPostTimestamps.set(uid, now);
  recentPostHashes.set(uid, { hash: text.trim().toLowerCase(), timestamp: now });
}

export function isDuplicateMessage(uid: string, text: string): boolean {
  const recent = recentPostHashes.get(uid);
  if (!recent) return false;

  const now = Date.now();
  const isWithinWindow = now - recent.timestamp < 60000; // 60s duplicate window
  const isIdentical = recent.hash === text.trim().toLowerCase();

  return isWithinWindow && isIdentical;
}
