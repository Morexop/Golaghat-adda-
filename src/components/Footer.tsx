import React from 'react';
import { ShieldCheck, Heart, AlertTriangle, FileText, Info, HelpCircle } from 'lucide-react';

interface FooterProps {
  onOpenRules: () => void;
  onOpenPrivacy: () => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  onOpenShare?: () => void;
  onOpenInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRules,
  onOpenPrivacy,
  onOpenContact,
  onOpenAdmin,
  onOpenShare,
  onOpenInstall,
}) => {
  return (
    <footer className="mt-20 border-t border-purple-900/50 bg-[#0a0312] text-purple-300 text-xs sm:text-sm">
      {/* Top Banner Disclaimer */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-yellow-200/90 leading-relaxed">
            <strong className="text-yellow-400 uppercase font-semibold">Unofficial Entertainment Notice:</strong> “Golaghat Adda” is an independent Assamese comedy and student community platform for Golaghat, Assam. It is <strong>NOT affiliated with any government department, bank, or official welfare scheme</strong>. It does not check eligibility, verify bank payments, or claim government benefits.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Laughing Emoji">😂</span>
              <span className="font-bungee text-lg text-white">GOLAGHAT ADDA</span>
            </div>
            <p className="text-purple-300/80 text-xs sm:text-sm leading-relaxed max-w-md">
              Golaghat’s unofficial comedy portal celebrating everyday Assamese banter, youth humour, and student life. Pure fun, zero tension!
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-400 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Golaghat Public Adda Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-yellow-400 transition">
                  🏠 Home (Top)
                </a>
              </li>
              <li>
                <a href="#comedy-section" className="hover:text-pink-400 transition">
                  🎭 Comedy Generator
                </a>
              </li>
              <li>
                <a href="#community-memes" className="hover:text-yellow-400 transition">
                  🌟 User Meme Feed
                </a>
              </li>
              <li>
                <a href="#public-adda" className="hover:text-cyan-400 transition">
                  💬 Golaghat Public Adda
                </a>
              </li>
              {onOpenShare && (
                <li>
                  <button onClick={onOpenShare} className="hover:text-yellow-400 transition text-left cursor-pointer font-bold text-yellow-300">
                    🚀 Share Website Link (WhatsApp/FB)
                  </button>
                </li>
              )}
              {onOpenInstall && (
                <li>
                  <button onClick={onOpenInstall} className="hover:text-emerald-400 transition text-left cursor-pointer font-bold text-emerald-300">
                    📱 Install Android App (PWA)
                  </button>
                </li>
              )}
              <li>
                <button onClick={onOpenContact} className="hover:text-yellow-400 transition text-left cursor-pointer">
                  ✉️ Report an Issue / Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider">Community & Safety</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenRules}
                  className="flex items-center gap-1.5 hover:text-yellow-300 transition text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Community Rules</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="flex items-center gap-1.5 hover:text-cyan-300 transition text-left cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Privacy Notice</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="flex items-center gap-1.5 hover:text-pink-300 transition text-left cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
                  <span>Moderation Appeal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 hover:text-yellow-400 transition text-left cursor-pointer text-purple-400/80"
                >
                  <span className="w-3.5 h-3.5 text-xs flex items-center justify-center">🛡️</span>
                  <span>Moderator Console</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-400">
          <p>© {new Date().getFullYear()} Golaghat Adda · Created for Golaghat, Assam with pure humour.</p>
          <div className="flex items-center gap-1 text-purple-300">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>for Assamese students &amp; meme lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
