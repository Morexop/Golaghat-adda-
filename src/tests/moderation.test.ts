import test from 'node:test';
import assert from 'node:assert/strict';
import { checkContentModeration } from '../lib/moderation.ts';

test('checkContentModeration allows friendly comedy text', () => {
  const result = checkContentModeration('Aji Moina asoni pala ne? Pale treat kham!');
  assert.equal(result.isClean, true);
  assert.equal(result.flaggedReason, undefined);
});

test('checkContentModeration blocks phone numbers', () => {
  const result = checkContentModeration('Call me on 9876543210 for details');
  assert.equal(result.isClean, false);
  assert.ok(result.flaggedReason?.includes('Phone numbers'));
});

test('checkContentModeration blocks sensitive banking keywords', () => {
  const result = checkContentModeration('Send me your OTP or UPI PIN for payment');
  assert.equal(result.isClean, false);
  assert.ok(result.flaggedReason?.includes('Sensitive bank'));
});

test('checkContentModeration flags scam announcements', () => {
  const result = checkContentModeration('Free cash lottery winner click here');
  assert.equal(result.isClean, false);
});
