const { body, param, query } = require('express-validator');

const userCreateValidator = [
  body('firstName').trim().notEmpty().withMessage('First Name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last Name is required.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('role').isIn(['Admin', 'Manager', 'SalesExecutive']).withMessage('Invalid role.')
];

const userUpdateValidator = [
  param('id').isMongoId().withMessage('Invalid user id.'),
  body('firstName').optional().trim().notEmpty().withMessage('First Name is required.'),
  body('lastName').optional().trim().notEmpty().withMessage('Last Name is required.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('role').optional().isIn(['Admin', 'Manager', 'SalesExecutive']).withMessage('Invalid role.')
];

const userIdValidator = [param('id').isMongoId().withMessage('Invalid user id.')];

const userListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

module.exports = {
  userCreateValidator,
  userUpdateValidator,
  userIdValidator,
  userListValidator
};
