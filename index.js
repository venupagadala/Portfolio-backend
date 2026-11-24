// Portfolio contact API.
//
// Sends contact-form messages through Resend's HTTPS API. Render's free plan
// blocks outbound SMTP (ports 25/465/587) since Sept 2025, which made the old
// Gmail/Nodemailer version hang until it timed out. HTTPS on 443 is allowed.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {
  RESEND_API_KEY,
  CONTACT_TO_EMAIL, // where messages are delivered (your inbox)
  CONTACT_FROM_EMAIL = 'Portfolio Contact <onboarding@resend.dev>',
  ALLOWED_ORIGINS = '', // comma-separated, e.g. https://venupagadala.github.io
  RESEND_API_URL = 'https://api.resend.com/emails', // overridable for tests
  PORT = 5000,
} = process.env;

const SEND_TIMEOUT_MS = 10_000;
const LIMITS = { name: 100, email: 200, phone: 30, message: 5000 };

const app = express();

const origins = ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
const corsOptions = {
  origin: origins.length ? origins : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('/send', cors(corsOptions));
app.use(express.json({ limit: '20kb' }));

// Visitor input goes into an HTML email, so escape it.
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);

function validate(body) {
  const fields = {
    name: String(body?.name ?? '').trim(),
    email: String(body?.email ?? '').trim(),
    phone: String(body?.phone ?? '').trim(),
    message: String(body?.message ?? '').trim(),
  };
  if (!fields.name || !fields.email || !fields.message) return { error: 'Missing required fields.' };
  if (!isEmail(fields.email)) return { error: 'Invalid email address.' };
  for (const [key, max] of Object.entries(LIMITS)) {
    if (fields[key].length > max) return { error: `${key} is too long.` };
  }
  return { fields };
}

// Lets the frontend (or an uptime pinger) wake the free instance early.
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/send', async (req, res) => {
  const { fields, error } = validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.error('❌ Email is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL.');
    return res.status(500).json({ success: false, message: 'Email service is not configured.' });
  }

  const { name, email, phone, message } = fields;
  const html = `
    <div style="font-family: system-ui, Arial, sans-serif; font-size: 14px;">
      <p><strong>You received a new message from your portfolio contact form:</strong></p>
      <div style="margin: 16px 0; padding: 12px; border: 1px dashed #ccc; border-radius: 6px;">
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
        <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
        <hr style="margin: 12px 0;">
        <p style="white-space: pre-line; font-size: 15px;">${escapeHtml(message)}</p>
      </div>
    </div>`;

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `New message from ${name.slice(0, 80)}`,
        html,
        text: `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ''}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error('❌ Resend rejected the email:', response.status, await response.text());
      return res.status(502).json({ success: false, message: 'Failed to send email.' });
    }

    const { id } = await response.json();
    console.log('✅ Email sent:', id);
    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('❌ Email send failed:', err.name === 'TimeoutError' ? 'timed out' : err);
    return res.status(502).json({ success: false, message: 'Failed to send email.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
