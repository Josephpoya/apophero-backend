'use strict';
// ═══════════════════════════════════════════
//  EMAIL UTILITY — Nodemailer
// ═══════════════════════════════════════════
const nodemailer = require('nodemailer');
const logger     = require('./logger');

// ── Transporter ───────────────────────────
const createTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
});

// ── Base HTML wrapper ─────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Apophero Health</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:#DEE3DF; color:#161919; }
    .wrapper { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; margin-top:24px; margin-bottom:24px; }
    .header  { background:#161919; padding:32px 40px; text-align:center; }
    .logo    { font-size:22px; font-weight:700; color:#fff; letter-spacing:-.3px; }
    .logo span { color:#09C8B8; }
    .body    { padding:40px; }
    .body h2 { font-size:22px; margin-bottom:12px; color:#161919; }
    .body p  { font-size:15px; line-height:1.7; color:#705C52; margin-bottom:14px; }
    .btn     { display:inline-block; background:#09C8B8; color:#fff; padding:13px 28px;
               border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; margin:8px 0; }
    .divider { border:none; border-top:1px solid #DEE3DF; margin:24px 0; }
    .footer  { background:#f7f8f7; padding:24px 40px; text-align:center; border-top:1px solid #DEE3DF; }
    .footer p { font-size:12px; color:#848B8C; line-height:1.6; }
    .highlight { background:#e3f8f7; border-left:3px solid #09C8B8; padding:14px 18px; border-radius:0 8px 8px 0; margin:16px 0; }
    .highlight p { color:#161919; margin:0; font-size:14px; }
    .tag { display:inline-block; background:#DEE3DF; color:#705C52; padding:3px 10px; border-radius:100px; font-size:12px; font-weight:600; margin:2px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Apophero <span>Health</span></div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>Apophero Health · Complete, Convenient Healthcare<br>
      <a href="${process.env.CLIENT_URL}" style="color:#09C8B8">Visit our website</a> ·
      <a href="${process.env.CLIENT_URL}#contact" style="color:#09C8B8">Contact Us</a><br><br>
      This email was sent because you interacted with Apophero Health.<br>
      If you believe this is an error, please <a href="mailto:${process.env.FROM_EMAIL}" style="color:#09C8B8">contact us</a>.</p>
    </div>
  </div>
</body>
</html>`;

// ── Email Templates ───────────────────────
const templates = {

  // Welcome email after registration
  welcome: ({ name }) => ({
    subject: 'Welcome to Apophero Health 🌿',
    html: baseTemplate(`
      <h2>Welcome, ${name}! 👋</h2>
      <p>You've successfully created your Apophero Health account. We're thrilled to have you on this health journey.</p>
      <div class="highlight"><p>💡 <strong>Get started:</strong> Browse our free health guides and download the ones that match your goals.</p></div>
      <p>Here's what you can do now:</p>
      <p>✅ Browse and download all free health guides<br>
         ✅ Book a 1-on-1 health consultation<br>
         ✅ Subscribe to our health newsletter<br>
         ✅ Track your wellness journey</p>
      <a href="${process.env.CLIENT_URL}#shop" class="btn">Browse Free Guides →</a>
      <hr class="divider">
      <p>If you didn't create this account, please <a href="mailto:${process.env.FROM_EMAIL}">contact us immediately</a>.</p>
    `)
  }),

  // Password reset
  resetPassword: ({ name, resetUrl }) => ({
    subject: 'Reset Your Password — Apophero Health',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your Apophero Health account password.</p>
      <div class="highlight"><p>⏰ This link expires in <strong>10 minutes</strong>.</p></div>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="btn">Reset My Password →</a>
      <hr class="divider">
      <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `)
  }),

  // Contact form confirmation (to user)
  contactConfirm: ({ name, subject }) => ({
    subject: `We received your message — Apophero Health`,
    html: baseTemplate(`
      <h2>Thanks for reaching out, ${name}! ✉️</h2>
      <p>We've received your message regarding <strong>"${subject}"</strong> and will respond within <strong>24 hours</strong>.</p>
      <div class="highlight"><p>💬 In the meantime, you can reach us directly on WhatsApp for urgent queries.</p></div>
      <p>While you wait, explore our free health resources:</p>
      <a href="${process.env.CLIENT_URL}#shop" class="btn">Browse Free Guides →</a>
    `)
  }),

  // Contact form notification (to admin)
  contactAdmin: ({ name, email, subject, message }) => ({
    subject: `📬 New Contact Form: ${subject}`,
    html: baseTemplate(`
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr class="divider">
      <p><strong>Message:</strong></p>
      <div class="highlight"><p>${message.replace(/\n/g, '<br>')}</p></div>
      <a href="mailto:${email}" class="btn">Reply to ${name} →</a>
    `)
  }),

  // Newsletter welcome
  newsletterWelcome: ({ email }) => ({
    subject: 'You\'re subscribed! Here\'s your free guide 🎁',
    html: baseTemplate(`
      <h2>Welcome to the Apophero Health Newsletter! 🌿</h2>
      <p>Thank you for subscribing. You'll now receive our latest health articles, free guides, and wellness tips straight to your inbox.</p>
      <div class="highlight"><p>🎁 <strong>Your free bonus:</strong> Download the Metabolic Blueprint guide — our most popular resource for permanent weight loss.</p></div>
      <a href="${process.env.CLIENT_URL}#shop" class="btn">Download Free Guides →</a>
      <hr class="divider">
      <p style="font-size:12px;color:#848B8C">You subscribed with: ${email}. To unsubscribe at any time, click the unsubscribe link in any newsletter email.</p>
    `)
  }),

  // Booking confirmation (to user)
  bookingConfirm: ({ name, sessionType, concern, bookingRef }) => ({
    subject: `Booking Confirmed — ${sessionType} | Apophero Health`,
    html: baseTemplate(`
      <h2>Your Consultation is Booked! 🎉</h2>
      <p>Hi ${name}, your consultation request has been received and confirmed.</p>
      <div class="highlight">
        <p>📋 <strong>Booking Reference:</strong> ${bookingRef}<br>
           🏥 <strong>Session Type:</strong> ${sessionType}<br>
           💊 <strong>Primary Concern:</strong> ${concern}</p>
      </div>
      <p><strong>What happens next?</strong></p>
      <p>1️⃣ Our team will review your details within <strong>24 hours</strong><br>
         2️⃣ We'll contact you via email or WhatsApp to schedule your session time<br>
         3️⃣ We'll send preparation materials before your session</p>
      <a href="${process.env.CLIENT_URL}#book" class="btn">View Booking Details →</a>
      <hr class="divider">
      <p>Questions? Reply to this email or reach us on WhatsApp.</p>
    `)
  }),

  // Booking notification (to admin)
  bookingAdmin: ({ name, email, phone, sessionType, concern, notes, bookingRef }) => ({
    subject: `📅 New Booking: ${sessionType} — ${name}`,
    html: baseTemplate(`
      <h2>New Consultation Booking</h2>
      <div class="highlight">
        <p>🔖 <strong>Ref:</strong> ${bookingRef}<br>
           👤 <strong>Name:</strong> ${name}<br>
           📧 <strong>Email:</strong> ${email}<br>
           📱 <strong>Phone:</strong> ${phone || 'Not provided'}<br>
           🏥 <strong>Session:</strong> ${sessionType}<br>
           💊 <strong>Concern:</strong> ${concern}</p>
      </div>
      ${notes ? `<p><strong>Additional notes:</strong><br>${notes}</p>` : ''}
      <a href="mailto:${email}" class="btn">Contact Client →</a>
    `)
  })
};

// ── Main send function ─────────────────────
const sendEmail = async ({ to, templateName, templateData, subject, html }) => {
  try {
    const transporter = createTransporter();

    let mailOptions;

    if (templateName && templates[templateName]) {
      const tmpl = templates[templateName](templateData);
      mailOptions = {
        from:    `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject: tmpl.subject,
        html:    tmpl.html
      };
    } else {
      mailOptions = {
        from:    `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html
      };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} → ${to}`);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    logger.error(`Email send error: ${err.message}`);
    // Don't throw — email failures shouldn't break the API response
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail, templates };
