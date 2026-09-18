const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vibe, date, time, food, message } = req.body || {};

  if (!date || !time || !food) {
    return res.status(400).json({ error: 'Date, time, and food are required fields.' });
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: (process.env.RESEND_TO_EMAIL || 'harshadsawarkar05@gmail.com').split(',').map(v => v.trim()).filter(Boolean),
      subject: 'New Date Lock In! ♥',
      html: `
        <h2>She locked it in! ♥</h2>
        <p><b>Vibe:</b> ${vibe || food}</p>
        <p><b>Food:</b> ${food}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Message:</b> ${message || 'be ready — I\'m coming to get you'}</p>
        <p>Be ready! ♥</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, message: 'Email successfully sent' });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
};
