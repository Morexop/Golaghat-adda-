import React from 'react';
import { Flame, TrendingUp, X, Sparkles, Hash } from 'lucide-react';
import { TrendingTopic } from '../lib/topicEngine';

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string | null) => void;
  totalCommentsCount: number;
  onInsertTag?: (tag: string) => void;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  totalCommentsCount,
  onInsertTag,
}) => {
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#18082e] via-[#140626] to-[#0d0417] border border-purple-800/60 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-purple-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-[1.5px] shadow-md shrink-0">
            <div className="w-full h-full bg-[#1b082c] rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bungee text-white tracking-wide">
                TRENDING TOPICS
              </h3>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                Live Frequency
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Most discussed subjects in Golaghat Adda based on comments
            </p>
          </div>
        </div>

        {selectedTopicId && (
          <button
            onClick={() => onSelectTopic(null)}
            className="self-start sm:self-auto text-xs text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear filter</span>
          </button>
        )}
      </div>

      {/* Topic Chips Carousel / Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-800">
        {/* All Topics Chip */}
        <button
          onClick={() => onSelectTopic(null)}
          data-testid="topic-all-btn"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
            selectedTopicId === null
              ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-yellow-300 shadow-md font-bold'
              : 'bg-purple-950/60 border-purple-800/60 text-purple-200 hover:border-yellow-400/50 hover:text-yellow-300'
          }`}
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>All Adda</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedTopicId === null ? 'bg-black/20 text-black font-mono' : 'bg-purple-900/80 text-purple-300 font-mono'
          }`}>
            {totalCommentsCount}
          </span>
        </button>

        {/* Dynamic Frequency Topics */}
        {topics.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(isSelected ? null : topic.id)}
              data-testid={`topic-chip-${topic.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] ring-1 ring-pink-400'
                  : topic.isHot
                  ? 'bg-purple-950/80 border-amber-500/40 text-amber-200 hover:border-amber-400 hover:bg-amber-950/30'
                  : 'bg-purple-950/50 border-purple-800/50 text-purple-200 hover:border-purple-600 hover:text-white'
              }`}
            >
              <span className="text-sm leading-none">{topic.emoji}</span>
              <span>{topic.tag}</span>

              {topic.isHot && (
                <span className="text-[10px]" title="Hot Discussion">
                  🔥
                </span>
              )}

              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-black/30 text-white'
                    : topic.isHot
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                    : 'bg-purple-900/60 text-purple-300'
                }`}
              >
                {topic.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Helper Banner */}
      {selectedTopic && (
        <div className="mt-3 pt-3 border-t border-purple-800/30 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-purple-200">
            <span className="text-base">{selectedTopic.emoji}</span>
            <span>
              Showing <strong>{selectedTopic.count}</strong> comment{selectedTopic.count !== 1 ? 's' : ''} discussing <strong>{selectedTopic.name}</strong> ({selectedTopic.percentage}% of chatter).
            </span>
          </div>

          {onInsertTag && (
            <button
              onClick={() => onInsertTag(selectedTopic.tag)}
              className="text-xs font-semibold text-yellow-300 hover:text-yellow-200 flex items-center gap-1 transition cursor-pointer"
            >
              <Hash className="w-3 h-3 text-yellow-400" />
              <span>Post with {selectedTopic.tag}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
