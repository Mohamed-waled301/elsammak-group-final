const TrainingBooking = require('../models/TrainingBooking');
const { sendTrainingBookingConfirmation } = require('../utils/sendEmail');

const COURSE_LABELS = {
  data_analysis: { en: 'Data Analysis', ar: 'تحليل البيانات' },
  human_resources: { en: 'Human Resources', ar: 'الموارد البشرية' },
  legal_training: { en: 'Legal Training', ar: 'التدريب القانوني' },
};

function parseBody(body) {
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '')
    .trim()
    .toLowerCase();
  const phone = String(body?.phone || '').trim();
  const course = String(body?.course || '').trim();
  const bookingDate = String(body?.bookingDate || '').trim();
  const governorate = String(body?.governorate || '').trim();
  const city = String(body?.city || '').trim();

  if (!name) return { error: 'Name is required.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'A valid email is required.' };
  }
  if (!course) return { error: 'Please select a program.' };
  if (!bookingDate) return { error: 'Please choose a booking date.' };

  return { name, email, phone, course, bookingDate, governorate, city };
}

/**
 * POST /api/training/booking
 */
async function postTrainingBooking(req, res, next) {
  try {
    const parsed = parseBody(req.body);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    await TrainingBooking.create({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      course: parsed.course,
      bookingDate: parsed.bookingDate,
      governorate: parsed.governorate,
      city: parsed.city,
    });

    const labels = COURSE_LABELS[parsed.course] || { en: parsed.course, ar: parsed.course };
    const emailResult = await sendTrainingBookingConfirmation({
      to: parsed.email,
      name: parsed.name,
      courseLabelEn: labels.en,
      courseLabelAr: labels.ar,
      bookingDate: parsed.bookingDate,
      phone: parsed.phone,
      governorate: parsed.governorate,
      city: parsed.city,
    });

    return res.status(201).json({
      success: true,
      message: 'Your training seat request was received.',
      emailSent: emailResult.sent,
      ...(emailResult.sent === false && emailResult.error
        ? { emailWarning: 'Confirmation email could not be sent. We will still process your request.' }
        : {}),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { postTrainingBooking };
