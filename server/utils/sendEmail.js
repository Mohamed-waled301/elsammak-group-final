const { sendMailWithRetry, getMailFrom, isConfigured } = require('./mailer');

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Professional HTML email — inline styles for Gmail & major clients.
 */
function buildContactHtmlEmail({ name, email, message }) {
  const n = escapeHtml(name);
  const eDisplay = escapeHtml(email);
  const eHref = encodeURIComponent(String(email).trim());
  const m = escapeHtml(message).replace(/\r\n/g, '\n').replace(/\n/g, '<br />');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f6;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#eef2f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,59,92,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#003B5C 0%,#005a8c 100%);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">New Contact Message</h1>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Website contact form</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Name</p>
              <p style="margin:0 0 24px;font-size:16px;font-weight:600;color:#0f172a;line-height:1.5;">${n}</p>

              <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Email</p>
              <p style="margin:0 0 24px;font-size:16px;color:#003B5C;line-height:1.5;">
                <a href="mailto:${eHref}" style="color:#003B5C;text-decoration:none;font-weight:500;">${eDisplay}</a>
              </p>

              <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Message</p>
              <div style="margin:0;padding:20px 22px;background-color:#f8fafc;border-left:4px solid #c5a059;border-radius:0 8px 8px 0;font-size:15px;color:#334155;line-height:1.65;word-break:break-word;">${m}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              <p style="margin:0;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">El-Sammak Group · This message was sent from your website contact form.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

function buildContactPlainText({ name, email, message }) {
  return [
    'New Contact Message',
    '-------------------',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n');
}

/**
 * Notify site owner; visitor address is replyTo (submitter's email from the form).
 */
async function sendContactNotification({ name, email, message }) {
  if (!isConfigured()) {
    return { sent: false, error: 'EMAIL_USER or EMAIL_PASS not set' };
  }

  const from = getMailFrom();
  const ownerTo = (process.env.CONTACT_TO_EMAIL || '').trim() || from;

  const payload = { name, email, message };
  const html = buildContactHtmlEmail(payload);
  const text = buildContactPlainText(payload);

  try {
    await sendMailWithRetry({
      from,
      to: ownerTo,
      replyTo: email,
      subject: 'New Contact Message',
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.log('[sendEmail] contact notify error:', err.message);
    return { sent: false, error: err.message || String(err) };
  }
}

/**
 * OTP email — always sent to the end user's address (`to` from the request).
 */
async function sendOtpEmail({ to, otp }) {
  if (!isConfigured()) {
    throw new Error('EMAIL_USER or EMAIL_PASS not set');
  }
  const from = getMailFrom();
  const safeOtp = escapeHtml(otp);
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#eef2f6;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#eef2f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 32px rgba(0,59,92,0.14);">
        <tr>
          <td style="background:linear-gradient(135deg,#003B5C 0%,#005a8c 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(197,160,89,0.95);">Elsamak Group</p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Verification code</h1>
            <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.88);">Secure sign-in or account verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px 24px;">
            <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">Use the one-time code below to complete your request. Do not share this code with anyone.</p>
            <div style="margin:0 auto;max-width:280px;padding:20px 16px;background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);border:2px solid #c5a059;border-radius:12px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;">Your code</p>
              <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#003B5C;font-family:Consolas,Monaco,monospace;">${safeOtp}</p>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#64748b;line-height:1.55;text-align:center;">This code expires in <strong style="color:#003B5C;">10 minutes</strong>. If you did not request it, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px;">
            <p style="margin:0;padding-top:20px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.5;">Elsamak Group · Legal · Accounting · Analytics<br/>This is an automated message; replies are not monitored.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`.trim();

  const text = [
    'Elsamak Group — Verification code',
    '--------------------------------',
    '',
    `Your one-time code: ${otp}`,
    '',
    'This code expires in 10 minutes.',
    'If you did not request this email, please ignore it.',
  ].join('\n');

  await sendMailWithRetry({
    from,
    to,
    subject: 'Elsamak Group — Your verification code',
    text,
    html,
  });
}

/**
 * Training booking confirmation to the registrant.
 */
async function sendTrainingBookingConfirmation({
  to,
  name,
  courseLabelEn,
  courseLabelAr,
  bookingDate,
  phone,
  governorate,
  city,
}) {
  if (!isConfigured()) {
    return { sent: false, error: 'EMAIL_USER or EMAIL_PASS not set' };
  }
  const from = getMailFrom();
  const n = escapeHtml(name);
  const courseEn = escapeHtml(courseLabelEn);
  const courseAr = escapeHtml(courseLabelAr);
  const date = escapeHtml(bookingDate);
  const ph = escapeHtml(phone || '—');
  const gov = escapeHtml(governorate || '—');
  const c = escapeHtml(city || '—');

  const html = `
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,59,92,0.12);">
        <tr><td style="background:#003B5C;padding:22px 24px;text-align:center;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.15em;color:#c5a059;">ELSAMAK GROUP</p>
          <h1 style="margin:8px 0 0;font-size:20px;color:#fff;">Training booking received</h1>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 16px;color:#334155;font-size:15px;">Dear <strong>${n}</strong>,</p>
          <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">Thank you for booking a training seat with us. Here is a summary of your request:</p>
          <table role="presentation" width="100%" style="border-collapse:collapse;background:#f8fafc;border-radius:8px;">
            <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Program</td></tr>
            <tr><td style="padding:8px 16px 14px;color:#0f172a;font-size:15px;">${courseEn} <span style="color:#64748b;font-size:13px;">/ ${courseAr}</span></td></tr>
            <tr><td style="padding:12px 16px;border-top:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Preferred date</td></tr>
            <tr><td style="padding:8px 16px 14px;color:#003B5C;font-size:18px;font-weight:700;">${date}</td></tr>
            <tr><td style="padding:12px 16px;border-top:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Contact</td></tr>
            <tr><td style="padding:8px 16px 14px;color:#334155;font-size:14px;">Phone: ${ph}<br/>Location: ${gov}, ${c}</td></tr>
          </table>
          <p style="margin:22px 0 0;font-size:13px;color:#64748b;line-height:1.55;">Our team will contact you to confirm schedule and next steps.</p>
        </td></tr>
        <tr><td style="padding:0 24px 24px;"><p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Elsamak Group</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`.trim();

  const text = [
    'Elsamak Group — Training booking',
    `Hello ${name},`,
    '',
    `Program: ${courseLabelEn} (${courseLabelAr})`,
    `Preferred date: ${bookingDate}`,
    `Phone: ${phone || '—'}`,
    `Governorate / City: ${governorate || '—'} / ${city || '—'}`,
    '',
    'We will contact you to confirm your seat and schedule.',
  ].join('\n');

  try {
    await sendMailWithRetry({
      from,
      to,
      subject: 'Elsamak Group — Training booking confirmation',
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.log('[sendEmail] training booking email error:', err.message);
    return { sent: false, error: err.message || String(err) };
  }
}

module.exports = {
  sendContactNotification,
  sendOtpEmail,
  sendTrainingBookingConfirmation,
};
