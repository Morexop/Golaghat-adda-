import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Pin,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { PinSuggestion, ReportItem, CommentItem } from '../types/community';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshFeed?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onRefreshFeed,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'reports' | 'pins' | 'announcement'>('reports');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pinSuggestions, setPinSuggestions] = useState<PinSuggestion[]>([]);
  const [pinnedText, setPinnedText] = useState('Moina aru Babu sokol! Welcome to Golaghat Public Adda. Pala ne Asoni? Respectful thakiba!');
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Auto-authenticate if user's verified email matches the admin owner
  useEffect(() => {
    if (auth.currentUser?.email === 'morexop18@gmail.com') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadData();
    }
  }, [isOpen, isAuthenticated, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'reports') {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);
        const list: ReportItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            targetId: data.targetId,
            targetType: data.targetType,
            targetText: data.targetText,
            reporterUid: data.reporterUid,
            reason: data.reason,
            details: data.details,
            createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : data.createdAt,
            status: data.status || 'pending',
          });
        });
        setReports(list);
      } else if (activeTab === 'pins') {
        const q = query(collection(db, 'pinSuggestions'), orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);
        const list: PinSuggestion[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            targetCommentId: data.targetCommentId,
            commentText: data.commentText,
            authorNickname: data.authorNickname,
            requesterUid: data.requesterUid,
            reason: data.reason,
            createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : data.createdAt,
            status: data.status || 'pending',
          });
        });
        setPinSuggestions(list);
      }
    } catch (err: any) {
      console.warn('Admin load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Authorized credentials check
    if (passkey === 'golaghat_mod_2026' || auth.currentUser?.email === 'morexop18@gmail.com') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid Moderator Access Key.');
    }
  };

  const handleApprovePin = async (suggestion: PinSuggestion) => {
    try {
      // 1. Update suggestion status
      await updateDoc(doc(db, 'pinSuggestions', suggestion.id), {
        status: 'approved',
      });
      // 2. Set comment isPinned: true
      await updateDoc(doc(db, 'comments', suggestion.targetCommentId), {
        isPinned: true,
        pinnedReason: suggestion.reason,
      });
      setActionNotice('Comment successfully pinned to top feed! 📌');
      loadData();
      if (onRefreshFeed) onRefreshFeed();
    } catch (err: any) {
      setActionNotice('Failed to pin comment.');
    }
  };

  const handleRejectPin = async (id: string) => {
    try {
      await updateDoc(doc(db, 'pinSuggestions', id), {
        status: 'rejected',
      });
      setActionNotice('Pin suggestion dismissed.');
      loadData();
    } catch {
      setActionNotice('Error updating suggestion.');
    }
  };

  const handleHideComment = async (commentId: string) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: 'hidden',
      });
      setActionNotice('Comment hidden from public view.');
      loadData();
      if (onRefreshFeed) onRefreshFeed();
    } catch {
      setActionNotice('Error hiding comment.');
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'dismissed',
      });
      setActionNotice('Report marked as dismissed.');
      loadData();
    } catch {
      setActionNotice('Error dismissing report.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#130722] border border-yellow-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left max-h-[90vh] flex flex-col cursor-default"
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bungee text-white">Golaghat Adda Moderation</h3>
            <p className="text-xs text-purple-300">Protected administrative console</p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Authentication Gate */
          <form onSubmit={handleAdminLogin} className="space-y-4 my-auto py-8 max-w-sm mx-auto w-full text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-yellow-400 mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-base">Authorized Access Only</h4>
            <p className="text-xs text-purple-300/80">
              Enter your moderator access key or sign in with admin Google account.
            </p>

            <div>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter Moderator Access Key"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400 text-sm focus:border-yellow-400 focus:outline-none transition text-center"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition cursor-pointer shadow-lg"
            >
              Verify &amp; Unlock Dashboard 🔓
            </button>
          </form>
        ) : (
          /* Unlocked Admin Panel */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-purple-900/60 pb-3 mb-4">
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-red-500 text-white'
                    : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60'
                }`}
              >
                Abuse Reports ({reports.filter((r) => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('pins')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'pins'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60'
                }`}
              >
                Pin Suggestions ({pinSuggestions.filter((p) => p.status === 'pending').length})
              </button>
              <button
                onClick={loadData}
                className="ml-auto p-2 rounded-xl bg-purple-950/60 text-purple-300 hover:text-white"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Notification Banner */}
            {actionNotice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between">
                <span>{actionNotice}</span>
                <button onClick={() => setActionNotice(null)} className="text-emerald-400 font-bold">×</button>
              </div>
            )}

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activeTab === 'reports' && (
                reports.length === 0 ? (
                  <div className="py-12 text-center text-purple-300 text-xs">
                    No reports submitted yet. Golaghat Public Adda is peaceful! 🕊️
                  </div>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400 uppercase tracking-wider text-[10px]">
                          Reason: {report.reason}
                        </span>
                        <span className="text-purple-400 text-[10px]">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="bg-black/40 p-2.5 rounded-xl text-purple-100 italic">
                        “{report.targetText}”
                      </p>
                      {report.details && (
                        <p className="text-purple-300 text-[11px]">
                          Details: {report.details}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleHideComment(report.targetId)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Content</span>
                        </button>
                        <button
                          onClick={() => handleDismissReport(report.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 cursor-pointer"
                        >
                          Dismiss Report
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'pins' && (
                pinSuggestions.length === 0 ? (
                  <div className="py-12 text-center text-purple-300 text-xs">
                    No community pin suggestions pending.
                  </div>
                ) : (
                  pinSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-yellow-300 text-xs">
                          @{suggestion.authorNickname}
                        </span>
                        <span className="text-purple-400 text-[10px]">
                          Status: {suggestion.status}
                        </span>
                      </div>
                      <p className="bg-black/40 p-2.5 rounded-xl text-purple-100 italic">
                        “{suggestion.commentText}”
                      </p>
                      <p className="text-purple-300 text-[11px]">
                        <strong>Reason:</strong> {suggestion.reason}
                      </p>
                      {suggestion.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleApprovePin(suggestion)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Pin className="w-3.5 h-3.5 fill-black" />
                            <span>Approve &amp; Pin to Top</span>
                          </button>
                          <button
                            onClick={() => handleRejectPin(suggestion.id)}
                            className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
