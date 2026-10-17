import React from 'react';
import { SchemeCategory } from '../types/comedy';
import { Sparkles, ArrowDownCircle, Share2, Smartphone } from 'lucide-react';

interface HeroProps {
  selectedCategory: SchemeCategory | null;
  onSelectCategory: (category: SchemeCategory) => void;
  onScrollToAdda: () => void;
  onOpenShare?: () => void;
  onOpenInstall?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  selectedCategory,
  onSelectCategory,
  onScrollToAdda,
  onOpenShare,
  onOpenInstall,
}) => {
  return (
    <section id="hero" className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Golaghat badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-yellow-400/40 text-yellow-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        <span>Golaghat Special Assamese Meme Edition</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bungee tracking-wide text-white drop-shadow-md mb-3 leading-tight">
        GOLAGHAT ADDA <span className="text-yellow-400">😂</span>
      </h1>

      {/* Supporting Text */}
      <p className="text-base sm:text-xl text-purple-200/90 max-w-xl mx-auto font-medium mb-8">
        “Aji tumar reaction ki? Pale treat, napale meme!”
      </p>

      {/* Two Interactive Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto text-left" id="comedy-section">
        {/* Choice 1: Female / Moina Asoni */}
        <button
          onClick={() => onSelectCategory('moina')}
          aria-label="Select Moina Asoni Category"
          className={`relative group rounded-3xl p-5 sm:p-7 border-2 transition-all duration-300 text-left cursor-pointer overflow-hidden ${
            selectedCategory === 'moina'
              ? 'bg-gradient-to-br from-pink-950/80 via-[#270e34] to-[#120522] border-pink-500 shadow-[0_0_30px_rgba(255,51,133,0.35)] scale-[1.02]'
              : 'bg-[#1b0a2c]/80 hover:bg-[#250d3d] border-pink-500/30 hover:border-pink-400/70 hover:shadow-[0_0_20px_rgba(255,51,133,0.2)]'
          }`}
          aria-pressed={selectedCategory === 'moina'}
        >
          {/* Top category label & badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-pink-400 tracking-wider uppercase">
              Category 1
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300 bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 rounded-full">
              Female 👧
            </span>
          </div>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 p-[2px] shadow-lg shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#1c0828] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                🌸
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bungee text-pink-300 group-hover:text-pink-200 transition-colors leading-tight">
                MOINA ASONI
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-purple-200/80 mb-5 leading-relaxed">
            “Notification sound full volume, pale selfie aru Golaghat market-ot treat! 🛍️”
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-pink-500/20 text-xs font-semibold text-pink-300">
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              ✨ 21 Assamese Jokes
            </span>
            <span className="bg-pink-500 text-white px-3 py-1.5 rounded-xl font-bold group-hover:bg-pink-400 transition text-xs">
              {selectedCategory === 'moina' ? 'Selected ✓' : 'Tap to React 🚀'}
            </span>
          </div>
        </button>

        {/* Choice 2: Male / Babu Asoni */}
        <button
          onClick={() => onSelectCategory('babu')}
          aria-label="Select Babu Asoni Category"
          className={`relative group rounded-3xl p-5 sm:p-7 border-2 transition-all duration-300 text-left cursor-pointer overflow-hidden ${
            selectedCategory === 'babu'
              ? 'bg-gradient-to-br from-cyan-950/80 via-[#0e2439] to-[#0c1328] border-cyan-400 shadow-[0_0_30px_rgba(0,210,255,0.35)] scale-[1.02]'
              : 'bg-[#1b0a2c]/80 hover:bg-[#12233c] border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-[0_0_20px_rgba(0,210,255,0.2)]'
          }`}
          aria-pressed={selectedCategory === 'babu'}
        >
          {/* Top category label & badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              Category 2
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
              Male 👦
            </span>
          </div>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-[2px] shadow-lg shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#081a2d] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                🍗
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bungee text-cyan-300 group-hover:text-cyan-200 transition-colors leading-tight">
                BABU ASONI
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-purple-200/80 mb-5 leading-relaxed">
            “Account check kori kori battery 2%! Dost-e ketiya Chicken party khujibo? 😂”
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              ✨ 21 Assamese Jokes
            </span>
            <span className="bg-cyan-500 text-black font-bold px-3 py-1.5 rounded-xl group-hover:bg-cyan-400 transition text-xs">
              {selectedCategory === 'babu' ? 'Selected ✓' : 'Tap to React 🚀'}
            </span>
          </div>
        </button>
      </div>

      {/* Action buttons: Share Link & Install Android App */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            data-testid="hero-share-link-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/50 text-yellow-300 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-yellow-400" />
            <span>Share Website Link 🚀</span>
          </button>
        )}

        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            data-testid="hero-install-android-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Install Android App 📱</span>
          </button>
        )}

        <button
          onClick={onScrollToAdda}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-purple-300 hover:text-cyan-300 transition py-2 px-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 hover:border-cyan-400/40 cursor-pointer"
        >
          <ArrowDownCircle className="w-4 h-4 text-cyan-400" />
          <span>Golaghat Public Adda (Comments)</span>
        </button>
      </div>
    </section>
  );
};
