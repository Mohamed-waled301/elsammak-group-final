const nodemailer = require("nodemailer");

let transporter;

const sanitizeHeaderValue = (value) => {
  if (typeof value !== "string") return "";
  // Prevent SMTP header injection (CRLF).
  return value.replace(/[\r\n]/g, " ").trim();
};

const getTransporter = () => {
  if (transporter) return transporter;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
};

/**
 * sendEmail({ to|email, subject, message|text })
 */
const sendEmail = async (options = {}) => {
  const to = options.to || options.email;
  const subject = options.subject;
  const text = options.text ?? options.message;

  if (!to || typeof to !== "string") {
    throw new Error("Email recipient is required");
  }

  if (!subject || typeof subject !== "string") {
    throw new Error("Email subject is required");
  }

  // If backend callers pass message as non-string, force it to string.
  const safeText = typeof text === "string" ? text : String(text ?? "");

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (!emailUser || !emailPass) {
    // In production this should be configured; throwing here lets controllers decide.
    throw new Error("Email provider is not configured (EMAIL_USER/EMAIL_PASS missing)");
  }

  const safeTo = sanitizeHeaderValue(to);
  const safeSubject = sanitizeHeaderValue(subject);

  const mail = {
    from: `"El-Sammak Group" <${sanitizeHeaderValue(emailUser)}>`,
    to: safeTo,
    subject: safeSubject,
    text: safeText,
  };

  const tx = getTransporter();
  await tx.sendMail(mail);
};

module.exports = sendEmail;