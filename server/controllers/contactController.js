const Contact = require('../models/Contact');
const { sendContactNotification } = require('../utils/sendEmail');

function validateContactBody(body) {
  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const subject =
    typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '';

  if (!name) errors.push('name is required');
  if (!email) errors.push('email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email is invalid');
  if (!message) errors.push('message is required');

  return { name, email, message, subject, errors };
}

/**
 * POST /api/contact
 * Saves to MongoDB, then sends email using the saved document (same data + createdAt).
 */
async function postContact(req, res, next) {
  try {
    console.log(req.body);

    const { name, email, message, subject, errors } = validateContactBody(req.body || {});
    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join('; '),
        errors,
      });
    }

    const doc = await Contact.create({
      name,
      email,
      message,
      subject: subject || '',
    });

    const emailResult = await sendContactNotification({
      name: doc.name,
      email: doc.email,
      message: doc.message,
    });

    return res.status(201).json({
      success: true,
      message: emailResult.sent
        ? 'Message received and notification email sent.'
        : 'Message saved. Email notification could not be sent.',
      id: doc._id,
      emailSent: emailResult.sent,
      ...(emailResult.error && !emailResult.sent && { emailWarning: emailResult.error }),
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
}

module.exports = { postContact };
