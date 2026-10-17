import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  const shareMessage = `😂 Golaghat Adda! Pala ne Asoni? Moina & Babu comedy jokes aru Golaghat public adda-t message kora! 🍗🛍️\n\n${appUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = appUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Golaghat Adda 😂',
          text: 'Assamese comedy jokes & Golaghat Public Adda!',
          url: appUrl,
        });
        onClose();
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
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
        aria-labelledby="share-modal-title"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-600/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/50 transition cursor-pointer"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-400 p-[2px] shadow-lg shrink-0">
            <div className="w-full h-full bg-[#1c0828] rounded-[14px] flex items-center justify-center text-2xl">
              🚀
            </div>
          </div>
          <div>
            <h3 id="share-modal-title" className="text-xl font-bungee text-white">
              Share Golaghat Adda
            </h3>
            <p className="text-xs text-purple-300">Invite friends to join the comedy and chat!</p>
          </div>
        </div>

        {/* Copy Link Field */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-purple-200 mb-2">
            Website Link
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3.5 bg-purple-950/70 border border-purple-700/60 rounded-2xl">
            <span className="text-xs text-purple-200 truncate font-mono flex-1">
              {appUrl}
            </span>
            <button
              onClick={handleCopyLink}
              data-testid="copy-link-btn"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 shadow-md ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-black active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Tap Social Sharing Options */}
        <div className="space-y-2.5 mb-5">
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Quick Share to Friends
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              data-testid="share-whatsapp-btn"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.128-.535-1.748-.727-2.885-2.5-2.973-2.617-.088-.116-.708-.941-.708-1.796 0-.855.449-1.277.61-1.45.162-.173.353-.217.471-.217.118 0 .236.001.338.006.109.005.255-.041.397.302.146.353.499 1.218.543 1.306.044.088.073.191.015.308-.059.117-.088.191-.176.294-.088.103-.185.23-.264.309-.088.088-.18.183-.077.36.103.177.458.756.984 1.225.679.605 1.25.793 1.427.881.177.088.279.073.383-.044.103-.117.442-.515.559-.691.118-.176.236-.147.397-.088.162.059 1.03.486 1.206.574.177.088.294.132.338.206.045.074.045.426-.099.831z"/>
              </svg>
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              data-testid="share-facebook-btn"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-[#1877F2] font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Device System Share */}
          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 text-xs font-semibold transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>More Share Options...</span>
            </button>
          )}
        </div>

        <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-900/40 text-[11px] text-purple-300/80 leading-relaxed">
          ✨ <strong>100% Free Golaghat Comedy:</strong> Spread the laughs with your friends, college groups, and hostel buddies!
        </div>
      </div>
    </div>
  );
};
