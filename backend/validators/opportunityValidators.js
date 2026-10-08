const { body, param, query } = require('express-validator');

const opportunityCreateValidator = [
  body('opportunityName').trim().notEmpty().withMessage('Opportunity Name is required.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Opportunity Amount must be greater than 0.'),
  body('probability').isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100.'),
  body('expectedCloseDate').isISO8601().withMessage('Expected Close Date must be a valid date.'),
  body('stage').optional().isIn(['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost']).withMessage('Invalid stage.'),
  body('status').optional().isIn(['Active', 'Won', 'Lost', 'Inactive']).withMessage('Invalid status.')
];

const opportunityUpdateValidator = [
  param('id').isMongoId().withMessage('Invalid opportunity id.'),
  body('opportunityName').optional().trim().notEmpty().withMessage('Opportunity Name is required.'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Opportunity Amount must be greater than 0.'),
  body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100.'),
  body('expectedCloseDate').optional().isISO8601().withMessage('Expected Close Date must be a valid date.'),
  body('stage').optional().isIn(['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost']).withMessage('Invalid stage.'),
  body('status').optional().isIn(['Active', 'Won', 'Lost', 'Inactive']).withMessage('Invalid status.')
];

const opportunityIdValidator = [param('id').isMongoId().withMessage('Invalid opportunity id.')];

const opportunityListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

module.exports = {
  opportunityCreateValidator,
  opportunityUpdateValidator,
  opportunityIdValidator,
  opportunityListValidator
};
