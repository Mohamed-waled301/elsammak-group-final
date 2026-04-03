const QRCode = require('qrcode');
const QRData = require('../models/QRData');

const MAX_LEN = 2000;

/**
 * POST /api/qr  { "text": "..." } or { "data": "..." }
 */
async function postQr(req, res, next) {
  try {
    const raw = req.body?.text ?? req.body?.data ?? '';
    const data = typeof raw === 'string' ? raw.trim() : '';

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'text or data field is required',
      });
    }
    if (data.length > MAX_LEN) {
      return res.status(400).json({
        success: false,
        message: `Input too long (max ${MAX_LEN} characters)`,
      });
    }

    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      type: 'image/png',
    });

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    await QRData.create({ data });

    return res.status(201).json({
      success: true,
      message: 'QR code generated and stored.',
      dataUrl,
      base64,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postQr };
