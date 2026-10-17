import test from 'node:test';
import assert from 'node:assert/strict';
import { getJokesForCategory, getRandomJoke, formatJokeForSharing } from '../lib/comedyEngine.ts';

test('Moina Asoni collection contains at least 20 jokes', () => {
  const jokes = getJokesForCategory('moina');
  assert.ok(jokes.length >= 20, `Expected at least 20 Moina jokes, got ${jokes.length}`);
});

test('Babu Asoni collection contains at least 20 jokes', () => {
  const jokes = getJokesForCategory('babu');
  assert.ok(jokes.length >= 20, `Expected at least 20 Babu jokes, got ${jokes.length}`);
});

test('getRandomJoke returns a valid joke with required fields', () => {
  const joke = getRandomJoke('moina');
  assert.ok(joke.id, 'Joke must have an id');
  assert.equal(joke.category, 'moina');
  assert.ok(joke.textAssamese.length > 5, 'Joke must have Assamese text');
  assert.ok(joke.punchline.length > 5, 'Joke must have punchline text');
  assert.ok(joke.reactionEmoji, 'Joke must have reaction emoji');
});

test('getRandomJoke avoids consecutive duplicates when previousJokeId is provided', () => {
  const firstJoke = getRandomJoke('babu');
  for (let i = 0; i < 25; i++) {
    const nextJoke = getRandomJoke('babu', firstJoke.id);
    assert.notEqual(nextJoke.id, firstJoke.id, 'Next joke should not be identical to previous joke');
  }
});

test('formatJokeForSharing creates valid text including joke and Golaghat branding', () => {
  const sampleJoke = {
    id: 'test-1',
    category: 'moina' as const,
    textAssamese: 'Moina asoni test joke',
    punchline: 'Test punchline',
    reactionEmoji: '😂',
    tag: 'Testing'
  };
  const shareText = formatJokeForSharing(sampleJoke);
  assert.ok(shareText.includes('Moina asoni test joke'));
  assert.ok(shareText.includes('Test punchline'));
  assert.ok(shareText.includes('Golaghat'));
});
