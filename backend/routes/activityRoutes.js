const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { listActivities, createActivity } = require('../controllers/activityController');
const { activityCreateValidator, activityListValidator } = require('../validators/activityValidators');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), activityListValidator, listActivities);
router.post('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), activityCreateValidator, createActivity);

module.exports = router;
