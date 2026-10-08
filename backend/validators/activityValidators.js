const { body, param, query } = require('express-validator');

const activityCreateValidator = [
  body('activityType').isIn(['Call', 'Meeting', 'Email', 'Task']).withMessage('Invalid activity type.'),
  body('subject').trim().notEmpty().withMessage('Subject is required.'),
  body('activityDate').isISO8601().withMessage('Activity Date must be a valid date.'),
  body('status').optional().isIn(['Planned', 'Completed', 'Cancelled']).withMessage('Invalid activity status.')
];

const activityUpdateValidator = [
  param('id').isMongoId().withMessage('Invalid activity id.'),
  body('activityType').optional().isIn(['Call', 'Meeting', 'Email', 'Task']).withMessage('Invalid activity type.'),
  body('subject').optional().trim().notEmpty().withMessage('Subject is required.'),
  body('activityDate').optional().isISO8601().withMessage('Activity Date must be a valid date.'),
  body('status').optional().isIn(['Planned', 'Completed', 'Cancelled']).withMessage('Invalid activity status.')
];

const activityIdValidator = [param('id').isMongoId().withMessage('Invalid activity id.')];

const activityListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

module.exports = {
  activityCreateValidator,
  activityUpdateValidator,
  activityIdValidator,
  activityListValidator
};
