const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { listFollowUps, createFollowUp, updateFollowUp, deleteFollowUp } = require('../controllers/followUpController');
const { followUpCreateValidator, followUpUpdateValidator, followUpIdValidator, followUpListValidator } = require('../validators/followUpValidators');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), followUpListValidator, listFollowUps);
router.post('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), followUpCreateValidator, createFollowUp);
router.put('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), followUpUpdateValidator, updateFollowUp);
router.delete('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), followUpIdValidator, deleteFollowUp);

module.exports = router;
