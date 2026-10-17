import React, { useState } from 'react';
import { X, Flag, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { submitReport } from '../services/commentService';

interface ReportModalProps {
  target: {
    id: string;
    type: 'comment' | 'reply';
    text: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_REASONS = [
  'Spam or repeated messages',
  'Abusive language or harassment',
  'Threats or hate speech',
  'Personal information (phone/address/bank)',
  'Impersonation',
  'Misleading claims presented as official information',
  'Other violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  target,
  onClose,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (target) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await submitReport(
        target.id,
        target.type,
        target.text,
        selectedReason,
        details
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#160829] border border-red-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-left cursor-default"
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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bungee text-white">Report Content</h3>
            <p className="text-xs text-purple-300">Help keep Golaghat Adda clean</p>
          </div>
        </div>

        {/* Target preview */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-800/40 mb-4 text-xs text-purple-200">
          <span className="text-[11px] uppercase tracking-wider text-purple-400 block mb-1">
            Reported {target.type}:
          </span>
          <p className="italic text-purple-100 line-clamp-2">“{target.text}”</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-2">
              Select Reason
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedReason === reason
                      ? 'bg-red-950/60 border-red-500/60 text-red-200 font-semibold'
                      : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:bg-purple-900/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="report-details" className="block text-xs font-semibold text-purple-200 mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Tell our moderators what went wrong..."
              maxLength={300}
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-white placeholder-purple-400 text-xs focus:border-red-400 focus:outline-none transition resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-950/50 border border-purple-900/40 text-[11px] text-purple-300">
            <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <span>Reports are confidential. The author will never see who reported them.</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {submitting ? <span>Sending...</span> : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
