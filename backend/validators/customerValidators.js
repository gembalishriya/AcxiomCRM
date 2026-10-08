const { body, param, query } = require('express-validator');

const customerCreateValidator = [
  body('customerCode').trim().notEmpty().withMessage('Customer Code is required.'),
  body('customerName').trim().notEmpty().withMessage('Customer Name is required.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required.'),
  body('phone').matches(/^[0-9+()\-\s]{7,20}$/).withMessage('Enter a valid phone number.'),
  body('companyName').optional({ checkFalsy: true }).isLength({ max: 150 }).withMessage('Company Name is too long.')
];

const customerUpdateValidator = [
  param('id').isMongoId().withMessage('Invalid customer id.'),
  body('customerCode').optional().trim().notEmpty().withMessage('Customer Code is required.'),
  body('customerName').optional().trim().notEmpty().withMessage('Customer Name is required.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').optional().matches(/^[0-9+()\-\s]{7,20}$/).withMessage('Enter a valid phone number.')
];

const customerIdValidator = [param('id').isMongoId().withMessage('Invalid customer id.')];

const customerListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

module.exports = {
  customerCreateValidator,
  customerUpdateValidator,
  customerIdValidator,
  customerListValidator
};
