/**
 * Express error-handling middleware (4 args).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: msgs.length ? msgs.join('; ') : 'Validation failed',
    });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }

  const status = Number(err.status) || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
  });
}

module.exports = errorHandler;
