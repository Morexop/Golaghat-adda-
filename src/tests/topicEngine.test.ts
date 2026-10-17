import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTrendingTopics, doesCommentMatchTopic, filterCommentsByTopic } from '../lib/topicEngine.ts';
import { CommentItem } from '../types/community.ts';

const mockComments: CommentItem[] = [
  {
    id: 'c1',
    authorUid: 'u1',
    nickname: 'BabuFan',
    text: 'Aji Babu asoni pala ne dost? Chicken party khujibo eibar! 😂',
    likeCount: 5,
    replyCount: 1,
    status: 'published',
    createdAt: Date.now(),
  },
  {
    id: 'c2',
    authorUid: 'u2',
    nickname: 'GolaghatKing',
    text: 'Golaghat market-ot aji bohut bhir, party-r chicken kinisu!',
    likeCount: 3,
    replyCount: 0,
    status: 'published',
    createdAt: Date.now(),
  },
  {
    id: 'c3',
    authorUid: 'u3',
    nickname: 'MoinaGolaghatia',
    text: 'Moina asoni pale jhumka aru earring kinim! #MoinaAsoni',
    likeCount: 8,
    replyCount: 2,
    status: 'published',
    createdAt: Date.now(),
  },
  {
    id: 'c4',
    authorUid: 'u4',
    nickname: 'HostelBoy',
    text: 'College hostel-ot aji class ses, roommate-e party dibo!',
    likeCount: 2,
    replyCount: 0,
    status: 'published',
    createdAt: Date.now(),
  },
];

test('calculateTrendingTopics ranks topics by comment frequency', () => {
  const topics = calculateTrendingTopics(mockComments);
  assert.ok(topics.length > 0, 'Should return topic list');

  // Chicken / party appears in c1, c2, c4 (3 times)
  const partyTopic = topics.find((t) => t.id === 'chicken-party');
  assert.ok(partyTopic, 'Party & Treat topic must exist');
  assert.equal(partyTopic.count, 3, 'Party & Treat should match 3 comments');
  assert.ok(partyTopic.isHot, 'Topic with >= 2 comments should be marked as hot');

  // First item in sorted list should have highest frequency
  assert.equal(topics[0].id, 'chicken-party');
});

test('doesCommentMatchTopic matches both hashtags and keywords', () => {
  const commentWithTag: CommentItem = {
    id: 'ct',
    authorUid: 'u1',
    nickname: 'Tester',
    text: 'Check this #MoinaAsoni update!',
    likeCount: 0,
    replyCount: 0,
    status: 'published',
    createdAt: Date.now(),
  };

  assert.equal(doesCommentMatchTopic(commentWithTag, 'moina-asoni'), true);
  assert.equal(doesCommentMatchTopic(commentWithTag, 'babu-asoni'), false);
});

test('filterCommentsByTopic returns matching comments only', () => {
  const filteredMoina = filterCommentsByTopic(mockComments, 'moina-asoni');
  assert.equal(filteredMoina.length, 1);
  assert.equal(filteredMoina[0].id, 'c3');

  const allReturnedWhenNull = filterCommentsByTopic(mockComments, null);
  assert.equal(allReturnedWhenNull.length, 4);
});
