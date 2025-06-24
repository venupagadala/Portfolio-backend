const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send', async (req, res) => {
  const { name, email, message, phone } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail (e.g., venupagadala13@gmail.com)
      pass: process.env.EMAIL_PASS, // 16-char app password (no spaces)
    },
  });

  const htmlContent = `
    <div style="font-family: system-ui, Arial, sans-serif; font-size: 14px;">
      <p><strong>You received a new message from your portfolio contact form:</strong></p>
      <div style="margin: 16px 0; padding: 12px; border: 1px dashed #ccc; border-radius: 6px;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr style="margin: 12px 0;">
        <p style="white-space: pre-line; font-size: 15px;">${message}</p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      html: htmlContent,
      replyTo: email,
    });

    console.log('✅ Email sent:', info.messageId);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('❌ Email send failed:', err);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
