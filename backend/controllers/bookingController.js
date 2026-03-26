const TrainingBooking = require('../models/TrainingBooking');
const ConsultationBooking = require('../models/ConsultationBooking');
const sendEmail = require('../utils/sendEmail');

const COURSE_CATALOG = {
  data_analysis: {
    title_en: 'Data Analysis',
    title_ar: 'تحليل البيانات',
    startDate: '2026-04-01',
    schedule: 'Sun & Wed, 6:00 PM - 8:00 PM',
  },
  human_resources: {
    title_en: 'Human Resources',
    title_ar: 'الموارد البشرية',
    startDate: '2026-04-05',
    schedule: 'Mon & Thu, 6:00 PM - 8:00 PM',
  },
  legal_training: {
    title_en: 'Legal Training for Lawyers',
    title_ar: 'التدريب القانوني للمحامين',
    startDate: '2026-04-10',
    schedule: 'Tue & Sat, 6:00 PM - 8:00 PM',
  },
};

const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const normalizeText = (v) => (typeof v === 'string' ? v.trim() : '');
const normalizeDate = (v) => (typeof v === 'string' ? v.trim() : '');

const isISODate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);

const thresholdForService = (serviceType) => {
  const s = (serviceType || '').toLowerCase();
  // Accounting / Data services: max 5 per day
  if (s === 'accounting' || s === 'data' || s === 'data_analysis') return 5;
  // Consultation (default): max 10 per day
  return 10;
};

const canBookDay = async ({ model, bookingDate, serviceType }) => {
  const threshold = thresholdForService(serviceType);
  const query = model === 'consultation'
    ? { bookingDate, serviceType }
    : { bookingDate };
  const count = model === 'consultation'
    ? await ConsultationBooking.countDocuments(query)
    : await TrainingBooking.countDocuments(query);
  return { ok: count < threshold, threshold, count };
};

exports.createTrainingBooking = async (req, res) => {
  try {
    const name = normalizeText(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const phone = normalizeText(req.body?.phone);
    const course = normalizeText(req.body?.course);
    const bookingDate = normalizeDate(req.body?.bookingDate);
    const governorate = normalizeText(req.body?.governorate);
    const city = normalizeText(req.body?.city);

    if (!name || !email || !phone || !course || !bookingDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!isISODate(bookingDate)) {
      return res.status(400).json({ success: false, message: 'Invalid booking date' });
    }

    const courseInfo = COURSE_CATALOG[course];
    if (!courseInfo) {
      return res.status(400).json({ success: false, message: 'Invalid training program' });
    }

    // Capacity rule for training (max 10 per day).
    const cap = await canBookDay({ model: 'training', bookingDate, serviceType: 'training' });
    if (!cap.ok) {
      return res.status(400).json({ success: false, message: 'This day is not available' });
    }

    const booking = await TrainingBooking.create({
      userId: req.user.id,
      name,
      email,
      phone,
      course,
      bookingDate,
      governorate,
      city,
      startDate: courseInfo.startDate,
      schedule: courseInfo.schedule,
    });

    // Email user with details (best-effort).
    try {
      await sendEmail({
        to: email,
        subject: 'Training booking confirmation',
        message:
          `Hello ${name},\n\n` +
          `Your training booking has been registered successfully.\n\n` +
          `Training: ${courseInfo.title_en}\n` +
          `Booking date: ${bookingDate}\n` +
          `Start date: ${courseInfo.startDate}\n` +
          `Schedule: ${courseInfo.schedule}\n\n` +
          `elsamak Group`,
      });
    } catch (e) {
      // Do not fail booking if email provider is down.
      console.error('⚠️ Training booking email failed:', e && e.message ? e.message : e);
    }

    return res.status(201).json({
      success: true,
      data: booking,
      message: 'Training booked successfully',
      courseInfo,
    });
  } catch (err) {
    console.error('❌ createTrainingBooking Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createConsultationBooking = async (req, res) => {
  try {
    const name = normalizeText(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const phone = normalizeText(req.body?.phone);
    const serviceType = normalizeText(req.body?.serviceType);
    const bookingDate = normalizeDate(req.body?.bookingDate);
    const notes = normalizeText(req.body?.notes);
    const governorate = normalizeText(req.body?.governorate);
    const city = normalizeText(req.body?.city);

    if (!name || !email || !phone || !serviceType || !bookingDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!isISODate(bookingDate)) {
      return res.status(400).json({ success: false, message: 'Invalid booking date' });
    }

    const cap = await canBookDay({ model: 'consultation', bookingDate, serviceType });
    if (!cap.ok) {
      return res.status(400).json({ success: false, message: 'This day is not available' });
    }

    const booking = await ConsultationBooking.create({
      userId: req.user.id,
      name,
      email,
      phone,
      serviceType,
      bookingDate,
      notes,
      governorate,
      city,
    });

    return res.status(201).json({
      success: true,
      data: booking,
      message: 'Consultation booked successfully',
    });
  } catch (err) {
    console.error('❌ createConsultationBooking Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const [trainings, consultations] = await Promise.all([
      TrainingBooking.find({ userId: req.user.id }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId: req.user.id }).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: { trainings, consultations },
    });
  } catch (err) {
    console.error('❌ getMyBookings Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/bookings/availability?serviceType=legal&month=YYYY-MM
exports.getAvailability = async (req, res) => {
  try {
    const serviceType = normalizeText(req.query?.serviceType || '');
    const month = normalizeText(req.query?.month || '');
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Invalid month' });
    }

    const start = `${month}-01`;
    const endMonth = new Date(`${month}-01T00:00:00.000Z`);
    endMonth.setUTCMonth(endMonth.getUTCMonth() + 1);
    const endStr = endMonth.toISOString().slice(0, 10); // next month day 1

    const threshold = thresholdForService(serviceType);

    // For training availability: serviceType=training
    if (serviceType.toLowerCase() === 'training') {
      const rows = await TrainingBooking.aggregate([
        { $match: { bookingDate: { $gte: start, $lt: endStr } } },
        { $group: { _id: '$bookingDate', count: { $sum: 1 } } },
        { $match: { count: { $gte: 10 } } },
      ]);
      const unavailableDates = rows.map((r) => r._id).sort();
      return res.status(200).json({ success: true, threshold: 10, unavailableDates });
    }

    const rows = await ConsultationBooking.aggregate([
      { $match: { serviceType, bookingDate: { $gte: start, $lt: endStr } } },
      { $group: { _id: '$bookingDate', count: { $sum: 1 } } },
      { $match: { count: { $gte: threshold } } },
    ]);

    const unavailableDates = rows.map((r) => r._id).sort();
    return res.status(200).json({ success: true, threshold, unavailableDates });
  } catch (err) {
    console.error('❌ getAvailability Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.COURSE_CATALOG = COURSE_CATALOG;

