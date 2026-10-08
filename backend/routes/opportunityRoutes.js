const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const {
  opportunityCreateValidator,
  opportunityUpdateValidator,
  opportunityIdValidator,
  opportunityListValidator
} = require('../validators/opportunityValidators');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), opportunityListValidator, listOpportunities);
router.get('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), opportunityIdValidator, getOpportunityById);
router.post('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), opportunityCreateValidator, createOpportunity);
router.put('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), opportunityUpdateValidator, updateOpportunity);
router.delete('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), opportunityIdValidator, deleteOpportunity);

module.exports = router;
