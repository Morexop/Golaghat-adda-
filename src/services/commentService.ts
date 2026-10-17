import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  getDocs,
} from 'firebase/firestore';
import { db, auth, ensureAnonymousAuth, handleFirestoreError, OperationType } from '../lib/firebase';
import { CommentItem, CommentReply, PublicProfile, PinSuggestion, ReportItem } from '../types/community';
import { validateNickname, validateCommentText, checkPostingCooldown, recordPostTimestamp, isDuplicateMessage } from '../lib/validation';
import { checkContentModeration } from '../lib/moderation';

const SEED_LIKES_STORAGE_KEY = 'asoni_palu_ne_seed_likes';

export function getLocalSeedLikes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SEED_LIKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalSeedLiked(commentId: string, liked: boolean): void {
  try {
    const map = getLocalSeedLikes();
    if (liked) {
      map[commentId] = true;
    } else {
      delete map[commentId];
    }
    localStorage.setItem(SEED_LIKES_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export const DEFAULT_STARTER_COMMENTS: CommentItem[] = [
  {
    id: 'seed-pin-1',
    authorUid: 'admin-seed',
    nickname: 'Golaghat Admin',
    text: 'Moina aru Babu sokol! Welcome to Golaghat Public Adda. Pala ne Asoni? Respectful thakiba, nijor comedy moments share kora! 🍗☕',
    createdAt: Date.now() - 3600000 * 2,
    likeCount: 0,
    replyCount: 0,
    status: 'published',
    isPinned: true,
    pinnedReason: 'Official Welcome & Rules',
  },
  {
    id: 'seed-2',
    authorUid: 'seed-2',
    nickname: 'Babu_Fan_99',
    text: 'Aji chicken treat khua plan cancel hol, bank-e koise "Technical glitch"! Etiya Maggi he bhorosa! 🍜😂',
    createdAt: Date.now() - 1800000,
    likeCount: 0,
    replyCount: 0,
    status: 'published',
    isPinned: false,
  },
  {
    id: 'seed-3',
    authorUid: 'seed-3',
    nickname: 'Moina_Scooty_Rider',
    text: 'Golaghat market-ot aji full bheed! Sobai ATM line-ot raye aahise sun! 🛍️🌸',
    createdAt: Date.now() - 900000,
    likeCount: 0,
    replyCount: 0,
    status: 'published',
    isPinned: false,
  },
];

const NICKNAME_LOCAL_STORAGE_KEY = 'asoni_palu_ne_nickname';

/**
 * Gets currently saved nickname (from localStorage or profile)
 */
export function getSavedNickname(): string {
  return localStorage.getItem(NICKNAME_LOCAL_STORAGE_KEY) || '';
}

/**
 * Saves user nickname to localStorage and to Firestore publicProfile
 */
export async function saveUserNickname(nickname: string): Promise<PublicProfile> {
  const validation = validateNickname(nickname);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid nickname');
  }

  const user = await ensureAnonymousAuth();
  const trimmed = nickname.trim();
  localStorage.setItem(NICKNAME_LOCAL_STORAGE_KEY, trimmed);

  const profile: PublicProfile = {
    uid: user.uid,
    nickname: trimmed,
    createdAt: Date.now(),
  };

  try {
    const profileRef = doc(db, 'publicProfiles', user.uid);
    await setDoc(profileRef, {
      authorUid: user.uid,
      nickname: trimmed,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    // Non-fatal if offline or restricted; local nickname remains active
    console.warn('Profile sync notice:', err);
  }

  return profile;
}

/**
 * Subscribes to real-time comments from Firestore
 */
export function subscribeToComments(
  onData: (comments: CommentItem[]) => void,
  pageSize: number = 20
): () => void {
  const commentsCol = collection(db, 'comments');
  const q = query(commentsCol, orderBy('createdAt', 'desc'), limit(pageSize));

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const items: CommentItem[] = [];
      const user = auth.currentUser;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.status === 'hidden' && data.authorUid !== user?.uid) {
          continue;
        }

        const comment: CommentItem = {
          id: docSnap.id,
          authorUid: data.authorUid || '',
          nickname: data.nickname || 'Golaghat User',
          text: data.text || '',
          createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : (data.createdAt || Date.now()),
          likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
          reactions: data.reactions || {},
          replyCount: typeof data.replyCount === 'number' ? data.replyCount : 0,
          status: data.status || 'published',
          isPinned: !!data.isPinned,
          pinnedReason: data.pinnedReason || '',
        };
        items.push(comment);
      }
      onData(items);
    },
    (error) => {
      console.warn('Realtime comments sync notice (using local starter adda feed):', error);
      onData(DEFAULT_STARTER_COMMENTS);
    }
  );

  return unsubscribe;
}

/**
 * Creates a new public comment
 */
export async function createComment(text: string, nickname: string): Promise<string> {
  const textValidation = validateCommentText(text);
  if (!textValidation.isValid) {
    throw new Error(textValidation.error);
  }

  const moderation = checkContentModeration(text);
  if (!moderation.isClean) {
    throw new Error(moderation.flaggedReason || 'Message violates community rules.');
  }

  const nickValidation = validateNickname(nickname);
  if (!nickValidation.isValid) {
    throw new Error(nickValidation.error);
  }

  const user = await ensureAnonymousAuth();

  // Cooldown check
  const cooldown = checkPostingCooldown(user.uid);
  if (!cooldown.canPost) {
    throw new Error(`Please wait ${cooldown.remainingSeconds}s before posting again.`);
  }

  // Duplicate check
  if (isDuplicateMessage(user.uid, text)) {
    throw new Error('Duplicate message detected! Please share a different reaction.');
  }

  const commentId = 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const commentRef = doc(db, 'comments', commentId);

  try {
    await setDoc(commentRef, {
      authorUid: user.uid,
      nickname: nickname.trim(),
      text: text.trim(),
      likeCount: 0,
      reactions: {},
      replyCount: 0,
      status: 'published',
      isPinned: false,
      pinnedReason: '',
      createdAt: new Date().toISOString(),
    });

    recordPostTimestamp(user.uid, text);
    return commentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `comments/${commentId}`);
  }
}

/**
 * Deletes a comment from Firestore
 */
export async function deleteComment(commentId: string): Promise<void> {
  if (commentId.startsWith('seed-')) {
    const rawDeleted = localStorage.getItem('asoni_palu_ne_deleted_seeds');
    const set = rawDeleted ? JSON.parse(rawDeleted) : [];
    set.push(commentId);
    localStorage.setItem('asoni_palu_ne_deleted_seeds', JSON.stringify(set));
    return;
  }

  try {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
  }
}

/**
 * Deletes a reply under a comment
 */
export async function deleteReply(commentId: string, replyId: string): Promise<void> {
  try {
    const replyRef = doc(db, 'comments', commentId, 'replies', replyId);
    await deleteDoc(replyRef);
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      replyCount: increment(-1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}/replies/${replyId}`);
  }
}

/**
 * Subscribes to replies for a specific comment
 */
export function subscribeToReplies(
  commentId: string,
  onData: (replies: CommentReply[]) => void
): () => void {
  // If this is a starter seed comment, it doesn't have a Firestore document yet
  if (commentId.startsWith('seed-')) {
    onData([]);
    return () => {};
  }

  const repliesCol = collection(db, 'comments', commentId, 'replies');
  const q = query(repliesCol, orderBy('createdAt', 'asc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: CommentReply[] = [];
      const user = auth.currentUser;

      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'hidden' && data.authorUid !== user?.uid) {
          return;
        }
        items.push({
          id: d.id,
          commentId,
          parentId: data.parentId || commentId,
          authorUid: data.authorUid || '',
          nickname: data.nickname || 'Golaghat User',
          text: data.text || '',
          createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : (data.createdAt || Date.now()),
          likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
          status: data.status || 'published',
        });
      });
      onData(items);
    },
    (error) => {
      console.warn('Realtime replies notice for', commentId, error);
      onData([]);
    }
  );

  return unsubscribe;
}

/**
 * Creates a nested reply to a comment
 */
export async function createReply(
  commentId: string,
  parentId: string,
  text: string,
  nickname: string
): Promise<string> {
  const textValidation = validateCommentText(text);
  if (!textValidation.isValid) {
    throw new Error(textValidation.error);
  }

  const moderation = checkContentModeration(text);
  if (!moderation.isClean) {
    throw new Error(moderation.flaggedReason || 'Reply violates community rules.');
  }

  const user = await ensureAnonymousAuth();

  // Cooldown check
  const cooldown = checkPostingCooldown(user.uid);
  if (!cooldown.canPost) {
    throw new Error(`Please wait ${cooldown.remainingSeconds}s before posting another reply.`);
  }

  // If replying to a seed comment, promote to a published comment
  if (commentId.startsWith('seed-')) {
    return createComment(`[Reply to Adda Post]: ${text}`, nickname);
  }

  const replyId = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const replyRef = doc(db, 'comments', commentId, 'replies', replyId);
  const commentRef = doc(db, 'comments', commentId);

  try {
    await setDoc(replyRef, {
      commentId,
      parentId,
      authorUid: user.uid,
      nickname: nickname.trim(),
      text: text.trim(),
      likeCount: 0,
      status: 'published',
      createdAt: new Date().toISOString(),
    });

    // Increment replyCount on parent comment
    await updateDoc(commentRef, {
      replyCount: increment(1),
    });

    recordPostTimestamp(user.uid, text);
    return replyId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `comments/${commentId}/replies/${replyId}`);
  }
}

/**
 * Checks if current user has liked a comment
 */
export async function hasUserLikedComment(commentId: string): Promise<boolean> {
  if (commentId.startsWith('seed-')) {
    return !!getLocalSeedLikes()[commentId];
  }
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const likeDoc = await getDoc(doc(db, 'comments', commentId, 'likes', user.uid));
    return likeDoc.exists();
  } catch {
    return false;
  }
}

/**
 * Toggles a like for a comment (one per user UID)
 */
export async function toggleCommentLike(commentId: string, currentlyLiked: boolean): Promise<boolean> {
  if (commentId.startsWith('seed-')) {
    const nextState = !currentlyLiked;
    setLocalSeedLiked(commentId, nextState);
    return nextState;
  }
  const user = await ensureAnonymousAuth();
  const likeRef = doc(db, 'comments', commentId, 'likes', user.uid);
  const commentRef = doc(db, 'comments', commentId);

  try {
    if (currentlyLiked) {
      await deleteDoc(likeRef);
      await updateDoc(commentRef, {
        likeCount: increment(-1),
      });
      return false;
    } else {
      await setDoc(likeRef, {
        targetId: commentId,
        targetType: 'comment',
        userUid: user.uid,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(commentRef, {
        likeCount: increment(1),
      });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `comments/${commentId}/likes/${user.uid}`);
  }
}

/**
 * Submits a suggestion to pin a comment
 */
export async function submitPinSuggestion(
  commentId: string,
  commentText: string,
  authorNickname: string,
  reason: string
): Promise<string> {
  const user = await ensureAnonymousAuth();
  const suggestionId = 'pin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const suggestionRef = doc(db, 'pinSuggestions', suggestionId);

  try {
    await setDoc(suggestionRef, {
      targetCommentId: commentId,
      commentText: commentText.substring(0, 500),
      authorNickname,
      requesterUid: user.uid,
      reason: reason.trim().substring(0, 300) || 'Recommended for top humor',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return suggestionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `pinSuggestions/${suggestionId}`);
  }
}

/**
 * Submits a moderation report for a comment or reply
 */
export async function submitReport(
  targetId: string,
  targetType: 'comment' | 'reply',
  targetText: string,
  reason: string,
  details?: string
): Promise<string> {
  const user = await ensureAnonymousAuth();
  const reportId = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const reportRef = doc(db, 'reports', reportId);

  try {
    await setDoc(reportRef, {
      targetId,
      targetType,
      targetText: targetText.substring(0, 500),
      reporterUid: user.uid,
      reason: reason.substring(0, 100),
      details: (details || '').substring(0, 500),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reports/${reportId}`);
  }
}

/**
 * Supported emojis for Golaghat Public Adda reactions
 */
export const AVAILABLE_REACTIONS = [
  { emoji: '😂', label: 'Hahi' },
  { emoji: '❤️', label: 'Morom' },
  { emoji: '🔥', label: 'Jomiise' },
  { emoji: '👏', label: 'Sobaas' },
  { emoji: '🍗', label: 'Treat' },
] as const;

export type ReactionEmoji = typeof AVAILABLE_REACTIONS[number]['emoji'];

const SEED_USER_REACTIONS_KEY = 'asoni_palu_ne_seed_user_reactions';
const SEED_REACTIONS_COUNTS_KEY = 'asoni_palu_ne_seed_reactions_counts';

export function getUserSeedReaction(commentId: string): string | null {
  try {
    const raw = localStorage.getItem(SEED_USER_REACTIONS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[commentId] || null;
  } catch {
    return null;
  }
}

export function getSeedReactionCounts(commentId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEED_REACTIONS_COUNTS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[commentId] || {};
  } catch {
    return {};
  }
}

/**
 * Checks which emoji reaction current user has applied to a comment
 */
export async function getUserReaction(commentId: string): Promise<string | null> {
  if (commentId.startsWith('seed-')) {
    return getUserSeedReaction(commentId);
  }
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const reactionDoc = await getDoc(doc(db, 'comments', commentId, 'reactions', user.uid));
    if (reactionDoc.exists()) {
      return reactionDoc.data().emoji || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Toggles or updates an emoji reaction on a comment
 */
export async function toggleCommentReaction(
  commentId: string,
  emoji: string,
  currentReactions: Record<string, number> = {}
): Promise<{ userReaction: string | null; reactions: Record<string, number> }> {
  // If it's a seed comment, handle locally in localStorage
  if (commentId.startsWith('seed-')) {
    const existingEmoji = getUserSeedReaction(commentId);
    const rawUserReactions = localStorage.getItem(SEED_USER_REACTIONS_KEY);
    const userMap = rawUserReactions ? JSON.parse(rawUserReactions) : {};

    const counts = { ...getSeedReactionCounts(commentId) };

    let nextReaction: string | null = null;
    if (existingEmoji === emoji) {
      // Toggle off
      delete userMap[commentId];
      counts[emoji] = Math.max(0, (counts[emoji] || 1) - 1);
      if (counts[emoji] === 0) delete counts[emoji];
    } else {
      // If switching from another emoji, decrement previous
      if (existingEmoji && counts[existingEmoji]) {
        counts[existingEmoji] = Math.max(0, counts[existingEmoji] - 1);
        if (counts[existingEmoji] === 0) delete counts[existingEmoji];
      }
      userMap[commentId] = emoji;
      counts[emoji] = (counts[emoji] || 0) + 1;
      nextReaction = emoji;
    }

    localStorage.setItem(SEED_USER_REACTIONS_KEY, JSON.stringify(userMap));

    const rawCounts = localStorage.getItem(SEED_REACTIONS_COUNTS_KEY);
    const allCounts = rawCounts ? JSON.parse(rawCounts) : {};
    allCounts[commentId] = counts;
    localStorage.setItem(SEED_REACTIONS_COUNTS_KEY, JSON.stringify(allCounts));

    return { userReaction: nextReaction, reactions: counts };
  }

  // Real Firestore comment
  const user = await ensureAnonymousAuth();
  const reactionRef = doc(db, 'comments', commentId, 'reactions', user.uid);
  const commentRef = doc(db, 'comments', commentId);

  const prevDoc = await getDoc(reactionRef);
  const existingEmoji = prevDoc.exists() ? prevDoc.data().emoji : null;

  const nextReactions: Record<string, number> = { ...currentReactions };
  let nextReaction: string | null = null;

  try {
    if (existingEmoji === emoji) {
      // Remove reaction
      await deleteDoc(reactionRef);
      if (nextReactions[emoji]) {
        nextReactions[emoji] = Math.max(0, nextReactions[emoji] - 1);
        if (nextReactions[emoji] === 0) delete nextReactions[emoji];
      }
    } else {
      // Switch or add
      if (existingEmoji && nextReactions[existingEmoji]) {
        nextReactions[existingEmoji] = Math.max(0, nextReactions[existingEmoji] - 1);
        if (nextReactions[existingEmoji] === 0) delete nextReactions[existingEmoji];
      }
      await setDoc(reactionRef, {
        emoji,
        userUid: user.uid,
        createdAt: new Date().toISOString(),
      });
      nextReactions[emoji] = (nextReactions[emoji] || 0) + 1;
      nextReaction = emoji;
    }

    await updateDoc(commentRef, {
      reactions: nextReactions,
    });

    return { userReaction: nextReaction, reactions: nextReactions };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `comments/${commentId}/reactions/${user.uid}`);
  }
}

