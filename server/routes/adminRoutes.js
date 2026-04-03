const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/requireAdmin');
const admin = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/clients/export/csv', admin.exportClientsCsv);
router.get('/clients', admin.listClients);
router.get('/clients/:id', admin.getClient);

module.exports = router;
