const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { dashboardSummary } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);
router.get('/', dashboardSummary);

module.exports = router;
