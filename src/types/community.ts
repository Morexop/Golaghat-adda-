export interface PublicProfile {
  uid: string;
  nickname: string;
  createdAt: number;
}

export interface CommentReply {
  id: string;
  commentId: string;
  parentId?: string; // either commentId or another replyId (max 2 levels)
  authorUid: string;
  nickname: string;
  text: string;
  createdAt: number;
  likeCount: number;
  likedByCurrentUser?: boolean;
  status: 'published' | 'hidden' | 'flagged';
}

export interface CommentItem {
  id: string;
  authorUid: string;
  nickname: string;
  text: string;
  createdAt: number;
  likeCount: number;
  likedByCurrentUser?: boolean;
  reactions?: Record<string, number>;
  userReaction?: string | null;
  replyCount: number;
  status: 'published' | 'hidden' | 'flagged';
  isPinned?: boolean;
  pinnedReason?: string;
  replies?: CommentReply[];
}

export interface ReportItem {
  id: string;
  targetId: string;
  targetType: 'comment' | 'reply';
  targetText: string;
  reporterUid: string;
  reason: string;
  details?: string;
  createdAt: number;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface PinSuggestion {
  id: string;
  targetCommentId: string;
  commentText: string;
  authorNickname: string;
  requesterUid: string;
  reason: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}
