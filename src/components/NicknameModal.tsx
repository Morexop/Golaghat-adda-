import React, { useState, useEffect } from 'react';
import { X, User, Check, AlertCircle } from 'lucide-react';
import { validateNickname } from '../lib/validation';

interface NicknameModalProps {
  isOpen: boolean;
  initialNickname: string;
  onClose: () => void;
  onSave: (nickname: string) => Promise<void>;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({
  isOpen,
  initialNickname,
  onClose,
  onSave,
}) => {
  const [nickname, setNickname] = useState(initialNickname || '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid nickname.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(nickname);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save nickname. Please try again.');
    } finally {
      setSaving(false);
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
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bungee text-white">Choose Nickname</h3>
            <p className="text-xs text-purple-300">Public Adda display name</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname-input" className="block text-xs font-semibold text-purple-200 mb-1.5">
              Your Fun Public Nickname
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Golaghat_Meme_King or Babu_Fan"
              maxLength={24}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400 text-sm focus:border-yellow-400 focus:outline-none transition"
            />
            <div className="flex justify-between items-center text-[11px] text-purple-400 mt-1">
              <span>2–24 characters (Letters, numbers, hyphens)</span>
              <span>{nickname.length}/24</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-[11px] text-purple-300/80 bg-purple-950/40 border border-purple-900/40 p-3 rounded-xl leading-relaxed">
            🔒 <strong>Anonymous &amp; Private:</strong> No real name, phone, or email needed. This nickname identifies your posts in Golaghat Public Adda.
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
              data-testid="submit-nickname-btn"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {saving ? <span>Saving...</span> : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Set Nickname</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
