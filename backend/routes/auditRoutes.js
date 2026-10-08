const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { listAuditLogs } = require('../controllers/auditController');

const router = express.Router();

router.use(protect, authorizeRoles('Admin'));
router.get('/', listAuditLogs);

module.exports = router;
