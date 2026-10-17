import React, { useState, useEffect } from 'react';
import { CommunityMeme } from '../types/meme';
import {
  subscribeToCommunityMemes,
  incrementMemeLaugh,
  incrementMemeShare,
  deleteCommunityMeme,
  formatMemeForSharing,
  getLocalMemeLaughs,
} from '../services/memeService';
import { getCurrentUserUid } from '../lib/firebase';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  PlusCircle,
  Trash2,
  AlertCircle,
  Laugh,
  MessageCircle,
} from 'lucide-react';

interface CommunityMemesFeedProps {
  onOpenSubmitModal: () => void;
  onOpenShareModal?: () => void;
}

export const CommunityMemesFeed: React.FC<CommunityMemesFeedProps> = ({
  onOpenSubmitModal,
}) => {
  const [memes, setMemes] = useState<CommunityMeme[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'moina' | 'babu' | 'golaghat'>('all');
  const [userLaughs, setUserLaughs] = useState<Record<string, boolean>>(getLocalMemeLaughs());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const currentUid = getCurrentUserUid();

  useEffect(() => {
    const unsubscribe = subscribeToCommunityMemes((loaded) => {
      setMemes(loaded);
    });
    return () => unsubscribe();
  }, []);

  const handleLaugh = async (meme: CommunityMeme) => {
    if (userLaughs[meme.id]) return;
    setUserLaughs((prev) => ({ ...prev, [meme.id]: true }));
    setMemes((prev) =>
      prev.map((m) => (m.id === meme.id ? { ...m, laughCount: m.laughCount + 1 } : m))
    );
    await incrementMemeLaugh(meme.id);
  };

  const handleCopyMeme = async (meme: CommunityMeme) => {
    const text = formatMemeForSharing(meme);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(meme.id);
      setShareFeedback(`Copied @${meme.nickname}'s meme! Paste it on WhatsApp or Facebook! 🚀`);
      setTimeout(() => setCopiedId(null), 3000);
      setTimeout(() => setShareFeedback(null), 4500);
      await incrementMemeShare(meme.id);
    } catch {
      setCopiedId(meme.id);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const handleWhatsAppMeme = async (meme: CommunityMeme) => {
    const text = formatMemeForSharing(meme);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    await incrementMemeShare(meme.id);
  };

  const handleFacebookMeme = async (meme: CommunityMeme) => {
    const appUrl = window.location.origin;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    await incrementMemeShare(meme.id);
  };

  const handleDeleteMeme = async (meme: CommunityMeme) => {
    if (!window.confirm('Delete this meme permanently?')) return;
    setMemes((prev) => prev.filter((m) => m.id !== meme.id));
    await deleteCommunityMeme(meme.id);
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const filteredMemes = selectedCategory === 'all'
    ? memes
    : memes.filter((m) => m.category === selectedCategory);

  return (
    <section id="community-memes" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Toast Feedback */}
      {shareFeedback && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-400/40 text-pink-300 text-xs font-semibold mb-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Community Submissions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bungee text-white">
            USER MEME FEED <span className="text-yellow-400">🔥</span>
          </h2>
          <p className="text-purple-300/90 text-xs sm:text-sm">
            Memes submitted by Golaghat users — share the best ones with friends!
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          data-testid="post-meme-open-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm transition shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Post Your Meme ✍️</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
            selectedCategory === 'all'
              ? 'bg-purple-900 text-yellow-300 border-yellow-400/60 shadow'
              : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:border-purple-600'
          }`}
        >
          All Memes ({memes.length})
        </button>

        <button
          onClick={() => setSelectedCategory('babu')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1 ${
            selectedCategory === 'babu'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow'
              : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:border-cyan-500/50'
          }`}
        >
          <span>🍗 Babu Asoni</span>
          <span className="text-[10px] opacity-80">({memes.filter((m) => m.category === 'babu').length})</span>
        </button>

        <button
          onClick={() => setSelectedCategory('moina')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1 ${
            selectedCategory === 'moina'
              ? 'bg-pink-950 text-pink-300 border-pink-400 shadow'
              : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:border-pink-500/50'
          }`}
        >
          <span>🌸 Moina Asoni</span>
          <span className="text-[10px] opacity-80">({memes.filter((m) => m.category === 'moina').length})</span>
        </button>

        <button
          onClick={() => setSelectedCategory('golaghat')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-1 ${
            selectedCategory === 'golaghat'
              ? 'bg-yellow-950 text-yellow-300 border-yellow-400 shadow'
              : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:border-yellow-500/50'
          }`}
        >
          <span>📍 Golaghat</span>
          <span className="text-[10px] opacity-80">({memes.filter((m) => m.category === 'golaghat').length})</span>
        </button>
      </div>

      {/* Memes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemes.map((meme) => {
          const isAuthor = meme.authorUid && meme.authorUid === currentUid;
          const isLaughed = !!userLaughs[meme.id];
          const isCopied = copiedId === meme.id;

          return (
            <div
              key={meme.id}
              className="p-5 rounded-3xl bg-gradient-to-br from-[#1b0933] via-[#150729] to-[#0e041c] border border-purple-800/60 hover:border-purple-600/80 transition-all shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-200 font-bungee text-xs flex items-center justify-center border border-purple-700/50">
                      {meme.category === 'moina' ? '🌸' : meme.category === 'babu' ? '🍗' : '📍'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block leading-none">
                        @{meme.nickname}
                      </span>
                      <span className="text-[10px] text-purple-400 block mt-0.5">
                        {formatTime(meme.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-950/80 border border-purple-800/60 text-purple-300">
                      {meme.category === 'moina' ? 'Moina' : meme.category === 'babu' ? 'Babu' : 'Golaghat'}
                    </span>

                    {isAuthor && (
                      <button
                        onClick={() => handleDeleteMeme(meme)}
                        className="p-1 text-purple-400/60 hover:text-rose-400 transition cursor-pointer"
                        title="Delete your meme"
                        aria-label="Delete your meme"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meme Body */}
                <div className="p-3.5 rounded-2xl bg-[#110521]/70 border border-purple-900/40 mb-4 space-y-2 text-left">
                  <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-medium">
                    “{meme.setup}”
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-300 font-bold leading-relaxed pt-1.5 border-t border-purple-900/40 flex items-start gap-1.5">
                    <span className="text-pink-400 shrink-0">👉</span>
                    <span>“{meme.punchline}”</span>
                  </p>
                </div>
              </div>

              {/* Action Toolbar: Laugh & Multi-Channel Sharing */}
              <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between gap-2 text-xs">
                {/* Laugh button */}
                <button
                  onClick={() => handleLaugh(meme)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer select-none active:scale-95 ${
                    isLaughed
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold'
                      : 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:border-yellow-400/50 hover:text-yellow-300'
                  }`}
                  title="Laugh at this meme"
                >
                  <span className="text-sm">😂</span>
                  <span>{meme.laughCount}</span>
                </button>

                {/* Share Actions Group */}
                <div className="flex items-center gap-1.5">
                  {/* WhatsApp Direct Share */}
                  <button
                    onClick={() => handleWhatsAppMeme(meme)}
                    className="p-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition cursor-pointer active:scale-95"
                    title="Share to WhatsApp"
                    aria-label="Share meme to WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.128-.535-1.748-.727-2.885-2.5-2.973-2.617-.088-.116-.708-.941-.708-1.796 0-.855.449-1.277.61-1.45.162-.173.353-.217.471-.217.118 0 .236.001.338.006.109.005.255-.041.397.302.146.353.499 1.218.543 1.306.044.088.073.191.015.308-.059.117-.088.191-.176.294-.088.103-.185.23-.264.309-.088.088-.18.183-.077.36.103.177.458.756.984 1.225.679.605 1.25.793 1.427.881.177.088.279.073.383-.044.103-.117.442-.515.559-.691.118-.176.236-.147.397-.088.162.059 1.03.486 1.206.574.177.088.294.132.338.206.045.074.045.426-.099.831z"/>
                    </svg>
                  </button>

                  {/* Facebook Share */}
                  <button
                    onClick={() => handleFacebookMeme(meme)}
                    className="p-1.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-[#1877F2] transition cursor-pointer active:scale-95"
                    title="Share to Facebook"
                    aria-label="Share meme to Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  {/* Copy Link / Text button */}
                  <button
                    onClick={() => handleCopyMeme(meme)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-purple-900/50 hover:bg-purple-800/80 text-purple-200 border border-purple-700/50'
                    }`}
                    title="Copy Meme Text & Link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
