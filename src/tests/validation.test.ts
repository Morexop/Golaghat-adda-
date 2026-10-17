import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateNickname,
  validateCommentText,
  checkPostingCooldown,
  recordPostTimestamp,
  isDuplicateMessage,
  POSTING_COOLDOWN_SECONDS,
} from '../lib/validation.ts';

test('validateNickname accepts valid nicknames', () => {
  assert.equal(validateNickname('Golaghat_User').isValid, true);
  assert.equal(validateNickname('Babu Asoni 07').isValid, true);
  assert.equal(validateNickname('Moina-Fan').isValid, true);
});

test('validateNickname rejects empty, too short, or too long nicknames', () => {
  assert.equal(validateNickname('').isValid, false);
  assert.equal(validateNickname('   ').isValid, false);
  assert.equal(validateNickname('A').isValid, false);
  assert.equal(validateNickname('A'.repeat(25)).isValid, false);
});

test('validateNickname rejects illegal characters', () => {
  assert.equal(validateNickname('user<script>').isValid, false);
  assert.equal(validateNickname('babu@123#').isValid, false);
});

test('validateCommentText checks empty and 500 max length', () => {
  assert.equal(validateCommentText('').isValid, false);
  assert.equal(validateCommentText('   ').isValid, false);
  assert.equal(validateCommentText('Pale treat aji!').isValid, true);
  assert.equal(validateCommentText('X'.repeat(501)).isValid, false);
});

test('cooldown rejects posts within 20s and duplicate detector flags identical messages', () => {
  const uid = 'test-user-123';
  const initial = checkPostingCooldown(uid);
  assert.equal(initial.canPost, true);

  recordPostTimestamp(uid, 'Aji biryani party!');
  const immediateCheck = checkPostingCooldown(uid);
  assert.equal(immediateCheck.canPost, false);
  assert.ok(immediateCheck.remainingSeconds > 0 && immediateCheck.remainingSeconds <= POSTING_COOLDOWN_SECONDS);

  assert.equal(isDuplicateMessage(uid, 'Aji biryani party!'), true);
  assert.equal(isDuplicateMessage(uid, 'Different message!'), false);
});
