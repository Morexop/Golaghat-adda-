import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMemeForSharing, STARTER_COMMUNITY_MEMES } from '../services/memeService.ts';
import { CommunityMeme } from '../types/meme.ts';

test('STARTER_COMMUNITY_MEMES has at least 3 initial memes', () => {
  assert.ok(STARTER_COMMUNITY_MEMES.length >= 3);
  STARTER_COMMUNITY_MEMES.forEach((meme) => {
    assert.ok(meme.id, 'Meme must have id');
    assert.ok(meme.nickname, 'Meme must have nickname');
    assert.ok(meme.setup, 'Meme must have setup');
    assert.ok(meme.punchline, 'Meme must have punchline');
    assert.ok(['moina', 'babu', 'golaghat'].includes(meme.category));
  });
});

test('formatMemeForSharing formats proper text with setup, punchline, and URL', () => {
  const sampleMeme: CommunityMeme = {
    id: 'm1',
    authorUid: 'u1',
    nickname: 'TestAuthor',
    setup: 'Aji ki party?',
    punchline: 'Babu asoni treat!',
    category: 'babu',
    status: 'published',
    sharesCount: 0,
    laughCount: 5,
    createdAt: Date.now(),
  };

  const formatted = formatMemeForSharing(sampleMeme, 'https://example.com');
  assert.ok(formatted.includes('TestAuthor'), 'Should contain author nickname');
  assert.ok(formatted.includes('Aji ki party?'), 'Should contain setup');
  assert.ok(formatted.includes('Babu asoni treat!'), 'Should contain punchline');
  assert.ok(formatted.includes('https://example.com'), 'Should contain link');
});
