// Runs the API against a fake Resend server to check what would be sent,
// and how failures are reported, without real credentials.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

let mock, mockUrl, received, mockStatus, mockDelayMs, api, apiUrl;

before(async () => {
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      received = { headers: req.headers, body: JSON.parse(body) };
      setTimeout(() => {
        res.writeHead(mockStatus, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockStatus === 200 ? { id: 'test-123' } : { message: 'bad key' }));
      }, mockDelayMs);
    });
  });
  await new Promise((r) => mock.listen(0, r));
  mockUrl = `http://127.0.0.1:${mock.address().port}/emails`;

  Object.assign(process.env, {
    RESEND_API_KEY: 're_test',
    CONTACT_TO_EMAIL: 'owner@example.com',
    RESEND_API_URL: mockUrl,
  });
  const app = require('../index.js');
  api = app.listen(0);
  await new Promise((r) => api.once('listening', r));
  apiUrl = `http://127.0.0.1:${api.address().port}`;
});

after(() => {
  api.close();
  mock.close();
});

const send = (payload) =>
  fetch(`${apiUrl}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

const valid = {
  name: 'Ada <b>Lovelace</b>',
  email: 'ada@example.com',
  phone: '+14705009074',
  message: 'Hello <script>alert(1)</script>',
};

test('health check responds', async () => {
  const res = await fetch(`${apiUrl}/health`);
  assert.deepStrictEqual(await res.json(), { ok: true });
});

test('sends through Resend with escaped HTML and reply-to set', async () => {
  mockStatus = 200;
  mockDelayMs = 0;
  const res = await send(valid);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).success, true);

  assert.strictEqual(received.headers.authorization, 'Bearer re_test');
  assert.deepStrictEqual(received.body.to, ['owner@example.com']);
  assert.strictEqual(received.body.reply_to, 'ada@example.com');
  assert.match(received.body.html, /Ada &lt;b&gt;Lovelace&lt;\/b&gt;/);
  assert.doesNotMatch(received.body.html, /<script>/);
  assert.match(received.body.html, /\+14705009074/);
});

test('rejects missing fields and bad email with 400', async () => {
  assert.strictEqual((await send({ name: 'A', email: '', message: 'x' })).status, 400);
  assert.strictEqual((await send({ ...valid, email: 'not-an-email' })).status, 400);
  assert.strictEqual((await send({ ...valid, message: 'x'.repeat(5001) })).status, 400);
});

test('reports a Resend error as 502 instead of hanging', async () => {
  mockStatus = 401;
  mockDelayMs = 0;
  const res = await send(valid);
  assert.strictEqual(res.status, 502);
  assert.strictEqual((await res.json()).success, false);
});
