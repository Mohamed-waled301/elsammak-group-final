const mongoose = require('mongoose');
const User = require('../models/User');
const TrainingBooking = require('../models/TrainingBooking');
const Contact = require('../models/Contact');
const { buildClientQrDataUrl } = require('../utils/userQr');

function csvEscape(val) {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * GET /api/admin/clients
 */
async function listClients(req, res, next) {
  try {
    const clients = await User.find({ role: 'client' }).select('-passwordHash').sort({ createdAt: -1 }).lean();

    const emails = clients.map((c) => c.email).filter(Boolean);
    let tMap = {};
    let cMap = {};
    if (emails.length > 0) {
      const [trainingAgg, contactAgg] = await Promise.all([
        TrainingBooking.aggregate([
          { $match: { email: { $in: emails } } },
          { $group: { _id: '$email', count: { $sum: 1 } } },
        ]),
        Contact.aggregate([
          { $match: { email: { $in: emails } } },
          { $group: { _id: '$email', count: { $sum: 1 } } },
        ]),
      ]);
      tMap = Object.fromEntries(trainingAgg.map((x) => [x._id, x.count]));
      cMap = Object.fromEntries(contactAgg.map((x) => [x._id, x.count]));
    }

    const data = clients.map((u) => ({
      id: String(u._id),
      name: u.name || '',
      email: u.email,
      phone: u.phone || '',
      nationalId: u.nationalId || '',
      governorate: u.governorate || '',
      city: u.city || '',
      emailVerified: Boolean(u.emailVerified),
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
      trainingsCount: tMap[u.email] || 0,
      consultationsCount: cMap[u.email] || 0,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/admin/clients/:id
 */
async function getClient(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid client id.' });
    }

    const user = await User.findOne({ _id: id, role: 'client' }).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const email = user.email;
    const [trainings, contacts] = await Promise.all([
      TrainingBooking.find({ email }).sort({ createdAt: -1 }).lean(),
      Contact.find({ email }).sort({ createdAt: -1 }).lean(),
    ]);

    const consultations = contacts.map((c) => ({
      _id: c._id,
      serviceType: c.subject?.trim() || 'Contact',
      notes: String(c.message || '').slice(0, 2000),
      createdAt: c.createdAt,
    }));

    let qrCode = null;
    let qrValue = '';
    try {
      const userDoc = await User.findById(user._id);
      if (userDoc) {
        qrCode = await buildClientQrDataUrl(userDoc);
        qrValue = `CLIENT:${String(user._id)}`;
      }
    } catch (qrErr) {
      console.warn('[admin] QR generation failed:', qrErr.message);
    }

    return res.json({
      success: true,
      data: {
        user: {
          _id: String(user._id),
          name: user.name || '',
          email: user.email,
          picture: user.picture || '',
          phone: user.phone || '',
          nationalId: user.nationalId || '',
          governorate: user.governorate || '',
          city: user.city || '',
          emailVerified: Boolean(user.emailVerified),
          role: 'client',
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
          updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
        },
        trainings,
        consultations,
        qrCode,
        qrValue,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/admin/clients/export/csv
 */
async function exportClientsCsv(req, res, next) {
  try {
    const clients = await User.find({ role: 'client' }).select('-passwordHash').sort({ createdAt: -1 }).lean();

    const header = [
      'id',
      'name',
      'email',
      'phone',
      'nationalId',
      'governorate',
      'city',
      'emailVerified',
      'createdAt',
    ];
    const lines = [header.join(',')];

    for (const u of clients) {
      lines.push(
        [
          csvEscape(String(u._id)),
          csvEscape(u.name),
          csvEscape(u.email),
          csvEscape(u.phone),
          csvEscape(u.nationalId),
          csvEscape(u.governorate),
          csvEscape(u.city),
          csvEscape(u.emailVerified ? 'yes' : 'no'),
          csvEscape(u.createdAt ? new Date(u.createdAt).toISOString() : ''),
        ].join(',')
      );
    }

    const csv = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="clients_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send('\uFEFF' + csv);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listClients,
  getClient,
  exportClientsCsv,
};
