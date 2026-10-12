import assert from 'node:assert/strict';
import test from 'node:test';
import { isFollowUpAvailable } from '../lib/follow-up';

test('hides Follow Up for dropped and expelled child statuses', () => {
  assert.equal(isFollowUpAvailable('DROPPED', undefined), false);
  assert.equal(isFollowUpAvailable('Dropped', undefined), false);
  assert.equal(isFollowUpAvailable('EXPELLED', undefined), false);
  assert.equal(isFollowUpAvailable(' expelled ', undefined), false);
});

test('hides Follow Up when disciplinary status is dropped or expelled', () => {
  assert.equal(isFollowUpAvailable('ACTIVE', 'DROPPED'), false);
  assert.equal(isFollowUpAvailable('ACTIVE', 'Expelled'), false);
});

test('keeps Follow Up available for other or missing statuses', () => {
  assert.equal(isFollowUpAvailable('ACTIVE', undefined), true);
  assert.equal(isFollowUpAvailable('PASSOUT', 'OTHER'), true);
  assert.equal(isFollowUpAvailable(undefined, null), true);
});
