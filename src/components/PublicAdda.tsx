import React, { useState, useEffect, useMemo } from 'react';
import { CommentItem } from '../types/community';
import { CommentComposer } from './CommentComposer';
import { CommentCard } from './CommentCard';
import { NicknameModal } from './NicknameModal';
import { SuggestPinModal } from './SuggestPinModal';
import { ReportModal } from './ReportModal';
import { TrendingTopics } from './TrendingTopics';
import { calculateTrendingTopics, filterCommentsByTopic } from '../lib/topicEngine';
import {
  subscribeToComments,
  createComment,
  getSavedNickname,
  saveUserNickname,
  DEFAULT_STARTER_COMMENTS,
  getLocalSeedLikes,
} from '../services/commentService';
import { MessageSquare, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export const PublicAdda: React.FC = () => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [nickname, setNickname] = useState<string>(getSavedNickname());
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [suggestPinComment, setSuggestPinComment] = useState<CommentItem | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; type: 'comment' | 'reply'; text: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [composerPrefill, setComposerPrefill] = useState<string | undefined>(undefined);

  // Load and listen to Firestore comments
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToComments((firestoreComments) => {
      if (firestoreComments.length > 0) {
        setComments(firestoreComments);
      } else {
        // If Firestore has no documents yet, provide clean starter comments with real user likes
        const seedLikes = getLocalSeedLikes();
        const cleanStarters = DEFAULT_STARTER_COMMENTS.map((c) => ({
          ...c,
          likeCount: seedLikes[c.id] ? 1 : 0,
        }));
        setComments(cleanStarters);
      }
      setLoading(false);
    }, pageSize);

    return () => unsubscribe();
  }, [pageSize]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveNickname = async (newNick: string) => {
    const profile = await saveUserNickname(newNick);
    setNickname(profile.nickname);
    showToast(`Nickname updated to @${profile.nickname}! 🎉`);
  };

  const handlePostComment = async (text: string) => {
    await createComment(text, nickname);
    showToast('Your comment was posted to Golaghat Public Adda! 💬');
  };

  // Separate pinned comments and normal stream
  const pinnedComment = comments.find((c) => c.isPinned);
  const feedComments = comments.filter((c) => !c.isPinned);

  // Calculate trending topics based on comment frequency
  const trendingTopics = useMemo(() => calculateTrendingTopics(comments), [comments]);

  // Filter feed comments based on selected topic
  const filteredFeedComments = useMemo(
    () => filterCommentsByTopic(feedComments, selectedTopicId),
    [feedComments, selectedTopicId]
  );

  return (
    <section id="public-adda" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-semibold mb-3 shadow-inner">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Live Community Feed</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bungee text-white drop-shadow-md">
          GOLAGHAT PUBLIC ADDA <span className="text-yellow-400">💬</span>
        </h2>
        <p className="text-purple-300/90 text-sm sm:text-base mt-2 max-w-lg mx-auto font-medium">
          “Jokes, reactions aru friendly discussion. Respectful thakiba!”
        </p>
      </div>

      {/* Trending Topics Section */}
      <TrendingTopics
        topics={trendingTopics}
        selectedTopicId={selectedTopicId}
        onSelectTopic={(topicId) => setSelectedTopicId(topicId)}
        totalCommentsCount={comments.length}
        onInsertTag={(tag) => {
          setComposerPrefill(tag);
          const textarea = document.querySelector('textarea');
          textarea?.focus();
        }}
      />

      {/* Comment Composer */}
      <CommentComposer
        nickname={nickname}
        onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
        onSubmitComment={handlePostComment}
        prefilledText={composerPrefill}
      />

      {/* Pinned Announcement Message (if present and no topic filter or matches topic) */}
      {pinnedComment && (!selectedTopicId || filterCommentsByTopic([pinnedComment], selectedTopicId).length > 0) && (
        <div className="mb-6">
          <CommentCard
            comment={pinnedComment}
            currentNickname={nickname}
            onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
            onOpenSuggestPin={(c) => setSuggestPinComment(c)}
            onOpenReport={(t) => setReportTarget(t)}
            onCommentDeleted={(deletedId) => {
              setComments((prev) => prev.filter((c) => c.id !== deletedId));
              showToast('Comment deleted successfully! 🗑️');
            }}
          />
        </div>
      )}

      {/* Comment Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-purple-300 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />
            <span>Loading Golaghat Adda discussions...</span>
          </div>
        ) : filteredFeedComments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#160829] border border-purple-800/40 text-center">
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-bold text-base">
              {selectedTopicId ? 'No comments found for this topic' : 'Be the first to post!'}
            </h3>
            <p className="text-xs text-purple-300 mt-1 max-w-sm mx-auto">
              {selectedTopicId
                ? 'No one has discussed this topic yet. Be the first to start the banter above!'
                : 'No comments yet. Set a nickname above and share your Moina or Babu reaction!'}
            </p>
            {selectedTopicId && (
              <button
                onClick={() => setSelectedTopicId(null)}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-yellow-300 text-xs font-semibold transition"
              >
                Show All Discussions
              </button>
            )}
          </div>
        ) : (
          filteredFeedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentNickname={nickname}
              onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
              onOpenSuggestPin={(c) => setSuggestPinComment(c)}
              onOpenReport={(t) => setReportTarget(t)}
              onCommentDeleted={(deletedId) => {
                setComments((prev) => prev.filter((c) => c.id !== deletedId));
                showToast('Comment deleted successfully! 🗑️');
              }}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {feedComments.length >= pageSize && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPageSize((prev) => prev + 15)}
            className="px-6 py-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-md"
          >
            Load More Messages 📜
          </button>
        </div>
      )}

      {/* Modals */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        initialNickname={nickname}
        onClose={() => setIsNicknameModalOpen(false)}
        onSave={handleSaveNickname}
      />

      <SuggestPinModal
        comment={suggestPinComment}
        onClose={() => setSuggestPinComment(null)}
        onSuccess={() => showToast('Pin suggestion sent to moderation team! 📌')}
      />

      <ReportModal
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onSuccess={() => showToast('Thank you. Content flagged for moderator review. 🛡️')}
      />
    </section>
  );
};
