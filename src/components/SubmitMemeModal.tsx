import React, { useState } from 'react';
import { X, Sparkles, Send, AlertCircle, Eye } from 'lucide-react';
import { submitCommunityMeme } from '../services/memeService';

interface SubmitMemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  onOpenNicknameModal: () => void;
  onSuccess: () => void;
}

export const SubmitMemeModal: React.FC<SubmitMemeModalProps> = ({
  isOpen,
  onClose,
  nickname,
  onOpenNicknameModal,
  onSuccess,
}) => {
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [category, setCategory] = useState<'moina' | 'babu' | 'golaghat'>('babu');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeNickname = nickname.trim() || 'Golaghatia_' + Math.floor(100 + Math.random() * 900);

    if (setup.trim().length < 3) {
      setError('Setup must be at least 3 characters.');
      return;
    }

    if (punchline.trim().length < 2) {
      setError('Punchline must be at least 2 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await submitCommunityMeme(setup, punchline, category, activeNickname);
      setSetup('');
      setPunchline('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit meme. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#160829] border border-purple-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left cursor-default my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-meme-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/50 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-pink-500 p-[2px] shadow-lg shrink-0">
            <div className="w-full h-full bg-[#1b0728] rounded-[14px] flex items-center justify-center text-2xl">
              ✍️
            </div>
          </div>
          <div>
            <h3 id="submit-meme-title" className="text-xl font-bungee text-white">
              Post Your Meme
            </h3>
            <p className="text-xs text-purple-300">
              Submit your funny dialogue — new users will see and share it!
            </p>
          </div>
        </div>

        {/* Author indicator */}
        <div className="mb-4 p-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-between text-xs">
          <div>
            <span className="text-purple-400 block text-[11px]">Posting as</span>
            <span className="font-bold text-yellow-300">@{nickname || 'No nickname set'}</span>
          </div>
          <button
            type="button"
            onClick={onOpenNicknameModal}
            className="text-xs text-cyan-300 hover:underline cursor-pointer"
          >
            Change Nickname
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Choice */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Meme Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('babu')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'babu'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:border-purple-600'
                }`}
              >
                <span>🍗</span>
                <span>Babu</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('moina')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'moina'
                    ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-sm'
                    : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:border-purple-600'
                }`}
              >
                <span>🌸</span>
                <span>Moina</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('golaghat')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  category === 'golaghat'
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-sm'
                    : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:border-purple-600'
                }`}
              >
                <span>📍</span>
                <span>Golaghat</span>
              </button>
            </div>
          </div>

          {/* Setup / Dialogue */}
          <div>
            <label htmlFor="meme-setup" className="block text-xs font-semibold text-purple-200 mb-1.5">
              1. Setup / Scenario (Situation or dialogue question)
            </label>
            <textarea
              id="meme-setup"
              value={setup}
              onChange={(e) => {
                setSetup(e.target.value);
                setError(null);
              }}
              placeholder='e.g., Dost: Bhai Babu Asoni-r form fill-up korili ne?'
              maxLength={300}
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400/60 text-xs sm:text-sm focus:border-yellow-400 focus:outline-none transition resize-none"
            />
            <span className="text-[10px] text-purple-400 block text-right">{setup.length}/300</span>
          </div>

          {/* Punchline */}
          <div>
            <label htmlFor="meme-punchline" className="block text-xs font-semibold text-purple-200 mb-1.5">
              2. Funny Punchline / Conclusion
            </label>
            <textarea
              id="meme-punchline"
              value={punchline}
              onChange={(e) => {
                setPunchline(e.target.value);
                setError(null);
              }}
              placeholder='e.g., Babu: Form fill-up nohoi direct treat-ot dekha hobo! 😂'
              maxLength={300}
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400/60 text-xs sm:text-sm focus:border-yellow-400 focus:outline-none transition resize-none"
            />
            <span className="text-[10px] text-purple-400 block text-right">{punchline.length}/300</span>
          </div>

          {/* Live Preview Card */}
          {(setup.trim() || punchline.trim()) && (
            <div className="p-3.5 rounded-2xl bg-[#110521] border border-yellow-400/30 text-xs">
              <div className="flex items-center gap-1.5 text-yellow-300 font-bold mb-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview (How other users see it):</span>
              </div>
              <p className="text-purple-200 italic mb-1">“{setup || 'Setup text...'}”</p>
              <p className="text-yellow-300 font-semibold">👉 “{punchline || 'Punchline text...'}”</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs sm:text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-meme-btn"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-black font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Meme 🚀'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
