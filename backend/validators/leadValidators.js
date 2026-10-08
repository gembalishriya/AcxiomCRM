const { body, param, query } = require('express-validator');

const leadCreateValidator = [
  body('leadCode').trim().notEmpty().withMessage('Lead Code is required.'),
  body('leadName').trim().notEmpty().withMessage('Lead Name is required.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required.'),
  body('phone').matches(/^[0-9+()\-\s]{7,20}$/).withMessage('Enter a valid phone number.'),
  body('expectedValue').optional().isFloat({ min: 0 }).withMessage('Expected Value must be greater than or equal to 0.'),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost']).withMessage('Invalid lead status.')
];

const leadUpdateValidator = [
  param('id').isMongoId().withMessage('Invalid lead id.'),
  body('leadCode').optional().trim().notEmpty().withMessage('Lead Code is required.'),
  body('leadName').optional().trim().notEmpty().withMessage('Lead Name is required.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').optional().matches(/^[0-9+()\-\s]{7,20}$/).withMessage('Enter a valid phone number.'),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost']).withMessage('Invalid lead status.')
];

const leadIdValidator = [param('id').isMongoId().withMessage('Invalid lead id.')];

const leadListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

module.exports = {
  leadCreateValidator,
  leadUpdateValidator,
  leadIdValidator,
  leadListValidator
};
