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

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
    </div>
  );
}
