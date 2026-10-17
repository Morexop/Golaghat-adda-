import React, { useState, useEffect } from 'react';
import { CommentItem, CommentReply } from '../types/community';
import { ReplyItem } from './ReplyItem';
import {
  Heart,
  MessageSquare,
  Pin,
  Flag,
  CornerDownRight,
  Send,
  X,
  AlertCircle,
  PinIcon,
  Trash2,
} from 'lucide-react';
import {
  subscribeToReplies,
  createReply,
  toggleCommentLike,
  hasUserLikedComment,
  AVAILABLE_REACTIONS,
  getUserReaction,
  toggleCommentReaction,
  deleteComment,
} from '../services/commentService';
import { validateCommentText } from '../lib/validation';
import { getCurrentUserUid } from '../lib/firebase';

interface CommentCardProps {
  comment: CommentItem;
  currentNickname: string;
  onOpenNicknameModal: () => void;
  onOpenSuggestPin: (comment: CommentItem) => void;
  onOpenReport: (target: { id: string; type: 'comment'; text: string }) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentNickname,
  onOpenNicknameModal,
  onOpenSuggestPin,
  onOpenReport,
  onCommentDeleted,
}) => {
  const currentUid = getCurrentUserUid();
  const isAuthor = !!(comment.authorUid && comment.authorUid === currentUid);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string | null>(null);
  const [replyParentId, setReplyParentId] = useState<string>(comment.id);

  const handleDeleteComment = async () => {
    try {
      setIsDeleting(true);
      await deleteComment(comment.id);
      setShowDeleteConfirm(false);
      onCommentDeleted?.(comment.id);
    } catch (err: any) {
      console.warn('Delete comment error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [liking, setLiking] = useState(false);

  // Emoji Reaction state (😂, ❤️, 🔥, 👏, 🍗)
  const [reactions, setReactions] = useState<Record<string, number>>(comment.reactions || {});
  const [userReaction, setUserReaction] = useState<string | null>(comment.userReaction || null);
  const [reactingEmoji, setReactingEmoji] = useState<string | null>(null);

  // Subscribe to replies
  useEffect(() => {
    const unsubscribe = subscribeToReplies(comment.id, (loadedReplies) => {
      setReplies(loadedReplies);
    });
    return () => unsubscribe();
  }, [comment.id]);

  // Check if current user liked
  useEffect(() => {
    hasUserLikedComment(comment.id).then((liked) => setIsLiked(liked));
  }, [comment.id]);

  // Load user reaction
  useEffect(() => {
    getUserReaction(comment.id).then((reaction) => {
      setUserReaction(reaction);
    });
  }, [comment.id]);

  // Sync like count if updated from parent/snapshot
  useEffect(() => {
    setLikeCount(comment.likeCount || 0);
  }, [comment.likeCount]);

  // Sync reactions if updated from parent/snapshot
  useEffect(() => {
    setReactions(comment.reactions || {});
  }, [comment.reactions]);

  const handleLikeToggle = async () => {
    if (liking) return;
    try {
      setLiking(true);
      const nextLikedState = !isLiked;
      setIsLiked(nextLikedState);
      setLikeCount((prev) => (nextLikedState ? prev + 1 : Math.max(0, prev - 1)));
      await toggleCommentLike(comment.id, isLiked);
    } catch (err) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(comment.likeCount || 0);
      console.warn('Like toggle failed:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleReactionClick = async (emoji: string) => {
    if (reactingEmoji) return;
    try {
      setReactingEmoji(emoji);
      const isTogglingOff = userReaction === emoji;
      const prevReaction = userReaction;
      const nextCounts: Record<string, number> = { ...reactions };

      if (isTogglingOff) {
        nextCounts[emoji] = Math.max(0, (nextCounts[emoji] || 1) - 1);
        if (nextCounts[emoji] === 0) delete nextCounts[emoji];
        setUserReaction(null);
      } else {
        if (prevReaction && nextCounts[prevReaction]) {
          nextCounts[prevReaction] = Math.max(0, nextCounts[prevReaction] - 1);
          if (nextCounts[prevReaction] === 0) delete nextCounts[prevReaction];
        }
        nextCounts[emoji] = (nextCounts[emoji] || 0) + 1;
        setUserReaction(emoji);
      }
      setReactions(nextCounts);

      const res = await toggleCommentReaction(comment.id, emoji, reactions);
      setUserReaction(res.userReaction);
      setReactions(res.reactions);
    } catch (err) {
      console.warn('Reaction update error:', err);
      setUserReaction(userReaction);
      setReactions(comment.reactions || {});
    } finally {
      setReactingEmoji(null);
    }
  };

  const handleStartReply = (parentId: string = comment.id, targetNickname?: string) => {
    if (!currentNickname) {
      onOpenNicknameModal();
      return;
    }
    setReplyParentId(parentId);
    setReplyingToAuthor(targetNickname || comment.nickname);
    setShowReplyComposer(true);
    setReplyError(null);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNickname) {
      onOpenNicknameModal();
      return;
    }

    const validation = validateCommentText(replyText);
    if (!validation.isValid) {
      setReplyError(validation.error || 'Please enter valid text.');
      return;
    }

    try {
      setSubmittingReply(true);
      setReplyError(null);
      await createReply(comment.id, replyParentId, replyText, currentNickname);
      setReplyText('');
      setShowReplyComposer(false);
      setReplyingToAuthor(null);
    } catch (err: any) {
      setReplyError(err?.message || 'Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className={`rounded-3xl p-5 sm:p-6 mb-4 text-left transition-all ${
      comment.isPinned 
        ? 'bg-gradient-to-br from-[#2a1347] via-[#1a0a30] to-[#120524] border-2 border-yellow-400/80 shadow-[0_0_25px_rgba(255,210,63,0.2)]'
        : 'bg-[#150727] border border-purple-800/50 hover:border-purple-700/70 shadow-lg'
    }`}>
      {/* Pinned pill if applicable */}
      {comment.isPinned && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold mb-3 shadow-sm">
          <Pin className="w-3.5 h-3.5 fill-black" />
          <span>PINNED MESSAGE 📌</span>
          {comment.pinnedReason && (
            <span className="font-normal opacity-90 hidden sm:inline">
              · {comment.pinnedReason}
            </span>
          )}
        </div>
      )}

      {/* Header: Author snapshot, timestamp, and report */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-[#17082a] rounded-full flex items-center justify-center text-xs font-bold text-yellow-300">
              {comment.nickname.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <span className="font-bold text-sm text-yellow-200">
              @{comment.nickname}
            </span>
            <span className="text-[11px] text-purple-400 block leading-none">
              {formatTime(comment.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Delete button (Visible for author) */}
          {isAuthor && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              data-testid="delete-comment-btn"
              className="p-1.5 text-purple-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition text-xs flex items-center gap-1 cursor-pointer"
              title="Delete this comment"
              aria-label="Delete this comment"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] text-rose-300">Delete</span>
            </button>
          )}

          {/* Suggest Pin button */}
          <button
            onClick={() => onOpenSuggestPin(comment)}
            data-testid="suggest-pin-btn"
            className="p-1.5 text-purple-400 hover:text-yellow-400 rounded-lg hover:bg-purple-900/30 transition text-xs flex items-center gap-1 cursor-pointer"
            title="Suggest to pin this message"
            aria-label="Suggest to pin this message"
          >
            <PinIcon className="w-3.5 h-3.5" />
            <span className="text-[11px]">Suggest Pin</span>
          </button>

          {/* Report button */}
          <button
            onClick={() => onOpenReport({ id: comment.id, type: 'comment', text: comment.text })}
            className="p-1.5 text-purple-400 hover:text-red-400 rounded-lg hover:bg-purple-900/30 transition text-xs flex items-center gap-1 cursor-pointer"
            title="Report this comment"
            aria-label="Report this comment"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Banner */}
      {showDeleteConfirm && (
        <div className="my-2.5 p-3 rounded-2xl bg-rose-950/90 border border-rose-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Delete this comment permanently?</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs text-purple-200 hover:text-white bg-purple-900/60 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteComment}
              disabled={isDeleting}
              data-testid="confirm-delete-btn"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Comment Body */}
      <div className="py-1">
        <p className="text-sm sm:text-base text-purple-50 leading-relaxed break-words">
          {comment.text}
        </p>
      </div>

      {/* Action Toolbar: Emoji Reactions, Like, Reply toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-purple-900/40 text-xs">
        {/* Emoji Reactions (😂, ❤️, 🔥, 👏, 🍗) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {AVAILABLE_REACTIONS.map(({ emoji, label }) => {
            const count = reactions[emoji] || 0;
            const isSelected = userReaction === emoji;
            return (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                disabled={!!reactingEmoji}
                title={`${label} (${count})`}
                aria-label={`React with ${emoji} - ${label}`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-yellow-400/25 border-yellow-400 text-yellow-300 font-bold shadow-[0_0_12px_rgba(255,210,63,0.3)] ring-1 ring-yellow-400/50'
                    : count > 0
                    ? 'bg-purple-950/70 border-purple-600/60 text-purple-200 hover:border-yellow-400/50 hover:bg-purple-900/50'
                    : 'bg-purple-950/30 border-purple-800/40 text-purple-300 hover:border-purple-600/60 hover:bg-purple-900/40 hover:text-white'
                }`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                {count > 0 && <span className="font-mono text-[11px] font-semibold">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            disabled={liking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
              isLiked
                ? 'bg-pink-950/60 border-pink-500/60 text-pink-300'
                : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:text-pink-300 hover:border-pink-500/30'
            }`}
            aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            <span>{likeCount > 0 ? likeCount : 'Like'}</span>
          </button>

          {/* Reply Toggle Button */}
          <button
            onClick={() => handleStartReply(comment.id, comment.nickname)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{replies.length > 0 ? `${replies.length} Replies` : 'Reply'}</span>
          </button>
        </div>
      </div>

      {/* Nested Replies List (Max depth 2) */}
      {replies.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-900/30 space-y-2">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onOpenReport={(target) => onOpenReport({ id: target.id, type: 'comment', text: target.text })}
              onReplyToReply={(r) => handleStartReply(comment.id, r.nickname)}
              onDeleteReply={(replyId) => setReplies((prev) => prev.filter((r) => r.id !== replyId))}
              canNestReply={true}
            />
          ))}
        </div>
      )}

      {/* Inline Reply Composer */}
      {showReplyComposer && (
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-cyan-500/30 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-cyan-300 mb-2">
            <span className="flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5" />
              Replying to <strong>@{replyingToAuthor}</strong>:
            </span>
            <button
              onClick={() => setShowReplyComposer(false)}
              className="text-purple-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitReply} className="space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                setReplyError(null);
              }}
              placeholder={`Write your reply to @${replyingToAuthor}...`}
              rows={2}
              maxLength={500}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400 text-xs focus:border-cyan-400 focus:outline-none transition resize-none"
            />

            {replyError && (
              <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{replyError}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-purple-400 pt-1">
              <span>{replyText.length}/500</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyComposer(false)}
                  className="px-3 py-1.5 rounded-lg bg-purple-900/40 text-purple-300 text-xs hover:bg-purple-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply || replyText.trim().length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition disabled:opacity-40 cursor-pointer shadow-md"
                >
                  {submittingReply ? <span>Sending...</span> : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Post Reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
