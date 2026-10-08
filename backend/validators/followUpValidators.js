const { body, param, query } = require('express-validator');

const followUpCreateValidator = [
  body('followUpDate').isISO8601().withMessage('Follow-up date must be a valid date.').custom((value, { req }) => {
    const status = req.body.status || 'Planned';
    if (status === 'Planned') {
      const dateValue = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(dateValue.getTime()) || dateValue < today) {
        throw new Error('Follow-up date cannot be earlier than today.');
      }
    }
    return true;
  }),
  body('followUpType').trim().notEmpty().withMessage('Follow-Up Type is required.'),
  body('status').optional().isIn(['Planned', 'Completed', 'Missed', 'Cancelled']).withMessage('Invalid follow-up status.'),
  body('remarks').optional().isLength({ max: 1000 }).withMessage('Remarks are too long.')
];

const followUpUpdateValidator = [
  param('id').isMongoId().withMessage('Invalid follow-up id.'),
  body('followUpDate').optional().isISO8601().withMessage('Follow-up date must be a valid date.').custom((value, { req }) => {
    const status = req.body.status || 'Planned';
    if (status === 'Planned') {
      const dateValue = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(dateValue.getTime()) || dateValue < today) {
        throw new Error('Follow-up date cannot be earlier than today.');
      }
    }
    return true;
  }),
  body('followUpType').optional().trim().notEmpty().withMessage('Follow-Up Type is required.'),
  body('status').optional().isIn(['Planned', 'Completed', 'Missed', 'Cancelled']).withMessage('Invalid follow-up status.')
];

const followUpIdValidator = [param('id').isMongoId().withMessage('Invalid follow-up id.')];

const followUpListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

module.exports = {
  followUpCreateValidator,
  followUpUpdateValidator,
  followUpIdValidator,
  followUpListValidator
};
