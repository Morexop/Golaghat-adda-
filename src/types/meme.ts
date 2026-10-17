export interface CommunityMeme {
  id: string;
  authorUid: string;
  nickname: string;
  setup: string;
  punchline: string;
  category: 'moina' | 'babu' | 'golaghat';
  status: 'published' | 'hidden' | 'flagged';
  sharesCount: number;
  laughCount: number;
  createdAt: number;
}
