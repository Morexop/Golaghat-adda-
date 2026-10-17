export type SchemeCategory = 'moina' | 'babu';

export interface JokeItem {
  id: string;
  category: SchemeCategory;
  textAssamese: string;
  punchline: string;
  reactionEmoji: string;
  tag: string;
}

export interface SchemeInfo {
  id: SchemeCategory;
  name: string;
  subtitle: string;
  badge: string;
  color: string;
  accentClass: string;
  borderClass: string;
  bgGradient: string;
  emoji: string;
  description: string;
}
