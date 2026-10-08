const test = require('node:test');
const assert = require('node:assert/strict');
const { validationResult } = require('express-validator');
const { opportunityCreateValidator, opportunityUpdateValidator } = require('../validators/opportunityValidators');
const { followUpCreateValidator } = require('../validators/followUpValidators');

async function runValidation(schema, payload, extra = {}) {
  const req = { body: payload, query: {}, params: {}, ...extra };
  await Promise.all(schema.map((validation) => validation.run(req)));
  return validationResult(req);
}

test('opportunity create rejects amount 0', async () => {
  const result = await runValidation(opportunityCreateValidator, {
    opportunityName: 'New deal',
    amount: 0,
    probability: 50,
    expectedCloseDate: '2026-12-31T00:00:00.000Z'
  });

  assert.equal(result.isEmpty(), false);
  assert.match(result.array()[0].msg, /greater than 0/i);
});

test('opportunity update rejects amount 0', async () => {
  const result = await runValidation(opportunityUpdateValidator, {
    amount: 0,
    probability: 50,
    expectedCloseDate: '2026-12-31T00:00:00.000Z'
  }, { params: { id: '507f1f77bcf86cd799439011' } });

  assert.equal(result.isEmpty(), false);
  assert.match(result.array()[0].msg, /greater than 0/i);
});

test('follow-up create rejects past planned date', async () => {
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const result = await runValidation(followUpCreateValidator, {
    followUpType: 'Call',
    status: 'Planned',
    followUpDate: pastDate,
    remarks: 'Follow up needed'
  });

  assert.equal(result.isEmpty(), false);
  assert.match(result.array()[0].msg, /earlier than today/i);
});
