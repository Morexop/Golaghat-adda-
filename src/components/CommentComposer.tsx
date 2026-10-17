import React, { useState, useEffect } from 'react';
import { Send, User, Edit3, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { validateCommentText, checkPostingCooldown, POSTING_COOLDOWN_SECONDS } from '../lib/validation';
import { auth } from '../lib/firebase';

interface CommentComposerProps {
  nickname: string;
  onOpenNicknameModal: () => void;
  onSubmitComment: (text: string) => Promise<void>;
  prefilledText?: string;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  nickname,
  onOpenNicknameModal,
  onSubmitComment,
  prefilledText,
}) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Sync prefilledText if provided (e.g. from Trending Topic click)
  useEffect(() => {
    if (prefilledText) {
      setText((prev) => (prev.includes(prefilledText) ? prev : prev ? `${prev} ${prefilledText}` : `${prefilledText} `));
    }
  }, [prefilledText]);

  // Check cooldown interval
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const interval = setInterval(() => {
      const cooldown = checkPostingCooldown(user.uid);
      setCooldownSeconds(cooldown.remainingSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      onOpenNicknameModal();
      return;
    }

    const validation = validateCommentText(text);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid message.');
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const cooldown = checkPostingCooldown(user.uid);
      if (!cooldown.canPost) {
        setError(`Please wait ${cooldown.remainingSeconds}s before posting.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitComment(text);
      setText('');
      // Trigger cooldown display
      setCooldownSeconds(POSTING_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const remainingChars = 500 - text.length;
  const isTooLong = remainingChars < 0;

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-[#160829] border border-purple-800/60 shadow-xl mb-8 text-left">
      {/* Top bar: Nickname identification */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-purple-400 block leading-tight">Posting as:</span>
            <span className="text-sm font-bold text-white">
              {nickname ? `@${nickname}` : <span className="text-yellow-400 italic">No nickname set yet</span>}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNicknameModal}
          className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-yellow-300 bg-purple-950/70 hover:bg-purple-900/60 border border-purple-800/50 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{nickname ? 'Change Nickname' : 'Set Nickname'}</span>
        </button>
      </div>

      {/* Composer Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            placeholder={
              nickname
                ? 'Aji Moina ba Babu asoni-r ki khobor? Share your funny reaction or meme thought...'
                : 'Pothome nickname set koriba, tar pasot message post koriba! 😊'
            }
            rows={3}
            maxLength={520}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-purple-800/50 text-white placeholder-purple-400/80 text-sm focus:border-yellow-400 focus:outline-none transition resize-none disabled:opacity-50"
          />
        </div>

        {/* Status & Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer controls: counter, cooldown, submit */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Character Counter & Cooldown */}
          <div className="flex items-center gap-3 text-xs">
            <span className={`font-mono text-xs ${isTooLong ? 'text-red-400 font-bold' : remainingChars < 50 ? 'text-yellow-400' : 'text-purple-400'}`}>
              {text.length}/500
            </span>

            {cooldownSeconds > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-yellow-300 bg-yellow-950/60 border border-yellow-500/30 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Cooldown: {cooldownSeconds}s</span>
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || isTooLong || text.trim().length === 0 || cooldownSeconds > 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-black font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <span>Posting...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
