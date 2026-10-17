import React, { useState, useEffect } from 'react';
import { JokeItem, SchemeCategory } from '../types/comedy';
import { getRandomJoke, formatJokeForSharing } from '../lib/comedyEngine';
import { RefreshCw, Share2, Check, ArrowLeft, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';

interface ComedyResultProps {
  category: SchemeCategory;
  onResetCategory: () => void;
  onScrollToAdda: () => void;
}

export const ComedyResult: React.FC<ComedyResultProps> = ({
  category,
  onResetCategory,
  onScrollToAdda,
}) => {
  const [currentJoke, setCurrentJoke] = useState<JokeItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Load an initial joke when category changes
  useEffect(() => {
    loadNewJoke();
  }, [category]);

  const loadNewJoke = () => {
    setIsAnimating(true);
    setCopied(false);
    setShareFeedback(null);

    // Short timeout for lightweight animation
    setTimeout(() => {
      const nextJoke = getRandomJoke(category, currentJoke?.id);
      setCurrentJoke(nextJoke);
      setIsAnimating(false);
    }, 150);
  };

  const handleShare = async () => {
    if (!currentJoke) return;
    const shareText = formatJokeForSharing(currentJoke);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Asoni Palu Ne? 😂 | Golaghat Comedy',
          text: shareText,
          url: window.location.href,
        });
        setShareFeedback('Shared successfully! 🎉');
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setShareFeedback('Joke copied to clipboard! Share with friends 📋');
        setTimeout(() => {
          setCopied(false);
          setShareFeedback(null);
        }, 3500);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setShareFeedback('Joke copied to clipboard! Share with friends 📋');
        setTimeout(() => {
          setCopied(false);
          setShareFeedback(null);
        }, 3500);
      } else {
        setShareFeedback('Please copy the text manually from the card.');
      }
    } catch {
      setShareFeedback('Please copy the text manually from the card.');
    }
  };

  if (!currentJoke) return null;

  const isMoina = category === 'moina';
  const themeBorder = isMoina ? 'border-pink-500/50' : 'border-cyan-400/50';
  const themeBg = isMoina
    ? 'bg-gradient-to-b from-[#240c31] to-[#140621]'
    : 'bg-gradient-to-b from-[#092237] to-[#0c1126]';
  const themeBadge = isMoina ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  const themeAccent = isMoina ? 'text-pink-400' : 'text-cyan-400';

  return (
    <div
      id="comedy-result-card"
      className="max-w-3xl mx-auto px-4 sm:px-6 my-10 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Result Card */}
      <div className={`relative rounded-3xl p-6 sm:p-9 border-2 ${themeBorder} ${themeBg} shadow-2xl text-left overflow-hidden transition-all`}>
        {/* Glow ambient spot */}
        <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isMoina ? 'bg-pink-600/20' : 'bg-cyan-600/20'}`} />

        {/* Top bar with back button & category tag */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={onResetCategory}
            className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 px-3 py-1.5 rounded-xl transition cursor-pointer"
            aria-label="Back to both scheme options"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Choice</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${themeBadge}`}>
              {isMoina ? 'Moina Asoni (Female 👧)' : 'Babu Asoni (Male 👦)'}
            </span>
          </div>
        </div>

        {/* Entertainment disclaimer badge */}
        <div className="flex items-center gap-2 mb-4 text-[11px] text-yellow-300/90 bg-yellow-950/40 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Random Assamese Comedy Simulation · Strictly for fun and laughs!</span>
        </div>

        {/* Joke Content Container with transition */}
        <div className={`space-y-4 py-2 transition-opacity duration-150 ${isAnimating ? 'opacity-30 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          {/* Reaction Emoji & Tag */}
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label="Reaction Emoji">
              {currentJoke.reactionEmoji}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-700/40">
              #{currentJoke.tag}
            </span>
          </div>

          {/* Main Joke Statement */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/5">
            <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
              “{currentJoke.textAssamese}”
            </p>
          </div>

          {/* Punchline */}
          <div className={`p-4 rounded-2xl border ${isMoina ? 'bg-pink-950/30 border-pink-500/30' : 'bg-cyan-950/30 border-cyan-500/30'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${themeAccent}`}>
              ⚡ Punchline / Reaction:
            </span>
            <p className="text-sm sm:text-base text-purple-100 font-medium">
              {currentJoke.punchline}
            </p>
          </div>
        </div>

        {/* Share feedback toast notification */}
        {shareFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-7 pt-5 border-t border-purple-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            {/* Try Another Button */}
            <button
              onClick={loadNewJoke}
              disabled={isAnimating}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-black transition-all cursor-pointer shadow-lg ${
                isMoina
                  ? 'bg-pink-400 hover:bg-pink-300 active:scale-95'
                  : 'bg-cyan-400 hover:bg-cyan-300 active:scale-95'
              }`}
              aria-label="Generate another joke"
            >
              <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
              <span>Try Another 😂</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-700/60 font-medium text-sm transition cursor-pointer"
              aria-label="Share this joke"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-yellow-400" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Join Public Adda Button */}
          <button
            onClick={onScrollToAdda}
            className="flex items-center gap-1.5 text-xs text-yellow-300 hover:text-yellow-200 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 px-3.5 py-3 rounded-2xl transition cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-yellow-400" />
            <span>Post in Golaghat Adda 💬</span>
          </button>
        </div>
      </div>
    </div>
  );
};
