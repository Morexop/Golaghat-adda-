import React, { useState } from 'react';
import { Menu, X, Sparkles, MessageSquare, Info, Laugh, ShieldAlert, Share2, Smartphone } from 'lucide-react';

interface HeaderProps {
  onNavClick: (sectionId: string) => void;
  onOpenRules: () => void;
  onOpenShare?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick, onOpenRules, onOpenShare, onOpenInstall }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    onNavClick(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0d0417]/90 border-b border-purple-900/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Golaghat Tagline */}
          <div 
            onClick={() => handleLinkClick('hero')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLinkClick('hero')}
            aria-label="Asoni Palu Ne Home"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-yellow-400 p-[2px] transition-transform duration-200 group-hover:scale-105 shadow-md">
              <div className="w-full h-full bg-[#120522] rounded-[14px] flex items-center justify-center">
                <span className="text-xl" role="img" aria-label="Laughing Emoji">😂</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bungee text-lg sm:text-xl tracking-wide bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                  GOLAGHAT ADDA
                </span>
                <span className="text-xs bg-purple-900/60 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/30 font-semibold hidden xs:inline-block">
                  😂 100% Fun
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 line-clamp-1">
                Pale treat, napale meme! 🍗 Assamese Comedy
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleLinkClick('hero')}
              className="px-3.5 py-2 text-sm font-medium text-purple-200 hover:text-yellow-300 hover:bg-purple-900/30 rounded-xl transition"
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick('comedy-section')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 hover:text-pink-400 hover:bg-purple-900/30 rounded-xl transition cursor-pointer"
            >
              <Laugh className="w-3.5 h-3.5 text-pink-400" />
              Comedy
            </button>
            <button
              onClick={() => handleLinkClick('community-memes')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 hover:text-yellow-400 hover:bg-purple-900/30 rounded-xl transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              User Memes
            </button>
            <button
              onClick={() => handleLinkClick('public-adda')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 hover:text-cyan-400 hover:bg-purple-900/30 rounded-xl transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Public Adda
            </button>
            <button
              onClick={onOpenRules}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 hover:text-yellow-300 hover:bg-purple-900/30 rounded-xl transition cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-yellow-400" />
              Rules
            </button>

            {/* Share Website Link Button */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                data-testid="header-share-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/40 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>Share Link</span>
              </button>
            )}

            {/* Android App Button */}
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                data-testid="header-install-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android App</span>
              </button>
            )}
          </nav>

          {/* Mobile Actions: Share, Install, Menu Button */}
          <div className="md:hidden flex items-center gap-1.5">
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="p-2 rounded-xl bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 hover:text-white"
                title="Share Website Link"
                aria-label="Share Website Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:text-white"
                title="Install Android App"
                aria-label="Install Android App"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-200 hover:text-yellow-300 focus:outline-none"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#130624] border-b border-purple-800/60 px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-purple-300 mb-3 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <span>Independent entertainment project. Not affiliated with any official scheme or government office.</span>
          </div>

          {onOpenShare && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenShare();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/30 transition text-left"
            >
              <Share2 className="w-4 h-4 text-yellow-400" />
              <span>Share Link (WhatsApp / Facebook)</span>
            </button>
          )}

          {onOpenInstall && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstall();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 transition text-left"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Install Android App (PWA)</span>
            </button>
          )}
          <button
            onClick={() => handleLinkClick('hero')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-900/40 hover:text-yellow-300 transition"
          >
            🏠 Home
          </button>
          <button
            onClick={() => handleLinkClick('comedy-section')}
            className="w-full flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-900/40 hover:text-pink-400 transition"
          >
            <Laugh className="w-4 h-4 text-pink-400" />
            🎭 Comedy Generator
          </button>
          <button
            onClick={() => handleLinkClick('community-memes')}
            className="w-full flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-900/40 hover:text-yellow-400 transition"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            🌟 User Meme Feed
          </button>
          <button
            onClick={() => handleLinkClick('public-adda')}
            className="w-full flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-900/40 hover:text-cyan-400 transition"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            💬 Golaghat Public Adda
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRules();
            }}
            className="w-full flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-900/40 hover:text-yellow-300 transition"
          >
            <Info className="w-4 h-4 text-yellow-400" />
            📜 About & Community Rules
          </button>
        </div>
      )}
    </header>
  );
};
