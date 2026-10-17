import { CommentItem } from '../types/community';

export interface TrendingTopic {
  id: string;
  tag: string;
  name: string;
  emoji: string;
  count: number;
  percentage: number;
  isHot: boolean;
  keywords: string[];
}

export const TOPIC_DEFINITIONS = [
  {
    id: 'moina-asoni',
    tag: '#MoinaAsoni',
    name: 'Moina Asoni',
    emoji: '🌸',
    keywords: ['moina', 'earring', 'shopping', 'makeup', 'parlour', 'jhumka', 'selfie'],
  },
  {
    id: 'babu-asoni',
    tag: '#BabuAsoni',
    name: 'Babu Asoni',
    emoji: '🍗',
    keywords: ['babu', 'dost', 'bandhu', 'brother', 'boys', 'bike', 'petrol'],
  },
  {
    id: 'chicken-party',
    tag: '#ChickenParty',
    name: 'Party & Treat',
    emoji: '🔥',
    keywords: ['party', 'chicken', 'treat', 'momo', 'cha', 'roast', 'khana'],
  },
  {
    id: 'golaghat-vibes',
    tag: '#GolaghatTown',
    name: 'Golaghat Town',
    emoji: '📍',
    keywords: ['golaghat', 'market', 'dergaon', 'arengapara', 'town', 'station'],
  },
  {
    id: 'college-hostel',
    tag: '#HostelLife',
    name: 'Student & Hostel',
    emoji: '🎒',
    keywords: ['college', 'hostel', 'exam', 'class', 'dkd', 'senior', 'roommate', 'mess'],
  },
  {
    id: 'meme-adda',
    tag: '#MemeAdda',
    name: 'Meme & Comedy',
    emoji: '😂',
    keywords: ['meme', 'hahi', 'comedy', 'joke', 'funny', 'hahah', '😂'],
  },
];

/**
 * Checks whether a comment matches a specific topic
 */
export function doesCommentMatchTopic(comment: CommentItem, topicId: string): boolean {
  if (!comment || !comment.text) return false;
  const def = TOPIC_DEFINITIONS.find((t) => t.id === topicId);
  if (!def) return false;

  const lowerText = comment.text.toLowerCase();

  // Match hashtag explicitly
  if (lowerText.includes(def.tag.toLowerCase())) {
    return true;
  }

  // Match keywords
  return def.keywords.some((kw) => {
    // Emojis match directly, words match with word boundaries or substring
    if (kw === '😂') return lowerText.includes('😂');
    return lowerText.includes(kw.toLowerCase());
  });
}

/**
 * Calculates trending topics ranked by frequency in the provided comments list
 */
export function calculateTrendingTopics(comments: CommentItem[]): TrendingTopic[] {
  if (!comments || comments.length === 0) {
    return TOPIC_DEFINITIONS.map((def) => ({
      ...def,
      count: 0,
      percentage: 0,
      isHot: false,
    }));
  }

  const totalComments = comments.length;

  const counted = TOPIC_DEFINITIONS.map((def) => {
    let count = 0;
    for (const comment of comments) {
      if (doesCommentMatchTopic(comment, def.id)) {
        count += 1;
      }
    }

    const percentage = totalComments > 0 ? Math.round((count / totalComments) * 100) : 0;

    return {
      id: def.id,
      tag: def.tag,
      name: def.name,
      emoji: def.emoji,
      keywords: def.keywords,
      count,
      percentage,
      isHot: count >= 2,
    };
  });

  // Sort descending by comment frequency count
  return counted.sort((a, b) => b.count - a.count);
}

/**
 * Filters comments by selected topic ID
 */
export function filterCommentsByTopic(
  comments: CommentItem[],
  selectedTopicId: string | null
): CommentItem[] {
  if (!selectedTopicId) return comments;
  return comments.filter((c) => doesCommentMatchTopic(c, selectedTopicId));
}
