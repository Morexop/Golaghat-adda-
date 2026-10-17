import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle2, ArrowRight, ShieldCheck, WifiOff, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstalled?: () => void;
}

export const InstallAndroidModal: React.FC<InstallAndroidModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        setInstalling(true);
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          onInstalled?.();
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setInstalling(false);
      }
    } else {
      // If prompt is not available, user can install via browser menu
      // Or in development environment
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#160829] border border-purple-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left cursor-default overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/50 transition cursor-pointer"
          aria-label="Close install dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-lg shrink-0">
            <div className="w-full h-full bg-[#0a1e1b] rounded-[14px] flex items-center justify-center text-3xl">
              📱
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="install-modal-title" className="text-xl font-bungee text-white">
                Golaghat Adda App
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Android PWA
              </span>
            </div>
            <p className="text-xs text-purple-300">Install on your phone like a native app</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
            <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Instant</span>
            <span className="text-[9px] text-purple-300 block">No Play Store lag</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
            <WifiOff className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Offline</span>
            <span className="text-[9px] text-purple-300 block">Jokes work offline</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">0 Storage</span>
            <span className="text-[9px] text-purple-300 block">&lt; 1 MB lightweight</span>
          </div>
        </div>

        {/* Action Button */}
        {isStandalone ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-200">Golaghat Adda is already installed!</p>
            <p className="text-xs text-emerald-300/80 mt-1">Enjoy running it directly from your Android app drawer.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-5">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                disabled={installing}
                data-testid="native-install-btn"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{installing ? 'Installing...' : 'Tap to Install on Android 🚀'}</span>
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Install Android App 📱</span>
              </button>
            )}

            {installSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 text-center flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Follow the prompt on your screen to complete install!</span>
              </div>
            )}
          </div>
        )}

        {/* Step by step Android Chrome instructions */}
        <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 text-xs text-purple-200/90 space-y-2">
          <p className="font-bold text-white uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to install in Chrome for Android:</span>
          </p>
          <div className="space-y-1.5 text-[11px] pl-1">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              <span>Open this site in <strong>Google Chrome</strong> on your Android phone.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              <span>Tap the <strong>three dots (⋮)</strong> menu at the top-right corner.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
              <span>Tap <strong>“Install app”</strong> or <strong>“Add to Home screen”</strong>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
