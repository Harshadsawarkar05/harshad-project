require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const TO_EMAILS = (process.env.RESEND_TO_EMAIL || 'harshadsawarkar05@gmail.com')
  .split(',')
  .map(email => email.trim())
  .filter(Boolean);

function buildEmailHtml({ vibe, date, time, food, message }) {
  return `
    <h2>She locked it in! ♥</h2>
    <p><b>Vibe:</b> ${vibe || food}</p>
    <p><b>Food:</b> ${food}</p>
    <p><b>Date:</b> ${date}</p>
    <p><b>Time:</b> ${time}</p>
    <p><b>Message:</b> ${message || 'be ready — I\'m coming to get you'}</p>
    <p>Be ready! ♥</p>
  `;
}

async function sendWithResend(emailData) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY in .env');
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAILS,
    subject: 'New Date Lock In! ♥',
    html: buildEmailHtml(emailData)
  });

  if (error) {
    throw new Error(error.message || 'Resend failed to send email');
  }

  return data;
}

async function sendWithGmail(emailData) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });

  const info = await transporter.sendMail({
    from: gmailUser,
    to: TO_EMAILS,
    subject: 'New Date Lock In! ♥',
    html: buildEmailHtml(emailData)
  });

  return info;
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Palak_edited.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.post('/send-email', async (req, res) => {
  const { vibe, date, time, food, message } = req.body;

  if (!date || !time || !food) {
    return res.status(400).json({
      error: 'Date, time, and food are required fields.'
    });
  }

  if (TO_EMAILS.length === 0) {
    return res.status(500).json({
      error: 'Missing RESEND_TO_EMAIL in .env'
    });
  }

  try {
    let result;

    if (process.env.EMAIL_PROVIDER === 'gmail') {
      result = await sendWithGmail({ vibe, date, time, food, message });
    } else if (process.env.RESEND_API_KEY) {
      try {
        result = await sendWithResend({ vibe, date, time, food, message });
      } catch (resendError) {
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          console.warn('Resend failed, falling back to Gmail SMTP:', resendError.message);
          result = await sendWithGmail({ vibe, date, time, food, message });
        } else {
          throw resendError;
        }
      }
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      result = await sendWithGmail({ vibe, date, time, food, message });
    } else {
      throw new Error('No email provider configured. Add RESEND_API_KEY or GMAIL_APP_PASSWORD in .env');
    }

    console.log('Email sent:', result);

    res.status(200).json({
      success: true,
      message: 'Email successfully sent'
    });

  } catch (error) {
    console.error('Email error:', error);

    res.status(500).json({
      error: error.message || 'Failed to send email'
    });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;