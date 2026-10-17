import React, { useState } from 'react';
import { X, Pin, Check, AlertCircle } from 'lucide-react';
import { submitPinSuggestion } from '../services/commentService';
import { CommentItem } from '../types/community';

interface SuggestPinModalProps {
  comment: CommentItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuggestPinModal: React.FC<SuggestPinModalProps> = ({
  comment,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (comment) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comment, onClose]);

  if (!comment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await submitPinSuggestion(
        comment.id,
        comment.text,
        comment.nickname,
        reason || 'Top Golaghat comedy message'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#160829] border border-purple-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left cursor-default"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/50 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
            <Pin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bungee text-white">Suggest Pin 📌</h3>
            <p className="text-xs text-purple-300">Recommend this comment for top highlight</p>
          </div>
        </div>

        {/* Selected Comment Preview */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-800/40 mb-4 text-xs">
          <span className="font-bold text-yellow-300 block mb-1">@{comment.nickname}:</span>
          <p className="text-purple-100 line-clamp-3">“{comment.text}”</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason-input" className="block text-xs font-semibold text-purple-200 mb-1.5">
              Why should this be pinned? (Optional)
            </label>
            <textarea
              id="reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sobotkoi funny Golaghat joke aji!"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400 text-sm focus:border-yellow-400 focus:outline-none transition resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-[11px] text-purple-300/80 bg-purple-950/40 border border-purple-900/40 p-3 rounded-xl">
            ℹ️ Suggestions are sent to the community moderation dashboard. An authorized moderator will review and approve valid pins.
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {submitting ? <span>Submitting...</span> : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Send Suggestion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
