import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { InfoModals, ModalType } from './components/InfoModals';
import { ComedyResult } from './components/ComedyResult';
import { SchemeCategory } from './types/comedy';
import { MessageSquare, Laugh, Sparkles } from 'lucide-react';

import { PublicAdda } from './components/PublicAdda';
import { AdminDashboard } from './components/AdminDashboard';
import { ShareAppModal } from './components/ShareAppModal';
import { InstallAndroidModal } from './components/InstallAndroidModal';
import { CommunityMemesFeed } from './components/CommunityMemesFeed';
import { SubmitMemeModal } from './components/SubmitMemeModal';
import { NicknameModal } from './components/NicknameModal';
import { getSavedNickname, saveUserNickname } from './services/commentService';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSubmitMemeOpen, setIsSubmitMemeOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [nickname, setNickname] = useState<string>(getSavedNickname());
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 4000);
  };

  // Capture Android PWA install prompt
  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (category: SchemeCategory) => {
    setSelectedCategory(category);
    // Smooth scroll down to comedy result
    setTimeout(() => {
      const el = document.getElementById('comedy-result-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0d0417] text-slate-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* Top Navigation */}
      <Header
        onNavClick={handleNavClick}
        onOpenRules={() => setActiveModal('rules')}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with interactive choice cards */}
        <Hero
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onScrollToAdda={() => handleNavClick('public-adda')}
          onOpenShare={() => setIsShareModalOpen(true)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        {/* Comedy Result Area */}
        {selectedCategory ? (
          <ComedyResult
            category={selectedCategory}
            onResetCategory={() => setSelectedCategory(null)}
            onScrollToAdda={() => handleNavClick('public-adda')}
          />
        ) : (
          <div className="text-center py-6 text-purple-400/70 text-xs px-4">
            👆 Choose either <span className="text-pink-400 font-bold">Moina Asoni</span> or <span className="text-cyan-400 font-bold">Babu Asoni</span> above to reveal today’s comedy reaction!
          </div>
        )}

        {/* Community User-Submitted Memes Feed */}
        <CommunityMemesFeed
          onOpenSubmitModal={() => setIsSubmitMemeOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
        />

        {/* Golaghat Public Adda Comments Feed */}
        <PublicAdda />
      </main>

      {/* Footer with Unofficial Disclaimer & Rules */}
      <Footer
        onOpenRules={() => setActiveModal('rules')}
        onOpenPrivacy={() => setActiveModal('privacy')}
        onOpenContact={() => setActiveModal('contact')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />

      {/* Global Toast */}
      {globalToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{globalToast}</span>
        </div>
      )}

      {/* Modal Dialogs */}
      <InfoModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* Admin Moderation Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Social Media Sharing Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Install on Android PWA Modal */}
      <InstallAndroidModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Submit Meme Modal */}
      <SubmitMemeModal
        isOpen={isSubmitMemeOpen}
        onClose={() => setIsSubmitMemeOpen(false)}
        nickname={nickname}
        onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
        onSuccess={() => showToast('Meme published! Other users can now see and share it! 🚀')}
      />

      {/* Nickname Modal */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        initialNickname={nickname}
        onClose={() => setIsNicknameModalOpen(false)}
        onSave={async (newNick) => {
          const profile = await saveUserNickname(newNick);
          setNickname(profile.nickname);
          showToast(`Nickname set to @${profile.nickname}! 🎉`);
        }}
      />
    </div>
  );
}
