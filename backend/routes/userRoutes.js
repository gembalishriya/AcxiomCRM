const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { listUsers, createUser, updateUser, resetPassword } = require('../controllers/userController');
const { userCreateValidator, userUpdateValidator, userIdValidator, userListValidator } = require('../validators/userValidators');

const router = express.Router();

router.use(protect, authorizeRoles('Admin'));

router.get('/', userListValidator, listUsers);
router.post('/', userCreateValidator, createUser);
router.put('/:id', userUpdateValidator, updateUser);
router.post('/:id/reset-password', userIdValidator, resetPassword);

module.exports = router;
