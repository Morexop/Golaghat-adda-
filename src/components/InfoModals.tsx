import React from 'react';
import { X, ShieldCheck, FileText, Mail, CheckCircle2, AlertOctagon } from 'lucide-react';

export type ModalType = 'rules' | 'privacy' | 'contact' | null;

interface InfoModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ activeModal, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#160829] border border-purple-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left max-h-[90vh] overflow-y-auto cursor-default"
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

        {activeModal === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bungee text-white">Community Rules</h3>
                <p className="text-xs text-purple-300">Golaghat Public Adda Niyomawali</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-purple-200/90 leading-relaxed pt-2">
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">1. Respectful Banter Only</strong>
                  Friendly jokes and Assamese humor are welcome. Bullying, harassment, hate speech, or targeted attacks are strictly forbidden.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">2. Never Post Personal Data</strong>
                  Do not post phone numbers, bank accounts, UPI IDs, passwords, or home addresses.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">3. No Fake Official Announcements</strong>
                  Do not mislead people with fake payment receipts or claimed government notices. All content is for comedy.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-start gap-3">
                <AlertOctagon className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">4. Moderation & Reports</strong>
                  Any visitor can report inappropriate comments. Moderators will review and hide violating messages.
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition"
            >
              Bhal lagise, buji palu! 👍
            </button>
          </div>
        )}

        {activeModal === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bungee text-white">Privacy Notice</h3>
                <p className="text-xs text-purple-300">Your privacy is 100% protected</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-purple-200/90 leading-relaxed pt-2">
              <p>
                <strong>No Personal Registration:</strong> We use Firebase Anonymous Authentication. We never ask for your real name, email, phone number, or social media handles.
              </p>
              <p>
                <strong>What We Store:</strong> Only your chosen nickname (2–24 letters) and the comedy comments/replies/likes you publish in Golaghat Public Adda.
              </p>
              <p>
                <strong>No Location Tracking:</strong> We do not track your GPS location, contacts, or device files.
              </p>
              <p>
                <strong>Security:</strong> All comments pass through anti-spam checks and are stored securely in Cloud Firestore with role-based security rules.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition"
            >
              Got it, safe &amp; secure! 🔒
            </button>
          </div>
        )}

        {activeModal === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bungee text-white">Contact &amp; Appeal</h3>
                <p className="text-xs text-purple-300">Feedback or moderation questions</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-purple-200/90 leading-relaxed pt-2">
              <p>
                Need to report a bug, appeal a hidden comment, or suggest a new Assamese meme joke for Golaghat?
              </p>
              <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-800/50">
                <span className="text-xs text-purple-300 block mb-1">Community Team Email:</span>
                <span className="text-yellow-300 font-mono text-sm font-semibold selection:bg-yellow-400 selection:text-black">
                  contact@asonipalune.golaghat.local
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Our local moderation team checks reports daily. Keep Golaghat smiling! 😊
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm transition"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
