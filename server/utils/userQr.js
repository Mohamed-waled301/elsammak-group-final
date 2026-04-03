const QRCode = require('qrcode');

function buildVCard(user) {
  const name = String(user.name || 'Client')
    .replace(/\n/g, ' ')
    .trim();
  const email = String(user.email || '').trim();
  return ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`, `EMAIL:${email}`, 'ORG:Elsamak Group', `NOTE:Client ID ${user._id}`, 'END:VCARD'].join(
    '\n'
  );
}

/**
 * PNG data URL for profile QR (vCard with name, email, org).
 */
async function buildClientQrDataUrl(user) {
  return QRCode.toDataURL(buildVCard(user), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
    type: 'image/png',
  });
}

module.exports = { buildClientQrDataUrl };
