const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  customerReport,
  leadReport,
  followUpReport,
  conversionReport,
  opportunityReport,
  pipelineReport,
  auditReport,
  userActivityReport
} = require('../controllers/reportController');

const router = express.Router();

router.use(protect);

router.get('/customers', authorizeRoles('Admin', 'Manager'), customerReport);
router.get('/leads', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadReport);
router.get('/followups', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), followUpReport);
router.get('/conversions', authorizeRoles('Admin', 'Manager'), conversionReport);
router.get('/opportunities', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), opportunityReport);
router.get('/pipeline', authorizeRoles('Admin', 'Manager'), pipelineReport);
router.get('/users', authorizeRoles('Admin', 'Manager'), userActivityReport);
router.get('/audit', authorizeRoles('Admin'), auditReport);

module.exports = router;
