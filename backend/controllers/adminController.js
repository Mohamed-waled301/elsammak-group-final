const User = require('../models/User');
const Case = require('../models/Case');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const TrainingBooking = require('../models/TrainingBooking');
const ConsultationBooking = require('../models/ConsultationBooking');
const AdminSettings = require('../models/AdminSettings');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: 'user',
      $nor: [
        { name: { $regex: 'otp', $options: 'i' } },
        { email: { $regex: 'otp', $options: 'i' } },
        { email: { $regex: 'example\\.com$', $options: 'i' } },
        { email: { $regex: 'test', $options: 'i' } },
      ],
    }).select('_id name email phone qrCode qrValue'); // Only real clients
    const ids = users.map((u) => u._id);

    const [trainings, consultations] = await Promise.all([
      TrainingBooking.find({ userId: { $in: ids } }).select('userId course startDate schedule createdAt'),
      ConsultationBooking.find({ userId: { $in: ids } }).select('userId serviceType notes status createdAt'),
    ]);

    const trainingsByUserId = new Map();
    trainings.forEach((t) => {
      const key = String(t.userId);
      const arr = trainingsByUserId.get(key) || [];
      arr.push(t);
      trainingsByUserId.set(key, arr);
    });

    const consultationsByUserId = new Map();
    consultations.forEach((c) => {
      const key = String(c.userId);
      const arr = consultationsByUserId.get(key) || [];
      arr.push(c);
      consultationsByUserId.set(key, arr);
    });

    const data = users.map((u) => {
      const uid = String(u._id);
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || null,
        trainings: trainingsByUserId.get(uid) || [],
        consultations: consultationsByUserId.get(uid) || [],
        trainingsCount: (trainingsByUserId.get(uid) || []).length,
        consultationsCount: (consultationsByUserId.get(uid) || []).length,
        qrCode: u.qrCode || null,
        qrValue: u.qrValue || null,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('❌ Admin getAllUsers Error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cases = await Case.find({ userId: user._id });
    const [trainings, consultations] = await Promise.all([
      TrainingBooking.find({ userId: user._id }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId: user._id }).sort({ createdAt: -1 }),
    ]);

    const qrValue = user.qrValue || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/${user._id}`;
    const qrCode = user.qrCode || await QRCode.toDataURL(qrValue);

    res.status(200).json({
      success: true,
      data: {
        user,
        cases,
        trainings,
        consultations,
        qrCode,
        qrValue
      }
    });
  } catch (err) {
    console.error('❌ Admin getUserById Error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get user cases
// @route   GET /api/admin/users/:id/cases
// @access  Private/Admin
exports.getUserCases = async (req, res) => {
  try {
    const cases = await Case.find({ userId: req.params.id });
    res.status(200).json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    console.error('❌ Admin getUserCases Error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get all clients with trainings/consultations summary
// @route   GET /api/admin/clients/summary?search=...&filter=...
// @access  Private/Admin
exports.getClientsSummary = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const filter = typeof req.query.filter === 'string' ? req.query.filter.trim().toLowerCase() : '';

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await User.find(query).select('_id name email phone qrCode qrValue');
    const ids = clients.map((c) => c._id);

    const [trainings, consultations] = await Promise.all([
      TrainingBooking.find({ userId: { $in: ids } }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId: { $in: ids } }).sort({ createdAt: -1 }),
    ]);

    const trainingsByUserId = new Map();
    trainings.forEach((t) => {
      const key = String(t.userId);
      const arr = trainingsByUserId.get(key) || [];
      arr.push(t);
      trainingsByUserId.set(key, arr);
    });

    const consultationsByUserId = new Map();
    consultations.forEach((c) => {
      const key = String(c.userId);
      const arr = consultationsByUserId.get(key) || [];
      arr.push(c);
      consultationsByUserId.set(key, arr);
    });

    const data = clients.map((client) => {
      const userId = String(client._id);
      const userTrainings = trainingsByUserId.get(userId) || [];
      const userConsultations = consultationsByUserId.get(userId) || [];
      return {
        client: {
          id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone || null,
          qrCode: client.qrCode || null,
          qrValue: client.qrValue || null,
        },
        trainingsCount: userTrainings.length,
        consultationsCount: userConsultations.length,
        trainingsPreview: userTrainings.slice(0, 3),
        consultationsPreview: userConsultations.slice(0, 3),
        trainings: userTrainings,
        consultations: userConsultations,
      };
    });

    const filtered =
      filter === 'trainings_only'
        ? data.filter((d) => d.trainingsCount > 0)
        : filter === 'consultations_only'
          ? data.filter((d) => d.consultationsCount > 0)
          : data;

    return res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    console.error('❌ Admin getClientsSummary Error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Download all clients data as PDF (with QR code per client)
// @route   GET /api/admin/clients/download-pdf?search=...
// @access  Private/Admin
exports.downloadAllClientsPDF = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await User.find(query).select('_id name email phone qrCode qrValue');
    const ids = clients.map((c) => c._id);

    const [trainings, consultations] = await Promise.all([
      TrainingBooking.find({ userId: { $in: ids } }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId: { $in: ids } }).sort({ createdAt: -1 }),
    ]);

    const trainingsByUserId = new Map();
    trainings.forEach((t) => {
      const key = String(t.userId);
      const arr = trainingsByUserId.get(key) || [];
      arr.push(t);
      trainingsByUserId.set(key, arr);
    });

    const consultationsByUserId = new Map();
    consultations.forEach((c) => {
      const key = String(c.userId);
      const arr = consultationsByUserId.get(key) || [];
      arr.push(c);
      consultationsByUserId.set(key, arr);
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=all_clients_${new Date().toISOString().slice(0, 10)}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).fillColor('#003B5C').text('elsamak Group - Clients Report', { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated at: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);

    for (let idx = 0; idx < clients.length; idx++) {
      const client = clients[idx];
      const userId = String(client._id);
      const userTrainings = trainingsByUserId.get(userId) || [];
      const userConsultations = consultationsByUserId.get(userId) || [];

      if (idx !== 0 && doc.y > doc.page.height - 240) doc.addPage();

      doc.fontSize(14).fillColor('#003B5C').text(`Client: ${client.name}`, { continued: false });
      doc.fillColor('black');
      doc.fontSize(10).text(`Email: ${client.email}`);
      doc.fontSize(10).text(`Phone: ${client.phone || '-'}`);
      doc.moveDown(0.5);

      // QR placeholder box
      const qrBoxX = doc.page.width - doc.page.margins.right - 140;
      const qrBoxY = doc.y - 22;
      doc.rect(qrBoxX, qrBoxY, 120, 120).stroke('#E5E7EB');

      // Try stored QR first, then best-effort generation.
      if (client.qrCode) {
        try {
          const base64 = client.qrCode.includes(',') ? client.qrCode.split(',')[1] : client.qrCode;
          const buffer = Buffer.from(base64, 'base64');
          doc.image(buffer, qrBoxX + 5, qrBoxY + 5, { width: 110, height: 110 });
        } catch (qrImgErr) {
          // ignore
        }
      } else {
        try {
          const qrValue = client.qrValue || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/${client._id}`;
          const qrBuffer = await QRCode.toBuffer(qrValue);
          doc.image(qrBuffer, qrBoxX + 5, qrBoxY + 5, { width: 110, height: 110 });
        } catch (qrGenErr) {
          // ignore
        }
      }

      // Trainings
      doc.fontSize(11).fillColor('#003B5C').text('Trainings');
      doc.fillColor('black');
      if (userTrainings.length === 0) {
        doc.fontSize(10).text('- No trainings');
      } else {
        userTrainings.forEach((t) => {
          if (doc.y > doc.page.height - 90) doc.addPage();
          doc.fontSize(10).text(`• ${t.course} | Start: ${t.startDate || '-'} | ${t.schedule || ''}`);
        });
      }
      doc.moveDown(0.2);

      // Consultations
      doc.fontSize(11).fillColor('#003B5C').text('Consultations');
      doc.fillColor('black');
      if (userConsultations.length === 0) {
        doc.fontSize(10).text('- No consultations');
      } else {
        userConsultations.forEach((c) => {
          if (doc.y > doc.page.height - 90) doc.addPage();
          const dateStr = c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '-';
          doc.fontSize(10).text(`• ${c.serviceType} | ${dateStr} | ${c.notes || '-'}`);
        });
      }

      doc.moveDown(1.2);
    }

    doc.end();
  } catch (err) {
    console.error('❌ downloadAllClientsPDF Error:', err && err.message ? err.message : err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

// @desc    Download user data as PDF
// @route   GET /api/admin/users/:id/download
// @access  Private/Admin
exports.downloadUserData = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cases = await Case.find({ userId: user._id });
    const [trainings, consultations] = await Promise.all([
      TrainingBooking.find({ userId: user._id }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId: user._id }).sort({ createdAt: -1 }),
    ]);

    const qrValue = user.qrValue || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/${user._id}`;
    let qrBuffer = null;
    if (user.qrCode) {
      const base64 = user.qrCode.includes(',') ? user.qrCode.split(',')[1] : user.qrCode;
      qrBuffer = Buffer.from(base64, 'base64');
    } else {
      qrBuffer = await QRCode.toBuffer(qrValue);
    }

    // Create PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=user_${user._id}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(25).text('User Profile', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`National ID: ${user.nationalId}`);
    doc.text(`Phone: ${user.phone}`);
    doc.text(`Governorate: ${user.governorate}`);
    doc.text(`City: ${user.city}`);
    doc.text(`Status: ${user.isVerified ? 'Verified' : 'Pending Verification'}`);
    
    doc.moveDown();
    doc.fontSize(20).text('Bookings', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Trainings (${trainings.length}):`);
    if (trainings.length === 0) {
      doc.fontSize(12).text('- No trainings');
    } else {
      trainings.forEach((t, index) => {
        if (doc.y > doc.page.height - 90) doc.addPage();
        doc.fontSize(12).text(`${index + 1}. ${t.course} - Start: ${t.startDate || '-'} - ${t.schedule || ''}`);
      });
    }

    doc.moveDown();
    doc.fontSize(12).text(`Consultations (${consultations.length}):`);
    if (consultations.length === 0) {
      doc.fontSize(12).text('- No consultations');
    } else {
      consultations.forEach((c, index) => {
        if (doc.y > doc.page.height - 90) doc.addPage();
        doc.fontSize(12).text(`${index + 1}. ${c.serviceType} - ${c.notes || '-'} - ${c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '-'}`);
      });
    }

    doc.moveDown();
    doc.fontSize(20).text('Client QR Code', { underline: true });
    doc.moveDown();
    if (qrBuffer) {
      doc.image(qrBuffer, { fit: [150, 150], align: 'center' });
    }

    doc.end();

  } catch (err) {
    if (!res.headersSent) {
      console.error('❌ Admin downloadUserData Error:', err && err.message ? err.message : err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

// @desc    Update admin own profile (single admin)
// @route   PUT /api/admin/profile
// @access  Private/Admin
exports.updateAdminProfile = async (req, res) => {
  try {
    const nameRaw = req.body?.name;
    const emailRaw = req.body?.email;
    const passwordRaw = req.body?.password;

    const update = {};
    if (typeof nameRaw === 'string' && nameRaw.trim()) update.name = nameRaw.trim();
    if (typeof emailRaw === 'string' && emailRaw.trim()) update.email = emailRaw.trim().toLowerCase();

    if (typeof passwordRaw === 'string' && passwordRaw.trim()) {
      if (passwordRaw.trim().length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      }
      update.passwordHash = await bcrypt.hash(passwordRaw.trim(), 10);
    }

    if (!update.name && !update.email && !update.passwordHash) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    // Ensure singleton exists
    const existing = await AdminSettings.findOne({ key: 'singleton' });
    if (!existing) {
      const seededHash = await bcrypt.hash('Waled1981@', 10);
      await AdminSettings.create({
        key: 'singleton',
        name: update.name || 'Admin',
        email: update.email || 'elsamakgroup0@gmail.com',
        passwordHash: update.passwordHash || seededHash,
      });
    } else {
      await AdminSettings.updateOne({ _id: existing._id }, { $set: update });
    }

    const settings = await AdminSettings.findOne({ key: 'singleton' }).select('name email');
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    console.error('❌ updateAdminProfile Error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
