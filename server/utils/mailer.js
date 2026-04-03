/**
 * Single global Nodemailer transporter (Gmail + app password).
 * All outbound mail goes through sendMailWithRetry (retries + rate gap).
 */

const nodemailer = require('nodemailer');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadAuth() {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
  return { user, pass };
}

const { user: mailFromUser, pass: mailPass } = loadAuth();
const hasMailCreds = Boolean(mailFromUser && mailPass);

/** One shared transporter for the process lifetime */
const transporter = hasMailCreds
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailFromUser,
        pass: mailPass,
      },
    })
  : null;

console.log('[mailer] FROM (EMAIL_USER):', mailFromUser || '(not set)');

if (transporter) {
  transporter.verify((err) => {
    if (err) console.log('[mailer] SMTP VERIFY ERROR:', err.message);
    else console.log('[mailer] SMTP SERVER IS READY');
  });
} else {
  console.log('[mailer] SMTP SKIP: set EMAIL_USER and EMAIL_PASS (Gmail app password)');
}

/** Minimum time between completed sends (helps avoid Gmail rate limits) */
const MIN_GAP_MS = Number(process.env.MAIL_MIN_GAP_MS) || 1500;
let lastSendCompletedAt = 0;

async function waitForInterSendGap() {
  const gapWait = lastSendCompletedAt + MIN_GAP_MS - Date.now();
  if (gapWait > 0) {
    console.log('[mailer] inter-send delay:', gapWait, 'ms (rate limit guard)');
    await sleep(gapWait);
  }
}

function recordSendCompleted() {
  lastSendCompletedAt = Date.now();
}

/**
 * @param {import('nodemailer').SendMailOptions} mailOptions
 * @param {{ maxAttempts?: number, retryDelayMs?: number }} opts
 */
async function sendMailWithRetry(mailOptions, opts = {}) {
  const maxAttempts = opts.maxAttempts ?? 3;
  const retryDelayMs = opts.retryDelayMs ?? 2000;

  if (!transporter) {
    throw new Error('Mail transporter not configured (EMAIL_USER / EMAIL_PASS)');
  }

  const to = mailOptions.to;
  const recipientLabel = Array.isArray(to) ? to.join(', ') : String(to || '(missing-to)');
  console.log('[mailer] recipient (to):', recipientLabel);

  await waitForInterSendGap();

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[mailer] attempt ${attempt}/${maxAttempts} → sending...`);
      const info = await transporter.sendMail(mailOptions);
      recordSendCompleted();
      console.log('[mailer] EMAIL SENT OK:', info.response);
      return info;
    } catch (err) {
      lastErr = err;
      console.log('[mailer] EMAIL ERROR (attempt', attempt, '):', err.message);
      if (attempt < maxAttempts) {
        console.log('[mailer] waiting', retryDelayMs, 'ms before retry...');
        await sleep(retryDelayMs);
      }
    }
  }

  const msg = lastErr?.message || 'Email send failed after retries';
  console.log('[mailer] FAILED after', maxAttempts, 'attempts:', msg);
  const error = new Error(msg);
  error.cause = lastErr;
  throw error;
}

function getTransporter() {
  return transporter;
}

function getMailFrom() {
  return mailFromUser;
}

function isConfigured() {
  return Boolean(transporter);
}

module.exports = {
  sendMailWithRetry,
  getTransporter,
  getMailFrom,
  isConfigured,
  waitForInterSendGap,
  recordSendCompleted,
};
