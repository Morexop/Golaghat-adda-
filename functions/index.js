const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Banned patterns for server-side trusted moderation
const BANNED_PATTERNS = [
  /\b(scam|fraud|lottery|crypto|free\s*cash|hack)\b/i,
  /\b(kill|suicide|shoot|attack)\b/i,
  /\b(kela|hoga|bhodai|baal|suta|randi|chutiya|madarchod|bhosdike)\b/i,
];
const PHONE_PATTERN = /(?:\+91[\-\s]?)?[6789]\d{9}/;
const SENSITIVE_INFO_PATTERN = /\b(otp|cvv|password|passcode|debit\s*card|credit\s*card|pin\s*code|bank\s*ac|upi\s*pin)\b/i;

/**
 * Server-side trusted moderation trigger for new comments
 */
exports.onCommentCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const text = data.text || '';
    const commentId = context.params.commentId;

    let flagged = false;
    let reason = '';

    if (PHONE_PATTERN.test(text)) {
      flagged = true;
      reason = 'Phone number detected';
    } else if (SENSITIVE_INFO_PATTERN.test(text)) {
      flagged = true;
      reason = 'Sensitive financial info';
    } else {
      for (const pattern of BANNED_PATTERNS) {
        if (pattern.test(text)) {
          flagged = true;
          reason = 'Prohibited or abusive keywords';
          break;
        }
      }
    }

    if (flagged) {
      console.log(`Auto-hiding comment ${commentId}: ${reason}`);
      await snap.ref.update({
        status: 'hidden',
        moderationReason: reason,
      });

      // Auto-create a moderation report for administrator review
      await db.collection('reports').add({
        targetId: commentId,
        targetType: 'comment',
        targetText: text,
        reporterUid: 'system_automod',
        reason: `AutoMod: ${reason}`,
        details: 'Automatically hidden by Cloud Function filter',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

/**
 * Server-side trusted moderation trigger for new replies
 */
exports.onReplyCreated = functions.firestore
  .document('comments/{commentId}/replies/{replyId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const text = data.text || '';
    const { commentId, replyId } = context.params;

    let flagged = false;
    let reason = '';

    if (PHONE_PATTERN.test(text) || SENSITIVE_INFO_PATTERN.test(text)) {
      flagged = true;
      reason = 'PII or banking info detected';
    }

    if (flagged) {
      console.log(`Auto-hiding reply ${replyId} under comment ${commentId}`);
      await snap.ref.update({
        status: 'hidden',
        moderationReason: reason,
      });
    }
  });
