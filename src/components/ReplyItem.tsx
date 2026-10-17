import React, { useState } from 'react';
import { CommentReply } from '../types/community';
import { Heart, Flag, MessageSquare, Trash2 } from 'lucide-react';
import { getCurrentUserUid } from '../lib/firebase';
import { deleteReply } from '../services/commentService';

interface ReplyItemProps {
  reply: CommentReply;
  onOpenReport: (target: { id: string; type: 'reply'; text: string }) => void;
  onReplyToReply?: (reply: CommentReply) => void;
  onDeleteReply?: (replyId: string) => void;
  canNestReply?: boolean;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  onOpenReport,
  onReplyToReply,
  onDeleteReply,
  canNestReply = true,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUid = getCurrentUserUid();
  const isAuthor = !!(reply.authorUid && reply.authorUid === currentUid);

  const handleDelete = async () => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      setIsDeleting(true);
      await deleteReply(reply.commentId, reply.id);
      onDeleteReply?.(reply.id);
    } catch (err) {
      console.warn('Delete reply failed:', err);
    } finally {
      setIsDeleting(false);
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
    <div className="relative pl-4 sm:pl-6 border-l-2 border-purple-800/60 my-3 text-left">
      <div className="p-3.5 rounded-2xl bg-[#1d0d36]/80 border border-purple-800/40 hover:border-purple-700/60 transition">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
              💬
            </span>
            <span className="font-bold text-xs text-cyan-300">@{reply.nickname}</span>
            <span className="text-[10px] text-purple-400">{formatTime(reply.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-purple-400/60 hover:text-rose-400 text-[11px] flex items-center gap-1 transition cursor-pointer"
                title="Delete your reply"
                aria-label="Delete your reply"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] text-rose-300">{isDeleting ? '...' : 'Delete'}</span>
              </button>
            )}

            <button
              onClick={() => onOpenReport({ id: reply.id, type: 'reply', text: reply.text })}
              className="text-purple-400/60 hover:text-red-400 text-[10px] flex items-center gap-1 transition cursor-pointer"
              title="Report reply"
              aria-label="Report reply"
            >
              <Flag className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed break-words">
          {reply.text}
        </p>

        {canNestReply && onReplyToReply && (
          <div className="mt-2.5 pt-2 border-t border-purple-900/40 flex items-center gap-3">
            <button
              onClick={() => onReplyToReply(reply)}
              className="text-[11px] font-medium text-purple-300 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>Reply</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
